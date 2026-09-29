/**
 * Server-side revocation list of admin sessions (logout). One file per revoked session id (`jti`) under
 * `revoked/<jti>` on the data volume, holding the session's expiry (epoch seconds). Entries are pruned once the
 * session would have expired anyway. Dependency-free (unit tested).
 */
import { promises as fs } from "node:fs";
import { listDir, p, removePath, writeFileAtomic } from "../data/store.ts";

/** jti produced by pkce.randomToken(): base64url, 16..64 chars. Anything else is never a valid session id. */
export const isJti = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(v);

export async function revokeSession(jti: string, exp: number): Promise<void> {
  if (!isJti(jti)) return;
  await writeFileAtomic(["revoked", jti], String(Math.floor(exp)));
  await pruneRevoked().catch(() => undefined);
}

export async function isRevoked(jti: string): Promise<boolean> {
  if (!isJti(jti)) return true;
  try {
    await fs.stat(p("revoked", jti));
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e; // fail closed: an unreadable list must not accept the session (caller treats throw as invalid)
  }
}

/** Remove entries whose session has expired (plus a 5 min margin for clock tolerance). Returns the removed ids. */
export async function pruneRevoked(nowSec = Math.floor(Date.now() / 1000)): Promise<string[]> {
  const removed: string[] = [];
  for (const name of await listDir(["revoked"])) {
    if (!isJti(name)) continue;
    const raw = await fs.readFile(p("revoked", name), "utf8").catch(() => "");
    const exp = Number(raw.trim());
    if (Number.isFinite(exp) && exp + 300 < nowSec) {
      await removePath(["revoked", name]);
      removed.push(name);
    }
  }
  return removed;
}
