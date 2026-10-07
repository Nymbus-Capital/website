/**
 * Default admin content and its merge with the stored document: the SINGLE source used by the read model
 * (site.ts getContent) and the writer (content.ts updateContent). Dependency-free (unit tested under plain Node).
 */
import type {
  FundContent,
  FundKey,
  FundLibraryRanking,
  RankingPeriod,
  SiteContent,
  ThirdPartyRanking,
} from "./types.ts";

/** rows from "rank/of" pairs; quartile given per row (the source states it for every period) */
const rows = (...r: [RankingPeriod, number, number, 1 | 2 | 3 | 4][]): FundLibraryRanking["rows"] =>
  r.map(([period, rank, of, quartile]) => ({ period, rank, of, quartile }));
const FL = "https://www.fundlibrary.com/MutualFunds/Detail/";
/** Morningstar overall rating of the two bond funds: 5 stars, as stated by Nymbus on 2026-10-01, class F (the page itself was not machine-readable); the admin updates it. */
const MS = (id: string) => ({
  stars: 5 as const,
  classLabel: "Class F",
  asOf: "2026-10-01",
  url: `https://global.morningstar.com/en-ca/investments/funds/${id}/quote`,
});

/**
 * Third-party category rankings read manually from the Fundata fund pages on FundLibrary.com (as at 2026-08-31). Seeds only: the admin
 * edits them (FundEditor) and the stored content wins. Never recomputed; the page always shows the "as at" date and the source.
 * The French category names are our translation of the source's English names (compliance to verify).
 */
export const SEEDED_RANKINGS: Partial<Record<FundKey, NonNullable<FundContent["rankings"]>>> = {
  "monthly-income": {
    fundLibrary: [
      {
        classLabel: "Class FP",
        fundserv: "LDM001",
        asOf: "2026-08-31",
        fundGrade: "B",
        url: `${FL}4992`,
        category: { en: "Canadian Core Plus Fixed Income", fr: "Revenu fixe canadien de base plus" },
        rows: rows(
          ["1M", 1, 108, 1],
          ["3M", 4, 106, 1],
          ["6M", 4, 106, 1],
          ["YTD", 3, 105, 1],
          ["1Y", 2, 102, 1],
          ["2Y", 3, 98, 1],
          ["3Y", 1, 97, 1],
          ["4Y", 1, 95, 1],
        ),
      },
    ],
    morningstar: MS("0P0001NL0N"),
  },
  "sustainable-enhanced-bonds": {
    fundLibrary: [
      {
        classLabel: "Class F",
        fundserv: "LDM201",
        asOf: "2026-08-31",
        fundGrade: "A",
        url: `${FL}790334`,
        category: { en: "Canadian Fixed Income", fr: "Revenu fixe canadien" },
        rows: rows(
          ["1M", 4, 486, 1],
          ["3M", 22, 478, 1],
          ["6M", 17, 474, 1],
          ["YTD", 1, 470, 1],
          ["1Y", 1, 465, 1],
          ["2Y", 3, 442, 1],
          ["3Y", 1, 408, 1],
        ),
      },
    ],
    morningstar: MS("0P0001ROZG"),
  },
  "multi-strategy": {
    fundLibrary: [
      {
        classLabel: "Class F",
        fundserv: "LDM301",
        asOf: "2026-08-31",
        fundGrade: "C",
        url: `${FL}790333`,
        category: { en: "Alternative Multi-Strategy", fr: "Multistratégies alternatives" },
        rows: rows(
          ["1M", 127, 144, 4],
          ["3M", 80, 140, 3],
          ["6M", 58, 129, 2],
          ["YTD", 39, 128, 2],
          ["1Y", 36, 110, 2],
          ["2Y", 37, 96, 2],
          ["3Y", 14, 81, 1],
        ),
      },
    ],
  },
};

