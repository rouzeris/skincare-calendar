import { createConvexCatalogSearch } from "@/catalog/convex";
import { searchCatalogFixture } from "@/catalog/fixture";
import type { CatalogSearch } from "@/catalog/types";

export const searchCatalog: CatalogSearch =
  process.env.EXPO_PUBLIC_CATALOG_FIXTURE === "true"
    ? searchCatalogFixture
    : createConvexCatalogSearch();
