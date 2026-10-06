/**
 * Return math shared by the pipeline (pure, dependency-free). Port of nymbus-decks `server/metrics.py`
 * and of the factsheet-generator conventions.
 *
 * Series are `Record<monthEnd, decimalReturn>` keyed by month-end dates (`2026-08-31`).
 *
 * Conventions
 *  - Trailing (factsheet convention): 1M, 3M, YTD, 1Y compounded; 2Y, 3Y, 5Y, 10Y annualized
 *    ((1+c)^(12/n)-1); SI annualized when the track record has >= 12 months, else compounded.
 *    A window must be complete and contiguous (no missing month), otherwise the value is null:
 *    a period longer than the track record is never shown.
 *  - Risk statistics (factsheet `get_statistics`, population statistics, monthly data):
 *      annReturn    = annualized return of the window
 *      annVol       = pstdev(monthly) * sqrt(12)
 *      downsideDev  = pstdev(negative months only) * sqrt(12)       (factsheet convention, not semi-deviation)
 *      sharpe       = annReturn / annVol          (NO risk-free rate: same as the published factsheets)
 *      sortino      = annReturn / downsideDev     (idem)
 *      maxDrawdown  = min over months of value / running peak - 1, with the standard definition: the
 *                     running peak starts at the initial investment, so a loss in the first month counts.
 *                     The factsheet producer (get_max_drawdown) takes the peak over month-END values only,
 *                     so it ignores a drawdown that starts in the very first month: the two can differ
 *                     for a fund that lost money in its first month(s). Stated in the provenance.
 *      positiveMonths = share of months with r > 0 (all months counted)
 *  - "arithmetic" method (GMV overlay: returns on notional, no reinvestment, as in the factsheet
 *    `compounded=False` path): periods are sums, annualized = sum / years, growth = 1 + cumsum,
 *    drawdown = value - running peak (in units of the initial investment).
 */
import { bondDays, isBondDay } from "./market-calendar.ts";

export type Series = Record<string, number>;
export type Method = "compounded" | "arithmetic";

const pad = (n: number, w = 2): string => String(n).padStart(w, "0");

