/**
 * Data freshness verdict of the public site (pure, dependency-free, unit tested): used by GET /api/status and by the
 * stale-data alert (monitor.ts). Business days are Canadian valuation days (TSX calendar, market-calendar.ts) in
 * America/Toronto.
 *
 * Stale when
 *  - no successful publication for more than 36 hours counted on business days only (a weekend or a holiday does not
 *    count), or never published;
 *  - a fund's performance does not include the last closed month once that month has been closed for more than 10
 *    business days (the oldest month-end older than that is the month expected);
 *  - a fund's NAV is more than 4 business days old (fund vehicles only: managed-account strategies have no NAV);
 *  - a fund the site shows has no performance at all.
 */
import { TIMEZONE } from "./config.ts";
import { isTradingDay, tradingDays } from "./market-calendar.ts";
import { zonedToUtc } from "./schedule.ts";

export const FRESHNESS = {
  /** business-day hours without a successful publication */
  publishBusinessHours: 36,
  /** business days after a month-end before that month must be published */
  performanceBusinessDays: 10,
  /** business days a NAV may lag */
  navBusinessDays: 4,
} as const;

export interface FundFreshnessInput {
  key: string;
  /** a fund vehicle has a NAV; a strategy (managed accounts) does not */
  hasNav: boolean;
  performanceAsOf: string | null;
  navAsOf: string | null;
}

export interface FundFreshness {
  performanceAsOf: string | null;
  navAsOf: string | null;
  /** month-end the performance should include by now */
  performanceExpected: string;
  /** business days since the NAV date, up to today */
  navLagBusinessDays: number | null;
  verdict: "ok" | "stale";
  reasons: string[];
}

export interface Freshness {
  verdict: "ok" | "stale";
  /** stable codes of what is stale (e.g. "publish", "monthly-income:nav"): the alert's fingerprint */
  codes: string[];
  reasons: string[];
  lastPublishAt: string | null;
  publishBusinessHours: number | null;
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

const addDays = (d: string, n: number): string => new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const dayStart = (d: string, tz: string): number => zonedToUtc(Number(d.slice(0, 4)), Number(d.slice(5, 7)), Number(d.slice(8, 10)), 0, 0, tz).getTime();

/** Milliseconds between two instants that fall on business days (local days of `tz`), capped at 60 calendar days. */
export function businessMsBetween(from: number, to: number, tz: string = TIMEZONE): number {
  if (!(to > from)) return 0;
  let sum = 0;
  let d = localDate(from, tz);
  for (let i = 0; i < 62; i++) {
    const start = dayStart(d, tz);
    if (start >= to) break;
    const next = addDays(d, 1);
    const end = dayStart(next, tz);
    if (isTradingDay(d)) sum += Math.max(0, Math.min(end, to) - Math.max(start, from));
    d = next;
  }
  return sum;
}

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
export const businessDaysSince = (asOf: string, today: string): number => (asOf >= today ? 0 : tradingDays(addDays(asOf, 1), today).length);

const isIso = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s);

export function freshness(o: { now: Date; lastPublishAt: string | null; funds: FundFreshnessInput[]; tz?: string }): Freshness {
  const tz = o.tz ?? TIMEZONE;
  const today = localDate(o.now.getTime(), tz);
  const codes: string[] = [];
  const reasons: string[] = [];
  const pub = o.lastPublishAt ? Date.parse(o.lastPublishAt) : NaN;
  const hours = Number.isFinite(pub) ? businessMsBetween(pub, o.now.getTime(), tz) / 3_600_000 : null;
  if (hours === null) {
    codes.push("publish");
    reasons.push("never published");
  } else if (hours > FRESHNESS.publishBusinessHours) {
    codes.push("publish");
    reasons.push(`no publication for ${Math.round(hours)} business-day hours (last ${o.lastPublishAt!.slice(0, 16).replace("T", " ")} UTC; limit ${FRESHNESS.publishBusinessHours})`);
  }
  const expected = expectedPerformanceMonthEnd(today);
  const funds: Record<string, FundFreshness> = {};
  for (const f of o.funds) {
    const fr: string[] = [];
    const perf = isIso(f.performanceAsOf) ? f.performanceAsOf.slice(0, 10) : null;
    const nav = isIso(f.navAsOf) ? f.navAsOf.slice(0, 10) : null;
    if (!perf) {
      fr.push("no performance published");
      codes.push(`${f.key}:performance`);
    } else if (perf.slice(0, 7) < expected.slice(0, 7)) {
      fr.push(`performance as of ${perf}, ${expected.slice(0, 7)} expected (closed more than ${FRESHNESS.performanceBusinessDays} business days ago)`);
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
    funds[f.key] = { performanceAsOf: perf, navAsOf: nav, performanceExpected: expected, navLagBusinessDays: f.hasNav ? lag : null, verdict: fr.length ? "stale" : "ok", reasons: fr };
    for (const r of fr) reasons.push(`${f.key}: ${r}`);
  }
  return {
    verdict: codes.length ? "stale" : "ok", codes: codes.sort(), reasons,
    lastPublishAt: o.lastPublishAt, publishBusinessHours: hours === null ? null : Math.round(hours * 10) / 10, funds, thresholds: FRESHNESS,
  };
}
