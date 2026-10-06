/**
 * FTSE index levels (pure): index-summary rows of one index → its daily total-return levels, the join of its naming
 * generations, and month-end to month-end returns. Return math lives in metrics.ts.
 */
import { bondDays, isBondDay } from "./market-calendar.ts";
import { ym } from "../data/dates.ts";
import { addMonths, toMonthEnd, type Series } from "./metrics.ts";

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
  for (let t = Date.parse(`${ym(d)}-01T00:00:00Z`); ; t += 86_400_000) {
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

/** last weekday (Mon-Fri) of the month of `month`, and the weekday `back` weekdays before it */
export function lastWeekdays(month: string, back = 2): { last: string; earliest: string } {
  let t = Date.parse(toMonthEnd(month));
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
    last[ym(d)] = { d, v };
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