export function monthEnd(y: number, m: number): string {
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${pad(y, 4)}-${pad(m)}-${pad(last)}`;
}

/** Month-end of the month containing `date` (YYYY-MM-DD or YYYY-MM). */
export function toMonthEnd(date: string): string {
  return monthEnd(Number(date.slice(0, 4)), Number(date.slice(5, 7)));
}

/** `ym` (YYYY-MM[-DD]) shifted by n months, as a month-end. */
export function addMonths(ym: string, n: number): string {
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(5, 7));
  const t = y * 12 + (m - 1) + n;
  return monthEnd(Math.floor(t / 12), (t % 12) + 1);
}

/** Number of months from a to b inclusive (both month keys). */
export function monthsBetween(a: string, b: string): number {
  return (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + (Number(b.slice(5, 7)) - Number(a.slice(5, 7))) + 1;
}

/** Last closed month-end before `now` (the month before the current one, UTC). */
export function lastClosedMonth(now: Date): string {
  return addMonths(`${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`, -1);
}

export const sortedKeys = (s: Series): string[] => Object.keys(s).sort();

/**
 * Monthly returns ending at `end` (inclusive). `null` if the window is incomplete: `end` missing,
 * fewer than `months` observations, or a missing month inside the window.
 */
export function window(series: Series, end: string, months?: number, start?: string): number[] | null {
  const keys = sortedKeys(series).filter((k) => k <= end && (start === undefined || k >= start));
  if (!keys.length || keys[keys.length - 1] !== end) return null;
  let sel = keys;
  if (months !== undefined) {
    if (keys.length < months) return null;
    sel = keys.slice(-months);
  }
  // contiguity: every month between the first and the last is present
  if (monthsBetween(sel[0], end) !== sel.length) return null;
  return sel.map((k) => series[k]);
}

export function compound(rs: number[]): number {
  let p = 1;
  for (const r of rs) p *= 1 + r;
  return p - 1;
}

export const sum = (rs: number[]): number => rs.reduce((a, b) => a + b, 0);

/** Annualized return over rs.length months. */
export function annualize(rs: number[], method: Method = "compounded"): number {
  if (method === "arithmetic") return sum(rs) / (rs.length / 12);
  return Math.pow(1 + compound(rs), 12 / rs.length) - 1;
}

const periodReturn = (rs: number[], method: Method): number => (method === "arithmetic" ? sum(rs) : compound(rs));

const TRAILING_SPECS: { period: "1M" | "3M" | "1Y" | "2Y" | "3Y" | "5Y" | "10Y"; months: number; ann: boolean }[] = [
  { period: "1M", months: 1, ann: false },
  { period: "3M", months: 3, ann: false },
  { period: "1Y", months: 12, ann: false },
  { period: "2Y", months: 24, ann: true },
  { period: "3Y", months: 36, ann: true },
  { period: "5Y", months: 60, ann: true },
  { period: "10Y", months: 120, ann: true },
];

type TrailingMap = { "1M": number | null; "3M": number | null; YTD: number | null; "1Y": number | null; "2Y": number | null; "3Y": number | null; "5Y": number | null; "10Y": number | null; SI: number | null };

/**
 * Trailing returns at `end`. `siStart` optionally restricts the SI window (e.g. an index aligned on
 * the fund's inception): the index SI then requires index data for every month since `siStart`.
 */
export function trailing(series: Series, end: string, opts: { method?: Method; siStart?: string } = {}): TrailingMap {
  const method = opts.method ?? "compounded";
  const out: TrailingMap = { "1M": null, "3M": null, YTD: null, "1Y": null, "2Y": null, "3Y": null, "5Y": null, "10Y": null, SI: null };
  for (const { period, months, ann } of TRAILING_SPECS) {
    const w = window(series, end, months);
    out[period] = w === null ? null : ann ? annualize(w, method) : periodReturn(w, method);
  }
  const ytd = window(series, end, undefined, `${end.slice(0, 4)}-01-01`);
  // YTD must start in January, unless the track record itself starts later this year
  if (ytd) {
    const first = sortedKeys(series).find((k) => k.slice(0, 4) === end.slice(0, 4))!;
    const startsInJanuary = first.slice(5, 7) === "01";
    const inceptionThisYear = sortedKeys(series)[0].slice(0, 4) === end.slice(0, 4);
    out.YTD = startsInJanuary || inceptionThisYear ? periodReturn(ytd, method) : null;
  }
  const si = window(series, end, undefined, opts.siStart);
  if (si && (opts.siStart === undefined || sortedKeys(series).some((k) => k === toMonthEnd(opts.siStart!)))) {
    out.SI = si.length >= 12 ? annualize(si, method) : periodReturn(si, method);
  }
  return out;
}

interface CalendarYear { year: number; value: number | null; months: number; partial: boolean }

/**
 * Calendar-year returns from `first` (month-end) to `end`. A year missing a month inside its expected
 * range (after inception, up to `end`) is null. `partial` marks the inception year when it does not
 * start in January and the current year when `end` is not December.
 */
export function calendarYears(series: Series, end: string, opts: { method?: Method; first?: string } = {}): CalendarYear[] {
  const method = opts.method ?? "compounded";
  const keys = sortedKeys(series).filter((k) => k <= end && (!opts.first || k >= opts.first));
  if (!keys.length) return [];
  const first = opts.first ?? keys[0];
  const out: CalendarYear[] = [];
  for (let y = Number(first.slice(0, 4)); y <= Number(end.slice(0, 4)); y++) {
    const from = y === Number(first.slice(0, 4)) ? first : monthEnd(y, 1);
    const to = y === Number(end.slice(0, 4)) ? end : monthEnd(y, 12);
    const expected = monthsBetween(from, to);
    const rs = keys.filter((k) => k >= from && k <= to).map((k) => series[k]);
    out.push({
      year: y,
      value: rs.length === expected ? periodReturn(rs, method) : null,
      months: rs.length,
      partial: from.slice(5, 7) !== "01" || to.slice(5, 7) !== "12",
    });
  }
  return out;
}

/**
 * Value of `start` invested at the end of the month before the first return, then month by month.
 * Returns [] when the series is not contiguous.
 */
export function growth(series: Series, end: string, opts: { method?: Method; start?: number; first?: string } = {}): { date: string; value: number }[] {
  const method = opts.method ?? "compounded";
  const start = opts.start ?? 10_000;
  const keys = sortedKeys(series).filter((k) => k <= end && (!opts.first || k >= opts.first));
  if (!keys.length || monthsBetween(keys[0], keys[keys.length - 1]) !== keys.length) return [];
  const out = [{ date: addMonths(keys[0], -1), value: start }];
  let acc = method === "arithmetic" ? 0 : 1;
  for (const k of keys) {
    if (method === "arithmetic") acc += series[k];
    else acc *= 1 + series[k];
    out.push({ date: k, value: method === "arithmetic" ? start * (1 + acc) : start * acc });
  }
  return out;
}

export function pstdev(xs: number[]): number {
  const m = sum(xs) / xs.length;
  return Math.sqrt(sum(xs.map((x) => (x - m) ** 2)) / xs.length);
}

/** Factsheet downside deviation: population st.dev. of the negative months, annualized. null if < 2 negative months. */
export function downsideDeviation(rs: number[]): number | null {
  const neg = rs.filter((r) => r < 0);
  return neg.length > 1 ? pstdev(neg) * Math.sqrt(12) : null;
}

export function maxDrawdown(rs: number[], method: Method = "compounded"): number {
  let v = 1;
  let peak = 1;
  let mdd = 0;
  for (const r of rs) {
    v = method === "arithmetic" ? v + r : v * (1 + r);
    peak = Math.max(peak, v);
    mdd = Math.min(mdd, method === "arithmetic" ? v - peak : v / peak - 1);
  }
  return mdd;
}

export interface RiskResult {
  window: "SI" | "3Y";
  months: number;
  annReturn: number | null;
  annVol: number | null;
  downsideDev: number | null;
  sharpe: number | null;
  sortino: number | null;
  maxDrawdown: number | null;
  positiveMonths: number | null;
  bestMonth: number | null;
  worstMonth: number | null;
}

/** Risk statistics over the SI or 3Y window ending at `end`; null when the window is shorter than 12 (SI) / 36 (3Y) months. */
export function riskStats(series: Series, end: string, win: "SI" | "3Y", method: Method = "compounded"): RiskResult | null {
  const rs = win === "3Y" ? window(series, end, 36) : window(series, end);
  if (!rs || rs.length < 12) return null;
  const annReturn = method === "arithmetic" ? (sum(rs) / rs.length) * 12 : annualize(rs);
  const annVol = pstdev(rs) * Math.sqrt(12);
  const dd = downsideDeviation(rs);
  return {
    window: win,
    months: rs.length,
    annReturn,
    annVol,
    downsideDev: dd,
    sharpe: annVol > 0 ? annReturn / annVol : null,
    sortino: dd !== null && dd > 0 ? annReturn / dd : null,
    maxDrawdown: maxDrawdown(rs, method),
    positiveMonths: rs.filter((r) => r > 0).length / rs.length,
    bestMonth: Math.max(...rs),
    worstMonth: Math.min(...rs),
  };
}

/* ------------------------------------------------------------------ index levels */

const AGG = new Set<unknown>([null, undefined, "", "All", "all", "Overall", "Total"]);

export interface FtseRow { date: string; total_return?: number | null; rating?: string | null; term?: string | null; industry_sector?: string | null; industry_group?: string | null; [k: string]: unknown }

const SIGNATURE_KEYS = ["index_name", "rating", "term", "industry_sector", "industry_group", "index_content"] as const;
/** grouping values that mean "not broken down" (null, "", All, Overall, Total) compare equal */
const signatureOf = (r: FtseRow): string => JSON.stringify(SIGNATURE_KEYS.map((k) => (AGG.has(r[k]) ? "*" : String(r[k]))));
const isAggregate = (r: FtseRow): boolean => AGG.has(r.rating) && AGG.has(r.term) && AGG.has(r.industry_sector) && AGG.has(r.industry_group);

/**
 * Date -> total-return level of the index itself, from index-summary rows of ONE short_name. The dataplatform
 * returns one row per day describing the index (its term / sector are the index's own definition, e.g.
 * Short / Corporate). The index's signature (name + grouping columns) is anchored on the latest day that has a
 * single row, or a single fully aggregate row among breakdown rows; a day counts only if exactly one of its rows
 * carries that signature, so the series can never switch to another index or a sub-index mid-way (e.g. two
 * indices slugged to the same short_name, or a breakdown row on a day missing its aggregate).
 */
export function ftseLevels(rows: FtseRow[]): Record<string, number> {
  return Object.fromEntries(Object.entries(ftseDaily(rows)).map(([d, x]) => [d, x.level]));
}

/** one day of an FTSE index: total-return level, average yield (percent) and modified duration (years) of the index row */
export interface FtseDay { level: number; ytm: number | null; dur: number | null }

/** ftseLevels with the index row's average yield and modified duration (the gap-link estimate needs them). */
export function ftseDaily(rows: FtseRow[]): Record<string, FtseDay> {
  const byDate = new Map<string, FtseRow[]>();
  for (const r of rows) {
    const v = r.total_return;
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    const d = String(r.date).slice(0, 10);
    const list = byDate.get(d);
    if (list) list.push(r);
    else byDate.set(d, [r]);
  }
  const dates = [...byDate.keys()].sort();
  let sig: string | null = null;
  for (const d of [...dates].reverse()) {
    const list = byDate.get(d)!;
    const aggs = list.filter(isAggregate);
    const row = list.length === 1 ? list[0] : aggs.length === 1 ? aggs[0] : null;
    if (row) {
      sig = signatureOf(row);
      break;
    }
  }
  if (sig === null) return {};
  const out: Record<string, FtseDay> = {};
  const fin = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);
  for (const d of dates) {
    const match = byDate.get(d)!.filter((r) => signatureOf(r) === sig);
    if (match.length === 1) out[d] = { level: match[0].total_return as number, ytm: fin(match[0].average_yield), dur: fin(match[0].modified_duration) };
  }
  return out;
}

/** Why no aggregate row was found: row count and the grouping values seen on the latest date (FTSE metadata only). */
export function ftseGroupingSummary(rows: FtseRow[]): string {
  if (!rows.length) return "0 rows";
  const last = rows.map((r) => String(r.date).slice(0, 10)).sort().at(-1);
  const day = rows.filter((r) => String(r.date).slice(0, 10) === last);
  const vals = (k: string): string => {
    const set = [...new Set(day.map((r) => (r[k] == null ? "null" : JSON.stringify(r[k]))))].sort();
    return `${k}=[${set.slice(0, 8).join(",")}${set.length > 8 ? `,…+${set.length - 8}` : ""}]`;
  };
  const withTr = day.filter((r) => typeof r.total_return === "number").length;
  return `${rows.length} rows; ${last}: ${day.length} rows, ${withTr} with total_return; ${["rating", "term", "industry_sector", "industry_group", "index_content"].map(vals).join(" ")}`;
}

/**
 * Name family of an FTSE index (to find its earlier naming generations among /short-names): the published name without
 * the publisher prefixes ("FTSE TMX Canada", "FTSE Canada", "DEX"), "Bond Index", "Overall" and "Term".
 * "FTSE Canada Universe Overall Bond Index" and "FTSE Canada Universe Bond Index" → "univ"; "FTSE TMX Canada Short Term
 * Corporate Bond Index" → "short corp"; "FTSE Canada Short Term Overall Bond Index" → "short" (another index).
 */
export function ftseFamily(name: string | null | undefined): string {
  let t = ` ${(name ?? "").toLowerCase().replace(/\(synthetic\)/g, " ")} `;
  t = t.replace(/short[\s-]*term/g, " short ").replace(/mid[\s-]*term/g, " mid ").replace(/long[\s-]*term/g, " long ");
  t = t.replace(/[^a-z0-9]+/g, " ");
  t = t.replace(/ (ftse|tmx|canada|canadian|dex|pc|scotia|capital|markets|bond|bonds|index|indices|overall|term|total|all)(?= )/g, " ");
  t = t.replace(/ (corporate|corporates|corps)(?= )/g, " corp").replace(/ universe(?= )/g, " univ").replace(/ st(?= )/g, " short");
  // order-insensitive: "Corporate Short Term" and "Short Term Corporate" are one family
  const tokens = [...new Set(t.split(/\s+/).filter(Boolean))];
  const ORDER = ["short", "mid", "long", "univ", "corp"];
  return tokens.sort((a, b) => (ORDER.includes(a) ? ORDER.indexOf(a) : 99) - (ORDER.includes(b) ? ORDER.indexOf(b) : 99) || a.localeCompare(b)).join(" ");
}

export interface FtseCandidate {
  name: string;
  levels: Record<string, number>;
  why: string;
  /** average yield / modified duration per day (needed for a gap link) */
  daily?: Record<string, FtseDay>;
  /** a gap link may be tried (configured alias, same index_id or same family; never a loose name match) */
  gapOk?: boolean;
}
/** the verification of a gap link (one missing daily return between two naming generations) */
interface FtseGapCheck { last: string; first: string; implied: number; estimate: number; residual: number; threshold: number; p95: number; samples: number }
interface FtseJoin {
  levels: Record<string, number>;
  /** earlier names linked in front: on an overlap (equal daily returns) or across a verified one-day gap */
  used: { name: string; link: string; from: string; checked: number; why: string; kind: "overlap" | "gap"; gap?: FtseGapCheck }[];
  skipped: string[];
}
/**
 * a link needs this many equal daily returns on common days; "equal" within dailyTol (levels published to 4+ decimals).
 * Gap link: the gap-day return implied by equal bases must match the yield / duration estimate within
 * min(max(gapResidualMult × p95 |residual|, gapMinTol), gapMaxTol), stay below gapMaxReturn, not be a copied level (|implied| <
 * gapZero while the estimate is not), the levels within gapMaxLevelDiff, and the
 * tolerance needs gapMinSamples daily residuals (all of the current series, the earlier one's last gapOldDays days).
 */
const FTSE_JOIN = { minCommonReturns: 5, dailyTol: 2e-6, gapResidualMult: 3, gapMinTol: 2e-4, gapMaxTol: 5e-4, gapZero: 1e-7, gapMaxReturn: 0.01, gapMaxLevelDiff: 0.03, gapMinSamples: 20, gapOldDays: 250 };

/**
 * Daily index return estimated from the index's own analytics: carry (average yield, act/365) minus modified duration ×
 * the change of the average yield (first-order price effect; convexity and roll ignored, absorbed by the calibrated
 * tolerance).
 */
export function ftseReturnEstimate(a: { ytm: number | null; dur: number | null }, b: { ytm: number | null }, calendarDays: number): number | null {
  if (a.ytm === null || a.dur === null || b.ytm === null) return null;
  return (a.ytm / 100 / 365) * calendarDays - (a.dur * (b.ytm - a.ytm)) / 100;
}

const calDays = (a: string, b: string): number => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/** the first bond-market business day of its month (the index rebalances at the month-end: not a typical day) */
function firstBondDayOfMonth(d: string): boolean {
  if (!isBondDay(d)) return false;
  for (let t = Date.parse(`${d.slice(0, 7)}-01T00:00:00Z`); ; t += 86_400_000) {
    const x = new Date(t).toISOString().slice(0, 10);
    if (isBondDay(x)) return x === d;
  }
}

/** residuals (actual − estimate) of consecutive days of one series, rebalance days excluded */
function residualsOf(levels: Record<string, number>, daily: Record<string, FtseDay>, days: string[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < days.length; i++) {
    const a = days[i - 1], b = days[i];
    if (firstBondDayOfMonth(b)) continue;
    const est = daily[a] && daily[b] ? ftseReturnEstimate(daily[a], daily[b], calDays(a, b)) : null;
    if (est === null || !(levels[a] > 0) || !(levels[b] > 0)) continue;
    out.push(levels[b] / levels[a] - 1 - est);
  }
  return out;
}

/**
 * Verifies a gap link: the earlier name ends on the bond-market business day just before the current name's first day
 * (one daily return missing). Accepted only if the return implied by equal bases (first / last − 1) matches the
 * analytics estimate within a tolerance calibrated on both series' own residuals. Returns the check, or why not.
 */
export function ftseGapCheck(cur: Record<string, number>, curDaily: Record<string, FtseDay>, old: Record<string, number>, oldDaily: Record<string, FtseDay>, cfg = FTSE_JOIN): { ok: true; check: FtseGapCheck } | { ok: false; why: string } {
  const curDays = Object.keys(cur).filter((d) => d in curDaily).sort();
  const oldDays = Object.keys(old).sort();
  const first = Object.keys(cur).sort()[0];
  const last = oldDays[oldDays.length - 1];
  if (!first || !last || last >= first) return { ok: false, why: "no gap before the current series" };
  const between = bondDays(new Date(Date.parse(`${last}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10), new Date(Date.parse(`${first}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10));
  if (between.length) return { ok: false, why: `${between.length + 1} daily returns missing between ${last} and ${first} (${between.slice(0, 3).join(", ")} without a level): only a one-day gap is verifiable` };
  const implied = cur[first] / old[last] - 1;
  if (Math.abs(implied) > cfg.gapMaxLevelDiff) return { ok: false, why: `levels ${old[last]} on ${last} and ${cur[first]} on ${first} differ by ${(100 * implied).toFixed(2)}% (re-based)` };
  const estimate = oldDaily[last] && curDaily[first] ? ftseReturnEstimate(oldDaily[last], curDaily[first], calDays(last, first)) : null;
  if (estimate === null) return { ok: false, why: `no average yield / modified duration on ${last} or ${first} to estimate the gap return` };
  const res = [...residualsOf(cur, curDaily, curDays), ...residualsOf(old, oldDaily, oldDays.slice(-cfg.gapOldDays))].map(Math.abs).sort((a, b) => a - b);
  if (res.length < cfg.gapMinSamples) return { ok: false, why: `${res.length} daily residual(s) to calibrate the tolerance (${cfg.gapMinSamples} needed)` };
  const p95 = res[Math.min(res.length - 1, Math.ceil(0.95 * res.length) - 1)];
  const threshold = Math.min(Math.max(cfg.gapResidualMult * p95, cfg.gapMinTol), cfg.gapMaxTol);
  const residual = implied - estimate;
  const check: FtseGapCheck = { last, first, implied, estimate, residual, threshold, p95, samples: res.length };
  const bp = (x: number): string => `${(x * 10_000).toFixed(2)} bp`;
  if (Math.abs(implied) < cfg.gapZero && Math.abs(estimate) >= cfg.gapZero) return { ok: false, why: `implied gap return is zero (${old[last]} on ${last} = ${cur[first]} on ${first}: a copied level, not a market move) while the estimate is ${bp(estimate)}` };
  if (Math.abs(implied) >= cfg.gapMaxReturn) return { ok: false, why: `implied gap return ${bp(implied)} is not below ${(cfg.gapMaxReturn * 100).toFixed(0)}%` };
  if (Math.abs(residual) > threshold) return { ok: false, why: `implied gap return ${bp(implied)} vs estimate ${bp(estimate)}: residual ${bp(residual)} beyond ${bp(threshold)} (3 × p95 of ${res.length} daily residuals, between 2 and 5 bp)` };
  return { ok: true, check };
}

/**
 * Joins earlier naming generations of an FTSE index in front of its current series. FTSE re-bases total-return levels
 * across a naming generation (factsheet-generator ftse_index_engine: "levels are not continuous across it"), so a level
 * is never compared with another name's: a candidate is linked only when it has a level on the current series' first
 * day AND its daily returns equal the current ones on at least `minCommonReturns` consecutive common days; its earlier
 * days are then chain-linked (rescaled at that first day). Without such an overlap nothing is joined (the index figures
 * needing those months are not shown). Repeats for older generations.
 */
export function joinFtseHistory(current: Record<string, number>, candidates: FtseCandidate[], cfg = FTSE_JOIN, currentDaily?: Record<string, FtseDay>): FtseJoin {
  let cur = { ...current };
  let curDaily: Record<string, FtseDay> = { ...(currentDaily ?? {}) };
  const used: FtseJoin["used"] = [];
  const skipped: string[] = [];
  const pending = [...candidates];
  const bp = (x: number): string => `${(x * 10_000).toFixed(3)} bp`;
  while (pending.length) {
    const first = Object.keys(cur).sort()[0];
    if (!first) break;
    let best: { c: FtseCandidate; earliest: string; checked: number } | null = null;
    let gapBest: { c: FtseCandidate; earliest: string; check: FtseGapCheck } | null = null;
    for (const c of [...pending]) {
      const days = Object.keys(c.levels).sort();
      const drop = (why: string): void => { skipped.push(`${c.name} (${why})`); pending.splice(pending.indexOf(c), 1); };
      if (!days.length || days[0] >= first) { drop(days.length ? `starts ${days[0]}, not before ${first}` : "no level"); continue; }
      if (!(first in c.levels)) {
        // no overlap: a verified one-day gap link (same index only: alias, index_id or family)
        if (days[days.length - 1] < first && c.gapOk && c.daily && Object.keys(curDaily).length) {
          const g = ftseGapCheck(cur, curDaily, c.levels, c.daily, cfg);
          if (g.ok) { if (!gapBest || days[0] < gapBest.earliest) gapBest = { c, earliest: days[0], check: g.check }; continue; }
          drop(`no level on ${first} (no overlap); gap link not verified: ${g.why}`);
          continue;
        }
        drop(`no level on ${first}, the first day of the current series: no overlap to verify a link${c.gapOk ? "" : " (gap links only for the same index)"}`);
        continue;
      }
      const common = days.filter((d) => d in cur);
      if (common.length < cfg.minCommonReturns + 1) { drop(`${common.length} common day(s): at least ${cfg.minCommonReturns + 1} needed to compare daily returns`); continue; }
      let worst = 0;
      for (let i = 1; i < common.length; i++) {
        const a = common[i - 1], b = common[i];
        worst = Math.max(worst, Math.abs(cur[b] / cur[a] - c.levels[b] / c.levels[a]));
      }
      if (!(worst <= cfg.dailyTol)) { drop(`daily returns differ on common days (up to ${bp(worst)}): another index`); continue; }
      if (!best || days[0] < best.earliest) best = { c, earliest: days[0], checked: common.length - 1 };
    }
    // an overlap link first; a gap link only when no candidate overlaps
    const pick = best ?? gapBest;
    if (!pick) break;
    pending.splice(pending.indexOf(pick.c), 1);
    // overlap: re-based at the first day; gap: equal bases (the verified implied return is the gap-day return)
    const k = best ? cur[first] / best.c.levels[first] : 1;
    const before: Record<string, number> = {};
    for (const d of Object.keys(pick.c.levels).sort()) if (d < first) before[d] = pick.c.levels[d] * k;
    cur = Object.fromEntries(Object.entries({ ...before, ...cur }).sort(([a], [b]) => (a < b ? -1 : 1)));
    // the earlier series' analytics extend the calibration base for an older generation
    if (pick.c.daily) curDaily = { ...Object.fromEntries(Object.entries(pick.c.daily).filter(([d]) => d < first).map(([d, x]) => [d, { ...x, level: x.level * k }])), ...curDaily };
    if (best) used.push({ name: best.c.name, link: first, from: best.earliest, checked: best.checked, why: best.c.why, kind: "overlap" });
    else used.push({ name: gapBest!.c.name, link: first, from: gapBest!.earliest, checked: 0, why: gapBest!.c.why, kind: "gap", gap: gapBest!.check });
  }
  return { levels: cur, used, skipped };
}

const isWeekday = (t: number): boolean => { const w = new Date(t).getUTCDay(); return w !== 0 && w !== 6; };

/** last weekday (Mon-Fri) of the month of `ym`, and the weekday `back` weekdays before it */
export function lastWeekdays(ym: string, back = 2): { last: string; earliest: string } {
  let t = Date.parse(toMonthEnd(ym));
  while (!isWeekday(t)) t -= 86_400_000;
  const last = new Date(t).toISOString().slice(0, 10);
  for (let n = 0; n < back; ) {
    t -= 86_400_000;
    if (isWeekday(t)) n++;
  }
  return { last, earliest: new Date(t).toISOString().slice(0, 10) };
}

interface MonthEndReturns { series: Series; dropped: { month: string; reason: string }[] }

/**
 * Daily levels -> month-end to month-end returns. A month's closing level is accepted only when
 *  - the month is closed: an observation exists in a later month (never an open-month return), and
 *  - no Canadian bond-market business day follows its last observation in the month: every day skipped before the
 *    month-end is a weekend or a bond-market holiday (market-calendar.ts caBondHolidays: the TSX holidays plus Truth and
 *    Reconciliation Day and Remembrance Day, which close the bond market and so the FTSE Canada indices).
 * A month without an accepted closing level produces no return for itself nor for the next month (the caller warns).
 */
export function monthEndReturns(levels: Record<string, number>): MonthEndReturns {
  const last: Record<string, { d: string; v: number }> = {};
  for (const d of Object.keys(levels).sort()) {
    const v = levels[d];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    last[d.slice(0, 7)] = { d, v };
  }
  const months = Object.keys(last).sort();
  const dropped: MonthEndReturns["dropped"] = [];
  const closing = new Map<string, number>();
  months.forEach((ym, i) => {
    if (i === months.length - 1) return; // not closed yet (no later observation)
    const next = new Date(Date.parse(`${last[ym].d.slice(0, 10)}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    const skipped = next <= toMonthEnd(ym) ? bondDays(next, toMonthEnd(ym)) : [];
    if (skipped.length) {
      dropped.push({ month: toMonthEnd(ym), reason: `last level ${last[ym].d}: no level for the bond-market business day(s) ${skipped.slice(-3).join(", ")}${skipped.length > 3 ? " …" : ""} before the month-end` });
      return;
    }
    closing.set(ym, last[ym].v);
  });
  const series: Series = {};
  for (let i = 1; i < months.length; i++) {
    const a = months[i - 1];
    const b = months[i];
    if (addMonths(a, 1) !== toMonthEnd(b)) continue; // gap in the level history
    const va = closing.get(a);
    const vb = closing.get(b);
    if (va === undefined || vb === undefined) continue;
    series[toMonthEnd(b)] = vb / va - 1;
  }
  return { series, dropped };
}

export const levelsToMonthly = (levels: Record<string, number>): Series => monthEndReturns(levels).series;

/** Round to 12 significant decimals (hides float noise such as 0.048200000000000004). */
export const clean = (x: number): number => Math.round(x * 1e12) / 1e12;
