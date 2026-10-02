/**
 * Public API of the headless-WordPress integration (server only). Pages call these and nothing else:
 *
 *   getTeam()         team members (CMS when available and not empty, else src/data/team.ts)
 *   getNews()         news, newest first (CMS when available and not empty, else the static items)
 *   getSiteTexts()    editable texts of the CMS ({} when none)
 *   getPublicContent() admin content with the CMS texts overlaid (AUM label, announcement banner; admin wins)
 *   cmsSource()       the source behind them (revalidate route), null when the CMS is not configured
 *
 * Without `WP_BASE_URL` every function returns the static sources: the site works exactly as without WordPress.
 * See docs/architecture.md (data flow, precedence) and src/lib/cms/source.ts (failure behaviour).
 */
import "server-only";
import { team as staticTeam, type TeamMember } from "@/data/team";
import { NEWS } from "@/components/site/home/news";
import { readJsonCached } from "@/lib/data/cache";
import { getContent } from "@/lib/data/site";
import type { SiteContent } from "@/lib/data/types";
import { loadCmsConfig, type CmsConfig } from "./config";
import { overlayTexts, toNewsEntry, toTeamMember, type NewsEntry } from "./map";
import { createCmsSource, type CmsSnapshot, type CmsSource } from "./source";
import type { CmsTexts } from "./types";

export type { NewsEntry } from "./map";

const KEY = Symbol.for("nymbus.cms.instance");
const g = globalThis as unknown as Record<symbol, { sig: string; cfg: CmsConfig; source: CmsSource } | null | undefined>;

/** The source for the current environment (rebuilt only when the CMS settings change), or null when disabled. */
export function cmsSource(): { cfg: CmsConfig; source: CmsSource } | null {
  const cfg = loadCmsConfig();
  if (!cfg) { g[KEY] = null; return null; }
  const sig = JSON.stringify([cfg.endpoint, cfg.mediaOrigin, cfg.contentSecret, cfg.ttlMs]);
  const cur = g[KEY];
  if (cur && cur.sig === sig) return cur;
  const next = { sig, cfg, source: createCmsSource(cfg) };
  g[KEY] = next;
  return next;
}

async function snapshot(): Promise<CmsSnapshot | null> {
  try {
    return (await cmsSource()?.source.get()) ?? null;
  } catch {
    return null; // never let the CMS break a page
  }
}

const STATIC_NEWS: NewsEntry[] = NEWS.map((n) => ({ ...n, image: null, link: null }));

export async function getTeam(): Promise<TeamMember[]> {
  const snap = await snapshot();
  return snap && snap.doc.team.length ? snap.doc.team.map(toTeamMember) : staticTeam;
}

export async function getNews(): Promise<NewsEntry[]> {
  const snap = await snapshot();
  return snap && snap.doc.news.length ? snap.doc.news.map(toNewsEntry) : STATIC_NEWS;
}

export async function getSiteTexts(): Promise<CmsTexts> {
  return (await snapshot())?.doc.texts ?? {};
}

/** The admin content as the PUBLIC pages use it: CMS texts fill in what the admin has not set. Not for the admin UI. */
export async function getPublicContent(): Promise<SiteContent> {
  const [content, stored, texts] = await Promise.all([
    getContent(),
    readJsonCached<SiteContent | null>(["content", "site-content.json"], null).catch(() => null),
    getSiteTexts(),
  ]);
  return overlayTexts(content, stored, texts);
}
