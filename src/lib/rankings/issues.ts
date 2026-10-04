/**
 * Admin issues of the third-party rankings (pure, unit tested): entries hidden because stale, drafts waiting for a
 * confirmation, incomplete confirmed entries, missing official Morningstar assets, and the RBC survey check.
 */
import type { FundKey, SiteContent } from "../data/types.ts";
import type { BrandAssets } from "../data/brand-assets.ts";
import { fundLibraryStatus, lastShowDay, morningstarStatus, PROVIDER_META, thirdPartyStatus } from "./policy.ts";
import { rbcIssues, type RankingIssue, type RbcCheckState } from "./rbc-survey.ts";

export type { RankingIssue };

export const MORNINGSTAR_ASSETS_MISSING = "official Morningstar assets missing";

/** Morningstar asset slots still missing for the ratings entered (logo + the star image of each rating). */
export function missingMorningstarAssets(content: Pick<SiteContent, "funds">, brand: BrandAssets): string[] {
  const need = new Set<string>();
  for (const fc of Object.values(content.funds ?? {})) {
    const m = fc?.rankings?.morningstar;
    if (!m || fc?.hide?.rankings) continue;
    need.add("morningstar-logo");
    need.add(`morningstar-stars-${m.stars}`);
  }
  return [...need].filter((s) => !brand[s as keyof BrandAssets]).sort();
}

export function rankingIssues(
  content: Pick<SiteContent, "funds">,
  opts: { now: Date; months: number; brand: BrandAssets; rbc: RbcCheckState | null; classes?: Partial<Record<FundKey, { fundserv: string }[]>> },
): RankingIssue[] {
  const out: RankingIssue[] = [];
  const missing = missingMorningstarAssets(content, opts.brand);
  if (missing.length) {
    out.push({
      level: "warn", key: "rankings.morningstar.assets",
      message: `${MORNINGSTAR_ASSETS_MISSING}: ${missing.join(", ")}. The rating is shown as text. Add the official files to public/brand/third-party/ (svg or png) or upload them in Settings → third-party brand assets.`,
    });
  }
  for (const [key, fc] of Object.entries(content.funds ?? {}) as [FundKey, NonNullable<SiteContent["funds"][FundKey]>][]) {
    const r = fc?.rankings;
    if (!r || fc.hide?.rankings) continue;
    const classes = opts.classes?.[key];
    const m = r.morningstar;
    if (m) {
      const st = morningstarStatus(m, opts.now, opts.months);
      if (st === "stale") out.push({ level: "warn", key: `rankings.${key}.morningstar.stale`, message: `${key}: Morningstar rating as of ${m.asOf} is older than ${opts.months} months — hidden. Check the Morningstar page and update the rating and its date.` });
      if (st === "incomplete") out.push({ level: "warn", key: `rankings.${key}.morningstar.incomplete`, message: `${key}: Morningstar rating not shown (needs stars, class, as-of date and an https source link).` });
    }
    (r.fundLibrary ?? []).forEach((e, i) => {
      const st = fundLibraryStatus(e, opts.now, opts.months, classes);
      if (st === "stale") out.push({ level: "warn", key: `rankings.${key}.fundlibrary.${i}.stale`, message: `${key}: Fundata ranking ${e.fundserv ?? e.classLabel} as at ${e.asOf} is older than ${opts.months} months — hidden.` });
      if (st === "incomplete") out.push({ level: "warn", key: `rankings.${key}.fundlibrary.${i}.incomplete`, message: `${key}: Fundata ranking ${e.fundserv ?? e.classLabel} not shown (needs figures, an as-of date and an https source link).` });
    });
    (r.thirdParty ?? []).forEach((e, i) => {
      const name = PROVIDER_META[e.provider]?.name ?? e.provider;
      const st = thirdPartyStatus(e, opts.now, opts.months, classes);
      if (st === "draft") out.push({ level: "info", key: `rankings.${key}.tp.${i}.draft`, message: `${key}: ${name} ranking is a draft (hidden until confirmed with its source URL and as-of date).` });
      if (st === "incomplete") out.push({ level: "warn", key: `rankings.${key}.tp.${i}.incomplete`, message: `${key}: ${name} ranking is confirmed but incomplete — hidden (class, category EN/FR, as-of date, https source and a figure for every period are required).` });
      if (st === "stale") out.push({ level: "warn", key: `rankings.${key}.tp.${i}.stale`, message: `${key}: ${name} ranking (period ended ${e.asOf}) is older than ${opts.months} months — hidden since ${lastShowDay(e.asOf, opts.months)}. Enter the latest edition.` });
      if (st === "other-class") out.push({ level: "warn", key: `rankings.${key}.tp.${i}.class`, message: `${key}: ${name} ranking names FundServ ${e.fundserv}, which is not a class of this fund — hidden.` });
    });
  }
  return [...out, ...rbcIssues(opts.rbc, content, opts.now)];
}
