/**
 * Canadian (TSX) valuation-day calendar: port of the dataplatform's `app/core/market_calendar.py`, shared by the daily
 * NAV chain (daily-chain.ts) and the FTSE month-end rule (index-levels.ts). Pure, dependency-free.
 */

const iso = (t: number): string => new Date(t).toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number): number => Date.UTC(y, m - 1, d);
const DAY = 86_400_000;

/** Easter Sunday (anonymous Gregorian computus), UTC ms. */
function easter(year: number): number {
  const a = year % 19;
  const b = Math.floor(year / 100),
    c = year % 100;
  const d = Math.floor(b / 4),
    e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4),
    k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

const weekday = (t: number): number => new Date(t).getUTCDay(); // 0 Sunday … 6 Saturday

/** n-th weekday (0 Sunday … 6 Saturday) of a month */
function nthWeekday(year: number, month: number, wd: number, n: number): number {
  const first = utc(year, month, 1);
  return first + (((wd - weekday(first) + 7) % 7) + 7 * (n - 1)) * DAY;
}

/** a fixed-date holiday on a weekend is observed the next Monday */
function observed(t: number): number {
  const w = weekday(t);
  return w === 6 ? t + 2 * DAY : w === 0 ? t + DAY : t;
}

const holidayCache = new Map<number, Set<string>>();

/**
 * TSX statutory holidays of a year: port of the dataplatform's `app/core/market_calendar.py` (the calendar its monthly
 * net returns and the PR #626 bridge use), so a month counts as complete here exactly when it does there.
 */
export function caMarketHolidays(year: number): Set<string> {
  const hit = holidayCache.get(year);
  if (hit) return hit;
  const may24 = utc(year, 5, 24);
  const victoria = may24 - ((weekday(may24) + 6) % 7) * DAY; // the Monday on or before May 24
  const christmas = observed(utc(year, 12, 25));
  let boxing = observed(utc(year, 12, 26));
  if (boxing === christmas) boxing += DAY;
  const days = [
    observed(utc(year, 1, 1)),
    nthWeekday(year, 2, 1, 3), // Family Day
    easter(year) - 2 * DAY, // Good Friday
    victoria,
    observed(utc(year, 7, 1)), // Canada Day
    nthWeekday(year, 8, 1, 1), // Civic Holiday
    nthWeekday(year, 9, 1, 1), // Labour Day
    nthWeekday(year, 10, 1, 2), // Thanksgiving
    christmas,
    boxing,
  ];
  const set = new Set(days.map(iso));
  holidayCache.set(year, set);
  return set;
}

export const isTradingDay = (d: string): boolean => {
  const t = Date.parse(`${d}T00:00:00Z`);
  const w = weekday(t);
  return w !== 0 && w !== 6 && !caMarketHolidays(Number(d.slice(0, 4))).has(d);
};

/** Canadian valuation days from `from` to `to` (inclusive, YYYY-MM-DD), ascending. */
export function tradingDays(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY) {
    const d = iso(t);
    if (isTradingDay(d)) out.push(d);
  }
  return out;
}

/** last valuation day before `date` (within 10 days, like the dataplatform's `prior`) */
export function priorTradingDay(date: string): string | null {
  const t = Date.parse(`${date}T00:00:00Z`);
  const days = tradingDays(iso(t - 10 * DAY), iso(t - DAY));
  return days.length ? days[days.length - 1] : null;
}

/* ------------------------------------------------------------------ Canadian bond market (FTSE Canada indices) */

const bondCache = new Map<number, Set<string>>();

/**
 * Canadian bond-market holidays of a year (the IIAC's recommended bond-market closures, which the FTSE Canada bond
 * indices follow): the TSX holidays plus the National Day for Truth and Reconciliation (Sep 30, from 2021) and
 * Remembrance Day (Nov 11), both observed on the Monday when they fall on a weekend. Every bond-market business day is a
 * TSX day, not conversely: FTSE month-ends use this calendar, fund NAVs the TSX one.
 */
export function caBondHolidays(year: number): Set<string> {
  const hit = bondCache.get(year);
  if (hit) return hit;
  const set = new Set(caMarketHolidays(year));
  if (year >= 2021) set.add(iso(observed(utc(year, 9, 30))));
  set.add(iso(observed(utc(year, 11, 11))));
  bondCache.set(year, set);
  return set;
}

export const isBondDay = (d: string): boolean => {
  const t = Date.parse(`${d}T00:00:00Z`);
  const w = weekday(t);
  return w !== 0 && w !== 6 && !caBondHolidays(Number(d.slice(0, 4))).has(d);
};

/** Canadian bond-market business days from `from` to `to` (inclusive), ascending. */
export function bondDays(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY) {
    const d = iso(t);
    if (isBondDay(d)) out.push(d);
  }
  return out;
}
