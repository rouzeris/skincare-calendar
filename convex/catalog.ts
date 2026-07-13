import { query } from "./_generated/server";
import { v } from "convex/values";

const RESULT_LIMIT = 15;
const SEARCH_CANDIDATES = 60;

function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const search = normalizeSearch(args.query)
      .split(" ")
      .slice(0, 16)
      .join(" ")
      .slice(0, 100);
    if (!search) return [];

    const matches = await ctx.db
      .query("catalogProducts")
      .withSearchIndex("search_searchText", (q) =>
        q.search("searchText", search),
      )
      .take(SEARCH_CANDIDATES);

    return matches
      .sort(
        (a, b) =>
          b.uniqueScans - a.uniqueScans ||
          b.completeness - a.completeness ||
          a.productName.localeCompare(b.productName),
      )
      .slice(0, RESULT_LIMIT)
      .map(({ _id, brand, productName, quantity, category, barcode }) => ({
        _id,
        brand,
        productName,
        quantity,
        category,
        barcode,
      }));
  },
});
