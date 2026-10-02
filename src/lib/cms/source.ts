/**
 * The document the site renders from, with the failure behaviour that keeps it up when WordPress is not:
 *
 *  - a fetched document is reused for `ttlMs` (time-based revalidation); after that the stale copy is still served while
 *    ONE background refresh runs (stale-while-revalidate), so no visitor waits for WordPress after the first request;
 *  - every good document is also written to `<SITE_DATA_DIR>/cms/last-good.json` (atomic, only when it changed). When
 *    WordPress cannot be reached (timeout, 5xx, invalid or oversized response) the last good document is used — from
 *    memory, else from the volume (re-validated on read, so a damaged file is ignored) — and a failed refresh is not
 *    retried for 30 s;
 *  - nothing at all (first start with WordPress down and an empty volume): `null`, and the callers fall back to the
 *    static sources;
 *  - `revalidate()` (authenticated route) forces a refetch, coalesced and rate-limited (min 2 s between fetches).
 *
 * A document that fails validation is a failure like any other: a bad or hostile response never replaces a good one.
 * Dependency-free apart from store.ts (unit tested under plain Node with an injected fetch).
 */
import { readJson, writeJson } from "../data/store.ts";
import { fetchCmsDocument } from "./client.ts";
import type { CmsConfig } from "./config.ts";
import type { CmsDocument } from "./types.ts";
import { parseCmsDocument } from "./validate.ts";

export const LAST_GOOD = ["cms", "last-good.json"];
export const FAIL_BACKOFF_MS = 30_000;
export const MIN_FETCH_GAP_MS = 2_000;

export type CmsOrigin = "live" | "last-good";
export interface CmsSnapshot { doc: CmsDocument; origin: CmsOrigin; at: number }

interface Deps {
  fetchImpl?: Parameters<typeof fetchCmsDocument>[1];
  now?: () => number;
  log?: (m: string) => void;
}

export interface CmsSource {
  get(): Promise<CmsSnapshot | null>;
  revalidate(): Promise<{ ok: boolean; origin: CmsOrigin | null }>;
  /** forgets the memory (tests) */
  reset(): void;
}

export function createCmsSource(cfg: CmsConfig, deps: Deps = {}): CmsSource {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((m: string) => console.warn(`[cms] ${m}`));
  let mem: CmsSnapshot | null = null;
  let nextTryAt = 0;
  let lastFetchAt = 0;
  let lastWritten = "";
  let inflight: Promise<boolean> | null = null;
  let lastLogAt = 0;

  const warnOnce = (m: string) => { if (now() - lastLogAt > 60_000) { lastLogAt = now(); log(m); } };

  async function readLastGood(): Promise<CmsDocument | null> {
    try {
      const raw = await readJson<unknown>(LAST_GOOD, null);
      if (!raw) return null;
      const { doc } = parseCmsDocument(raw, { mediaOrigin: cfg.mediaOrigin, allowLoopbackHttp: cfg.allowLoopbackHttp });
      lastWritten = JSON.stringify(doc);
      return doc;
    } catch {
      return null;
    }
  }

  /** one refresh; true when a new live document was obtained */
  function refresh(): Promise<boolean> {
    if (inflight) return inflight;
    inflight = (async () => {
      lastFetchAt = now();
      try {
        const { doc, dropped } = await fetchCmsDocument(cfg, deps.fetchImpl);
        if (dropped.length) warnOnce(`${dropped.length} item(s) ignored: ${dropped.slice(0, 3).join("; ")}`);
        mem = { doc, origin: "live", at: now() };
        nextTryAt = 0;
        const ser = JSON.stringify(doc);
        if (ser !== lastWritten) {
          try { await writeJson(LAST_GOOD, doc); lastWritten = ser; } catch (e: unknown) { warnOnce(`could not store the last good copy (${e instanceof Error ? e.name : "error"})`); }
        }
        return true;
      } catch (e: unknown) {
        nextTryAt = now() + FAIL_BACKOFF_MS;
        warnOnce(`WordPress document not used: ${e instanceof Error ? e.message.slice(0, 200) : "error"}${mem ? " (keeping the last good copy)" : ""}`);
        if (!mem) {
          const disk = await readLastGood();
          if (disk) mem = { doc: disk, origin: "last-good", at: now() };
        }
        return false;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  return {
    async get() {
      const t = now();
      if (mem && (t - mem.at < cfg.ttlMs || t < nextTryAt)) return mem;
      if (mem) {
        void refresh(); // stale-while-revalidate: this request is served from memory
        return mem;
      }
      await refresh();
      return mem;
    },
    async revalidate() {
      if (!inflight && now() - lastFetchAt < MIN_FETCH_GAP_MS) return { ok: mem?.origin === "live", origin: mem?.origin ?? null };
      const ok = await refresh();
      return { ok, origin: (mem as CmsSnapshot | null)?.origin ?? null };
    },
    reset() { mem = null; nextTryAt = 0; lastFetchAt = 0; lastWritten = ""; inflight = null; },
  };
}
