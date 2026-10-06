/**
 * File-backed store on the persistent volume (`SITE_DATA_DIR`, default `./var`).
 *
 *   published/site-data.json        what the public site shows (last validated snapshot)
 *   snapshots/<id>/site-data.json   every pipeline run, with raw payloads and its report
 *   snapshots/<id>/report.json
 *   snapshots/<id>/raw/*.json
 *   content/site-content.json       admin-managed content (fees, texts, visibility, publish mode)
 *   content/history/<ts>.json       previous versions of the content
 *   documents/index.json            document metadata
 *   documents/files/<id>            uploaded files (served through /api/documents/<id>)
 *   audit/audit.jsonl               who changed what
 *   inquiries/<id>.json             website inquiries (contact form, src/lib/contact/store.ts)
 *   locks/                          cross-process locks (pipeline runs)
 *
 * Writes are atomic (temp file + rename) so a reader never sees a half-written JSON.
 * Dependency-free, Node only.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const dataDir = (): string => path.resolve(process.env.SITE_DATA_DIR || "./var");
export const p = (...parts: string[]): string => {
  const root = dataDir();
  const full = path.resolve(root, ...parts);
  // defence in depth: nothing may escape the data directory
  if (full !== root && !full.startsWith(root + path.sep)) throw new Error(`path escapes data dir: ${parts.join("/")}`);
  return full;
};

/**
 * Write generation of this process, bumped by every write / removal through this module. Read caches
 * (cache.ts) compare it to revalidate at once after a publish, a rollback or a content save. Kept on
 * globalThis: Next.js may load this module more than once (route handlers and pages), and every copy must
 * see the same counter.
 */
const GEN = Symbol.for("nymbus.store.generation");
const g = globalThis as unknown as Record<symbol, number>;
export const writeGeneration = (): number => g[GEN] ?? 0;
const bumpWriteGeneration = (): void => { g[GEN] = writeGeneration() + 1; };

export async function readJson<T>(rel: string[], fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(p(...rel), "utf8")) as T;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw e;
  }
}

export async function writeFileAtomic(rel: string[], data: string | Uint8Array): Promise<void> {
  const target = p(...rel);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, target);
  bumpWriteGeneration();
}

export const writeJson = (rel: string[], value: unknown): Promise<void> =>
  writeFileAtomic(rel, JSON.stringify(value, null, 2) + "\n");

async function appendLine(rel: string[], line: string): Promise<void> {
  const target = p(...rel);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.appendFile(target, line.replace(/\n/g, " ") + "\n");
}

export async function listDir(rel: string[]): Promise<string[]> {
  try {
    return (await fs.readdir(p(...rel))).sort();
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

export async function removePath(rel: string[]): Promise<void> {
  await fs.rm(p(...rel), { recursive: true, force: true });
  bumpWriteGeneration();
}

/**
 * Exclusive lock through `mkdir` (atomic on POSIX volumes). The holder writes a random owner token in
 * the lock directory and touches it periodically (heartbeat), so a long run is never mistaken for an
 * abandoned one. A lock whose heartbeat is older than `staleMs` is considered abandoned (crashed run)
 * and taken over. On release the directory is removed only if it still carries our token (a holder
 * that was taken over never deletes its successor's lock).
 */
export async function withLock<T>(name: string, fn: () => Promise<T>, staleMs = 30 * 60_000): Promise<T | { locked: true }> {
  const dir = p("locks", `${name}.lock`);
  const ownerFile = path.join(dir, "owner");
  const token = crypto.randomBytes(12).toString("hex");
  await fs.mkdir(path.dirname(dir), { recursive: true });
  const lastBeat = async (): Promise<number | null> => {
    const st = (await fs.stat(ownerFile).catch(() => null)) ?? (await fs.stat(dir).catch(() => null));
    return st ? st.mtimeMs : null;
  };
  try {
    await fs.mkdir(dir);
    await fs.writeFile(ownerFile, token);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    const beat = await lastBeat();
    if (beat !== null && Date.now() - beat < staleMs) return { locked: true };
    // Takeover, serialised by a second mkdir mutex: only its holder may replace a stale lock, and it
    // re-checks staleness under the mutex (another contender may have taken over in the meantime).
    const mutex = `${dir}.takeover`;
    try {
      await fs.mkdir(mutex);
    } catch (e2: unknown) {
      if ((e2 as NodeJS.ErrnoException).code !== "EEXIST") throw e2;
      const st = await fs.stat(mutex).catch(() => null);
      // a takeover mutex left by a crash in the middle of a takeover (it only lives for milliseconds)
      if (st && Date.now() - st.mtimeMs > 60_000) await fs.rm(mutex, { recursive: true, force: true });
      return { locked: true };
    }
    try {
      const again = await lastBeat();
      if (again !== null && Date.now() - again < staleMs) return { locked: true };
      // move the stale lock aside atomically, then delete it at leisure
      const aside = `${dir}.stale-${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
      try {
        await fs.rename(dir, aside);
        await fs.rm(aside, { recursive: true, force: true });
      } catch (e3: unknown) {
        if ((e3 as NodeJS.ErrnoException).code !== "ENOENT") throw e3;
      }
      try {
        await fs.mkdir(dir);
      } catch (e4: unknown) {
        if ((e4 as NodeJS.ErrnoException).code === "EEXIST") return { locked: true }; // a newcomer got the free slot
        throw e4;
      }
      await fs.writeFile(ownerFile, token);
    } finally {
      await fs.rm(mutex, { recursive: true, force: true });
    }
  }
  // verify we still own the directory we created (a concurrent takeover would have replaced it)
  if ((await fs.readFile(ownerFile, "utf8").catch(() => null)) !== token) return { locked: true };
  const heartbeat = setInterval(() => {
    const now = new Date();
    fs.readFile(ownerFile, "utf8").then((t) => (t === token ? fs.utimes(ownerFile, now, now) : undefined)).catch(() => undefined);
  }, Math.max(1000, Math.min(60_000, Math.floor(staleMs / 4))));
  heartbeat.unref?.();
  try {
    return await fn();
  } finally {
    clearInterval(heartbeat);
    const current = await fs.readFile(ownerFile, "utf8").catch(() => null);
    if (current === token) await fs.rm(dir, { recursive: true, force: true });
  }
}

/** Heartbeat time (ms) of a held lock, or null when free. */
export async function lockHeartbeat(name: string): Promise<number | null> {
  const dir = p("locks", `${name}.lock`);
  const st = (await fs.stat(path.join(dir, "owner")).catch(() => null)) ?? (await fs.stat(dir).catch(() => null));
  return st ? st.mtimeMs : null;
}

export interface AuditEntry { at: string; by: string; action: string; target?: string; detail?: unknown }
export const audit = (e: Omit<AuditEntry, "at">): Promise<void> =>
  appendLine(["audit", "audit.jsonl"], JSON.stringify({ at: new Date().toISOString(), ...e }));

export const newId = (): string => {
  const ts = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
  return `${ts}-${crypto.randomBytes(4).toString("hex")}`;
};
