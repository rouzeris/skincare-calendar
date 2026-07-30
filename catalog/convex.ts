import { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { CatalogSearch } from "./types";

export function createConvexCatalogSearch(): CatalogSearch {
  const url = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("EXPO_PUBLIC_CONVEX_URL is required");
  const client = new ConvexReactClient(url);

  return async (query) =>
    (await client.query(api.catalog.search, { query })).map(
      ({ _id, ...suggestion }) => ({ id: _id, ...suggestion }),
    );
}
