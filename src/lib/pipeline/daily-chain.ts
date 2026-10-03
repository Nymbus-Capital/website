/**
 * Monthly net returns of ONE share class (FundServ code), computed in the website from the dataplatform's daily
 * `/api/performance/nav-timeseries` rows (Gabriel 2026-10-02: "compute whatever you need within the backend of the
 * website and only take the dataplatform api endpoints as input data"). Pure, dependency-free (Node type stripping).
 *
 * Three regimes, each a port of the dataplatform's own rules so the figures are the ones it would publish:
 *  - Apex months (after the cut-over month): `monthly_net_returns._monthly_rows` (dataplatform main) — every Canadian
 *    valuation day of the month present once, every row `source=apex`, CAD, FINAL_NAV, `apex_distribution_aware`,
 *    `return_source_count` 1, and the `return_start_date` chain continuous from the previous month's last valuation day.
 *  - The cut-over month (2026-07): the NAV bridge of dataplatform PR #626 (`_bridge` / `_bridge_issue`), Apex month-end
 *    NAV per unit / CIBC prior month-end NAV per unit − 1, with its coverage and drift gates. The CIBC `distribution`
 *    column is not served by the API: a CIBC distribution inside the month shows as a drift of the CIBC chain instead.
 *  - CIBC months (before the cut-over month): the stored CIBC daily net returns (`legacy_stored`) compounded over a
 *    month whose every Canadian valuation day is present (no partial month), from the class's data start (`navStart`;
 *    earlier rows of a reused fund code belong to another strategy and are ignored). The API does not say whether the
 *    stored CIBC returns include distributions: the caller verifies them against an independent monthly history before
 *    using any CIBC month (build.ts). A `nav_price_ratio` row (price return, distribution-blind) is never compounded.
 */
import { addMonths, toMonthEnd } from "./metrics.ts";
import { tradingDays, priorTradingDay } from "./market-calendar.ts";

export { caMarketHolidays, isTradingDay, priorTradingDay, tradingDays } from "./market-calendar.ts";

/* ------------------------------------------------------------------ rows */

/** One nav-timeseries row of the class, reduced to what the chain needs. */
export interface DailyRow {
  date: string;
  source?: string | null;
  currency?: string | null;
  nav_type?: string | null;
  nav_per_share_cad?: number | null;
  net_daily_return?: number | null;
  net_return_method?: string | null;
  return_start_date?: string | null;
  return_source_count?: number | null;
}

export type ChainSource = "cibc" | "bridge" | "apex";

export interface ChainMonth {
  month: string;
  status: "ready" | "unavailable" | "conflict";
  r: number | null;
  source: ChainSource;
  issue: string | null;
  /** CIBC months: compounded daily returns / NAV-per-unit ratio − 1 (≈ 0 without a distribution; diagnostics only) */
  navGap?: number | null;
}

export interface ChainOptions {
  /** first date whose rows belong to this class's own book (earlier rows of a reused code are another strategy) */
  navStart: string;
  /** last closed month (month-end): later months are never computed */
  endMonth: string;
  /** last CIBC-authoritative day (dataplatform `_CUTOVER`); the month containing it is the bridge month */
  cutover?: string;
}

export const CUTOVER = "2026-07-05";
/** tolerance of the bridge drift checks (dataplatform PR #626 `_BRIDGE_TOLERANCE`) */
export const BRIDGE_TOLERANCE = 1e-4;

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const validReturn = (v: unknown): v is number => finite(v) && v > -1;
const prod = (rs: number[]): number => rs.reduce((a, r) => a * (1 + r), 1);

const monthRows = (rows: DailyRow[], ym: string): DailyRow[] => rows.filter((r) => r.date.slice(0, 7) === ym).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

/** Apex month (port of `_monthly_rows`). */
export function apexMonth(rows: DailyRow[], month: string): ChainMonth {
  const ym = month.slice(0, 7);
  const first = `${ym}-01`;
  const out: ChainMonth = { month, status: "unavailable", r: null, source: "apex", issue: null };
  const expected = tradingDays(first, month);
  const rs = monthRows(rows, ym);
  const days = rs.map((r) => r.date);
  const prior = priorTradingDay(first);
  const starts = [prior, ...expected.slice(0, -1)];
  if (new Set(days).size !== days.length) return { ...out, status: "conflict", issue: "Duplicate daily observations" };
  if (days.length !== expected.length || days.some((d, i) => d !== expected[i])) return { ...out, issue: "Incomplete Apex valuation-day coverage; no partial-month compounding" };
  if (rs.some((r) => r.source !== "apex" || r.currency !== "CAD" || r.nav_type !== "FINAL_NAV" || r.net_return_method !== "apex_distribution_aware" || r.return_source_count !== 1 || !validReturn(r.net_daily_return))) {
    return { ...out, issue: "A complete distribution-aware Apex net-return chain is unavailable" };
  }
  if (rs.some((r, i) => r.return_start_date !== starts[i])) return { ...out, issue: "Apex return periods do not form a continuous month-end-to-month-end chain" };
  const value = prod(rs.map((r) => r.net_daily_return as number)) - 1;
  return validReturn(value) ? { ...out, status: "ready", r: value } : { ...out, issue: "Invalid compounded monthly return" };
}

