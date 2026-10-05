/**
 * SYNTHETIC daily NAV rows of one share class as /api/performance/nav-timeseries returns them (CIBC era with stored
 * daily returns, the 2026-07-06 Apex cut-over, Apex distribution-aware returns), built so that the compounded months
 * equal a given monthly series. Shared by the fixture generator and the unit tests. No real fund data.
 *
 * Distribution conventions (as described by the dataplatform, PR #626): a CIBC month-end NAV per unit is
 * post-distribution (the distribution leaves the NAV on the month-end valuation day); an Apex month-end NAV per unit is
 * pre-distribution (Apex re-bases the next day's return on the post-distribution NAV).
 */
import { tradingDays, CUTOVER, type DailyRow } from "../../../src/lib/pipeline/daily-chain.ts";
import { addMonths, toMonthEnd, type Series } from "../../../src/lib/pipeline/metrics.ts";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SynthClass {
  fundserv: string;
  /** target monthly returns (month-end keys); a month in it compounds exactly to it */
  monthly: Series;
  /** first row of the class's own book */
  navStart: string;
  /** last row (inclusive) */
  end: string;
  nav0: number;
  /** distribution per unit at a month-end (null/0: none) */
  dist?: (month: string) => number;
  seed: number;
  /** rows of ANOTHER strategy under the same code before navStart (reused fund code), from this date */
  priorFrom?: string;
  /** last day of those earlier rows (default: the day before navStart); a gap after it is a closed-then-relaunched class */
  priorTo?: string;
  cutover?: string;
  /**
   * shared daily noise: every class of one fund given the same `noiseSeed` gets the same noise on the same date, and each
   * complete month is scaled uniformly over its days to its target (classes of one book move together, as in the source).
   * Without it: a per-class random sequence and the month's last day carries the target.
   */
  noiseSeed?: number;
  /** extra daily returns added to the noise on given dates (before the month is scaled to its target) */
  shocks?: Record<string, number>;
  /** class currency (default CAD); a non-CAD class gets price-ratio returns in the Apex era, like the source */
  currency?: string;
}

/** deterministic noise in [-0.5, 0.5) for (seed, date) */
function dayNoise(seed: number, date: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < date.length; i++) h = Math.imul(h ^ date.charCodeAt(i), 2654435761) >>> 0;
  return mulberry32(h)() - 0.5;
}

const r10 = (x: number): number => Math.round(x * 1e10) / 1e10;

export function synthClassRows(c: SynthClass): DailyRow[] {
  const rnd = mulberry32(c.seed);
  const cut = c.cutover ?? CUTOVER;
  const out: DailyRow[] = [];
  const cur = c.currency ?? "CAD";
  const row = (date: string, nav: number, ret: number, start: string | null): DailyRow & Record<string, unknown> => {
    const apex = date > cut;
    return {
      date, source: apex ? "apex" : "cibc", fundserv: c.fundserv, currency: cur, nav_type: apex ? "FINAL_NAV" : null,
      nav_per_share_cad: r10(nav), net_daily_return: ret, net_return_method: apex ? (cur === "CAD" ? "apex_distribution_aware" : "nav_price_ratio") : "legacy_stored",
      return_start_date: apex ? start : null, return_source_count: apex ? 1 : null,
    };
  };
  if (c.priorFrom) {
    // another strategy's rows: random walk, never part of this class
    let nav = 10;
    let prev: string | null = null;
    for (const d of tradingDays(c.priorFrom, c.priorTo ?? addDays(c.navStart, -1))) {
      const r = 0.004 * (rnd() - 0.5);
      nav *= 1 + r;
      out.push(row(d, nav, r, prev));
      prev = d;
    }
  }
  const days = tradingDays(c.navStart, c.end);
  let nav = c.nav0;
  let pendingApexDist = 0;
  for (let i = 0; i < days.length; ) {
    const ym = days[i].slice(0, 7);
    const monthDays: string[] = [];
    while (i < days.length && days[i].slice(0, 7) === ym) monthDays.push(days[i++]);
    const m = toMonthEnd(ym);
    const target = m in c.monthly && monthDays[0] === tradingDays(`${ym}-01`, m)[0] && monthDays[monthDays.length - 1] === tradingDays(`${ym}-01`, m).at(-1) ? c.monthly[m] : null;
    let rs = monthDays.map((day) => (c.noiseSeed !== undefined ? 0.0016 * dayNoise(c.noiseSeed, day) : 0.0016 * (rnd() - 0.5)) + (c.shocks?.[day] ?? 0));
    if (c.noiseSeed !== undefined && (target !== null || m in c.monthly)) {
      // uniform scaling over the month's days: (1 + r_d) × q, q chosen so the WHOLE month compounds exactly to the target;
      // a class launched within the month keeps the same daily returns as a class priced all month
      const all = tradingDays(`${ym}-01`, m);
      const full = all.map((day) => 0.0016 * dayNoise(c.noiseSeed!, day) + (c.shocks?.[day] ?? 0));
      const t = c.monthly[m];
      const p = full.reduce((a, r) => a * (1 + r), 1);
      const q = Math.pow((1 + t) / p, 1 / full.length);
      const scaled = full.map((r) => (1 + r) * q - 1);
      if (target !== null) {
        const p2 = scaled.slice(0, -1).reduce((a, r) => a * (1 + r), 1);
        scaled[scaled.length - 1] = (1 + target) / p2 - 1; // exact to the last bit
      }
      rs = monthDays.map((day) => scaled[all.indexOf(day)]);
    } else if (target !== null) {
      const p = rs.slice(0, -1).reduce((a, r) => a * (1 + r), 1);
      rs[rs.length - 1] = (1 + target) / p - 1;
    }
    const d = c.dist?.(m) ?? 0;
    monthDays.forEach((day, k) => {
      const r = rs[k];
      const apex = day > cut;
      const prev = out.length ? out[out.length - 1].date : null;
      if (apex && pendingApexDist) {
        nav = (nav - pendingApexDist) * (1 + r);
        pendingApexDist = 0;
      } else nav = nav * (1 + r);
      const last = k === monthDays.length - 1;
      if (last && d && target !== null) {
        if (apex) pendingApexDist = d; // Apex month-end NAV is pre-distribution
        else nav -= d; // CIBC month-end NAV is post-distribution
      }
      out.push(row(day, nav, r, prev));
    });
  }
  return out;
}

export function addDays(date: string, n: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

export const monthsOf = (first: string, last: string): string[] => {
  const out: string[] = [];
  for (let m = first; m <= last; m = addMonths(m, 1)) out.push(m);
  return out;
};