/**
 * RBC Investor Services Pooled Fund Survey, Q2 2026 (periods ending 2026-06-30), read by Nymbus from the public PDF.
 * The survey ranks the fund (strategy track record since Jan-19), not a series, and its returns are gross of management
 * fees in CAD (survey p. 3); PR = percentile ranking, 1 = best. Confirmed seeds: the admin edits them; a newer edition is
 * flagged by the weekly check (src/lib/rankings/rbc-survey.ts).
 */
const RBC_Q2_2026_URL = "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf";
const RBC_BASIS = {
  en: "gross of management fees, in Canadian dollars",
  fr: "avant déduction des frais de gestion, en dollars canadiens",
};
type R = [RankingPeriod, number, number];
/** RBC category names stay in English in both languages: they are the survey's own names (no official French version). */
const rbcCategory = (name: string) => ({ en: name, fr: name });
const rbc = (
  category: { en: string; fr: string },
  page: string,
  rows: R[],
  fourYear: [string, number, number][],
): ThirdPartyRanking => ({
  provider: "rbc-pfs",
  classLabel: "",
  scope: "fund",
  trackSince: "2019-01",
  basis: RBC_BASIS,
  category,
  asOf: "2026-06-30",
  edition: "Q2 2026",
  url: RBC_Q2_2026_URL,
  sourceRef: page,
  confirmed: true,
  rows: rows.map(([period, percentile, ror]) => ({ period, percentile, ror })),
  // table "Four year periods ending June 30": rolling 4-year (annualized) periods, not one-year periods
  rolling: fourYear.map(([end, percentile, ror]) => ({ end, years: 4, percentile, ror })),
  note: "RBC Investor Services Pooled Fund Survey Q2 2026, read by Nymbus (2026-10-03). Strategy track record (inception Jan-19 in the survey, before the fund's launch), gross of management fees. Columns 2026-2023 = rolling 4-year periods ending June 30. 10-year: n/a.",
});
export const SEEDED_THIRD_PARTY: Partial<Record<FundKey, ThirdPartyRanking[]>> = {
  "sustainable-enhanced-bonds": [
    rbc(
      rbcCategory("Canadian Fixed Income"),
      "page 21 of 57",
      [
        ["3M", 1, 3.16],
        ["1Y", 1, 10.04],
        ["2Y", 1, 9.51],
        ["3Y", 1, 11.39],
        ["5Y", 1, 6.83],
      ],
      [
        ["2026-06-30", 1, 10.79],
        ["2025-06-30", 1, 6.04],
        ["2024-06-30", 1, 4.88],
        ["2023-06-30", 1, 5.1],
      ],
    ),
  ],
  "monthly-income": [
    rbc(
      rbcCategory("Canadian Short Term Fixed Income"),
      "page 26 of 57",
      [
        ["3M", 4, 2.02],
        ["1Y", 1, 12.42],
        ["2Y", 1, 10.9],
        ["3Y", 1, 13.38],
        ["5Y", 1, 7.23],
      ],
      [
        ["2026-06-30", 1, 11.52],
        ["2025-06-30", 1, 5.96],
        ["2024-06-30", 1, 10.31],
        ["2023-06-30", 1, 9.76],
      ],
    ),
  ],
};

type LegacyEntry = ThirdPartyRanking & { annual?: { end: string; percentile: number | null; ror?: number | null }[] };
/**
 * Entries stored with the previous release's `annual` list: that RBC table is "Four year periods ending June 30", so
 * they become rolling 4-year periods; the stored copy of the seeded RBC entry also gets its strategy scope and the
 * survey's English category names.
 */
function migrateEntry(e: LegacyEntry): ThirdPartyRanking {
  const { annual, ...rest } = e;
  const out: ThirdPartyRanking =
    annual && !rest.rolling ? { ...rest, rolling: annual.map((a) => ({ ...a, years: 4 })) } : rest;
  if (out.provider === "rbc-pfs" && out.url === RBC_Q2_2026_URL && out.scope === "fund") {
    if (!out.trackSince) out.trackSince = "2019-01";
    if (out.category.fr === "Revenu fixe canadien" || out.category.fr === "Revenu fixe canadien à court terme")
      out.category = rbcCategory(out.category.en);
  }
  return out;
}