/** CIBC month: stored daily net returns compounded over a complete month of the class's own book. */
export function cibcMonth(rows: DailyRow[], month: string, navStart: string): ChainMonth {
  const ym = month.slice(0, 7);
  const out: ChainMonth = { month, status: "unavailable", r: null, source: "cibc", issue: null };
  const expected = tradingDays(`${ym}-01`, month);
  if (!expected.length || expected[0] < navStart) return { ...out, issue: `before the class's own data start (${navStart}): partial or other-strategy month` };
  const rs = monthRows(rows, ym);
  const days = rs.map((r) => r.date);
  if (new Set(days).size !== days.length) return { ...out, status: "conflict", issue: "Duplicate daily observations" };
  const have = new Set(days);
  const missing = expected.filter((d) => !have.has(d));
  if (missing.length) return { ...out, issue: `Incomplete CIBC valuation-day coverage (missing ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ", …" : ""}); no partial-month compounding` };
  const bad = rs.find((r) => r.source !== "cibc" || r.currency !== "CAD" || r.net_return_method !== "legacy_stored" || !validReturn(r.net_daily_return));
  if (bad) return { ...out, issue: `${bad.date}: ${bad.source !== "cibc" ? `source ${bad.source ?? "unknown"}` : bad.currency !== "CAD" ? `currency ${bad.currency ?? "unknown"} (CAD expected)` : bad.net_return_method !== "legacy_stored" ? `return method ${bad.net_return_method ?? "unknown"} (not the stored CIBC net return)` : "no valid daily net return"}` };
  const value = prod(rs.map((r) => r.net_daily_return as number)) - 1;
  if (!validReturn(value)) return { ...out, issue: "Invalid compounded monthly return" };
  // diagnostics: chain vs NAV per unit ratio from the previous month-end (a gap is a distribution, or a missed day)
  const prevYm = addMonths(month, -1).slice(0, 7);
  const prevRows = monthRows(rows, prevYm).filter((r) => finite(r.nav_per_share_cad) && (r.nav_per_share_cad as number) > 0);
  const base = prevRows[prevRows.length - 1]?.nav_per_share_cad ?? null;
  const end = rs[rs.length - 1].nav_per_share_cad;
  const navGap = finite(base) && finite(end) && end > 0 ? (1 + value) / (end / base) - 1 : null;
  return { ...out, status: "ready", r: value, navGap };
}

