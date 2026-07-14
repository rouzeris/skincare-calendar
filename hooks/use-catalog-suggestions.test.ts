import { expect, test } from "bun:test";
import { resolveCatalogSuggestionsState } from "./use-catalog-suggestions";

test("does not carry a failed query into new input during debounce", () => {
  const failedQuery = { isError: true, isFetching: false };

  expect(
    resolveCatalogSuggestionsState("new query", "failed query", failedQuery),
  ).toEqual({ status: "loading", suggestions: [] });
  expect(
    resolveCatalogSuggestionsState("failed query", "failed query", failedQuery),
  ).toEqual({ status: "error", suggestions: [] });
});