/** The untouched draft the previous release seeded (no URL, no date, not confirmed): replaced by the confirmed seed. */
const pristineDraft = (e: ThirdPartyRanking): boolean => e.provider === "rbc-pfs" && !e.confirmed && !e.url && !e.asOf;

export const DEFAULT_CONTENT: SiteContent = {
  version: 0,
  updatedAt: "1970-01-01T00:00:00.000Z",
  updatedBy: "system",
  firm: {
    aumLabel: { en: "$1.9B", fr: "1,9 G$" },
    announcement: null,
  },
  funds: {},
  // owner's decision 2026-10-07: auto publishing, gated by the automatic validation (validate/*, completeness.ts)
  pipeline: { publishMode: "auto" },
};

/** Previous default of the firm AUM label: a stored copy of it was never edited by hand, so it follows the new default. */
const LEGACY_AUM = [{ en: "$1.8B+", fr: "1,8 G$+" }];

/**
 * Stored fund content; the seeded rankings apply to a fund that has none stored (hide.rankings removes them). The
 * third-party drafts apply to a fund whose stored rankings have no `thirdParty` list (an admin who removed them saves
 * an empty list, which stays empty).
 */
function mergeFunds(stored: SiteContent["funds"] | undefined): SiteContent["funds"] {
  const out: SiteContent["funds"] = { ...(stored ?? {}) };
  for (const [key, rankings] of Object.entries(SEEDED_RANKINGS) as [FundKey, NonNullable<FundContent["rankings"]>][]) {
    const cur = out[key];
    if (!cur?.rankings) out[key] = { ...(cur ?? {}), rankings: structuredClone(rankings) };
  }
  for (const [key, drafts] of Object.entries(SEEDED_THIRD_PARTY) as [FundKey, ThirdPartyRanking[]][]) {
    const cur = out[key] ?? {};
    const list = cur.rankings?.thirdParty?.map((e) => migrateEntry(e as LegacyEntry));
    if (list && cur.rankings) out[key] = { ...cur, rankings: { ...cur.rankings, thirdParty: list } };
    if (!list) out[key] = { ...cur, rankings: { ...(cur.rankings ?? {}), thirdParty: structuredClone(drafts) } };
    else if (list.some(pristineDraft) && !list.some((e) => e.provider === "rbc-pfs" && !pristineDraft(e))) {
      // migration: the stored copy of the old RBC draft becomes the confirmed Q2 2026 entry
      out[key] = {
        ...cur,
        rankings: {
          ...cur.rankings,
          thirdParty: [...structuredClone(drafts), ...list.filter((e) => !pristineDraft(e))],
        },
      };
    }
  }
  return out;
}

/** Stored content (or nothing yet) merged over the defaults. Always a fresh object. */
export function mergeContent(c: SiteContent | null | undefined): SiteContent {
  if (!c) return { ...structuredClone(DEFAULT_CONTENT), funds: mergeFunds(undefined) };
  return {
    ...structuredClone(DEFAULT_CONTENT),
    ...c,
    firm: { ...DEFAULT_CONTENT.firm, ...c.firm, aumLabel: freshAum(c.firm?.aumLabel) },
    funds: mergeFunds(c.funds),
    pipeline: { ...DEFAULT_CONTENT.pipeline, ...c.pipeline },
  };
}

function freshAum(stored: SiteContent["firm"]["aumLabel"]): SiteContent["firm"]["aumLabel"] {
  if (!stored) return DEFAULT_CONTENT.firm.aumLabel;
  return LEGACY_AUM.some((l) => l.en === stored.en && l.fr === stored.fr) ? DEFAULT_CONTENT.firm.aumLabel : stored;
}
