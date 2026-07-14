/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("searches by normalized brand prefix and ranks popular products first", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    for (const product of [
      {
        source: "open_beauty_facts" as const,
        sourceKey: "obf:1",
        sourceUrl: "https://world.openbeautyfacts.org/product/1",
        sourceModifiedAt: 1,
        license: "ODbL-1.0" as const,
        barcode: "1",
        brand: "L'Oréal",
        productName: "Revitalift Cream",
        searchText: "l oreal revitalift cream",
        uniqueScans: 2,
        completeness: 0.8,
      },
      {
        source: "open_beauty_facts" as const,
        sourceKey: "obf:2",
        sourceUrl: "https://world.openbeautyfacts.org/product/2",
        sourceModifiedAt: 1,
        license: "ODbL-1.0" as const,
        barcode: "2",
        brand: "L'Oréal",
        productName: "Hydra Cream",
        searchText: "l oreal hydra cream",
        uniqueScans: 20,
        completeness: 0.6,
      },
    ]) {
      await ctx.db.insert("catalogProducts", product);
    }
  });

  const results = await t.query(api.catalog.search, { query: "L’Oré" });

  expect(results.map((product) => product.productName)).toEqual([
    "Hydra Cream",
    "Revitalift Cream",
  ]);
});

test("bounds long pasted searches", async () => {
  const t = convexTest(schema, modules);
  await expect(
    t.query(api.catalog.search, { query: "cream ".repeat(100) }),
  ).resolves.toEqual([]);
});

function catalogRow(
  index: number,
  fields: {
    brand: string;
    productName: string;
    searchText: string;
    uniqueScans: number;
    completeness?: number;
  },
) {
  return {
    source: "open_beauty_facts" as const,
    sourceKey: `obf:${index}`,
    sourceUrl: `https://world.openbeautyfacts.org/product/${index}`,
    sourceModifiedAt: 1,
    license: "ODbL-1.0" as const,
    barcode: String(index),
    completeness: 0.5,
    ...fields,
  };
}

test("ranks multi-token matches above a more popular partial match", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    await ctx.db.insert(
      "catalogProducts",
      catalogRow(1, {
        brand: "CeraVe",
        productName: "Hydrating Cleanser",
        searchText: "cerave hydrating cleanser",
        uniqueScans: 9999,
      }),
    );
    await ctx.db.insert(
      "catalogProducts",
      catalogRow(2, {
        brand: "CeraVe",
        productName: "AM Facial Moisturizing Lotion SPF 30",
        searchText: "cerave am facial moisturizing lotion spf 30",
        uniqueScans: 5,
      }),
    );
  });

  const results = await t.query(api.catalog.search, { query: "CeraVe SPF" });

  expect(results[0]?.productName).toBe("AM Facial Moisturizing Lotion SPF 30");
});

test("resolves a brand alias to the intended family", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    await ctx.db.insert(
      "catalogProducts",
      catalogRow(1, {
        brand: "L'Oréal",
        productName: "Revitalift Cream",
        searchText: "l oreal revitalift cream",
        uniqueScans: 3,
      }),
    );
  });

  const results = await t.query(api.catalog.search, { query: "loreal" });

  expect(results.map((product) => product.productName)).toContain(
    "Revitalift Cream",
  );
});
