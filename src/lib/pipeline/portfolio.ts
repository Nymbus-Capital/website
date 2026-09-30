/**
 * Daily portfolio block (FundData.portfolio) from the dataplatform fund-portfolio book. Pure.
 *
 *  - selectPortfolio: is the daily book usable (coverage thresholds, freshness)? If so, map it; otherwise the
 *    Portfolio tab keeps the month-end factsheet figures and an issue says why.
 *  - crossCheckPortfolio: at a month-end where both exist, compare the book with the factsheet of that month.
 *
 * The data platform computes every figure; this module only selects, reorders and relabels. Thresholds and
 * tolerances: config.ts PORTFOLIO.
 */
import type { Bucket, Characteristic, Issue, PortfolioBreakdownKey, PortfolioData, PortfolioHolding, PortfolioMetric, PortfolioMetricId, WeightBucket } from "../data/types.ts";
import { PORTFOLIO } from "./config.ts";
import { bookAgeProblem } from "../data/freshness.ts";
import type { BreakdownKey, FundPortfolio, PortfolioMeasureKey, SourceResult, WeightRow } from "./raw.ts";

const DAY = 86_400_000;
const pct = (x: number, d = 1): string => `${(x * 100).toFixed(d)}%`;

/* ------------------------------------------------------------------ mapping */

const METRICS: { from: PortfolioMeasureKey; id: PortfolioMetricId; unit: PortfolioMetric["unit"] }[] = [
  { from: "modified_duration", id: "duration", unit: "years" },
  { from: "yield_to_maturity", id: "ytm", unit: "pct" },
  { from: "coupon", id: "coupon", unit: "pct" },
  { from: "average_maturity", id: "maturity", unit: "years" },
  { from: "average_rating", id: "rating", unit: "rating" },
];

const BREAKDOWNS: { from: BreakdownKey; to: PortfolioBreakdownKey }[] = [
  { from: "sector", to: "sector" }, { from: "rating", to: "rating" }, { from: "term", to: "term" },
  { from: "country", to: "country" }, { from: "asset_type", to: "assetType" },
];

/** Letter grades from best to worst; "not rated" always last. */
export const RATING_ORDER = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D"];
export const TERM_BUCKETS = ["0-1", "1-3", "3-5", "5-7", "7-10", "10+"];

const isNotRated = (label: string): boolean => /^(nr|n\/r|not rated|unrated)$/i.test(label.trim());
const isCash = (label: string): boolean => /^cash$/i.test(label.trim());

/** Rank of a rating label: letter grades in order, unknown labels after them, then "not rated", then cash. */
export function ratingRank(label: string): number {
  if (isCash(label)) return 2000;
  if (isNotRated(label)) return 1000;
  const i = RATING_ORDER.indexOf(label.trim().toUpperCase().replace(/[+-]$/, ""));
  return i >= 0 ? i : 500;
}

/** Term buckets in bucket order, unknown labels after them, cash last. */
export function termRank(label: string, order: string[] = TERM_BUCKETS): number {
  if (isCash(label)) return 2000;
  const norm = (s: string) => s.replace(/\s|yrs?|years?/gi, "").replace(/[–—]/g, "-");
  const i = order.map(norm).indexOf(norm(label));
  return i >= 0 ? i : 500;
}

/** Breakdown rows in display order: ratings and terms in their natural order, the others largest first; cash last. */
export function orderRows(key: PortfolioBreakdownKey, rows: WeightRow[], termOrder?: string[]): WeightBucket[] {
  const out = rows.map((r) => ({ label: r.label, weight: r.weight, count: r.count }));
  const byWeight = (a: WeightBucket, b: WeightBucket) => b.weight - a.weight;
  if (key === "rating") return out.sort((a, b) => ratingRank(a.label) - ratingRank(b.label) || byWeight(a, b));
  if (key === "term") return out.sort((a, b) => termRank(a.label, termOrder) - termRank(b.label, termOrder) || byWeight(a, b));
  // largest first, cash at the end (it is not a category of securities)
  return out.sort((a, b) => Number(isCash(a.label)) - Number(isCash(b.label)) || byWeight(a, b));
}

