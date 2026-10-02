/**
 * Shared-secret check for the on-demand revalidation route: constant-time comparison (digests of equal length) and a
 * small failure limiter per source address. The secret is checked first: a correct secret is never limited (a flood of
 * wrong guesses from elsewhere cannot lock WordPress out); only failures count. Dependency-free.
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

export interface KeyedLimiter { blocked(key: string, now?: number): boolean; fail(key: string, now?: number): void }

/** Failure limiter per key (bounded: past `maxKeys` sources, new ones share one bucket). */
export function keyedFailureLimiter(max = 20, windowMs = 60_000, maxKeys = 500): KeyedLimiter {
  const by = new Map<string, number[]>();
  const OVERFLOW = "*";
  const live = (k: string, now: number): number[] => {
    const t = (by.get(k) ?? []).filter((x) => now - x < windowMs);
    if (t.length) by.set(k, t); else by.delete(k);
    return t;
  };
  const slot = (k: string, now: number): string => {
    if (by.has(k) || by.size < maxKeys) return k;
    for (const key of [...by.keys()]) live(key, now); // drop expired buckets before sharing one
    return by.size < maxKeys ? k : OVERFLOW;
  };
  return {
    blocked(key, now = Date.now()) { return live(slot(key, now), now).length >= max; },
    fail(key, now = Date.now()) { const k = slot(key, now); const t = live(k, now); t.push(now); by.set(k, t.slice(-max)); },
  };
}

/** First hop of X-Forwarded-For (the address the platform's proxy saw), else "unknown". */
export function sourceKey(forwardedFor: string | null | undefined): string {
  const first = (forwardedFor ?? "").split(",")[0].trim();
  return /^[0-9A-Za-z:.\-]{1,64}$/.test(first) ? first.toLowerCase() : "unknown";
}

export type RevalidateDecision = "ok" | "unauthorized" | "limited";

/** Secret first; only a wrong secret is counted, and limited once its source failed too often. */
export function revalidateDecision(given: string | null, expected: string, source: string, limiter: KeyedLimiter, now = Date.now()): RevalidateDecision {
  if (secretsEqual(given, expected)) return "ok";
  if (limiter.blocked(source, now)) return "limited";
  limiter.fail(source, now);
  return "unauthorized";
}
