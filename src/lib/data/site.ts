/**
 * Server-side read model for the public pages and the admin: published pipeline data + admin content
 * + static fund registry, merged into one view per fund. Server only (reads the data volume).
 *
 * The files are read through the in-memory cache (cache.ts): parsed once, reused until the file changes (at once
 * after a publish / rollback / content save in this process, within a second after a write by another process).
 * Cached values are frozen: copy before changing anything.
 */
import "server-only";
import { FUNDS, fundSpec, type FundSpec } from "@/config/funds";
import { readJsonCached } from "./cache";
import { mergeContent } from "./defaults";
import type { FundContent, FundData, FundKey, SiteContent, SiteData } from "./types";
import sample from "./sample-site-data.json";

export { DEFAULT_CONTENT } from "./defaults";

export async function getContent(): Promise<SiteContent> {
  const c = await readJsonCached<SiteContent | null>(["content", "site-content.json"], null);
  return mergeContent(c);
}

/** Sample data is illustrative only: never shown in production unless explicitly allowed. */
export const sampleAllowed = () => process.env.NODE_ENV !== "production" || process.env.SHOW_SAMPLE_DATA === "1";

export async function getSiteData(): Promise<SiteData | null> {
  const live = await readJsonCached<SiteData | null>(["published", "site-data.json"], null);
  if (live) return live;
  return sampleAllowed() ? (sample as unknown as SiteData) : null;
}

/**
 * Data of one fund, honouring an admin "pin" (freeze the fund on an older snapshot). A pin that cannot be
 * honoured (invalid id, snapshot missing or without this fund) shows NO data for the fund rather than
 * silently falling back to the live dataset the admin chose not to show.
 */
async function fundData(key: FundKey, site: SiteData | null, content: FundContent | undefined): Promise<FundData | null> {
  const pin = content?.pinnedSnapshot;
  if (pin) {
    if (!/^[0-9A-Za-z-]+$/.test(pin)) return null;
    const pinned = await readJsonCached<SiteData | null>(["snapshots", pin, "site-data.json"], null).catch(() => null);
    return pinned?.funds[key] ?? null;
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