/** Characteristics whose own coverage is at least the threshold, in display order; the others are listed in `hidden`. */
export function coveredMetrics(book: FundPortfolio): { metrics: PortfolioMetric[]; hidden: string[] } {
  const metrics: PortfolioMetric[] = [];
  const hidden: string[] = [];
  for (const m of METRICS) {
    const src = book.characteristics[m.from];
    if (!src) continue;
    const typeOk = m.unit === "rating" ? typeof src.value === "string" : typeof src.value === "number";
    if (!typeOk) { hidden.push(`${m.from} (value of the wrong type)`); continue; }
    if (src.coverage === null || src.coverage < PORTFOLIO.minMetricCoverage) {
      hidden.push(`${m.from} (coverage ${src.coverage === null ? "unknown" : pct(src.coverage)})`);
      continue;
    }
    metrics.push({ id: m.id, value: src.value, unit: m.unit, coverage: Math.min(1, src.coverage) });
  }
  return { metrics, hidden };
}

function holdings(book: FundPortfolio): PortfolioHolding[] {
  return [...book.top_holdings].sort((a, b) => b.weight - a.weight).slice(0, 10).map((h) => ({
    name: h.name, weight: h.weight, coupon: h.coupon, maturity: h.maturity, rating: h.rating, sector: h.sector, green: h.green_bond,
  }));
}

/** The daily book in the site's shape (no selection rule applied here). */
export function mapPortfolio(book: FundPortfolio, opts: { greenBonds: boolean }): PortfolioData {
  const breakdowns: PortfolioData["breakdowns"] = {};
  for (const b of BREAKDOWNS) {
    const rows = book.breakdowns[b.from];
    if (rows?.length) breakdowns[b.to] = orderRows(b.to, rows);
  }
  const t = book.totals;
  return {
    source: "daily",
    asOf: book.as_of,
    characteristics: coveredMetrics(book).metrics,
    breakdowns,
    topHoldings: holdings(book),
    greenBondsWeight: opts.greenBonds ? book.green_bonds_weight : null,
    totals: { holdings: t.holdings_count, bonds: t.bonds_count, cashWeight: t.cash_weight, derivatives: t.derivatives_count },
    coverage: { resolved: book.coverage.resolved_weight, priced: book.coverage.priced_weight },
  };
}

/* ------------------------------------------------------------------ selection */

export interface PortfolioSelection {
  portfolio: PortfolioData | null;
  issues: Issue[];
  provenance: string | null;
  /** the endpoint answered 404 (not deployed yet): reported once per run by the caller, not per fund */
  absent: boolean;
}

/**
 * Daily book as the primary source when it is recent and covered enough; else null (the factsheet figures stay) with
 * an issue. `short` names the fund in messages and provenance only.
 */
export function selectPortfolio(res: SourceResult<FundPortfolio> | undefined, o: { base: string; short: string; now: Date; greenBonds: boolean }): PortfolioSelection {
  const key = `${o.base}.portfolio`;
  const none = (issues: Issue[] = [], absent = false): PortfolioSelection => ({ portfolio: null, issues, provenance: null, absent });
  if (!res) return none();
  if (!res.ok || !res.data) {
    if (res.absent) return none([], true);
    return none([{ key, level: "warn", message: `daily portfolio unavailable (${res.error ?? "no data"}): month-end factsheet figures shown` }]);
  }
  const book = res.data;
  const issues: Issue[] = book.notes.length ? [{ key, level: "info", message: `fund-portfolio payload: ${book.notes.slice(0, 5).join("; ")}` }] : [];
  const stale = bookAgeProblem(book.as_of, o.now);
  if (stale) return none([...issues, { key, level: "warn", message: `daily portfolio not used: ${stale}; month-end factsheet figures shown` }]);
  const { priced_weight: priced, resolved_weight: resolved } = book.coverage;
  if (priced === null || resolved === null || priced < PORTFOLIO.minPricedWeight || resolved < PORTFOLIO.minResolvedWeight) {
    const fmt = (v: number | null) => (v === null ? "unknown" : pct(v));
    return none([...issues, {
      key, level: "warn",
      message: `daily portfolio coverage below the thresholds (priced ${fmt(priced)} < ${pct(PORTFOLIO.minPricedWeight, 0)} or resolved ${fmt(resolved)} < ${pct(PORTFOLIO.minResolvedWeight, 0)} of the bond weight): month-end factsheet figures shown`,
    }]);
  }
  const portfolio = mapPortfolio(book, { greenBonds: o.greenBonds });
  const { hidden } = coveredMetrics(book);
  if (hidden.length) issues.push({ key: `${key}.characteristics`, level: "info", message: `not shown (coverage below ${pct(PORTFOLIO.minMetricCoverage, 0)} or unusable): ${hidden.join(", ")}` });
  if (book.warnings.length) issues.push({ key, level: "info", message: `dataplatform: ${book.warnings.slice(0, 5).join("; ")}` });
  const m = book.method;
  const provenance = `dataplatform /api/apex/fund-portfolio ${o.short} (FINAL_NAV book ${book.as_of}; priced ${pct(priced)}, resolved ${pct(resolved)} of the bond weight${m.weights ? `; weights: ${m.weights}` : ""}${m.duration ? `; duration: ${m.duration}` : ""})`;
  return { portfolio, issues, provenance, absent: false };
}

