import { useEffect, useRef, useState } from "react";
import type { CatalogSuggestion } from "@/catalog/types";
import { useCatalogSearch } from "@/context/catalog";

export type CatalogSuggestionsState = {
  status: "not-queried" | "loading" | "complete" | "error";
  suggestions: CatalogSuggestion[];
};

type CatalogRequestState = CatalogSuggestionsState & { query: string };

const notQueried: CatalogRequestState = {
  query: "",
  status: "not-queried",
  suggestions: [],
};

export function useCatalogSuggestions(name: string): CatalogSuggestionsState {
  const search = useCatalogSearch();
  const request = useRef(0);
  const [state, setState] = useState<CatalogRequestState>(notQueried);

  useEffect(() => {
    const query = name.trim();
    const requestId = ++request.current;
    if (query.length < 2) {
      setState(notQueried);
      return;
    }

    setState((current) => ({
      query,
      status: "loading",
      suggestions: current.suggestions,
    }));
    const timeout = setTimeout(() => {
      void search(query).then(
        (suggestions) => {
          if (request.current === requestId)
            setState({ query, status: "complete", suggestions });
        },
        () => {
          if (request.current === requestId)
            setState((current) => ({ ...current, status: "error" }));
        },
      );
    }, 200);

    return () => clearTimeout(timeout);
  }, [name, search]);

  const query = name.trim();
  if (query.length < 2) return notQueried;
  if (state.query !== query)
    return { status: "loading", suggestions: state.suggestions } as const;
  return state;
}
