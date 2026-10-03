/**
 * Third-party rankings and ratings: which entries may be shown publicly (pure, dependency-free, unit tested).
 *
 * Rule: a figure is shown only with its source name, a source link (third-party percentile rankings), its as-of date
 * and the class it is for; a draft, an incomplete entry or one older than the staleness limit is not shown. Nothing
 * here touches the network: a failed freshness check never hides data by itself (see rbc-survey.ts).
 */
import {
  THIRD_PARTY_PROVIDERS,
  type FundLibraryRanking, type FundRankings, type L10n, type MorningstarRating, type SiteContent, type ThirdPartyProvider, type ThirdPartyRanking,
} from "../data/types.ts";

export const DEFAULT_MAX_AGE_MONTHS = 6;
export const MIN_MAX_AGE_MONTHS = 1;
export const MAX_MAX_AGE_MONTHS = 24;

/** Staleness limit in months from the site settings (clamped; default 6). */
export function policyMonths(content?: Pick<SiteContent, "rankingPolicy"> | null): number {
  const m = content?.rankingPolicy?.maxAgeMonths;
  if (typeof m !== "number" || !Number.isInteger(m)) return DEFAULT_MAX_AGE_MONTHS;
  return Math.min(MAX_MAX_AGE_MONTHS, Math.max(MIN_MAX_AGE_MONTHS, m));
}

export function isIsoDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export const isHttpsUrl = (u: unknown): u is string => typeof u === "string" && /^https:\/\/[^\s<>"']+$/.test(u) && u.length <= 300;

/** Last day (UTC, YYYY-MM-DD) on which a figure as of `asOf` may still be shown: same day `months` later (clamped to month end). */
export function lastShowDay(asOf: string, months: number): string | null {
  if (!isIsoDate(asOf)) return null;
  const [y, m, d] = asOf.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const monthEnd = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, monthEnd))).toISOString().slice(0, 10);
}

/**
 * Fresh: as of no later than tomorrow (a future date is a typo, never shown) and no older than `months` months.
 * Compared on UTC calendar days.
 */
export function isFresh(asOf: string, now: Date, months: number = DEFAULT_MAX_AGE_MONTHS): boolean {
  const last = lastShowDay(asOf, months);
  if (!last) return false;
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString().slice(0, 10);
  return asOf <= tomorrow && today <= last;
}

/* ------------------------------------------------------------------ providers */

export interface ProviderMeta {
  /** short wordmark (text) */
  name: string;
  /** full source name, EN / FR */
  source: L10n;
  /** brand asset slot of its official logo (src/lib/data/brand-assets.ts) */
  logoSlot: string;
}

export const PROVIDER_META: Record<ThirdPartyProvider, ProviderMeta> = {
  "rbc-pfs": {
    name: "RBC Investor Services",
    source: { en: "RBC Investor Services Pooled Fund Survey", fr: "Sondage sur les fonds en gestion commune de RBC Services aux investisseurs" },
    logoSlot: "rbc-logo",
  },
  evestment: { name: "eVestment", source: { en: "eVestment", fr: "eVestment" }, logoSlot: "evestment-logo" },
  lipper: { name: "LSEG Lipper", source: { en: "LSEG Lipper", fr: "LSEG Lipper" }, logoSlot: "lseg-lipper-logo" },
  gmr: { name: "GMR", source: { en: "GMR", fr: "GMR" }, logoSlot: "gmr-logo" },
};

export const isProvider = (p: unknown): p is ThirdPartyProvider => typeof p === "string" && (THIRD_PARTY_PROVIDERS as readonly string[]).includes(p);

/* ------------------------------------------------------------------ validity */

const okPercentile = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 100;
const okRank = (rank: unknown, of: unknown): boolean =>
  typeof rank === "number" && typeof of === "number" && Number.isInteger(rank) && Number.isInteger(of) && rank >= 1 && of >= rank && of <= 100_000;

/** A period row has something to show: a valid percentile, or a valid rank out of N. */
export const rowHasFigure = (r: ThirdPartyRanking["rows"][number]): boolean => okPercentile(r.percentile) || okRank(r.rank, r.of);

/** Complete enough to publish (ignoring age and class): confirmed, source link, as-of date, class, category, figures. */
export function isCompleteThirdParty(e: ThirdPartyRanking | null | undefined): boolean {
  if (!e || e.confirmed !== true || !isProvider(e.provider)) return false;
  // a series, or explicitly the fund as a whole (a survey that ranks the fund, not a series)
  if (!(e.scope === "fund" || e.classLabel?.trim()) || !e.category?.en?.trim() || !e.category?.fr?.trim()) return false;
  if (!isIsoDate(e.asOf) || !isHttpsUrl(e.url)) return false;
  if (e.basis && !(e.basis.en?.trim() && e.basis.fr?.trim())) return false;
  if ((e.rolling ?? []).some((a) => !isIsoDate(a.end) || a.end > e.asOf || !okPercentile(a.percentile) || !Number.isInteger(a.years) || a.years < 1 || a.years > 20)) return false;
  if (e.trackSince !== undefined && !/^\d{4}-(0[1-9]|1[0-2])$/.test(e.trackSince)) return false;
  return Array.isArray(e.rows) && e.rows.length > 0 && e.rows.every(rowHasFigure);
}

