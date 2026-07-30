import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CatalogSuggestion } from "@/catalog/types";
import { searchCatalog } from "@/catalog/search";

export type CatalogSuggestionsState = {
  status: "not-queried" | "loading" | "complete" | "error";
  suggestions: CatalogSuggestion[];
};

const notQueried: CatalogSuggestionsState = {
  status: "not-queried",
  suggestions: [],
};

type CatalogQueryResult = {
  data?: CatalogSuggestion[];
  isError: boolean;
  isFetching: boolean;
};

export function resolveCatalogSuggestionsState(
  query: string,
  debouncedQuery: string,
  result: CatalogQueryResult,
): CatalogSuggestionsState {
  const suggestions = result.data ?? [];
  if (query.length < 2) return notQueried;
  if (query !== debouncedQuery) return { status: "loading", suggestions };
  if (result.isError) return { status: "error", suggestions };
  if (result.isFetching) return { status: "loading", suggestions };
  return { status: "complete", suggestions };
}

export function useCatalogSuggestions(name: string): CatalogSuggestionsState {
  const query = name.trim();
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("");
      return;
    }

    const timeout = setTimeout(() => setDebouncedQuery(query), 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const result = useQuery({
    queryKey: ["catalogSuggestions", debouncedQuery],
    queryFn: () => searchCatalog(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    placeholderData: keepPreviousData,
    retry: false,
  });
  return resolveCatalogSuggestionsState(query, debouncedQuery, result);
}
