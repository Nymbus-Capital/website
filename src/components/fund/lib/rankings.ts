/** Which third-party rankings the page shows, and the CIFSC category line of the facts table (pure, unit tested). */
import type { FundContent, FundLibraryRanking, MorningstarRating, ThirdPartyRanking } from "../../../lib/data/types.ts";
import { awardsEligible, DEFAULT_MAX_AGE_MONTHS, publicRankings } from "../../../lib/rankings/policy.ts";
import { tr, type Locale } from "../../../lib/i18n/config.ts";

/** Default staleness limit (~6 months); the configured one is `SiteContent.rankingPolicy.maxAgeMonths`. */
export const RANKING_MAX_AGE_DAYS = 183;

export interface ShownRankings {
  fundLibrary: FundLibraryRanking[];
  morningstar: MorningstarRating | null;
  thirdParty: ThirdPartyRanking[];
}

/**
 * Rankings to show: none when the admin hid the block, when no shown Fundata entry has a FundGrade of A or B, or when
 * there is nothing but empty / draft entries. A Fundata entry whose FundServ is not a class of the fund (`classes`, when given) is dropped. With `now`, an entry older
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
  // no tab and no overview rating block unless a shown Fundata FundGrade is A or B (Gabriel, 2026-10-04)
  if (!awardsEligible(r.fundLibrary)) return null;
  return { ...r, thirdParty: byProvider(r.thirdParty) };
}

/** Display order of the percentile rankings: RBC Investor Services first, then the others as entered. */
const byProvider = (list: ThirdPartyRanking[]): ThirdPartyRanking[] =>
  [...list.filter((e) => e.provider === "rbc-pfs"), ...list.filter((e) => e.provider !== "rbc-pfs")];

/** The CIFSC category for the facts table: the admin's, else the Fundata category when every entry agrees. */
export function cifscCategory(content: Pick<FundContent, "cifscCategory" | "rankings" | "hide"> | null | undefined, lang: Locale, classes?: { fundserv: string }[], now?: Date): string | null {
  const own = content?.cifscCategory;
  if (own && (own.en || own.fr)) return tr(own, lang);
  if (!content || content.hide?.rankings) return null;
  const lib = publicRankings(content.rankings, { now: now ?? null, months: DEFAULT_MAX_AGE_MONTHS, classes }).fundLibrary;
  const names = [...new Set(lib.map((e) => tr(e.category, lang)).filter(Boolean))];
  return names.length === 1 ? names[0] : null;
}
