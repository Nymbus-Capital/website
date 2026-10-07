/** Server-side data of the rankings admin views (dashboard panel, fund editor warnings, brand assets settings). */
import { FUNDS } from "@/config/funds";
import type { FundKey, SiteContent } from "@/lib/data/types";
import {
  BRAND_SLOTS,
  BRAND_SLOT_LABEL,
  listUploadedBrand,
  resolveBrandAssets,
  staticBrandAssets,
  type BrandAssets,
} from "@/lib/data/brand-assets";
import { policyMonths } from "@/lib/rankings/policy";
import { missingMorningstarAssets, rankingIssues, type RankingIssue } from "@/lib/rankings/issues";
import { effectiveLatest, readRbcState, type RbcCheckState } from "@/lib/rankings/rbc-survey";
import type { BrandRow } from "@/components/admin/BrandAssetsManager";

export async function rankingsAdmin(content: SiteContent): Promise<{
  issues: RankingIssue[];
  months: number;
  rbc: RbcCheckState | null;
  brand: BrandAssets;
  latest: { label: string; asOf: string; url?: string };
}> {
  const [brand, rbc] = await Promise.all([resolveBrandAssets(), readRbcState()]);
  const months = policyMonths(content);
  const classes = Object.fromEntries(FUNDS.map((f) => [f.key, f.classes])) as Partial<
    Record<FundKey, { fundserv: string }[]>
  >;
  let issues: RankingIssue[];
  try {
    issues = rankingIssues(content, { now: new Date(), months, brand, rbc, classes });
  } catch (e) {
    issues = [
      { level: "warn", key: "rankings.error", message: `Could not evaluate the rankings: ${(e as Error).message}` },
    ];
  }
  const l = effectiveLatest(rbc, new Date());
  return { issues, months, rbc, brand, latest: { label: l.label, asOf: l.asOf, url: l.url } };
}

export async function morningstarMissing(content: SiteContent): Promise<string[]> {
  return missingMorningstarAssets(content, await resolveBrandAssets());
}

export async function brandRows(): Promise<BrandRow[]> {
  const shipped = staticBrandAssets();
  const uploaded = await listUploadedBrand().catch(() => []);
  const resolved = await resolveBrandAssets();
  return BRAND_SLOTS.map((slot) => {
    const up = uploaded.find((m) => m.slot === slot);
    return {
      slot,
      label: BRAND_SLOT_LABEL[slot],
      url: resolved[slot],
      source: up ? "uploaded" : shipped[slot] ? "shipped" : "missing",
      ...(up ? { uploadedBy: up.uploadedBy, uploadedAt: up.uploadedAt } : {}),
    } satisfies BrandRow;
  });
}
