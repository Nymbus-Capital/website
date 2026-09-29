/**
 * Server-side read model for the public pages and the admin: published pipeline data + admin content
 * + static fund registry, merged into one view per fund. Server only (reads the data volume).
 */
import "server-only";
import { FUNDS, fundSpec, type FundSpec } from "@/config/funds";
import { readJson } from "./store";
import type { FundContent, FundData, FundKey, SiteContent, SiteData } from "./types";
import sample from "./sample-site-data.json";

export const DEFAULT_CONTENT: SiteContent = {
  version: 0,
  updatedAt: "1970-01-01T00:00:00.000Z",
  updatedBy: "system",
  firm: {
    aumLabel: { en: "1.8 B$+", fr: "1,8 G$+" },
    announcement: null,
  },
  funds: {},
  pipeline: { publishMode: "auto" },
};

export async function getContent(): Promise<SiteContent> {
  const c = await readJson<SiteContent | null>(["content", "site-content.json"], null);
  return c ? { ...DEFAULT_CONTENT, ...c, firm: { ...DEFAULT_CONTENT.firm, ...c.firm }, pipeline: { ...DEFAULT_CONTENT.pipeline, ...c.pipeline } } : DEFAULT_CONTENT;
}

/** Sample data is illustrative only: never shown in production unless explicitly allowed. */
export const sampleAllowed = () => process.env.NODE_ENV !== "production" || process.env.SHOW_SAMPLE_DATA === "1";

export async function getSiteData(): Promise<SiteData | null> {
  const live = await readJson<SiteData | null>(["published", "site-data.json"], null);
  if (live) return live;
  return sampleAllowed() ? (sample as unknown as SiteData) : null;
}

/** Data of one fund, honouring an admin "pin" (freeze the fund on an older snapshot). */
async function fundData(key: FundKey, site: SiteData | null, content: FundContent | undefined): Promise<FundData | null> {
  const pin = content?.pinnedSnapshot;
  if (pin && /^[0-9A-Za-z-]+$/.test(pin)) {
    const pinned = await readJson<SiteData | null>(["snapshots", pin, "site-data.json"], null);
    if (pinned?.funds[key]) return pinned.funds[key]!;
  }
  return site?.funds[key] ?? null;
}

export interface FundView {
  spec: FundSpec;
  content: FundContent;
  data: FundData | null;
  sample: boolean;
}

export async function getFundView(slug: string): Promise<FundView | null> {
  const spec = fundSpec(slug);
  if (!spec) return null;
  const [site, content] = await Promise.all([getSiteData(), getContent()]);
  const fc = content.funds[spec.key] ?? {};
  if (fc.hidden) return null;
  return { spec, content: fc, data: await fundData(spec.key, site, fc), sample: site?.mode === "sample" };
}

export async function getAllFundViews(): Promise<FundView[]> {
  const [site, content] = await Promise.all([getSiteData(), getContent()]);
  const out: FundView[] = [];
  for (const spec of FUNDS) {
    const fc = content.funds[spec.key] ?? {};
    if (fc.hidden) continue;
    out.push({ spec, content: fc, data: await fundData(spec.key, site, fc), sample: site?.mode === "sample" });
  }
  return out;
}
