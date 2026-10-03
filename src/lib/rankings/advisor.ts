/**
 * Items of the advisor rankings list (/solutions): every confirmed, fresh ranking or rating of every visible fund, across
 * providers, each with its source name, link and as-of date (pure, unit tested). Built on the server: drafts, admin
 * notes and stale figures never reach the client.
 */
import type { FundContent, FundKey, L10n, RankingPeriod, ThirdPartyProvider } from "../data/types.ts";
import type { BrandAssets } from "../data/brand-assets.ts";
import { PROVIDER_META, publicRankings } from "./policy.ts";

export interface AdvisorFigure {
  period: RankingPeriod;
  percentile?: number | null;
  rank?: number | null;
  of?: number | null;
  quartile?: 1 | 2 | 3 | 4 | null;
}

export interface AdvisorRankingItem {
  fund: FundKey;
  fundName: L10n;
  kind: "morningstar" | "fundlibrary" | ThirdPartyProvider;
  /** provider name (text wordmark) and full source name */
  provider: string;
  source: L10n;
  /** official logo URL, only when the file is present */
  logo?: string;
  classLabel: string;
  category?: L10n;
  asOf: string;
  edition?: string;
  url: string;
  stars?: number;
  figures: AdvisorFigure[];
}

export interface AdvisorFundInput {
  key: FundKey;
  name: L10n;
  classes?: { fundserv: string }[];
  content: Pick<FundContent, "rankings" | "hide">;
}

export function advisorRankingItems(funds: AdvisorFundInput[], opts: { now: Date; months: number; brand?: BrandAssets }): AdvisorRankingItem[] {
  const out: AdvisorRankingItem[] = [];
  for (const f of funds) {
    if (f.content.hide?.rankings) continue;
    const r = publicRankings(f.content.rankings, { now: opts.now, months: opts.months, classes: f.classes });
    const base = { fund: f.key, fundName: f.name };
    if (r.morningstar?.url) {
      const m = r.morningstar;
      out.push({ ...base, kind: "morningstar", provider: "Morningstar", source: { en: "Morningstar", fr: "Morningstar" }, logo: opts.brand?.["morningstar-logo"], classLabel: m.classLabel, category: m.category, asOf: m.asOf, url: m.url!, stars: m.stars, figures: [] });
    }
    for (const e of r.thirdParty) {
      const meta = PROVIDER_META[e.provider];
      out.push({
        ...base, kind: e.provider, provider: meta.name, source: meta.source, logo: opts.brand?.[meta.logoSlot as keyof BrandAssets], classLabel: e.classLabel,
        category: e.category, asOf: e.asOf, edition: e.edition || undefined, url: e.url!, figures: e.rows.map((x) => ({ period: x.period, percentile: x.percentile, rank: x.rank ?? null, of: x.of ?? null })),
      });
    }
    for (const e of r.fundLibrary) {
      if (!e.url || !e.rows.length) continue;
      out.push({
        ...base, kind: "fundlibrary", provider: "Fund Library", source: { en: "Fund Library", fr: "Fund Library" }, logo: opts.brand?.["fundlibrary-logo"], classLabel: e.classLabel,
        category: e.category, asOf: e.asOf, url: e.url, figures: e.rows.map((x) => ({ period: x.period, rank: x.rank, of: x.of, quartile: x.quartile })),
      });
    }
  }
  return out;
}
