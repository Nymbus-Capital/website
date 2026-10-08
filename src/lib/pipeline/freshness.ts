/**
 * Data freshness verdict of the public site (pure, dependency-free, unit tested): used by GET /api/status and by the
 * stale-data alert (monitor.ts). Business days are Canadian valuation days (TSX calendar, market-calendar.ts) in
 * America/Toronto.
 *
 * Stale when (per fund, on what the site shows — never on how often runs are published, so a review-mode site whose
 * figures are current is not stale between approvals):
 *  - its performance does not include the last closed month once that month has been closed for more than 15 business
 *    days (month-end NAVs are final the next business day, the administrator's month-end package and the factsheet
 *    archive that confirms a new month arrive within about two weeks; 15 leaves a margin and still flags a month missed
 *    well before the next month-end);
 *  - the NAV of its OLDEST class is more than 4 business days old (fund vehicles only: managed-account strategies have no
 *    NAV);
 *  - it shows no performance at all.
 * Blocks the admin hides (hide.performance / hide.nav) are not checked.
 */
import { TIMEZONE } from "./config.ts";
import { tradingDays } from "./market-calendar.ts";

export const FRESHNESS = {
  /** business days after a month-end before that month must be published */
  performanceBusinessDays: 7,
  /** business days a NAV may lag */
  navBusinessDays: 2,
} as const;

export interface FundFreshnessInput {
  key: string;
  /** a fund vehicle has a NAV (and the admin shows it); a strategy (managed accounts) does not */
  hasNav: boolean;
  /** false when the admin hides the fund's performance */
  hasPerformance?: boolean;
  performanceAsOf: string | null;
  navAsOf: string | null;
}

export interface FundFreshness {
  performanceAsOf: string | null;
  /** NAV date of the fund's oldest class */
  navAsOf: string | null;
  /** month-end the performance should include by now (null when not checked) */
  performanceExpected: string | null;
  /** business days since the NAV date, up to today */
  navLagBusinessDays: number | null;
  verdict: "ok" | "stale";
  reasons: string[];
}

export interface Freshness {
  verdict: "ok" | "stale";
  /** stable codes of what is stale (e.g. "monthly-income:nav"): the alert's fingerprint */
  codes: string[];
  reasons: string[];
  funds: Record<string, FundFreshness>;
  thresholds: typeof FRESHNESS;
}

const DAY = 86_400_000;
const fmtCache = new Map<string, Intl.DateTimeFormat>();

/** local calendar date (YYYY-MM-DD) of an instant in `tz` */
export function localDate(t: number, tz: string = TIMEZONE): string {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    fmtCache.set(tz, f);
  }
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(new Date(t))) if (p.type !== "literal") o[p.type] = p.value;
  return `${o.year}-${o.month}-${o.day}`;
}

const addDays = (d: string, n: number): string =>
  new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

const monthEnd = (y: number, m: number): string => new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);

/** The month-end the performance must include on `today`: the last one closed for more than `days` business days. */
export function expectedPerformanceMonthEnd(today: string, days: number = FRESHNESS.performanceBusinessDays): string {
  let y = Number(today.slice(0, 4));
  let m = Number(today.slice(5, 7)) - 1; // previous month (1-based month numbers; 0 = December of the year before)
  for (let i = 0; i < 3; i++) {
    if (m < 1) {
      m += 12;
      y -= 1;
    }
    const e = monthEnd(y, m);
    if (tradingDays(addDays(e, 1), today).length > days) return e;
    m -= 1;
  }
  return monthEnd(m < 1 ? y - 1 : y, m < 1 ? m + 12 : m);
}

/** Business days after `asOf` up to and including `today`. */
export const businessDaysSince = (asOf: string, today: string): number =>
  asOf >= today ? 0 : tradingDays(addDays(asOf, 1), today).length;

const isIso = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s);

export function freshness(o: { now: Date; funds: FundFreshnessInput[]; tz?: string }): Freshness {
  const tz = o.tz ?? TIMEZONE;
  const today = localDate(o.now.getTime(), tz);
  const codes: string[] = [];
  const reasons: string[] = [];
  const expected = expectedPerformanceMonthEnd(today);
  const funds: Record<string, FundFreshness> = {};
  for (const f of o.funds) {
    const fr: string[] = [];
    const checkPerf = f.hasPerformance !== false;
    const perf = checkPerf && isIso(f.performanceAsOf) ? f.performanceAsOf.slice(0, 10) : null;
    const nav = f.hasNav && isIso(f.navAsOf) ? f.navAsOf.slice(0, 10) : null;
    if (!checkPerf) {
      // hidden by the admin: not on the site, not checked
    } else if (!perf) {
      fr.push("no performance published");
      codes.push(`${f.key}:performance`);
    } else if (perf.slice(0, 7) < expected.slice(0, 7)) {
      fr.push(
        `performance as of ${perf}, ${expected.slice(0, 7)} expected (closed more than ${FRESHNESS.performanceBusinessDays} business days ago)`,
      );
      codes.push(`${f.key}:performance`);
    }
    const lag = nav ? businessDaysSince(nav, today) : null;
    if (f.hasNav) {
      if (!nav) {
        fr.push("no NAV published");
        codes.push(`${f.key}:nav`);
      } else if (lag! > FRESHNESS.navBusinessDays) {
        fr.push(`NAV as of ${nav}, ${lag} business days old (limit ${FRESHNESS.navBusinessDays})`);
        codes.push(`${f.key}:nav`);
      }
    }
    funds[f.key] = {
      performanceAsOf: perf,
      navAsOf: nav,
      performanceExpected: checkPerf ? expected : null,
      navLagBusinessDays: f.hasNav ? lag : null,
      verdict: fr.length ? "stale" : "ok",
      reasons: fr,
    };
    for (const r of fr) reasons.push(`${f.key}: ${r}`);
  }
  return { verdict: codes.length ? "stale" : "ok", codes: codes.sort(), reasons, funds, thresholds: FRESHNESS };
}
