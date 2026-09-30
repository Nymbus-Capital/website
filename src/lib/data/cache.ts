/**
 * In-memory read cache of JSON files on the data volume (published site data, admin content, pinned snapshots), so
 * public pages render without reading and parsing them on every request. Dependency-free (unit tested under Node).
 *
 * A cached value is reused until its file changes:
 *  - at once after a write in this process (publish, rollback, content save: store.ts bumps a write generation);
 *  - otherwise the file identity (inode, size, mtime) is re-checked at most every `recheckMs` (default 1 s): this
 *    catches writes by another process (the CLI) — every store write replaces the file (new inode), so a change is
 *    never missed even within the same millisecond.
 * Content and identity are taken from the same open file descriptor, so a value is never paired with the identity
 * of another version. Concurrent requests share one load. Values are deep-frozen: callers must copy before changing.
 */
import { promises as fs } from "node:fs";
import { p, writeGeneration } from "./store.ts";

interface Entry { sig: string; value: unknown; gen: number; checkedAt: number }

const KEY = Symbol.for("nymbus.data.cache");
const g = globalThis as unknown as Record<symbol, { entries: Map<string, Entry>; loading: Map<string, Promise<Entry>> } | undefined>;
const state = (g[KEY] ??= { entries: new Map(), loading: new Map() });

export const DEFAULT_RECHECK_MS = 1000;
const ABSENT = "absent";

const signature = (st: { ino: number | bigint; size: number | bigint; mtimeMs: number }): string => `${st.ino}:${st.size}:${st.mtimeMs}`;

function deepFreeze<T>(v: T): T {
  if (v && typeof v === "object" && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const x of Object.values(v as object)) deepFreeze(x);
  }
  return v;
}

async function currentSig(file: string): Promise<string> {
  try {
    return signature(await fs.stat(file));
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return ABSENT;
    throw e;
  }
}

/** Reads and parses the file with its identity from one descriptor (ENOENT → absent). */
async function load(file: string, gen: number): Promise<Entry> {
  let fh: Awaited<ReturnType<typeof fs.open>> | null = null;
  try {
    fh = await fs.open(file, "r");
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { sig: ABSENT, value: undefined, gen, checkedAt: Date.now() };
    throw e;
  }
  try {
    const st = await fh.stat();
    const value = deepFreeze(JSON.parse(await fh.readFile("utf8")));
    return { sig: signature(st), value, gen, checkedAt: Date.now() };
  } finally {
    await fh.close();
  }
}

/**
 * The parsed JSON at `rel` under the data directory (`fallback` when the file does not exist), from the cache when
 * the file has not changed. Invalid JSON throws (like store.readJson) and is not cached.
 */
export async function readJsonCached<T>(rel: string[], fallback: T, opts: { recheckMs?: number } = {}): Promise<T> {
  const file = p(...rel);
  const recheck = opts.recheckMs ?? DEFAULT_RECHECK_MS;
  const gen = writeGeneration();
  const hit = state.entries.get(file);
  const now = Date.now();
  if (hit && hit.gen === gen && now - hit.checkedAt < recheck) return (hit.sig === ABSENT ? fallback : hit.value) as T;
  if (hit && (await currentSig(file)) === hit.sig) {
    hit.gen = gen;
    hit.checkedAt = now;
    return (hit.sig === ABSENT ? fallback : hit.value) as T;
  }
  // one load per file and write generation: a request after a write never joins a load started before it
  const lkey = `${gen}:${file}`;
  let pending = state.loading.get(lkey);
  if (!pending) {
    pending = load(file, gen).finally(() => state.loading.delete(lkey));
    state.loading.set(lkey, pending);
  }
  const entry = await pending;
  // a load started before a newer write must not replace a fresher entry
  const cur = state.entries.get(file);
  if (!cur || cur.gen <= entry.gen) state.entries.set(file, entry);
  return (entry.sig === ABSENT ? fallback : entry.value) as T;
}

/** Forget every cached file (tests; also safe to call after any out-of-band change). */
export function clearDataCache(): void {
  state.entries.clear();
  state.loading.clear();
}

/** Number of cached files (tests / diagnostics). */
export const cachedFileCount = (): number => state.entries.size;
