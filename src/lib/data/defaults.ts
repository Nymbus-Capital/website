/**
 * Default admin content and its merge with the stored document: the SINGLE source used by the read model
 * (site.ts getContent) and the writer (content.ts updateContent). Dependency-free (unit tested under plain Node).
 */
import type { FundContent, FundKey, FundLibraryRanking, RankingPeriod, SiteContent } from "./types.ts";

/** rows from "rank/of" pairs; quartile given per row (the source states it for every period) */
const rows = (...r: [RankingPeriod, number, number, 1 | 2 | 3 | 4][]): FundLibraryRanking["rows"] => r.map(([period, rank, of, quartile]) => ({ period, rank, of, quartile }));
const FL = "https://www.fundlibrary.com/MutualFunds/Detail/";

/**
 * Third-party category rankings read manually from the Fund Library fund pages (as at 2026-08-31). Seeds only: the admin
 * edits them (FundEditor) and the stored content wins. Never recomputed; the page always shows the "as at" date and the source.
 * The French category names are our translation of the source's English names (compliance to verify).
 */
export const SEEDED_RANKINGS: Partial<Record<FundKey, NonNullable<FundContent["rankings"]>>> = {
  "monthly-income": {
    fundLibrary: [{
      classLabel: "Class FP", fundserv: "LDM001", asOf: "2026-08-31", fundGrade: "B", url: `${FL}4992`,
      category: { en: "Canadian Core Plus Fixed Income", fr: "Revenu fixe canadien de base plus" },
      rows: rows(["1M", 1, 108, 1], ["3M", 4, 106, 1], ["6M", 4, 106, 1], ["YTD", 3, 105, 1], ["1Y", 2, 102, 1], ["2Y", 3, 98, 1], ["3Y", 1, 97, 1], ["4Y", 1, 95, 1]),
    }],
  },
  "sustainable-enhanced-bonds": {
    fundLibrary: [{
      classLabel: "Class F", fundserv: "LDM201", asOf: "2026-08-31", fundGrade: "A", url: `${FL}790334`,
      category: { en: "Canadian Fixed Income", fr: "Revenu fixe canadien" },
      rows: rows(["1M", 4, 486, 1], ["3M", 22, 478, 1], ["6M", 17, 474, 1], ["YTD", 1, 470, 1], ["1Y", 1, 465, 1], ["2Y", 3, 442, 1], ["3Y", 1, 408, 1]),
    }],
  },
  "multi-strategy": {
    fundLibrary: [{
      classLabel: "Class F", fundserv: "LDM301", asOf: "2026-08-31", fundGrade: "C", url: `${FL}790333`,
      category: { en: "Alternative Multi-Strategy", fr: "Multistratégies alternatives" },
      rows: rows(["1M", 127, 144, 4], ["3M", 80, 140, 3], ["6M", 58, 129, 2], ["YTD", 39, 128, 2], ["1Y", 36, 110, 2], ["2Y", 37, 96, 2], ["3Y", 14, 81, 1]),
    }],
  },
};

export const DEFAULT_CONTENT: SiteContent = {
  version: 0,
  updatedAt: "1970-01-01T00:00:00.000Z",
  updatedBy: "system",
  firm: {
    aumLabel: { en: "$1.8B+", fr: "1,8 G$+" },
    announcement: null,
  },
  funds: {},
  pipeline: { publishMode: "review" },
};

/** Stored fund content; the seeded rankings apply to a fund that has none stored (hide.rankings removes them). */
function mergeFunds(stored: SiteContent["funds"] | undefined): SiteContent["funds"] {
  const out: SiteContent["funds"] = { ...(stored ?? {}) };
  for (const [key, rankings] of Object.entries(SEEDED_RANKINGS) as [FundKey, NonNullable<FundContent["rankings"]>][]) {
    const cur = out[key];
    if (!cur?.rankings) out[key] = { ...(cur ?? {}), rankings: structuredClone(rankings) };
  }
  return out;
}

/** Stored content (or nothing yet) merged over the defaults. Always a fresh object. */
export function mergeContent(c: SiteContent | null | undefined): SiteContent {
  if (!c) return { ...structuredClone(DEFAULT_CONTENT), funds: mergeFunds(undefined) };
  return {
    ...structuredClone(DEFAULT_CONTENT),
    ...c,
    firm: { ...DEFAULT_CONTENT.firm, ...c.firm },
    funds: mergeFunds(c.funds),
    pipeline: { ...DEFAULT_CONTENT.pipeline, ...c.pipeline },
  };
}
