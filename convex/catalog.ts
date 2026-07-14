import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  expandCatalogSearchQuery,
  normalizeCatalogSearch,
  rankCatalogCandidates,
} from "../shared/catalog-search";

const RESULT_LIMIT = 15;
const SEARCH_CANDIDATES = 60;

export const search = query({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("catalogProducts"),
      brand: v.string(),
      productName: v.string(),
      quantity: v.optional(v.string()),
      category: v.optional(v.string()),
      barcode: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const normalized = normalizeCatalogSearch(args.query)
      .split(" ")
      .slice(0, 16)
      .join(" ")
      .slice(0, 100);
    if (!normalized) return [];

    const matches = await ctx.db
      .query("catalogProducts")
      .withSearchIndex("search_searchText", (q) =>
        q.search("searchText", expandCatalogSearchQuery(normalized)),
      )
      .take(SEARCH_CANDIDATES);

    return rankCatalogCandidates(normalized, matches, RESULT_LIMIT).map(
      ({ _id, brand, productName, quantity, category, barcode }) => ({
        _id,
        brand,
        productName,
        quantity,
        category,
        barcode,
      }),
    );
  },
});
