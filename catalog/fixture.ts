import { normalizeCatalogSearch } from "@/shared/catalog-search";
import type { CatalogSearch, CatalogSuggestion } from "./types";

const suggestions: CatalogSuggestion[] = [
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

export const searchCatalogFixture: CatalogSearch = async (query) => {
  const search = normalizeCatalogSearch(query);
  return suggestions.filter((item) =>
    normalizeCatalogSearch(`${item.brand} ${item.productName}`).includes(
      search,
    ),
  );
};
