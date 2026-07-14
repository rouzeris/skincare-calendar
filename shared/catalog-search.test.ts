import { expect, test } from "vitest";
import {
  expandCatalogSearchQuery,
  normalizeCatalogSearch,
  rankCatalogCandidates,
  type RankableCatalogRecord,
} from "./catalog-search";

function record(
  searchText: string,
  productName: string,
  uniqueScans = 0,
  completeness = 0,
): RankableCatalogRecord {
  return { searchText, productName, uniqueScans, completeness };
}

test("normalizes diacritics and punctuation to a shared form", () => {
  expect(normalizeCatalogSearch("L'Oréal")).toBe("l oreal");
  expect(normalizeCatalogSearch("CeraVe — SPF 50+")).toBe("cerave spf 50");
  expect(normalizeCatalogSearch("Loréal")).toBe("loreal");
});

test("ranks records matching all tokens above popular partial matches", () => {
  const spf = record(
    "cerave am facial moisturizing lotion spf 30",
    "AM Facial Moisturizing Lotion SPF 30",
    5,
  );
  const generic = record(
    "cerave hydrating cleanser",
    "Hydrating Cleanser",
    9999,
  );

  const ranked = rankCatalogCandidates("cerave spf", [generic, spf], 10);

  expect(ranked[0]).toBe(spf);
});

test("tolerates a single-character typo in the brand", () => {
  const cerave = record("cerave hydrating cleanser", "Hydrating Cleanser", 3);
  const other = record("nivea soft cream", "Soft Cream", 100);

  const ranked = rankCatalogCandidates("cerave", [other, cerave], 10);

  expect(ranked[0]).toBe(cerave);
});

test("resolves a brand alias to the intended family", () => {
  const loreal = record("l oreal revitalift cream", "Revitalift Cream", 2);
  const decoy = record("garnier micellar water", "Micellar Water", 500);

  const ranked = rankCatalogCandidates("loreal", [decoy, loreal], 10);

  expect(ranked[0]).toBe(loreal);
});

test("popularity only breaks ties among equally relevant matches", () => {
  const popular = record("cerave hydra cream", "Hydra Cream", 20);
  const rare = record("cerave revitalift cream", "Revitalift Cream", 2);

  const ranked = rankCatalogCandidates("cerave cream", [rare, popular], 10);

  expect(ranked.map((r) => r.productName)).toEqual([
    "Hydra Cream",
    "Revitalift Cream",
  ]);
});

test("expands alias variants into the retrieval query", () => {
  expect(expandCatalogSearchQuery("loreal cream")).toBe("loreal oreal cream");
  expect(expandCatalogSearchQuery("cerave")).toBe("cerave");
});
