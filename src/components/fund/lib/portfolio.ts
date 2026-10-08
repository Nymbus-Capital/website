// portfolio.ts — breakdown bars and the daily portfolio block (freshness, origin, grid layout, totals)
import type {
  Bucket,
  FundData,
  PortfolioBreakdownKey,
  PortfolioData,
  PortfolioMetric,
} from "../../../lib/data/types.ts";
import { isFreshBook } from "../../../lib/data/freshness.ts";
import { isNum } from "./is-num.ts";

/** Buckets with a fund weight, largest first; index weights kept alongside. */
export function bucketRows(b: Bucket[] | undefined | null, limit = 12): Bucket[] {
  return (b ?? [])
    .filter((x) => isNum(x.fund) || isNum(x.index))
    .sort((a, c) => (c.fund ?? -1) - (a.fund ?? -1))
    .slice(0, limit);
}

const RATING_GRADES = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D"];
const isCashLabel = (s: string) => /\bcash\b|liquidit|encaisse|trésorerie/i.test(s);

/**
 * Rank of a credit-rating label (owner's rule: AAA at the top, then AA, A, BBB, … downward): its first grade
 * ("AA-" → AA, "BB & below" → BB, "R-1 (high)" unknown), unknown grades after the letter grades, "not rated" after them,
 * cash last.
 */
export function ratingSortRank(label: string): number {
  if (isCashLabel(label)) return 2000;
  if (/\bn\.?\s?r\.?\b|not rated|non cot/i.test(label)) return 1000;
  const m = label.trim().toUpperCase().match(/^(AAA|AA|A|BBB|BB|B|CCC|CC|C|D)(?![A-Z])/);
  return m ? RATING_GRADES.indexOf(m[1]) : 500;
}

/**
 * Rank of a maturity / duration bucket label (owner's rule: shortest at the top, longer downward): the lower bound of
 * its range in years ("Money Market (0-1 yr)" → 0, "Short-Term (>3 yrs)" → 3, "10+" → 10, "<1" → 0), with "money
 * market" / "short" / "mid" / "long" words as a fallback; unknown labels after them, cash last.
 */
export function termSortRank(label: string): number {
  if (isCashLabel(label)) return 2000;
  const range = label.match(/(<|>|≥|≤)?\s*(\d+(?:[.,]\d+)?)\s*(?:[-–—to à]+\s*(\d+(?:[.,]\d+)?))?\s*\+?/);
  if (range) {
    const lo = range[1] === "<" || range[1] === "≤" ? 0 : Number(range[2].replace(",", "."));
    if (Number.isFinite(lo)) return lo;
  }
  if (/money market|march[ée] monétaire|ultra/i.test(label)) return 0.5;
  if (/short|court/i.test(label)) return 1.5;
  if (/mid|moyen/i.test(label)) return 5;
  if (/long/i.test(label)) return 10;
  return 500;
}

/** Ordered categories (credit ratings, maturity / duration buckets) in the owner's display order; stable for ties. */
export function orderedBuckets(b: Bucket[] | undefined | null, kind: "rating" | "term" = "rating"): Bucket[] {
  const rank = kind === "rating" ? ratingSortRank : termSortRank;
  return (b ?? [])
    .filter((x) => isNum(x.fund) || isNum(x.index))
    .map((x, i) => ({ x, i }))
    .sort((p, q) => rank(p.x.label) - rank(q.x.label) || p.i - q.i)
    .map(({ x }) => x);
}

/**
 * A daily portfolio block with something to show. With `now`, the book must also be fresh (data/freshness.ts, the
 * pipeline's rule): an older book is not "daily" any more.
 */
export function hasDailyPortfolio(p: PortfolioData | null | undefined, now?: Date): p is PortfolioData {
  if (now && p && !isFreshBook(p.asOf, now)) return false;
  return (
    !!p &&
    p.source === "daily" &&
    (p.characteristics.some((m) => m.value != null) ||
      Object.values(p.breakdowns ?? {}).some((b) => !!b?.length) ||
      p.topHoldings.length > 0 ||
      isNum(p.greenBondsWeight))
  );
}

/**
 * Where the Portfolio tab's figures come from: the daily book (its date), else the month-end factsheet (its month),
 * else nothing.
 */
export function portfolioOrigin(
  data: Pick<FundData, "portfolio" | "factsheetMonth"> | null | undefined,
): { kind: "daily"; asOf: string } | { kind: "factsheet"; month: string } | null {
  if (hasDailyPortfolio(data?.portfolio)) return { kind: "daily", asOf: data!.portfolio!.asOf };
  return data?.factsheetMonth ? { kind: "factsheet", month: data.factsheetMonth } : null;
}

/** Breakdowns of the daily book in display order (paired by typical length in the two-column grid), as bars. */
const DAILY_BREAKDOWNS: PortfolioBreakdownKey[] = ["assetType", "country", "sector", "rating", "term"];
export function dailyBreakdowns(p: PortfolioData | null | undefined): { key: PortfolioBreakdownKey; rows: Bucket[] }[] {
  if (!p) return [];
  return DAILY_BREAKDOWNS.map((key) => {
    const rows = (p.breakdowns[key] ?? []).filter((r) => isNum(r.weight)).map((r) => ({ label: r.label, fund: r.weight }));
    return { key, rows: key === "rating" || key === "term" ? orderedBuckets(rows, key) : rows };
  }).filter((b) => b.rows.length > 0);
}

/**
 * Items of a two-column grid that span the full row: the wide ones, and any item that would otherwise sit alone in a
 * row (an odd count, or before a wide item), so no block is left in half a row next to an empty column.
 */
export function fullRowItems(wide: boolean[]): boolean[] {
  const out = [...wide];
  let col = 0;
  for (let i = 0; i < wide.length; i++) {
    if (wide[i]) {
      col = 0;
      continue;
    }
    if (col === 0 && (i + 1 >= wide.length || wide[i + 1])) out[i] = true;
    else col = col === 0 ? 1 : 0;
  }
  return out;
}

/** Weight of the ten largest holdings (decimal), only when the ten are listed: a shorter list gives no total. */
export function topTotal(items: { weight: number }[] | null | undefined): number | null {
  const w = (items ?? []).filter((h) => isNum(h.weight)).map((h) => h.weight);
  return w.length >= 10 ? w.slice(0, 10).reduce((a, b) => a + b, 0) : null;
}

/** Characteristics computed over part of the bonds only (coverage < 1): they get a footnote. */
export const partialCoverage = (metrics: PortfolioMetric[]): PortfolioMetric[] =>
  metrics.filter((m) => isNum(m.coverage) && m.coverage < 0.9995);
