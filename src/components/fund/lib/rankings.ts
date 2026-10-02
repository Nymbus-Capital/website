/** Which third-party rankings the page shows, and the CIFSC category line of the facts table (pure, unit tested). */
import type { FundContent, FundLibraryRanking, MorningstarRating } from "../../../lib/data/types.ts";
import { tr } from "../copy.ts";
import type { Lang } from "./format.ts";

/** Rankings to show: none when the admin hid the block, or when there is nothing but empty entries. */
export function rankingsToShow(content: Pick<FundContent, "rankings" | "hide"> | null | undefined): { fundLibrary: FundLibraryRanking[]; morningstar: MorningstarRating | null } | null {
  if (!content || content.hide?.rankings) return null;
  const r = content.rankings ?? {};
  const fundLibrary = (r.fundLibrary ?? []).filter((e) => e.rows.length > 0 || !!e.fundGrade);
  const m = r.morningstar;
  const morningstar = m && Number.isInteger(m.stars) && m.stars >= 1 && m.stars <= 5 && m.asOf ? m : null;
  return fundLibrary.length || morningstar ? { fundLibrary, morningstar } : null;
}

/** The CIFSC category for the facts table: the admin's, else the Fund Library category when every entry agrees. */
export function cifscCategory(content: Pick<FundContent, "cifscCategory" | "rankings" | "hide"> | null | undefined, lang: Lang): string | null {
  const own = content?.cifscCategory;
  if (own && (own.en || own.fr)) return tr(own, lang);
  const lib = rankingsToShow(content)?.fundLibrary ?? [];
  const names = [...new Set(lib.map((e) => tr(e.category, lang)).filter(Boolean))];
  return names.length === 1 ? names[0] : null;
}
