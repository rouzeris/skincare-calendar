import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { normalizeCatalogSearch } from "../shared/catalog-search";
import { buildCatalog, toCatalogProduct } from "./build-obf-catalog";

const columns = {
  code: 0,
  last_modified_t: 1,
  product_name: 2,
  quantity: 3,
  brands: 4,
  categories_en: 5,
  unique_scans_n: 6,
  completeness: 7,
};

test("normalizes accents and punctuation for prefix search", () => {
  assert.equal(
    normalizeCatalogSearch("  L’Oréal — Crème  SPF-50  "),
    "l oreal creme spf 50",
  );
});

test("preserves an existing catalog when the source is invalid", async () => {
  const directory = await mkdtemp(join(tmpdir(), "cera-catalog-"));
  const inputPath = join(directory, "invalid.csv.gz");
  const outputPath = join(directory, "catalog.jsonl");

  try {
    await writeFile(inputPath, gzipSync("code\tproduct_name\n"));
    await writeFile(outputPath, "existing catalog\n");

    await assert.rejects(
      buildCatalog(inputPath, outputPath),
      /Missing OBF columns/,
    );
    assert.equal(await readFile(outputPath, "utf8"), "existing catalog\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("builds an attributed catalog product", () => {
  assert.deepEqual(
    toCatalogProduct(columns, [
      "3337875597210",
      "1720000000",
      "Cicaplast Baume B5+",
      "40 ml",
      "La Roche-Posay,L'Oréal",
      "Face creams,Skin care",
      "122",
      "0.675",
    ]),
    {
      source: "open_beauty_facts",
      sourceKey: "obf:3337875597210",
      sourceUrl: "https://world.openbeautyfacts.org/product/3337875597210",
      sourceModifiedAt: 1720000000,
      license: "ODbL-1.0",
      barcode: "3337875597210",
      brand: "La Roche-Posay",
      productName: "Cicaplast Baume B5+",
      quantity: "40 ml",
      category: "Face creams",
      searchText: "la roche posay l oreal cicaplast baume b5",
      uniqueScans: 122,
      completeness: 0.675,
    },
  );
});

test("only requires barcode, brand, and product name", () => {
  assert.ok(
    toCatalogProduct(columns, ["1", "", "Cream", "", "Brand", "", "", ""]),
  );
  assert.equal(
    toCatalogProduct(columns, ["1", "", "", "", "Brand", "", "", ""]),
    null,
  );
  assert.equal(
    toCatalogProduct(columns, ["1", "", "1", "", "Brand", "", "", ""]),
    null,
  );
});
