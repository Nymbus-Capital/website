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

export const TRAILING_SPECS: { period: "1M" | "3M" | "1Y" | "2Y" | "3Y" | "5Y" | "10Y"; months: number; ann: boolean }[] = [
  { period: "1M", months: 1, ann: false },
  { period: "3M", months: 3, ann: false },
  { period: "1Y", months: 12, ann: false },
  { period: "2Y", months: 24, ann: true },
  { period: "3Y", months: 36, ann: true },
  { period: "5Y", months: 60, ann: true },
  { period: "10Y", months: 120, ann: true },
];

export type TrailingMap = { "1M": number | null; "3M": number | null; YTD: number | null; "1Y": number | null; "2Y": number | null; "3Y": number | null; "5Y": number | null; "10Y": number | null; SI: number | null };

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

export interface CalendarYear { year: number; value: number | null; months: number; partial: boolean }

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

/**
 * Date -> total-return level of the index itself, from index-summary rows (which may repeat a date per
 * rating/term/sector/group breakdown). Only the aggregate row counts: EVERY grouping dimension blank or
 * All/Overall/Total. A day without such a row is dropped (a sub-index level is never used).
 */
export function ftseLevels(rows: FtseRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = r.total_return;
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    if (!AGG.has(r.rating) || !AGG.has(r.term) || !AGG.has(r.industry_sector) || !AGG.has(r.industry_group)) continue;
    const d = String(r.date).slice(0, 10);
    if (!(d in out)) out[d] = v;
  }
  return Object.fromEntries(Object.keys(out).sort().map((d) => [d, out[d]]));
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

export interface MonthEndReturns { series: Series; dropped: { month: string; reason: string }[] }

/**
 * Daily levels -> month-end to month-end returns. A month's closing level is accepted only when
 *  - the month is closed: an observation exists in a later month (never an open-month return), and
 *  - its last observation is the last weekday of the month or at most 2 weekdays before it (Canadian
 *    market holidays; the dataplatform exposes no holiday calendar).
 * A month without an accepted closing level produces no return for itself nor for the next month.
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
    const { earliest } = lastWeekdays(ym);
    if (last[ym].d < earliest) {
      dropped.push({ month: toMonthEnd(ym), reason: `last level ${last[ym].d} is more than 2 weekdays before the month-end` });
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
