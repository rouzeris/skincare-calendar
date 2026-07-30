export type CatalogSuggestion = {
  id: string;
  barcode: string;
  brand: string;
  productName: string;
  quantity?: string;
  category?: string;
};

export type CatalogSearch = (query: string) => Promise<CatalogSuggestion[]>;
