/**
 * Pure selectors that turn the data contract into what each block draws. Nothing here invents a number:
 * every value returned comes from the published data, or is a ratio of two published values (growth
 * rebasing to the start of a range, heatmap colour intensity).
 */
import type {
  Bucket, CalendarRow, ClassDistribution, DistributionsData, DocType, DocumentMeta, FundContent, FundData, GrowthPoint, MonthlyPoint, NavClass, Period, PeriodMap,
  PortfolioBreakdownKey, PortfolioData, PortfolioMetric, RiskStats,
} from "../../../lib/data/types.ts";
import { isFreshBook } from "../../../lib/data/freshness.ts";

export const PERIOD_ORDER: Period[] = ["1M", "3M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "SI"];
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Periods for which the fund has a trailing return, in display order. */
export function trailingPeriods(fund: PeriodMap | undefined | null): Period[] {
  if (!fund) return [];
  return PERIOD_ORDER.filter((p) => isNum(fund[p]));
}

/** Monthly returns in a track record from `firstMonth` to `asOf` (both month-ends, inclusive). */
export function trackMonths(firstMonth: string, asOf: string): number {
  return monthsBetween(firstMonth, asOf) + 1;
}

/**
 * Since-inception return is annualized when the record has at least 12 monthly returns: the pipeline's rule
 * (metrics.trailing: `si.length >= 12`). Unknown dates: annualized (the pipeline's default for long records).
 */
export function siAnnualized(firstMonth?: string | null, asOf?: string | null): boolean {
  if (!firstMonth || !asOf) return true;
  return trackMonths(firstMonth, asOf) >= 12;
}

/** Periods that are annualized (2 years and more, and since inception from 12 monthly returns). */
export function isAnnualized(p: Period, firstMonth?: string | null, asOf?: string | null): boolean {
  if (p === "2Y" || p === "3Y" || p === "5Y" || p === "10Y") return true;
  if (p !== "SI") return false;
  return siAnnualized(firstMonth, asOf);
}

export function monthsBetween(a: string, b: string): number {
  const [ya, ma] = [+a.slice(0, 4), +a.slice(5, 7)];
  const [yb, mb] = [+b.slice(0, 4), +b.slice(5, 7)];
  return (yb - ya) * 12 + (mb - ma);
}

/**
 * Value added rounded to the precision it is displayed at (percent points, `decimals`), as a decimal
 * fraction; 0 means "in line with the benchmark" (never "−0.0%").
 */
export function vaRounded(va: number | null | undefined, decimals = 1): number | null {
  if (!isNum(va)) return null;
  const k = Math.pow(10, decimals);
  const r = +(Math.round(va * 100 * k) / k / 100).toFixed(decimals + 2);
  return Math.abs(r) < 1e-12 ? 0 : r;
}

/** Label of the class the performance is published for: "Series F", else "class FP", else null. */
/**
 * Benchmark name to display: in French the registry's localized name (the published FTSE `indexName` is English);
 * in English the published name, else the registry's. The disclosure / provenance keep the raw `indexName`.
 */
export function benchmarkLabel(indexName: string | null | undefined, benchmark: { en: string; fr: string } | null | undefined, lang: "en" | "fr"): string | null {
  const loc = benchmark ? benchmark[lang] || benchmark.en : null;
  if (lang === "fr") return loc || indexName || null;
  return indexName || loc || null;
}

export function perfClassLabel(perf: { returnClass?: string; returnClassLabel?: string } | null | undefined, classWord: string): string | null {
  if (!perf) return null;
  // labels arrive in English ("Series FP"): keep only the class code and use the localised word
  const m = perf.returnClassLabel?.match(/^(?:series|class|s\u00e9rie|classe)\s+(.+)$/i);
  if (m) return `${classWord} ${m[1]}`;
  if (perf.returnClassLabel) return perf.returnClassLabel;
  return perf.returnClass ? `${classWord} ${perf.returnClass}` : null;
}

export const RISK_LEVELS = ["low", "low-medium", "medium", "medium-high", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
export const riskIndex = (r: string | null | undefined) => Math.max(0, RISK_LEVELS.indexOf((r ?? "low") as RiskLevel));

/** The class whose NAV headlines: the admin's choice, else the registry default, else the first class with a NAV. */
export function headlineClass(classes: NavClass[] | undefined | null, preferred: (string | null | undefined)[]): NavClass | null {
  if (!classes?.length) return null;
  for (const code of preferred) {
    if (!code) continue;
    const hit = classes.find((c) => c.fundserv.toUpperCase() === code.toUpperCase());
    if (hit) return hit;
  }
  return classes.find((c) => isNum(c.nav)) ?? classes[0];
}

/* ------------------------------------------------------------------ growth of 10 000 $ */

export type Range = "1Y" | "3Y" | "5Y" | "SI";
export const RANGE_MONTHS: Record<Range, number> = { "1Y": 12, "3Y": 36, "5Y": 60, SI: Infinity };

/** Ranges the record is long enough for (SI always; 1Y/3Y/5Y only when shorter than the whole record). */
export function availableRanges(points: GrowthPoint[]): Range[] {
  const months = points.length - 1;
  const out: Range[] = (["1Y", "3Y", "5Y"] as Range[]).filter((r) => months > RANGE_MONTHS[r]);
  return [...out, "SI"];
}

export type GrowthMethod = "compounded" | "arithmetic";

/**
 * How the published growth series aggregates returns: the published `method`, else arithmetic for a gross series
 * (the GMV overlay, computed on notional without reinvestment), else compounded.
 */
export function growthMethod(perf: { method?: string | null; basis?: string | null } | null | undefined, specBasis?: "net" | "gross"): GrowthMethod {
  if (perf?.method === "arithmetic" || perf?.method === "compounded") return perf.method;
  return (perf?.basis ?? specBasis) === "gross" ? "arithmetic" : "compounded";
}

export interface GrowthSeries {
  dates: string[]; fund: number[]; index: (number | null)[]; hasIndex: boolean; start: number;
  /** fund return over the range shown (decimal), consistent with the method: what the end label / aria state */
  change: number | null;
}

/**
 * Points of a range, rebased so the range starts at 10 000 $ like the published series (10 000 $ at inception).
 * A compounded series is rebased by ratio (p / p0 × 10 000); an arithmetic one (10 000 × (1 + Σr), no reinvestment)
 * additively (10 000 + p − p0), which is 10 000 × (1 + Σr over the range). SI returns the published values untouched.
 */
export function growthRange(points: GrowthPoint[], range: Range, method: GrowthMethod = "compounded"): GrowthSeries {
  const clean = points.filter((p) => isNum(p.fund));
  const n = RANGE_MONTHS[range];
  const slice = n === Infinity || clean.length <= n + 1 ? clean : clean.slice(clean.length - (n + 1));
  const base = clean[0]?.fund ?? 10000;
  const start = 10000;
  const f0 = slice[0]?.fund;
  const i0 = slice.find((p) => isNum(p.index))?.index ?? null;
  const rebased = range !== "SI" && slice !== clean;
  const add = method === "arithmetic";
  const rb = (v: number, v0: number | null | undefined) => (!rebased || !isNum(v0) || !v0 ? v : add ? start + (v - v0) : (v / v0) * start);
  const fund = slice.map((p) => rb(p.fund, f0));
  const index = slice.map((p) => (isNum(p.index) ? rb(p.index, i0) : null));
  const s0 = rebased ? start : base;
  const last = fund[fund.length - 1];
  // arithmetic: Σr over the range = (p − p0) / notional; compounded: p / p0 − 1 (the notional is 10 000 $ either way)
  const change = fund.length > 1 && isNum(last) && s0 ? (add ? (last - fund[0]) / start : last / fund[0] - 1) : null;
  return { dates: slice.map((p) => p.date), fund, index, hasIndex: index.some(isNum), start: s0, change };
}

/* ------------------------------------------------------------------ calendar */

export function calendarRows(rows: CalendarRow[] | undefined | null): CalendarRow[] {
  return (rows ?? []).filter((r) => isNum(r.fund) || isNum(r.index)).sort((a, b) => a.year - b.year);
}

/** Why a calendar year is incomplete: "ytd" only for the as-of year, "launch" for an earlier partial (inception) year. */
export type PartialKind = "ytd" | "launch" | null;

export function partialKind(year: number, partial: boolean | null | undefined, asOf: string | null | undefined): PartialKind {
  if (!partial) return null;
  const y = asOf && /^\d{4}/.test(asOf) ? +asOf.slice(0, 4) : null;
  return y != null && year === y ? "ytd" : "launch";
}

/* ------------------------------------------------------------------ monthly heatmap */

export interface HeatRow { year: number; cells: (number | null)[]; total: number | null; partial: boolean; kind: PartialKind }

/**
 * Years × 12 months grid of monthly returns, with the calendar-year return when published. A partial row is
 * "ytd" only for the as-of year (default: the last published month), "launch" for a partial inception year.
 */
export function heatmapGrid(monthly: MonthlyPoint[] | undefined | null, calendar?: CalendarRow[] | null, asOf?: string | null): HeatRow[] {
  const byYear = new Map<number, (number | null)[]>();
  for (const p of monthly ?? []) {
    if (!isNum(p.r)) continue;
    const y = +p.month.slice(0, 4), m = +p.month.slice(5, 7);
    if (!y || m < 1 || m > 12) continue;
    if (!byYear.has(y)) byYear.set(y, Array(12).fill(null));
    byYear.get(y)![m - 1] = p.r;
  }
  const cal = new Map((calendar ?? []).map((c) => [c.year, c]));
  const lastMonth = (monthly ?? []).filter((p) => isNum(p.r)).map((p) => p.month).sort().pop() ?? null;
  const end = asOf ?? lastMonth;
  return [...byYear.keys()].sort((a, b) => b - a).map((year) => {
    const c = cal.get(year);
    const cells = byYear.get(year)!;
    const partial = !!c?.partial || cells[11] == null;
    return { year, cells, total: c && isNum(c.fund) ? c.fund : null, partial, kind: partialKind(year, partial, end) };
  });
}

/** Scale for the heatmap colours: a high percentile of |r| so one outlier month doesn't wash out the rest. */
export function heatScale(values: number[], q = 0.95): number {
  const a = values.filter(isNum).map(Math.abs).sort((x, y) => x - y);
  if (!a.length) return 0.01;
  const v = a[Math.min(a.length - 1, Math.floor(q * (a.length - 1)))];
  return Math.max(v, 0.001);
}

/**
 * Colour of a heatmap cell: sign picks the hue (pos = blue→cyan, neg = red), |r| / scale the intensity.
 * Returns an opacity in [0.1, 1] (small returns stay visible) and whether the text should turn white.
 */
export function heatCell(r: number | null, scale: number): { tone: "pos" | "neg" | "zero" | "none"; alpha: number; strong: boolean } {
  if (!isNum(r)) return { tone: "none", alpha: 0, strong: false };
  if (Math.abs(r) < 5e-5) return { tone: "zero", alpha: 0.1, strong: false };
  const k = Math.min(1, Math.abs(r) / (scale || 1));
  const alpha = +(0.1 + 0.9 * Math.pow(k, 0.8)).toFixed(3);
  // white text only on saturated cells of at least 1 %: smaller returns keep the ink colour
  return { tone: r > 0 ? "pos" : "neg", alpha, strong: alpha >= 0.62 && Math.abs(r) >= 0.01 };
}

/* ------------------------------------------------------------------ breakdowns */

/** Buckets with a fund weight, largest first; index weights kept alongside. */
export function bucketRows(b: Bucket[] | undefined | null, limit = 12): Bucket[] {
  return (b ?? []).filter((x) => isNum(x.fund) || isNum(x.index)).sort((a, c) => (c.fund ?? -1) - (a.fund ?? -1)).slice(0, limit);
}

/** Keep the natural order for ordered categories (credit ratings, curve buckets). */
export function orderedBuckets(b: Bucket[] | undefined | null): Bucket[] {
  return (b ?? []).filter((x) => isNum(x.fund) || isNum(x.index));
}

/* ------------------------------------------------------------------ documents */

export const DOC_ORDER: DocType[] = ["factsheet", "fund-facts", "commentary", "presentation", "prospectus", "annual-report", "interim-report", "mrfp", "esg", "other"];

/** Group documents by type (fixed order), newest first within a group; the display language first. Documents that
 * carry `published: false` are dropped (the public DTO has no flag: it only ever contains published ones). */
type GroupableDoc = Pick<DocumentMeta, "id" | "type" | "lang" | "date"> & { published?: boolean };
export function groupDocuments<D extends GroupableDoc>(docs: D[], lang: "en" | "fr"): { type: DocType; docs: D[] }[] {
  const pub = docs.filter((d) => d.published !== false);
  const rank = (d: D) => (d.lang === lang || d.lang === "both" ? 0 : 1);
  return DOC_ORDER.map((type) => ({
    type,
    docs: pub.filter((d) => d.type === type).sort((a, b) => b.date.localeCompare(a.date) || rank(a) - rank(b)),
  })).filter((g) => g.docs.length > 0);
}

/* ------------------------------------------------------------------ visibility */

export type Block = "hero" | "trailing" | "growth" | "calendar" | "heatmap" | "risk" | "portfolio" | "facts" | "documents" | "distributions" | "disclosure";

/**
 * The fund data with every block the admin hid removed (null / empty), so hidden figures never cross the server →
 * client boundary and every consumer (header, badges, tabs, cards) sees the same thing. `hide.performance` removes
 * everything derived from the returns: trailing, monthly, growth, calendar and the risk statistics. The fund AUM is
 * kept only when the admin explicitly published it (`hide.aum === false`). Pure; never mutates its input.
 */
export function stripHidden<D extends Omit<FundData, "sourceName">>(data: D | null | undefined, content: Pick<FundContent, "hide"> | null | undefined): D | null {
  if (!data) return null;
  const h = content?.hide ?? {};
  const out: D = { ...data };
  if (h.performance) out.performance = null;
  else if (out.performance && (h.growth || h.calendar)) {
    out.performance = { ...out.performance, ...(h.growth ? { growth: [] } : {}), ...(h.calendar ? { calendar: [] } : {}) };
  }
  if (h.performance || h.risk) {
    out.risk = null;
    if ("risk3Y" in out) out.risk3Y = null;
  }
  if (h.nav) out.nav = null;
  if (h.aum !== false) out.aum = null;
  if (h.characteristics) out.characteristics = [];
  if (h.breakdowns) out.breakdowns = {};
  if (h.holdings) out.topHoldings = [];
  if (h.esg) out.esg = [];
  if ("portfolio" in out) out.portfolio = stripPortfolio(out.portfolio, h);
  if (h.distributions && "distributions" in out) out.distributions = null;
  return out;
}

/** The daily portfolio without the parts the admin hid (the same flags as the factsheet figures); null when nothing is left. */
function stripPortfolio(p: PortfolioData | null | undefined, h: NonNullable<FundContent["hide"]>): PortfolioData | null {
  if (!p) return null;
  const out: PortfolioData = {
    ...p,
    characteristics: h.characteristics ? [] : p.characteristics,
    // the number of securities is shown with the characteristics: hidden with them
    totals: h.characteristics && p.totals ? { ...p.totals, holdings: null } : p.totals,
    breakdowns: h.breakdowns ? {} : p.breakdowns,
    greenBondsWeight: h.breakdowns ? null : p.greenBondsWeight,
    topHoldings: h.holdings ? [] : p.topHoldings,
  };
  return hasDailyPortfolio(out) ? out : null;
}

/* ------------------------------------------------------------------ daily portfolio */

/**
 * A daily portfolio block with something to show. With `now`, the book must also be fresh (data/freshness.ts, the
 * pipeline's rule): an older book is not "daily" any more.
 */
export function hasDailyPortfolio(p: PortfolioData | null | undefined, now?: Date): p is PortfolioData {
  if (now && p && !isFreshBook(p.asOf, now)) return false;
  return !!p && p.source === "daily" && (
    p.characteristics.some((m) => m.value != null) || Object.values(p.breakdowns ?? {}).some((b) => !!b?.length) || p.topHoldings.length > 0 || isNum(p.greenBondsWeight)
  );
}

/**
 * Where the Portfolio tab's figures come from: the daily book (its date), else the month-end factsheet (its month),
 * else nothing.
 */
export function portfolioOrigin(data: Pick<FundData, "portfolio" | "factsheetMonth"> | null | undefined): { kind: "daily"; asOf: string } | { kind: "factsheet"; month: string } | null {
  if (hasDailyPortfolio(data?.portfolio)) return { kind: "daily", asOf: data!.portfolio!.asOf };
  return data?.factsheetMonth ? { kind: "factsheet", month: data.factsheetMonth } : null;
}

/** Breakdowns of the daily book in display order (paired by typical length in the two-column grid), as bars. */
export const DAILY_BREAKDOWNS: PortfolioBreakdownKey[] = ["assetType", "country", "sector", "rating", "term"];
export function dailyBreakdowns(p: PortfolioData | null | undefined): { key: PortfolioBreakdownKey; rows: Bucket[] }[] {
  if (!p) return [];
  return DAILY_BREAKDOWNS.map((key) => ({ key, rows: (p.breakdowns[key] ?? []).filter((r) => isNum(r.weight)).map((r) => ({ label: r.label, fund: r.weight })) }))
    .filter((b) => b.rows.length > 0);
}

/**
 * Items of a two-column grid that span the full row: the wide ones, and any item that would otherwise sit alone in a
 * row (an odd count, or before a wide item), so no block is left in half a row next to an empty column.
 */
export function fullRowItems(wide: boolean[]): boolean[] {
  const out = [...wide];
  let col = 0;
  for (let i = 0; i < wide.length; i++) {
    if (wide[i]) { col = 0; continue; }
    if (col === 0 && (i + 1 >= wide.length || wide[i + 1])) out[i] = true;
    else col = col === 0 ? 1 : 0;
  }
  return out;
}

/** Characteristics computed over part of the bonds only (coverage < 1): they get a footnote. */
export const partialCoverage = (metrics: PortfolioMetric[]): PortfolioMetric[] => metrics.filter((m) => isNum(m.coverage) && m.coverage < 0.9995);

/* ------------------------------------------------------------------ distributions */

/** Series with distribution data, the headline one first, then by FundServ code. */
export function distributionClasses(d: DistributionsData | null | undefined, headline: string | null | undefined): ClassDistribution[] {
  const h = (headline ?? "").toUpperCase();
  return [...(d?.classes ?? [])].sort((a, b) => (a.fundserv.toUpperCase() === h ? -1 : b.fundserv.toUpperCase() === h ? 1 : a.fundserv.localeCompare(b.fundserv)));
}

/**
 * Decimals for every amount of one series (cards, chart, tables): the fewest between 4 and 6 at which each amount it
 * shows (history, last distribution, trailing 12 months, calendar-year totals) is exact, so the rows of a year add up to
 * its total as displayed. Amounts per unit are recorded with up to 6 decimals.
 */
export function amountDecimals(c: ClassDistribution | null | undefined): number {
  if (!c) return 4;
  const values = [...c.history.map((h) => h.amount), c.last?.amount, c.trailing12m, ...c.calendarYears.map((y) => y.amount)].filter(isNum);
  for (let d = 4; d < 6; d++) if (values.every((v) => Math.abs(v - Number(v.toFixed(d))) < 5e-10)) return d;
  return 6;
}

/** Tag a calendar year as year to date: the year of the reference date (the last successful read of the source) while that year is not over. */
export function isYearToDate(year: number, ref: string | null | undefined): boolean {
  if (!ref || !/^\d{4}-\d{2}-\d{2}$/.test(ref)) return false;
  return String(year) === ref.slice(0, 4) && ref < `${year}-12-31`;
}

/** History newest first: the last `limit` distributions, or all of them. */
export function historyRows(c: ClassDistribution | null | undefined, all: boolean, limit = 12): { date: string; amount: number }[] {
  const rows = [...(c?.history ?? [])].filter((r) => isNum(r.amount)).reverse();
  return all ? rows : rows.slice(0, limit);
}

/** Bars of the history chart: the last `n` distributions, oldest first. */
export function distributionBars(c: ClassDistribution | null | undefined, n = 24): { date: string; amount: number }[] {
  return (c?.history ?? []).filter((r) => isNum(r.amount)).slice(-n);
}

/** Which blocks render: the data must exist and the admin must not have hidden it (hiding performance hides every returns-derived block). */
export function visibleBlocks(data: Omit<FundData, "sourceName"> | null, content: FundContent, docCount: number): Record<Block, boolean> {
  const h = content.hide ?? {};
  const perf = data?.performance ?? null;
  const has = (x: unknown[] | undefined | null) => !!x && x.length > 0;
  const riskOk = riskWindows([data?.risk, data?.risk3Y]).length > 0;
  const portfolio = !!data && (
    hasDailyPortfolio(stripPortfolio(data.portfolio, h)) ||
    (!h.characteristics && data.characteristics.some((c) => c.fund != null)) ||
    (!h.breakdowns && Object.values(data.breakdowns ?? {}).some((b) => has(b))) ||
    (!h.holdings && has(data.topHoldings)) ||
    (!h.esg && data.esg.some((c) => c.fund != null))
  );
  return {
    hero: true,
    trailing: !h.performance && trailingPeriods(perf?.trailing.fund).length > 0,
    growth: !h.performance && !h.growth && (perf?.growth.filter((p) => isNum(p.fund)).length ?? 0) > 1,
    calendar: !h.performance && !h.calendar && calendarRows(perf?.calendar).length > 0,
    heatmap: !h.performance && has(perf?.monthly),
    risk: !h.performance && !h.risk && riskOk,
    portfolio,
    facts: true,
    documents: docCount > 0,
    distributions: !h.distributions && (data?.distributions?.classes.length ?? 0) > 0,
    disclosure: true,
  };
}

/* ------------------------------------------------------------------ risk windows */

/**
 * The contract publishes one RiskStats (its `window` says SI or 3Y). The page offers an SI / 3Y toggle,
 * so it also accepts an array of windows (or `{ SI, "3Y" }`) should the pipeline publish both; only
 * windows with at least one figure are kept, SI first.
 */
export function riskWindows(risk: unknown): RiskStats[] {
  const list: unknown[] = Array.isArray(risk) ? risk : risk && typeof risk === "object" && !("window" in risk) ? Object.values(risk as object) : [risk];
  const ok = list.filter((r): r is RiskStats => !!r && typeof r === "object" && ((r as RiskStats).window === "SI" || (r as RiskStats).window === "3Y"))
    .filter((r) => Object.entries(r).some(([k, v]) => k !== "window" && isNum(v)));
  const seen = new Set<string>();
  return ok.filter((r) => (seen.has(r.window) ? false : (seen.add(r.window), true))).sort((a, b) => (a.window === "SI" ? -1 : b.window === "SI" ? 1 : 0));
}

/* ------------------------------------------------------------------ fund page (light rebuild) */

/** Periods shown as return badges under the header (6M is not published by the pipeline). */
export const BADGE_PERIODS: Period[] = ["1M", "3M", "YTD", "1Y", "3Y", "5Y", "10Y", "SI"];

export interface Badge { period: Period; value: number; annualized: boolean }

/** Return badges: published fund returns only, in display order; none when the admin hid performance. */
export function returnBadges(perf: { trailing: { fund: PeriodMap }; firstMonth?: string; asOf?: string } | null | undefined, hidden = false): Badge[] {
  if (!perf || hidden) return [];
  return BADGE_PERIODS.filter((p) => isNum(perf.trailing.fund[p])).map((p) => ({
    period: p, value: perf.trailing.fund[p] as number, annualized: isAnnualized(p, perf.firstMonth, perf.asOf),
  }));
}

export interface TrailingRow { period: Period; fund: number; index: number | null; va: number | null; annualized: boolean }

/** Rows of the trailing / annualized returns table: fund, benchmark and value added per published period. */
export function trailingRows(perf: { trailing: { fund: PeriodMap; index?: PeriodMap; va?: PeriodMap }; firstMonth?: string; asOf?: string } | null | undefined): TrailingRow[] {
  if (!perf) return [];
  return trailingPeriods(perf.trailing.fund).map((p) => {
    const index = perf.trailing.index?.[p];
    const va = perf.trailing.va?.[p];
    return { period: p, fund: perf.trailing.fund[p] as number, index: isNum(index) ? index : null, va: isNum(va) ? va : null, annualized: isAnnualized(p, perf.firstMonth, perf.asOf) };
  });
}

/** Direction of a daily NAV change (null / rounded-to-zero changes are flat). */
export function navDirection(changePct: number | null | undefined, decimals = 2): "up" | "down" | "flat" {
  if (!isNum(changePct)) return "flat";
  const r = +(changePct * 100).toFixed(decimals);
  return r > 0 ? "up" : r < 0 ? "down" : "flat";
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, " ").trim();

/**
 * Portfolio managers named in the admin content, matched with the team registry (accents, case and
 * punctuation ignored). Unknown names are kept (shown without photo); blanks and duplicates are dropped.
 */
export function resolveManagers<T extends { name: string }>(names: string[] | undefined | null, team: readonly T[]): { name: string; member: T | null }[] {
  const seen = new Set<string>();
  const out: { name: string; member: T | null }[] = [];
  for (const raw of names ?? []) {
    const name = (raw ?? "").trim();
    const key = norm(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const member = team.find((m) => norm(m.name) === key) ?? null;
    out.push({ name: member?.name ?? name, member });
  }
  return out;
}

/** Initials for an avatar without a photo ("Mathieu Poulin-Brière" → "MP"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

/** Regulatory documents of a Canadian mutual fund (NI 81-101 / 81-106), listed as available on request when none is uploaded. */
export const REGULATORY_DOCS: DocType[] = ["fund-facts", "prospectus", "annual-report", "interim-report", "mrfp"];

/** Series (NAV classes) sorted for the facts table: the headline class first, then by FundServ code. */
export function sortedClasses(classes: NavClass[] | undefined | null, headline: string | null | undefined): NavClass[] {
  const h = (headline ?? "").toUpperCase();
  return [...(classes ?? [])].sort((a, b) => (a.fundserv.toUpperCase() === h ? -1 : b.fundserv.toUpperCase() === h ? 1 : a.fundserv.localeCompare(b.fundserv)));
}