/* ------------------------------------------------------------------ month-end cross-check */

export interface FactsheetPortfolio {
  /** YYYY-MM */
  month: string;
  characteristics: Characteristic[];
  sectors?: Bucket[];
}

const lastDayOfMonth = (ym: string): string => new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0)).toISOString().slice(0, 10);
const normLabel = (s: string): string => s.toLowerCase().replace(/[^a-z]/g, "").replace(/s$/, "");

/** A book usable for the month-end comparison: in the factsheet's month, within its last days. */
export function monthEndBook(books: (FundPortfolio | null | undefined)[], month: string): FundPortfolio | null {
  const end = lastDayOfMonth(month);
  for (const b of books) {
    if (!b || b.as_of.slice(0, 7) !== month) continue;
    if ((Date.parse(end) - Date.parse(b.as_of)) / DAY <= PORTFOLIO.crossCheck.bookWithinDays) return b;
  }
  return null;
}

/**
 * Compares the month-end book with the factsheet of the same month. Returns warn issues for gaps beyond the
 * tolerances (config PORTFOLIO.crossCheck), an info issue when nothing could be compared. Never blocks.
 */
export function crossCheckPortfolio(book: FundPortfolio, fs: FactsheetPortfolio, key: string): Issue[] {
  const tol = PORTFOLIO.crossCheck;
  const out: Issue[] = [];
  let compared = 0;
  const fsNum = (id: string): number | null => {
    const c = fs.characteristics.find((x) => x.id === id);
    return typeof c?.fund === "number" && Number.isFinite(c.fund) ? c.fund : null;
  };
  const apiNum = (k: PortfolioMeasureKey): number | null => {
    const v = book.characteristics[k]?.value;
    return typeof v === "number" ? v : null;
  };
  const dur = [apiNum("modified_duration"), fsNum("duration")] as const;
  if (dur[0] !== null && dur[1] !== null) {
    compared++;
    const limit = Math.max(tol.durationYears, tol.durationRel * Math.abs(dur[1]));
    if (Math.abs(dur[0] - dur[1]) > limit) out.push({ key: `${key}.duration`, level: "warn", message: `month-end cross-check ${book.as_of}: duration ${dur[0].toFixed(2)} (daily book) vs ${dur[1].toFixed(2)} (factsheet ${fs.month}), gap above ${limit.toFixed(2)} year` });
  }
  const yld = [apiNum("yield_to_maturity"), fsNum("portfolioYield")] as const;
  if (yld[0] !== null && yld[1] !== null) {
    compared++;
    if (Math.abs(yld[0] - yld[1]) > tol.yield) out.push({ key: `${key}.ytm`, level: "warn", message: `month-end cross-check ${book.as_of}: yield to maturity ${pct(yld[0], 2)} (daily book) vs portfolio yield ${pct(yld[1], 2)} (factsheet ${fs.month}), gap above ${pct(tol.yield, 2)}; the two measures may differ (the factsheet figure is not necessarily a yield to maturity): check before reading it as an error` });
  }
  const fsSectors = new Map((fs.sectors ?? []).filter((b) => typeof b.fund === "number").map((b) => [normLabel(b.label), b.fund as number]));
  const top = [...(book.breakdowns.sector ?? [])].filter((r) => normLabel(r.label) !== "cash").sort((a, b) => b.weight - a.weight).slice(0, tol.sectors);
  for (const r of top) {
    const f = fsSectors.get(normLabel(r.label));
    if (f === undefined) continue;
    compared++;
    if (Math.abs(r.weight - f) > tol.sectorWeight) out.push({ key: `${key}.sector`, level: "warn", message: `month-end cross-check ${book.as_of}: sector ${r.label} ${pct(r.weight)} (daily book) vs ${pct(f)} (factsheet ${fs.month}), gap above ${pct(tol.sectorWeight, 0)}` });
  }
  if (!compared) out.push({ key, level: "info", message: `month-end cross-check ${book.as_of}: nothing comparable with the factsheet ${fs.month}` });
  return out;
}
