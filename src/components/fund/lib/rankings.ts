/** Which third-party rankings the page shows, and the CIFSC category line of the facts table (pure, unit tested). */
import type { FundContent, FundLibraryRanking, MorningstarRating } from "../../../lib/data/types.ts";
import { tr } from "../copy.ts";
import type { Lang } from "./format.ts";

/** A ranking older than this is not shown (third-party figures are copied by hand and go stale). */
export const RANKING_MAX_AGE_DAYS = 183;
const fresh = (asOf: string, now: Date): boolean => {
  const t = Date.parse(`${asOf.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(t) && (now.getTime() - t) / 86_400_000 <= RANKING_MAX_AGE_DAYS;
};

/**
 * Rankings to show: none when the admin hid the block, or when there is nothing but empty entries. A Fund Library entry
 * whose FundServ is not a class of the fund (`classes`, when given) is dropped; a block older than ~6 months is hidden.
 */
export function rankingsToShow(
  content: Pick<FundContent, "rankings" | "hide"> | null | undefined,
  classes?: { fundserv: string }[],
  now: Date = new Date(),
): { fundLibrary: FundLibraryRanking[]; morningstar: MorningstarRating | null } | null {
  if (!content || content.hide?.rankings) return null;
  const r = content.rankings ?? {};
  const own = classes ? new Set(classes.map((c) => c.fundserv.toUpperCase())) : null;
  const fundLibrary = (r.fundLibrary ?? []).filter((e) => (e.rows.length > 0 || !!e.fundGrade) && fresh(e.asOf, now) && (!own || (!!e.fundserv && own.has(e.fundserv.toUpperCase()))));
  const m = r.morningstar;
  const morningstar = m && Number.isInteger(m.stars) && m.stars >= 1 && m.stars <= 5 && m.asOf && m.classLabel?.trim() && fresh(m.asOf, now) ? m : null;
  return fundLibrary.length || morningstar ? { fundLibrary, morningstar } : null;
}

/** The CIFSC category for the facts table: the admin's, else the Fund Library category when every entry agrees. */
export function cifscCategory(content: Pick<FundContent, "cifscCategory" | "rankings" | "hide"> | null | undefined, lang: Lang, classes?: { fundserv: string }[], now?: Date): string | null {
  const own = content?.cifscCategory;
  if (own && (own.en || own.fr)) return tr(own, lang);
  const lib = rankingsToShow(content, classes, now)?.fundLibrary ?? [];
  const names = [...new Set(lib.map((e) => tr(e.category, lang)).filter(Boolean))];
  return names.length === 1 ? names[0] : null;
}
