/**
 * Shared-secret check for the on-demand revalidation route: constant-time comparison (digests of equal length) and a
 * small failure limiter (a global window: this endpoint has one legitimate caller, WordPress). Dependency-free.
 */
import crypto from "node:crypto";

const digest = (s: string) => crypto.createHash("sha256").update(s).digest();

/** Value of an `Authorization: Bearer <token>` header, or null. */
export function bearerToken(header: string | null | undefined): string | null {
  const m = /^Bearer ([^\s]{1,512})$/.exec(header ?? "");
  return m ? m[1] : null;
}

/** Constant-time equality of two secrets (false when either is empty). */
export function secretsEqual(given: string | null | undefined, expected: string | null | undefined): boolean {
  if (!given || !expected) return false;
  return crypto.timingSafeEqual(digest(given), digest(expected));
}

export interface Limiter { blocked(now?: number): boolean; fail(now?: number): void }

/** Blocks for the rest of the window once `max` failures happened inside it. */
export function failureLimiter(max = 20, windowMs = 60_000): Limiter {
  let times: number[] = [];
  return {
    blocked(now = Date.now()) { times = times.filter((t) => now - t < windowMs); return times.length >= max; },
    fail(now = Date.now()) { times.push(now); if (times.length > max * 2) times = times.slice(-max); },
  };
}
