import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CatalogSuggestion } from "@/catalog/types";
import { useCatalogSearch } from "@/context/catalog";

export type CatalogSuggestionsState = {
  status: "not-queried" | "loading" | "complete" | "error";
  suggestions: CatalogSuggestion[];
};

const notQueried: CatalogSuggestionsState = {
  status: "not-queried",
  suggestions: [],
};

export function useCatalogSuggestions(name: string): CatalogSuggestionsState {
  const search = useCatalogSearch();
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
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    placeholderData: keepPreviousData,
    retry: false,
  });
  const suggestions = result.data ?? [];

  if (query.length < 2) return notQueried;
  if (result.isError) return { status: "error", suggestions };
  if (query !== debouncedQuery || result.isFetching)
    return { status: "loading", suggestions };
  return { status: "complete", suggestions };
}
