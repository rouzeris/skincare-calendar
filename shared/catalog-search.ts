/**
 * Pure, Convex-runtime-free catalog search helpers.
 *
 * The Convex full-text `searchIndex` handles retrieval (typo tolerance + prefix
 * matching on the final term). These helpers own NORMALIZATION and RE-RANKING so
 * that textual relevance leads and popularity/completeness is only a tiebreaker.
 * Kept dependency-free so it is unit-testable in plain TS and reused verbatim by
 * the Convex query.
 */

/** Fold diacritics + punctuation, collapse whitespace, lowercase. */
export function normalizeCatalogSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

export function tokenizeCatalogSearch(value: string): string[] {
  const normalized = normalizeCatalogSearch(value);
  return normalized ? normalized.split(" ") : [];
}

/**
 * Common brand aliases / transliterations, keyed by a normalized token.
 * Applied both to widen Convex retrieval and to score matches, so equivalent
 * spellings collapse onto the same product family. Extend as needed.
 */
export const CATALOG_ALIASES: Record<string, readonly string[]> = {
  loreal: ["oreal"],
  oreal: ["loreal"],
  laroche: ["roche"],
  vaselina: ["vaseline"],
  vaseline: ["vaselina"],
  neutrogena: ["neutrogina"],
};

function aliasesFor(token: string): string[] {
  return [token, ...(CATALOG_ALIASES[token] ?? [])];
}

/** Bounded Levenshtein: true iff edit distance between a and b is <= max. */
function withinEditDistance(a: string, b: string, max: number): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > max) return false;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return false;
    previous = current;
  }
  return previous[b.length] <= max;
}

const EXACT = 3;
const PREFIX = 2;
const FUZZY = 1;

/** Best match strength of a single query token against a document's tokens. */
function tokenMatchStrength(queryToken: string, docTokens: string[]): number {
  let best = 0;
  for (const variant of aliasesFor(queryToken)) {
    for (const docToken of docTokens) {
      if (docToken === variant) return EXACT;
      if (docToken.startsWith(variant) || variant.startsWith(docToken)) {
        best = Math.max(best, PREFIX);
      } else if (
        variant.length >= 4 &&
        withinEditDistance(variant, docToken, 1)
      ) {
        best = Math.max(best, FUZZY);
      }
    }
  }
  return best;
}

export type RankableCatalogRecord = {
  searchText: string;
  uniqueScans: number;
  completeness: number;
  productName: string;
};

export function scoreCatalogRecord(
  queryTokens: string[],
  record: RankableCatalogRecord,
): { score: number; matched: number } {
  const docTokens = record.searchText.split(" ").filter(Boolean);
  let score = 0;
  let matched = 0;
  for (const queryToken of queryTokens) {
    const strength = tokenMatchStrength(queryToken, docTokens);
    if (strength > 0) matched++;
    score += strength;
  }
  return { score, matched };
}

/**
 * Re-rank Convex search candidates so relevance leads:
 *   1. records matching ALL query tokens first (multi-token AND priority),
 *   2. then more query tokens matched,
 *   3. then stronger textual match (exact > prefix > fuzzy),
 *   4. popularity (uniqueScans) and completeness only as tiebreakers.
 */
export function rankCatalogCandidates<T extends RankableCatalogRecord>(
  query: string,
  candidates: T[],
  limit: number,
): T[] {
  const queryTokens = tokenizeCatalogSearch(query);
  const tokenCount = queryTokens.length;

  return candidates
    .map((record) => ({ record, ...scoreCatalogRecord(queryTokens, record) }))
    .sort((a, b) => {
      const aAll = a.matched === tokenCount ? 1 : 0;
      const bAll = b.matched === tokenCount ? 1 : 0;
      return (
        bAll - aAll ||
        b.matched - a.matched ||
        b.score - a.score ||
        b.record.uniqueScans - a.record.uniqueScans ||
        b.record.completeness - a.record.completeness ||
        a.record.productName.localeCompare(b.record.productName)
      );
    })
    .slice(0, limit)
    .map((entry) => entry.record);
}

/**
 * Widen the Convex search string with alias variants so alias/transliteration
 * matches are retrieved before ranking. Preserves token order (keeping the
 * user's final token available for prefix autocomplete) and stays bounded.
 */
export function expandCatalogSearchQuery(normalizedQuery: string): string {
  const tokens = normalizedQuery ? normalizedQuery.split(" ") : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    for (const variant of aliasesFor(token)) {
      if (!seen.has(variant)) {
        seen.add(variant);
        out.push(variant);
      }
    }
  }
  return out.slice(0, 16).join(" ");
}
