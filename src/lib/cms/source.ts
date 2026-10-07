/**
 * The document the site renders from, with the failure behaviour that keeps it up when WordPress is not:
 *
 *  - a fetched document is reused for `ttlMs` (time-based revalidation); after that the stale copy is still served while
 *    ONE background refresh runs (stale-while-revalidate), so no visitor waits for WordPress after the first request;
 *  - every good document is also written to `<SITE_DATA_DIR>/cms/last-good.json` (atomic, only when it changed). When
 *    WordPress cannot be reached (timeout, 5xx, invalid or oversized response) the last good document is used — from
 *    memory, else from the volume (re-validated on read, so a damaged file is ignored) — and a failed refresh is not
 *    retried for 30 s;
 *  - nothing at all (first start with WordPress down and an empty volume), a failed fetch inside its back-off with nothing
 *    in memory, or a last good copy older than `maxStaleMs` (72 h): `null`, and the callers fall back to the static sources;
 *  - a document with no item, with less than half of the previous items, or that lost items to validation never replaces
 *    a non-empty one (the old one stays, logged); each replaced last-good copy is kept as `last-good.prev.json`;
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
export const LAST_GOOD_PREV = ["cms", "last-good.prev.json"];
export const LAST_GOOD_META = ["cms", "last-good-at.json"];

const itemCount = (d: CmsDocument): number => d.news.length + d.team.length;

/** Why a new document must not replace the previous one, or null. */
export function shrinkProblem(prev: CmsDocument | null, next: CmsDocument, dropped: number): string | null {
  const before = prev ? itemCount(prev) : 0;
  if (!before) return null;
  const after = itemCount(next);
  if (after === 0) return `no item (was ${before})`;
  if (after * 2 < before) return `${after} item(s) (was ${before})`;
  if (dropped > 0 && after < before)
    return `${dropped} item(s) failed validation and the list shrank (${before} to ${after})`;
  return null;
}
export const FAIL_BACKOFF_MS = 30_000;
export const MIN_FETCH_GAP_MS = 2_000;

export type CmsOrigin = "live" | "last-good";
export interface CmsSnapshot {
  doc: CmsDocument;
  origin: CmsOrigin;
  at: number;
}

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

  const warnOnce = (m: string) => {
    if (now() - lastLogAt > 60_000) {
      lastLogAt = now();
      log(m);
    }
  };

  let lastMetaAt = 0;

  async function readLastGood(): Promise<{ doc: CmsDocument; at: number } | null> {
    try {
      const raw = await readJson<unknown>(LAST_GOOD, null);
      if (!raw) return null;
      const { doc } = parseCmsDocument(raw, { mediaOrigin: cfg.mediaOrigin, allowLoopbackHttp: cfg.allowLoopbackHttp });
      lastWritten = JSON.stringify(doc);
      const meta = await readJson<{ at?: unknown } | null>(LAST_GOOD_META, null).catch(() => null);
      // the time of the last successful fetch; unknown: as old as it can be (nothing is served from an undated copy)
      const at = typeof meta?.at === "number" && Number.isFinite(meta.at) ? meta.at : 0;
      lastMetaAt = at;
      return { doc, at };
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
        // the previous document: memory, else the volume (a first fetch after a restart is compared with it too)
        const previous = mem?.doc ?? (await readLastGood())?.doc ?? null;
        const problem = shrinkProblem(previous, doc, dropped.length);
        if (problem) {
          nextTryAt = now() + FAIL_BACKOFF_MS;
          warnOnce(`WordPress document refused: ${problem}; keeping the previous copy`);
          if (!mem && previous) {
            const disk = await readLastGood();
            if (disk) mem = { doc: disk.doc, origin: "last-good", at: disk.at };
          }
          return false;
        }
        mem = { doc, origin: "live", at: now() };
        nextTryAt = 0;
        const ser = JSON.stringify(doc);
        const changed = ser !== lastWritten;
        try {
          if (changed) {
            if (lastWritten) await writeJson(LAST_GOOD_PREV, JSON.parse(lastWritten));
            await writeJson(LAST_GOOD, doc);
            lastWritten = ser;
          }
          if (changed || now() - lastMetaAt > 15 * 60_000 || lastMetaAt === 0) {
            await writeJson(LAST_GOOD_META, { at: now() });
            lastMetaAt = now();
          }
        } catch (e: unknown) {
          warnOnce(`could not store the last good copy (${e instanceof Error ? e.name : "error"})`);
        }
        return true;
      } catch (e: unknown) {
        nextTryAt = now() + FAIL_BACKOFF_MS;
        warnOnce(
          `WordPress document not used: ${e instanceof Error ? e.message.slice(0, 200) : "error"}${mem ? " (keeping the last good copy)" : ""}`,
        );
        if (!mem) {
          const disk = await readLastGood();
          if (disk) mem = { doc: disk.doc, origin: "last-good", at: disk.at };
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
      // a copy older than maxStaleMs is not served (the callers use the static sources); a refresh may still renew it
      const usable = mem && t - mem.at <= cfg.maxStaleMs ? mem : null;
      if (usable && (t - usable.at < cfg.ttlMs || t < nextTryAt)) return usable;
      if (t < nextTryAt) return null; // failed recently: no new request, nothing usable in memory
      if (usable) {
        void refresh(); // stale-while-revalidate: this request is served from memory
        return usable;
      }
      await refresh();
      return mem && now() - mem.at <= cfg.maxStaleMs ? mem : null;
    },
    async revalidate() {
      if (!inflight && now() - lastFetchAt < MIN_FETCH_GAP_MS)
        return { ok: mem?.origin === "live", origin: mem?.origin ?? null };
      const ok = await refresh();
      return { ok, origin: (mem as CmsSnapshot | null)?.origin ?? null };
    },
    reset() {
      mem = null;
      nextTryAt = 0;
      lastFetchAt = 0;
      lastWritten = "";
      lastMetaAt = 0;
      inflight = null;
    },
  };
}
