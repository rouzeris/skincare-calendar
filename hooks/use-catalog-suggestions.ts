import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { normalizeCatalogSearch } from "@/shared/catalog-search";

export type CatalogSuggestion = {
  id: string;
  barcode: string;
  brand: string;
  productName: string;
  quantity?: string;
  category?: string;
};

const fixture: CatalogSuggestion[] = [
  {
    id: "fixture-cerave-cleanser",
    barcode: "fixture-1",
    brand: "CeraVe",
    productName: "Hydrating Facial Cleanser",
    quantity: "236 ml",
    category: "Face cleansers",
  },
  {
    id: "fixture-loreal-cream",
    barcode: "fixture-2",
    brand: "L'Oréal",
    productName: "Revitalift Cream",
    quantity: "50 ml",
    category: "Face creams",
  },
];

const useFixture = process.env.EXPO_PUBLIC_CATALOG_FIXTURE === "true";

function searchFixture(query: string) {
  const search = normalizeCatalogSearch(query);
  if (search.length < 2) return [];
  return fixture.filter((item) =>
    normalizeCatalogSearch(`${item.brand} ${item.productName}`).includes(
      search,
    ),
  );
}

export function useCatalogSuggestions(name: string) {
  const [catalogQuery, setCatalogQuery] = useState("");
  const [displayed, setDisplayed] = useState<CatalogSuggestion[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => setCatalogQuery(name.trim()), 200);
    return () => clearTimeout(timeout);
  }, [name]);

  const remote = useQuery(
    api.catalog.search,
    !useFixture && catalogQuery.length > 1 ? { query: catalogQuery } : "skip",
  );
  const current = useMemo(
    () =>
      useFixture
        ? searchFixture(catalogQuery)
        : remote?.map(({ _id, ...item }) => ({ id: _id, ...item })),
    [catalogQuery, remote],
  );

  useEffect(() => {
    if (current !== undefined) setDisplayed(current);
  }, [current]);

  return displayed;
}
