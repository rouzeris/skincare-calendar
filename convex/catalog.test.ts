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