export type EntryStatus = "shown" | "draft" | "incomplete" | "stale" | "other-class";

export function thirdPartyStatus(e: ThirdPartyRanking, now: Date, months: number, classes?: { fundserv: string }[]): EntryStatus {
  if (e.confirmed !== true) return "draft";
  if (!isCompleteThirdParty(e)) return "incomplete";
  if (!isFresh(e.asOf, now, months)) return "stale";
  if (e.fundserv && classes && !classes.some((c) => c.fundserv.toUpperCase() === e.fundserv!.toUpperCase())) return "other-class";
  return "shown";
}

/** A rating is shown only with its stars, class, as-of date and source link. */
export function validMorningstar(m: MorningstarRating | null | undefined): m is MorningstarRating {
  return !!m && Number.isInteger(m.stars) && m.stars >= 1 && m.stars <= 5 && isIsoDate(m.asOf) && !!m.classLabel?.trim() && isHttpsUrl(m.url);
}

/** A Fund Library entry is shown only with figures, an as-of date and its source link. */
const validFundLibrary = (e: FundLibraryRanking): boolean => (e.rows.length > 0 || !!e.fundGrade) && isIsoDate(e.asOf) && isHttpsUrl(e.url);

export function morningstarStatus(m: MorningstarRating, now: Date, months: number): EntryStatus {
  if (!validMorningstar(m)) return "incomplete";
  return isFresh(m.asOf, now, months) ? "shown" : "stale";
}

export function fundLibraryStatus(e: FundLibraryRanking, now: Date, months: number, classes?: { fundserv: string }[]): EntryStatus {
  if (!validFundLibrary(e)) return "incomplete";
  if (!isFresh(e.asOf, now, months)) return "stale";
  if (classes && !(e.fundserv && classes.some((c) => c.fundserv.toUpperCase() === e.fundserv!.toUpperCase()))) return "other-class";
  return "shown";
}

/**
 * What a public page may receive: only shown entries, drafts and admin notes stripped. `now: null` skips the age test
 * (the server already applied it with the configured limit).
 */
export function publicRankings(
  r: FundRankings | null | undefined,
  opts: { now: Date | null; months?: number; classes?: { fundserv: string }[] },
): { fundLibrary: FundLibraryRanking[]; morningstar: MorningstarRating | null; thirdParty: ThirdPartyRanking[] } {
  const months = opts.months ?? DEFAULT_MAX_AGE_MONTHS;
  // with no clock (client side, after the server filtered with the configured limit) only the date format is checked
  const fresh = (asOf: string) => (opts.now ? isFresh(asOf, opts.now, months) : isIsoDate(asOf));
  const own = opts.classes;
  const fundLibrary = (r?.fundLibrary ?? []).filter((e) => {
    if (!validFundLibrary(e) || !fresh(e.asOf)) return false;
    return !own || (!!e.fundserv && own.some((c) => c.fundserv.toUpperCase() === e.fundserv!.toUpperCase()));
  });
  const m = r?.morningstar;
  const morningstar = validMorningstar(m) && fresh(m.asOf) ? m : null;
  const thirdParty = (r?.thirdParty ?? [])
    .filter((e) => isCompleteThirdParty(e) && fresh(e.asOf) && (!e.fundserv || !own || own.some((c) => c.fundserv.toUpperCase() === e.fundserv!.toUpperCase())))
    .map((e) => {
      // admin note and source reference stay on the server; returns are not displayed, so not sent either
      const { note: _note, sourceRef: _ref, rolling, ...rest } = e;
      void _note; void _ref;
      return {
        ...rest,
        rows: e.rows.filter(rowHasFigure).map((r) => ({ period: r.period, percentile: r.percentile, ...(r.rank != null ? { rank: r.rank } : {}), ...(r.of != null ? { of: r.of } : {}) })),
        ...(rolling?.length ? { rolling: rolling.map((a) => ({ end: a.end, years: a.years, percentile: a.percentile })) } : {}),
      };
    });
  return { fundLibrary, morningstar, thirdParty };
}

/** The fund rankings object a public page receives (empty → undefined). */
export function publicFundRankings(r: FundRankings | null | undefined, opts: { now: Date; months: number; classes?: { fundserv: string }[] }): FundRankings | undefined {
  const p = publicRankings(r, opts);
  const out: FundRankings = {};
  if (p.fundLibrary.length) out.fundLibrary = p.fundLibrary;
  if (p.morningstar) out.morningstar = p.morningstar;
  if (p.thirdParty.length) out.thirdParty = p.thirdParty;
  return Object.keys(out).length ? out : undefined;
}

/* ------------------------------------------------------------------ wording helpers */

/** "1st", "22nd" / « 1er », « 22e ». */
export function ordinal(n: number, lang: "en" | "fr"): string {
  if (lang === "fr") return n === 1 ? "1er" : `${n}e`;
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}
