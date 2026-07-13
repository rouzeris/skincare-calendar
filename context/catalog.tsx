import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import { createConvexCatalogSearch } from "@/catalog/convex";
import { searchCatalogFixture } from "@/catalog/fixture";
import type { CatalogSearch } from "@/catalog/types";

const searchCatalog =
  process.env.EXPO_PUBLIC_CATALOG_FIXTURE === "true"
    ? searchCatalogFixture
    : createConvexCatalogSearch();
const CatalogContext = createContext<CatalogSearch | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  return (
    <CatalogContext.Provider value={searchCatalog}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalogSearch() {
  const search = useContext(CatalogContext);
  if (!search) throw new Error("useCatalogSearch requires CatalogProvider");
  return search;
}
