/**
 * Pure helpers for the home, strategies and solutions pages: formatting of published figures, fund
 * categories for the filter, the mini calendar-year bars. Dependency-free (unit tested under plain Node,
 * tests/unit/site/figures.test.ts).
 */
import { dateLabel, fmt, money, monthLabel, NAV_DECIMALS } from "../../fund/lib/format.ts";
import type { FundKey } from "../../../lib/data/types.ts";
import { partialKind, type PartialKind } from "../../fund/lib/performance.ts";
import type { Locale } from "../../../lib/i18n/config.ts";

export type Category = "fixed-income" | "alternatives";
export type Filter = "all" | Category;

/** Which filter pill a fund belongs to (Strategies page): the two bond funds vs the alternatives. */
export const CATEGORY: Record<FundKey, Category> = {
  "monthly-income": "fixed-income",
  "sustainable-enhanced-bonds": "fixed-income",
  "multi-strategy": "alternatives",
  "global-minimum-volatility": "alternatives",
};

export function filterFunds<T extends { key: FundKey }>(funds: T[], filter: Filter): T[] {
  return filter === "all" ? funds : funds.filter((f) => CATEGORY[f.key] === filter);
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Return as shown next to the fund: "+5.2%" / "−1.3 %" (FR); null when not published. */
export function pctText(v: number | null | undefined, lang: Locale, sign = true): string | null {
  return isNum(v) ? fmt(v, { pct: true, decimals: 1, sign, lang }) : null;
}

/** Table cell: the figure, or an em dash when it is not published. */
export const cell = (v: number | null | undefined, lang: Locale): string => pctText(v, lang) ?? "—";

/** NAV per unit in its class currency: "$10.1905" / "10,1905 $"; "US$…" for a USD class. */
export const navText = (nav: number, currency: string, lang: Locale): string => money(nav, currency, lang, NAV_DECIMALS);

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** "2026-08-31" → "August 2026" (EN, sentence case) / "août 2026" (FR). */
export const monthText = (iso: string | null | undefined, lang: Locale): string =>
  lang === "en" ? cap(monthLabel(iso, lang)) : monthLabel(iso, lang);

/** "2026-09-28" → "Sep 28, 2026" / "28 sept. 2026". */
export const dayText = (iso: string | null | undefined, lang: Locale): string =>
  lang === "en" ? cap(dateLabel(iso, lang)) : dateLabel(iso, lang);

/** `kind`: why a year is partial: "ytd" only for the as-of year, "launch" for a partial inception year. */
export interface YearBar { year: number; r: number; partial: boolean; kind: PartialKind }

/**
 * The last `n` calendar years with a published fund return, oldest first (the old site showed the oldest by mistake).
 * `asOf` (month-end of the published performance) tells a year-to-date year from a partial launch year.
 */
export function lastYears(rows: { year: number; fund: number | null; partial?: boolean }[] | null | undefined, n = 6, asOf?: string | null): YearBar[] {
  return (rows ?? [])
    .filter((r) => isNum(r.fund) && Number.isInteger(r.year))
    .sort((a, b) => a.year - b.year)
    .slice(-n)
    .map((r) => ({ year: r.year, r: r.fund as number, partial: !!r.partial, kind: partialKind(r.year, r.partial, asOf) }));
}

/**
 * Geometry of the mini bar chart: the zero line position (0 = top, 1 = bottom of the plot) and each bar's
 * top offset and height as fractions of the plot height. Positive bars grow up from the zero line, negative down.
 */
export function miniBars<B extends Pick<YearBar, "year" | "r">>(bars: B[]): { zero: number; bars: (B & { top: number; height: number })[] } {
  if (!bars.length) return { zero: 1, bars: [] };
  const hi = Math.max(0, ...bars.map((b) => b.r));
  const lo = Math.min(0, ...bars.map((b) => b.r));
  const span = hi - lo || 1;
  const zero = hi / span;
  return {
    zero,
    bars: bars.map((b) => {
      const h = Math.abs(b.r) / span;
      return { ...b, top: b.r >= 0 ? zero - h : zero, height: h };
    }),
  };
}

/** Latest of several ISO dates (null when none). */
export function latest(dates: (string | null | undefined)[]): string | null {
  const ok = dates.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)).sort();
  return ok.length ? ok[ok.length - 1] : null;
}

/** A free-text figure such as "$1.9B" or "1,9 G$" split so it can count up. */
interface CountLabel { prefix: string; value: number; decimals: number; suffix: string }

/** Prefix + number + suffix, or null when the text is anything else (it is then shown as written). */
export function parseCountLabel(text: string | null | undefined, lang: Locale): CountLabel | null {
  const m = /^(\D*?)(\d{1,4})(?:([.,])(\d{1,2}))?(\D*)$/.exec((text ?? "").trim());
  if (!m) return null;
  const [, prefix, int, sep, frac = "", suffix] = m;
  // the separator must be the language's own, so the counting figure ends on exactly the written text
  if (sep && sep !== (lang === "fr" ? "," : ".")) return null;
  const value = Number(frac ? `${int}.${frac}` : int);
  return Number.isFinite(value) && value > 0 ? { prefix, value, decimals: frac.length, suffix } : null;
}
