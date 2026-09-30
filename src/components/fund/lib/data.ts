/**
 * Pure selectors that turn the data contract into what each block draws. Nothing here invents a number:
 * every value returned comes from the published data, or is a ratio of two published values (growth
 * rebasing to the start of a range, heatmap colour intensity).
 */
import type {
  Bucket, CalendarRow, DocType, DocumentMeta, FundContent, FundData, GrowthPoint, MonthlyPoint, NavClass, Period, PeriodMap, RiskStats,
} from "../../../lib/data/types.ts";

export const PERIOD_ORDER: Period[] = ["1M", "3M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "SI"];
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Periods for which the fund has a trailing return, in display order. */
export function trailingPeriods(fund: PeriodMap | undefined | null): Period[] {
  if (!fund) return [];
  return PERIOD_ORDER.filter((p) => isNum(fund[p]));
}

/** Periods that are annualized (2 years and more, and since inception when the record exceeds a year). */
export function isAnnualized(p: Period, firstMonth?: string | null, asOf?: string | null): boolean {
  if (p === "2Y" || p === "3Y" || p === "5Y" || p === "10Y") return true;
  if (p !== "SI") return false;
  if (!firstMonth || !asOf) return true;
  return monthsBetween(firstMonth, asOf) >= 12;
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

export interface GrowthSeries { dates: string[]; fund: number[]; index: (number | null)[]; hasIndex: boolean; start: number }

/**
 * Points of a range, rebased so the range starts at the same amount as the published series
 * (10 000 $ at inception). SI returns the published values untouched.
 */
export function growthRange(points: GrowthPoint[], range: Range): GrowthSeries {
  const clean = points.filter((p) => isNum(p.fund));
  const n = RANGE_MONTHS[range];
  const slice = n === Infinity || clean.length <= n + 1 ? clean : clean.slice(clean.length - (n + 1));
  const base = clean[0]?.fund ?? 10000;
  const start = 10000;
  const f0 = slice[0]?.fund;
  const i0 = slice.find((p) => isNum(p.index))?.index ?? null;
  const rebased = range !== "SI" && slice !== clean;
  const fund = slice.map((p) => (rebased && f0 ? (p.fund / f0) * start : p.fund));
  const index = slice.map((p) => (isNum(p.index) ? (rebased && i0 ? (p.index / i0) * start : p.index) : null));
  return { dates: slice.map((p) => p.date), fund, index, hasIndex: index.some(isNum), start: rebased ? start : base };
}

/* ------------------------------------------------------------------ calendar */

export function calendarRows(rows: CalendarRow[] | undefined | null): CalendarRow[] {
  return (rows ?? []).filter((r) => isNum(r.fund) || isNum(r.index)).sort((a, b) => a.year - b.year);
}

/* ------------------------------------------------------------------ monthly heatmap */

export interface HeatRow { year: number; cells: (number | null)[]; total: number | null; partial: boolean }

/** Years × 12 months grid of monthly returns, with the calendar-year return when published. */
export function heatmapGrid(monthly: MonthlyPoint[] | undefined | null, calendar?: CalendarRow[] | null): HeatRow[] {
  const byYear = new Map<number, (number | null)[]>();
  for (const p of monthly ?? []) {
    if (!isNum(p.r)) continue;
    const y = +p.month.slice(0, 4), m = +p.month.slice(5, 7);
    if (!y || m < 1 || m > 12) continue;
    if (!byYear.has(y)) byYear.set(y, Array(12).fill(null));
    byYear.get(y)![m - 1] = p.r;
  }
  const cal = new Map((calendar ?? []).map((c) => [c.year, c]));
  return [...byYear.keys()].sort((a, b) => b - a).map((year) => {
    const c = cal.get(year);
    const cells = byYear.get(year)!;
    return { year, cells, total: c && isNum(c.fund) ? c.fund : null, partial: !!c?.partial || cells[11] == null };
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

export type Block = "hero" | "trailing" | "growth" | "calendar" | "heatmap" | "risk" | "portfolio" | "facts" | "documents" | "disclosure";

/** Which blocks render: the data must exist and the admin must not have hidden it. */
export function visibleBlocks(data: Omit<FundData, "sourceName"> | null, content: FundContent, docCount: number): Record<Block, boolean> {
  const h = content.hide ?? {};
  const perf = data?.performance ?? null;
  const has = (x: unknown[] | undefined | null) => !!x && x.length > 0;
  const riskOk = riskWindows([data?.risk, data?.risk3Y]).length > 0;
  const portfolio = !!data && (
    (!h.characteristics && data.characteristics.some((c) => c.fund != null)) ||
    (!h.breakdowns && Object.values(data.breakdowns ?? {}).some((b) => has(b))) ||
    (!h.holdings && has(data.topHoldings)) ||
    (!h.esg && data.esg.some((c) => c.fund != null))
  );
  return {
    hero: true,
    trailing: !h.performance && trailingPeriods(perf?.trailing.fund).length > 0,
    growth: !h.growth && (perf?.growth.filter((p) => isNum(p.fund)).length ?? 0) > 1,
    calendar: !h.calendar && calendarRows(perf?.calendar).length > 0,
    heatmap: !h.performance && has(perf?.monthly),
    risk: !h.risk && riskOk,
    portfolio,
    facts: true,
    documents: docCount > 0,
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
