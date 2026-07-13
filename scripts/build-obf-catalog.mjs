import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import { createGunzip } from "node:zlib";

const REQUIRED_COLUMNS = [
  "code",
  "last_modified_t",
  "product_name",
  "quantity",
  "brands",
  "categories_en",
  "unique_scans_n",
  "completeness",
];

export function normalizeSearch(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clean(value) {
  return value.replace(/\s+/g, " ").trim();
}

function first(value) {
  return clean(value.split(",")[0] ?? "");
}

export function toCatalogProduct(columns, row) {
  const barcode = clean(row[columns.code] ?? "");
  const productName = clean(row[columns.product_name] ?? "");
  const brands = clean(row[columns.brands] ?? "");
  const brand = first(brands);
  if (!barcode || !brand || !productName) return null;
  if (normalizeSearch(productName) === normalizeSearch(barcode)) return null;

  const quantity = clean(row[columns.quantity] ?? "");
  const category = first(row[columns.categories_en] ?? "");

  return {
    source: "open_beauty_facts",
    sourceKey: `obf:${barcode}`,
    sourceUrl: `https://world.openbeautyfacts.org/product/${encodeURIComponent(barcode)}`,
    sourceModifiedAt: numberOrZero(row[columns.last_modified_t]),
    license: "ODbL-1.0",
    barcode,
    brand,
    productName,
    ...(quantity ? { quantity } : {}),
    ...(category ? { category } : {}),
    searchText: normalizeSearch(`${brands} ${productName}`),
    uniqueScans: numberOrZero(row[columns.unique_scans_n]),
    completeness: numberOrZero(row[columns.completeness]),
  };
}

export async function buildCatalog(inputPath, outputPath) {
  const input = createReadStream(inputPath).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });
  const output = createWriteStream(outputPath, { encoding: "utf8" });
  let columns;
  let imported = 0;
  let skipped = 0;

  for await (const line of lines) {
    const row = line.split("\t");
    if (!columns) {
      columns = Object.fromEntries(row.map((name, index) => [name, index]));
      const missing = REQUIRED_COLUMNS.filter(
        (name) => columns[name] === undefined,
      );
      if (missing.length)
        throw new Error(`Missing OBF columns: ${missing.join(", ")}`);
      continue;
    }

    const product = toCatalogProduct(columns, row);
    if (!product) {
      skipped++;
      continue;
    }
    if (!output.write(`${JSON.stringify(product)}\n`))
      await once(output, "drain");
    imported++;
  }

  output.end();
  await once(output, "finish");
  return { imported, skipped };
}

async function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    throw new Error(
      "Usage: bun run catalog:build <obf.csv.gz> <catalog.jsonl>",
    );
  }
  const result = await buildCatalog(inputPath, outputPath);
  console.log(`Wrote ${result.imported} products; skipped ${result.skipped}.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
