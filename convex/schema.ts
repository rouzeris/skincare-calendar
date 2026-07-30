import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  catalogProducts: defineTable({
    source: v.literal("open_beauty_facts"),
    sourceKey: v.string(),
    sourceUrl: v.string(),
    sourceModifiedAt: v.number(),
    license: v.literal("ODbL-1.0"),
    barcode: v.string(),
    brand: v.string(),
    productName: v.string(),
    quantity: v.optional(v.string()),
    category: v.optional(v.string()),
    searchText: v.string(),
    uniqueScans: v.number(),
    completeness: v.number(),
  })
    .index("by_sourceKey", ["sourceKey"])
    .index("by_barcode", ["barcode"])
    .searchIndex("search_searchText", { searchField: "searchText" }),
  waitlist: defineTable({
    email: v.string(),
    locale: v.string(),
  }).index("by_email", ["email"]),
});
