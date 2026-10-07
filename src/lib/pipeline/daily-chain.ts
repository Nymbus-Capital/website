/**
 * Monthly net returns of ONE share class (FundServ code), computed in the website from the dataplatform's daily
 * `/api/performance/nav-timeseries` rows (dataplatform main endpoints are the only input: docs/architecture.md § Sources).
 * Pure, dependency-free (Node type stripping).
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
 *    using any CIBC month (build/track-record.ts). A `nav_price_ratio` row (price return, distribution-blind) is never compounded.
 */
import { addMonths, toMonthEnd } from "./metrics.ts";
import { isTradingDay, tradingDays, priorTradingDay } from "./market-calendar.ts";
import { ym } from "../data/dates.ts";

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
  /** CIBC months: valuation days without a NAV whose return is carried, verified, by the next day's stored return */
  bridged?: string[];
}

/** at most this many consecutive valuation days without a NAV can be bridged by the next day's stored return */
const CIBC_GAP_MAX_DAYS = 2;
/** the bridging stored return must equal the NAV-per-unit ratio across the gap within this (absolute) */
const CIBC_GAP_TOL = 1e-8;

interface ChainOptions {
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

const monthRows = (rows: DailyRow[], monthKey: string): DailyRow[] =>
  rows.filter((r) => ym(r.date) === monthKey).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

/**
 * CIBC holiday filler: the former administrator wrote a row on some market holidays (Labour Day, Thanksgiving, Christmas,
 * Family Day…) with the NAV per unit carried over and no return. Such a row is not a valuation day: dropped when the date
 * is not a trading day, its return is empty or zero, its NAV per unit is present and equals the previous row's, and no
 * other row shares the date. A holiday row that moves the NAV, carries a return or has no NAV stays (judged like any row).
 */
export function dropHolidayFiller<T extends DailyRow>(rows: T[]): T[] {
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const perDay = new Map<string, number>();
  for (const r of sorted) perDay.set(r.date.slice(0, 10), (perDay.get(r.date.slice(0, 10)) ?? 0) + 1);
  const out: T[] = [];
  let prevNav: number | null = null;
  for (const r of sorted) {
    const d = r.date.slice(0, 10);
    const nav = finite(r.nav_per_share_cad) ? (r.nav_per_share_cad as number) : null;
    const noReturn = r.net_daily_return === null || r.net_daily_return === undefined || r.net_daily_return === 0;
    // the NAV must be shown carried over (non-empty, equal to the previous one); a second row on the same day is a
    // conflict for the duplicate check, never resolved here
    const carried = nav !== null && prevNav !== null && Math.abs(nav / prevNav - 1) < 1e-9;
    if (r.source !== "apex" && !isTradingDay(d) && noReturn && carried && perDay.get(d) === 1) continue;
    out.push(r);
    if (nav !== null) prevNav = nav;
  }
  return out;
}

/** Apex month (port of `_monthly_rows`). */
export function apexMonth(rows: DailyRow[], month: string): ChainMonth {
  const monthKey = ym(month);
  const first = `${monthKey}-01`;
  const out: ChainMonth = { month, status: "unavailable", r: null, source: "apex", issue: null };
  const expected = tradingDays(first, month);
  const rs = monthRows(rows, monthKey);
  const days = rs.map((r) => r.date);
  const prior = priorTradingDay(first);
  const starts = [prior, ...expected.slice(0, -1)];
  if (new Set(days).size !== days.length) return { ...out, status: "conflict", issue: "Duplicate daily observations" };
  if (days.length !== expected.length || days.some((d, i) => d !== expected[i]))
    return { ...out, issue: "Incomplete Apex valuation-day coverage; no partial-month compounding" };
  if (
    rs.some(
      (r) =>
        r.source !== "apex" ||
        r.currency !== "CAD" ||
        r.nav_type !== "FINAL_NAV" ||
        r.net_return_method !== "apex_distribution_aware" ||
        r.return_source_count !== 1 ||
        !validReturn(r.net_daily_return),
    )
  ) {
    return { ...out, issue: "A complete distribution-aware Apex net-return chain is unavailable" };
  }
  if (rs.some((r, i) => r.return_start_date !== starts[i]))
    return { ...out, issue: "Apex return periods do not form a continuous month-end-to-month-end chain" };
  const value = prod(rs.map((r) => r.net_daily_return as number)) - 1;
  return validReturn(value)
    ? { ...out, status: "ready", r: value }
    : { ...out, issue: "Invalid compounded monthly return" };
}

/** CIBC month: stored daily net returns compounded over a complete month of the class's own book. */
export function cibcMonth(rows: DailyRow[], month: string, navStart: string): ChainMonth {
  const monthKey = ym(month);
  const out: ChainMonth = { month, status: "unavailable", r: null, source: "cibc", issue: null };
  const expected = tradingDays(`${monthKey}-01`, month);
  if (!expected.length || expected[0] < navStart)
    return { ...out, issue: `before the class's own data start (${navStart}): partial or other-strategy month` };
  const all = monthRows(dropHolidayFiller(rows), monthKey);
  const days0 = all.map((r) => r.date);
  if (new Set(days0).size !== days0.length) return { ...out, status: "conflict", issue: "Duplicate daily observations" };
  // a valuation day served without NAV and return is a missing day
  const blank = (r: DailyRow): boolean =>
    !finite(r.nav_per_share_cad) && (r.net_daily_return === null || r.net_daily_return === undefined);
  const isExpected = new Set(expected);
  // only on a valuation day (a blank row on a holiday keeps withholding the month: it is not a missing valuation day)
  const rs = all.filter((r) => !(blank(r) && isExpected.has(r.date)));
  const days = rs.map((r) => r.date);
  const have = new Set(days);
  const missing = expected.filter((d) => !have.has(d));
  const incomplete = (why = ""): ChainMonth => ({
    ...out,
    issue: `Incomplete CIBC valuation-day coverage (missing ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ", …" : ""})${why}; no partial-month compounding`,
  });
  // the previous month's last valuation day without a NAV: this month's first stored return would carry its move
  // (the previous month is withheld for it, this one must be too). Not applicable at the start of the data.
  const prevYm0 = ym(addMonths(month, -1));
  const prevAll = monthRows(rows, prevYm0).filter((r) => r.source === "cibc" && r.date >= navStart);
  const lastPrev = priorTradingDay(`${monthKey}-01`);
  if (prevAll.length && lastPrev && lastPrev >= navStart) {
    const at = prevAll.filter((r) => r.date === lastPrev);
    if (at.length !== 1 || !finite(at[0].nav_per_share_cad) || !((at[0].nav_per_share_cad as number) > 0))
      return {
        ...out,
        issue: `Incomplete CIBC valuation-day coverage (previous month's last valuation day ${lastPrev} without a single NAV per unit: this month's first return would carry its move); no partial-month compounding`,
      };
  }
  if (missing.length) {
    // CIBC sometimes strikes no NAV on a valuation day and the next day's stored return spans both days. Accepted only
    // when verified: a short run of missing days inside the month, NAVs per unit on both sides, and the next day's stored
    // return equal to their ratio − 1 (no distribution, nothing lost); otherwise the month stays unavailable.
    const prevYm = ym(addMonths(month, -1));
    const before = [
      ...monthRows(dropHolidayFiller(rows), prevYm).filter(
        (r) => r.source === "cibc" && r.currency === "CAD" && r.date >= navStart && finite(r.nav_per_share_cad),
      ),
      ...rs,
    ];
    let i = 0;
    while (i < expected.length) {
      if (have.has(expected[i])) {
        i++;
        continue;
      }
      let j = i;
      while (j < expected.length && !have.has(expected[j])) j++;
      if (j - i > CIBC_GAP_MAX_DAYS) return incomplete(`: ${j - i} consecutive days, at most ${CIBC_GAP_MAX_DAYS} bridgeable`);
      if (j >= expected.length) return incomplete(": the month's last valuation day has no NAV");
      const next = rs.find((r) => r.date === expected[j])!;
      const prevDay = [...before].reverse().find((r) => r.date < expected[i])?.date;
      const atPrev = before.filter((r) => r.date === prevDay);
      const prev = atPrev.length === 1 ? atPrev[0] : undefined;
      const pn = prev?.nav_per_share_cad;
      const nn = next.nav_per_share_cad;
      if (!prev || prev.date < priorTradingDay(expected[i])! || !finite(pn) || !finite(nn) || !(pn > 0) || !(nn > 0))
        return incomplete(": no NAV per unit on both sides of the gap");
      if (!validReturn(next.net_daily_return) || Math.abs((next.net_daily_return as number) - (nn / pn - 1)) > CIBC_GAP_TOL)
        return incomplete(
          `: the stored return of ${next.date} does not equal the NAV-per-unit ratio across the gap (${prev.date} → ${next.date})`,
        );
      i = j;
    }
  }
  const bad = rs.find(
    (r) =>
      r.source !== "cibc" ||
      r.currency !== "CAD" ||
      r.net_return_method !== "legacy_stored" ||
      !validReturn(r.net_daily_return),
  );
  if (bad)
    return {
      ...out,
      issue: `${bad.date}: ${bad.source !== "cibc" ? `source ${bad.source ?? "unknown"}` : bad.currency !== "CAD" ? `currency ${bad.currency ?? "unknown"} (CAD expected)` : bad.net_return_method !== "legacy_stored" ? `return method ${bad.net_return_method ?? "unknown"} (not the stored CIBC net return)` : "no valid daily net return"}`,
    };
  const value = prod(rs.map((r) => r.net_daily_return as number)) - 1;
  if (!validReturn(value)) return { ...out, issue: "Invalid compounded monthly return" };
  // diagnostics: chain vs NAV per unit ratio from the previous month-end (a gap is a distribution, or a missed day)
  const prevYm = ym(addMonths(month, -1));
  const prevRows = monthRows(rows, prevYm).filter(
    (r) => finite(r.nav_per_share_cad) && (r.nav_per_share_cad as number) > 0,
  );
  const base = prevRows.find((r) => r.date === lastPrev)?.nav_per_share_cad ?? null;
  const end = rs[rs.length - 1].nav_per_share_cad;
  const navGap = finite(base) && finite(end) && end > 0 ? (1 + value) / (end / base) - 1 : null;
  return { ...out, status: "ready", r: value, navGap, ...(missing.length ? { bridged: missing } : {}) };
}

/** The cut-over month: NAV bridge of dataplatform PR #626 (`_bridge` + `_bridge_issue`). */
export function bridgeMonth(rows: DailyRow[], month: string, cutover = CUTOVER): ChainMonth {
  const monthKey = ym(month);
  const out: ChainMonth = { month, status: "unavailable", r: null, source: "bridge", issue: null };
  const fail = (issue: string, status: ChainMonth["status"] = "unavailable"): ChainMonth => ({ ...out, status, issue });
  const july = tradingDays(`${monthKey}-01`, month);
  const priorEnd = priorTradingDay(`${monthKey}-01`);
  const prevYm = ym(addMonths(month, -1));
  const prior = monthRows(rows, prevYm).filter((r) => r.source === "cibc" && finite(r.nav_per_share_cad));
  const priorDay = prior.length ? prior[prior.length - 1] : null;
  if (priorDay && priorDay.currency !== "CAD")
    return fail(`CIBC month-end NAV per unit of ${priorDay.date} is not in CAD (${priorDay.currency ?? "unknown"})`);
  const day = prior.length ? prior[prior.length - 1].date : null;
  const base = prior.filter((r) => r.date === day);
  const apex = monthRows(rows, monthKey).filter((r) => r.source === "apex");
  const firstApex = apex[0]?.date ?? month;
  const cibcJuly = monthRows(rows, monthKey).filter((r) => r.source === "cibc" && r.date < firstApex);
  if (!base.length || !priorEnd || day! < priorEnd) return fail("No CIBC month-end NAV per unit before the cut-over");
  if (new Set(base.map((r) => r.nav_per_share_cad)).size > 1)
    return fail("Conflicting CIBC month-end NAV per unit", "conflict");
  const baseNav = base[0].nav_per_share_cad as number;
  if (!(baseNav > 0)) return fail("Invalid CIBC month-end NAV per unit");
  if (!apex.length || apex[0].date <= cutover) return fail("No Apex valuation days after the cut-over");
  const cibcDays = cibcJuly.map((r) => r.date);
  const apexDays = apex.map((r) => r.date);
  if (new Set(cibcDays).size !== cibcDays.length || new Set(apexDays).size !== apexDays.length)
    return fail("Duplicate daily observations", "conflict");
  const wantCibc = july.filter((d) => d < firstApex);
  const wantApex = july.filter((d) => d >= firstApex);
  if (cibcDays.length !== wantCibc.length || cibcDays.some((d, i) => d !== wantCibc[i]))
    return fail("Incomplete CIBC valuation-day coverage before the first Apex day");
  if (apexDays.length !== wantApex.length || apexDays.some((d, i) => d !== wantApex[i]))
    return fail("Incomplete Apex valuation-day coverage after the cut-over");
  if (cibcJuly.some((r) => r.currency !== "CAD"))
    return fail("CIBC daily rows before the first Apex day are not in CAD");
  if (
    cibcJuly.some(
      (r) =>
        !(finite(r.nav_per_share_cad) && r.nav_per_share_cad > 0) ||
        !validReturn(r.net_daily_return) ||
        r.net_return_method !== "legacy_stored",
    )
  ) {
    return fail("CIBC daily NAV per unit or stored return is unavailable before the first Apex day");
  }
  if (
    apex.some(
      (r) =>
        r.currency !== "CAD" || r.nav_type !== "FINAL_NAV" || !(finite(r.nav_per_share_cad) && r.nav_per_share_cad > 0),
    )
  )
    return fail("Apex FINAL_NAV per unit is unavailable after the cut-over");
  if (apex[apex.length - 1].return_source_count !== 1)
    return fail("Apex month-end NAV per unit does not come from a single class row");
  for (let i = 1; i < apex.length; i++) {
    const r = apex[i];
    if (
      r.net_return_method !== "apex_distribution_aware" ||
      !validReturn(r.net_daily_return) ||
      r.return_start_date !== apex[i - 1].date
    ) {
      return fail("A complete distribution-aware Apex net-return chain is unavailable after the cut-over");
    }
  }
  const drifts = (rs: DailyRow[], start: number): boolean =>
    Math.abs(
      (prod(rs.map((r) => r.net_daily_return as number)) * start) / (rs[rs.length - 1].nav_per_share_cad as number) - 1,
    ) > BRIDGE_TOLERANCE;
  if (cibcJuly.length && drifts(cibcJuly, baseNav))
    return fail("CIBC daily returns disagree with its NAV per unit (distribution before the switch?)");
  if (apex.length > 1 && drifts(apex.slice(1), apex[0].nav_per_share_cad as number))
    return fail("Apex daily returns disagree with its NAV per unit (distribution before month-end?)");
  // seam continuity: when the first Apex day's return starts on the last CIBC day, the CIBC NAV per unit carried by that
  // return must give the first Apex NAV per unit (a different unit value or an unbooked distribution at the switch)
  const lastCibc = cibcJuly.length ? cibcJuly[cibcJuly.length - 1] : base[0];
  const a0 = apex[0];
  if (a0.return_start_date === lastCibc.date && validReturn(a0.net_daily_return)) {
    const carried = (lastCibc.nav_per_share_cad as number) * (1 + a0.net_daily_return);
    if (Math.abs(carried / (a0.nav_per_share_cad as number) - 1) > BRIDGE_TOLERANCE) {
      return fail(
        `seam discontinuity: CIBC NAV per unit of ${lastCibc.date} × (1 + Apex return of ${a0.date}) = ${carried.toFixed(6)} vs Apex NAV per unit ${(a0.nav_per_share_cad as number).toFixed(6)}`,
      );
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
  const days = tradingDays(`${ym(m)}-01`, m);
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
  const ownRows = dropHolidayFiller(own);
  const out: ChainMonth[] = [];
  const start = classStart(ownRows, opts.navStart);
  if (!start) return out;
  for (let m = firstComputableMonth(start); m <= opts.endMonth; m = addMonths(m, 1)) {
    if (m < bridge) out.push(cibcMonth(ownRows, m, start));
    else if (m === bridge) out.push(bridgeMonth(ownRows, m, cutover));
    else out.push(apexMonth(ownRows, m));
  }
  return out;
}
