/** Which third-party rankings the page shows, and the CIFSC category line of the facts table (pure, unit tested). */
import type { FundContent, FundLibraryRanking, MorningstarRating, ThirdPartyRanking } from "../../../lib/data/types.ts";
import { DEFAULT_MAX_AGE_MONTHS, publicRankings } from "../../../lib/rankings/policy.ts";
import { tr } from "../copy.ts";
import type { Lang } from "./format.ts";

/** Default staleness limit (~6 months); the configured one is `SiteContent.rankingPolicy.maxAgeMonths`. */
export const RANKING_MAX_AGE_DAYS = 183;

export interface ShownRankings {
  fundLibrary: FundLibraryRanking[];
  morningstar: MorningstarRating | null;
  thirdParty: ThirdPartyRanking[];
}

/**
 * Rankings to show: none when the admin hid the block, or when there is nothing but empty / draft entries. A Fund
 * Library entry whose FundServ is not a class of the fund (`classes`, when given) is dropped. With `now`, an entry older
 * than `months` is hidden; without it (client side) the age test is skipped because the server page already removed
 * stale entries with the configured limit (src/lib/rankings/policy.ts publicFundRankings).
 */
export function rankingsToShow(
  content: Pick<FundContent, "rankings" | "hide"> | null | undefined,
  classes?: { fundserv: string }[],
  now: Date | null = null,
  months: number = DEFAULT_MAX_AGE_MONTHS,
): ShownRankings | null {
  if (!content || content.hide?.rankings) return null;
  const r = publicRankings(content.rankings, { now, months, classes });
  return r.fundLibrary.length || r.morningstar || r.thirdParty.length ? r : null;
}

/** The CIFSC category for the facts table: the admin's, else the Fund Library category when every entry agrees. */
export function cifscCategory(content: Pick<FundContent, "cifscCategory" | "rankings" | "hide"> | null | undefined, lang: Lang, classes?: { fundserv: string }[], now?: Date): string | null {
  const own = content?.cifscCategory;
  if (own && (own.en || own.fr)) return tr(own, lang);
  const lib = rankingsToShow(content, classes, now ?? null)?.fundLibrary ?? [];
  const names = [...new Set(lib.map((e) => tr(e.category, lang)).filter(Boolean))];
  return names.length === 1 ? names[0] : null;
}
