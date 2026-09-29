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
 *   locks/                          cross-process locks (pipeline runs)
 *
 * Writes are atomic (temp file + rename) so a reader never sees a half-written JSON.
 * Dependency-free, Node only.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const dataDir = (): string => path.resolve(process.env.SITE_DATA_DIR || "./var");
export const p = (...parts: string[]): string => {
  const root = dataDir();
  const full = path.resolve(root, ...parts);
  // defence in depth: nothing may escape the data directory
  if (full !== root && !full.startsWith(root + path.sep)) throw new Error(`path escapes data dir: ${parts.join("/")}`);
  return full;
};

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
}

export const writeJson = (rel: string[], value: unknown): Promise<void> =>
  writeFileAtomic(rel, JSON.stringify(value, null, 2) + "\n");

export async function appendLine(rel: string[], line: string): Promise<void> {
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
}

/**
 * Exclusive lock through `mkdir` (atomic on POSIX volumes). A lock older than `staleMs` is considered
 * abandoned (crashed run) and taken over.
 */
export async function withLock<T>(name: string, fn: () => Promise<T>, staleMs = 30 * 60_000): Promise<T | { locked: true }> {
  const dir = p("locks", `${name}.lock`);
  await fs.mkdir(path.dirname(dir), { recursive: true });
  try {
    await fs.mkdir(dir);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    const st = await fs.stat(dir).catch(() => null);
    if (st && Date.now() - st.mtimeMs < staleMs) return { locked: true };
    await fs.rm(dir, { recursive: true, force: true });
    await fs.mkdir(dir);
  }
  try {
    return await fn();
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

export interface AuditEntry { at: string; by: string; action: string; target?: string; detail?: unknown }
export const audit = (e: Omit<AuditEntry, "at">): Promise<void> =>
  appendLine(["audit", "audit.jsonl"], JSON.stringify({ at: new Date().toISOString(), ...e }));

export const newId = (): string => {
  const ts = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
  return `${ts}-${crypto.randomBytes(4).toString("hex")}`;
};