/** The cut-over month: NAV bridge of dataplatform PR #626 (`_bridge` + `_bridge_issue`). */
export function bridgeMonth(rows: DailyRow[], month: string, cutover = CUTOVER): ChainMonth {
  const ym = month.slice(0, 7);
  const out: ChainMonth = { month, status: "unavailable", r: null, source: "bridge", issue: null };
  const fail = (issue: string, status: ChainMonth["status"] = "unavailable"): ChainMonth => ({ ...out, status, issue });
  const july = tradingDays(`${ym}-01`, month);
  const priorEnd = priorTradingDay(`${ym}-01`);
  const prevYm = addMonths(month, -1).slice(0, 7);
  const prior = monthRows(rows, prevYm).filter((r) => r.source === "cibc" && finite(r.nav_per_share_cad));
  const priorDay = prior.length ? prior[prior.length - 1] : null;
  if (priorDay && priorDay.currency !== "CAD") return fail(`CIBC month-end NAV per unit of ${priorDay.date} is not in CAD (${priorDay.currency ?? "unknown"})`);
  const day = prior.length ? prior[prior.length - 1].date : null;
  const base = prior.filter((r) => r.date === day);
  const apex = monthRows(rows, ym).filter((r) => r.source === "apex");
  const firstApex = apex[0]?.date ?? month;
  const cibcJuly = monthRows(rows, ym).filter((r) => r.source === "cibc" && r.date < firstApex);
  if (!base.length || !priorEnd || day! < priorEnd) return fail("No CIBC month-end NAV per unit before the cut-over");
  if (new Set(base.map((r) => r.nav_per_share_cad)).size > 1) return fail("Conflicting CIBC month-end NAV per unit", "conflict");
  const baseNav = base[0].nav_per_share_cad as number;
  if (!(baseNav > 0)) return fail("Invalid CIBC month-end NAV per unit");
  if (!apex.length || apex[0].date <= cutover) return fail("No Apex valuation days after the cut-over");
  const cibcDays = cibcJuly.map((r) => r.date);
  const apexDays = apex.map((r) => r.date);
  if (new Set(cibcDays).size !== cibcDays.length || new Set(apexDays).size !== apexDays.length) return fail("Duplicate daily observations", "conflict");
  const wantCibc = july.filter((d) => d < firstApex);
  const wantApex = july.filter((d) => d >= firstApex);
  if (cibcDays.length !== wantCibc.length || cibcDays.some((d, i) => d !== wantCibc[i])) return fail("Incomplete CIBC valuation-day coverage before the first Apex day");
  if (apexDays.length !== wantApex.length || apexDays.some((d, i) => d !== wantApex[i])) return fail("Incomplete Apex valuation-day coverage after the cut-over");
  if (cibcJuly.some((r) => r.currency !== "CAD")) return fail("CIBC daily rows before the first Apex day are not in CAD");
  if (cibcJuly.some((r) => !(finite(r.nav_per_share_cad) && r.nav_per_share_cad > 0) || !validReturn(r.net_daily_return) || r.net_return_method !== "legacy_stored")) {
    return fail("CIBC daily NAV per unit or stored return is unavailable before the first Apex day");
  }
  if (apex.some((r) => r.currency !== "CAD" || r.nav_type !== "FINAL_NAV" || !(finite(r.nav_per_share_cad) && r.nav_per_share_cad > 0))) return fail("Apex FINAL_NAV per unit is unavailable after the cut-over");
  if (apex[apex.length - 1].return_source_count !== 1) return fail("Apex month-end NAV per unit does not come from a single class row");
  for (let i = 1; i < apex.length; i++) {
    const r = apex[i];
    if (r.net_return_method !== "apex_distribution_aware" || !validReturn(r.net_daily_return) || r.return_start_date !== apex[i - 1].date) {
      return fail("A complete distribution-aware Apex net-return chain is unavailable after the cut-over");
    }
  }
  const drifts = (rs: DailyRow[], start: number): boolean => Math.abs((prod(rs.map((r) => r.net_daily_return as number)) * start) / (rs[rs.length - 1].nav_per_share_cad as number) - 1) > BRIDGE_TOLERANCE;
  if (cibcJuly.length && drifts(cibcJuly, baseNav)) return fail("CIBC daily returns disagree with its NAV per unit (distribution before the switch?)");
  if (apex.length > 1 && drifts(apex.slice(1), apex[0].nav_per_share_cad as number)) return fail("Apex daily returns disagree with its NAV per unit (distribution before month-end?)");
  // seam continuity: when the first Apex day's return starts on the last CIBC day, the CIBC NAV per unit carried by that
  // return must give the first Apex NAV per unit (a different unit value or an unbooked distribution at the switch)
  const lastCibc = cibcJuly.length ? cibcJuly[cibcJuly.length - 1] : base[0];
  const a0 = apex[0];
  if (a0.return_start_date === lastCibc.date && validReturn(a0.net_daily_return)) {
    const carried = (lastCibc.nav_per_share_cad as number) * (1 + a0.net_daily_return);
    if (Math.abs(carried / (a0.nav_per_share_cad as number) - 1) > BRIDGE_TOLERANCE) {
      return fail(`seam discontinuity: CIBC NAV per unit of ${lastCibc.date} × (1 + Apex return of ${a0.date}) = ${carried.toFixed(6)} vs Apex NAV per unit ${(a0.nav_per_share_cad as number).toFixed(6)}`);
    }
  }
  const value = (apex[apex.length - 1].nav_per_share_cad as number) / baseNav - 1;
  return validReturn(value) ? { ...out, status: "ready", r: value } : fail("Invalid bridged monthly return");
}

/**
 * First day of a class's own data: its first row on or after the fund's data start (a class launched later than the
 * fund starts at its own first valuation; the register serves no class inception date). null without rows.
 */
export function classStart(rows: DailyRow[], navStart: string): string | null {
  let first: string | null = null;
  for (const r of rows) {
    if (typeof r.date !== "string") continue;
    const d = r.date.slice(0, 10);
    if (d >= navStart && (first === null || d < first)) first = d;
  }
  return first;
}

/** First month whose every valuation day falls on or after `start` (the class's first computable month). */
export function firstComputableMonth(start: string): string {
  const m = toMonthEnd(start);
  const days = tradingDays(`${m.slice(0, 7)}-01`, m);
  return days.length && days[0] >= start ? m : addMonths(m, 1);
}

/**
 * Every month of one class from its first computable month (classStart, firstComputableMonth) to `endMonth`: CIBC
 * months, the cut-over bridge, Apex months.
 */
export function classMonths(rows: DailyRow[], opts: ChainOptions): ChainMonth[] {
  const cutover = opts.cutover ?? CUTOVER;
  const bridge = toMonthEnd(cutover);
  // only the class's own book: rows before navStart (another strategy under a reused code) never enter a month,
  // nor serve as the bridge base
  const own = rows
    .filter((r) => typeof r.date === "string")
    .map((r) => ({ ...r, date: r.date.slice(0, 10) }))
    .filter((r) => r.date >= opts.navStart && r.date <= opts.endMonth);
  const out: ChainMonth[] = [];
  const start = classStart(own, opts.navStart);
  if (!start) return out;
  for (let m = firstComputableMonth(start); m <= opts.endMonth; m = addMonths(m, 1)) {
    if (m < bridge) out.push(cibcMonth(own, m, start));
    else if (m === bridge) out.push(bridgeMonth(own, m, cutover));
    else out.push(apexMonth(own, m));
  }
  return out;
}
