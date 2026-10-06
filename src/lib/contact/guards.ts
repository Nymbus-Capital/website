/**
 * Request guards of POST /api/contact (pure, unit tested): same-origin check, client address key, rate limits.
 */

type Headers = { get(name: string): string | null };

const originOf = (u: string | null | undefined): string | null => {
  if (!u) return null;
  try {
    const x = new URL(u);
    return x.protocol === "https:" || x.protocol === "http:" ? x.origin : null;
  } catch {
    return null;
  }
};

export type OriginCheck = "ok" | "cross-origin" | "unconfigured";

/**
 * The form posts from our own /contact page: `Origin` (else `Referer`) must be PUBLIC_URL's origin, and
 * `Sec-Fetch-Site`, when the browser sends it, must be same-origin. A request with neither header is refused.
 */
export function checkSameOrigin(h: Headers, publicUrl: string | undefined): OriginCheck {
  const expected = originOf(publicUrl);
  if (!expected) return "unconfigured";
  const site = h.get("sec-fetch-site");
  if (site && site !== "same-origin") return "cross-origin";
  const origin = h.get("origin");
  if (origin !== null) return origin !== "null" && originOf(origin) === expected && origin.replace(/\/$/, "") === expected ? "ok" : "cross-origin";
  return originOf(h.get("referer")) === expected ? "ok" : "cross-origin";
}

/** loopback, private (RFC 1918), link-local, CGNAT and IPv6 unique-local addresses: the platform's own proxies */
export function isInternalAddress(a: string): boolean {
  const v = a.toLowerCase().replace(/^\[|\]$/g, "").replace(/^::ffff:/, "");
  const m = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(v);
  if (m) {
    const [x, y] = [Number(m[1]), Number(m[2])];
    return x === 10 || x === 127 || (x === 172 && y >= 16 && y <= 31) || (x === 192 && y === 168) || (x === 169 && y === 254) || (x === 100 && y >= 64 && y <= 127);
  }
  return v === "::1" || /^f[cd][0-9a-f]{0,2}:/.test(v) || /^fe[89ab][0-9a-f]?:/.test(v);
}

/**
 * Client address for the rate limit: walking X-Forwarded-For from the RIGHT (what the platform's load balancer
 * appended), the first address that is not one of the platform's internal proxies. Whatever a client writes on the left
 * is never reached first, so it cannot be forged (same rule as the WordPress image: Apache mod_remoteip with private
 * ranges as internal proxies, wordpress/README.md). "unknown" when absent (local runs): those requests share one bucket.
 */
export function clientKey(forwardedFor: string | null | undefined): string {
  const parts = (forwardedFor ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const a = parts[i];
    if (!/^[0-9A-Za-z:.\-[\]]{1,64}$/.test(a)) return "unknown";
    if (i > 0 && isInternalAddress(a)) continue;
    return a.toLowerCase();
  }
  return "unknown";
}

export interface ContactLimits {
  /** attempts (valid or not) per client address and window */
  perClient: number;
  perClientWindowMs: number;
  /** stored inquiries for the whole site and window (bounds what a spoofed or distributed flood can write) */
  global: number;
  globalWindowMs: number;
  /** tracked addresses; past it, new ones share one bucket */
  maxClients: number;
}

export const CONTACT_LIMITS: ContactLimits = { perClient: 5, perClientWindowMs: 15 * 60_000, global: 40, globalWindowMs: 60 * 60_000, maxClients: 2000 };

export interface ContactLimiter {
  /** count an attempt of `key`; false when the client is over its budget (the refused attempt is not counted) */
  take(key: string, now?: number): boolean;
  /** count one stored inquiry; false when the site-wide budget is spent */
  takeGlobal(now?: number): boolean;
}

/** In-memory limiter (one instance; a restart resets it). */
export function contactLimiter(o: ContactLimits = CONTACT_LIMITS): ContactLimiter {
  const by = new Map<string, number[]>();
  let global: number[] = [];
  const OVERFLOW = "*";
  const live = (k: string, now: number): number[] => {
    const t = (by.get(k) ?? []).filter((x) => now - x < o.perClientWindowMs);
    if (t.length) by.set(k, t);
    else by.delete(k);
    return t;
  };
  const slot = (k: string, now: number): string => {
    if (by.has(k) || by.size < o.maxClients) return k;
    for (const key of [...by.keys()]) live(key, now);
    return by.size < o.maxClients ? k : OVERFLOW;
  };
  return {
    take(key, now = Date.now()) {
      const k = slot(key, now);
      const t = live(k, now);
      if (t.length >= o.perClient) return false;
      t.push(now);
      by.set(k, t);
      return true;
    },
    takeGlobal(now = Date.now()) {
      global = global.filter((x) => now - x < o.globalWindowMs);
      if (global.length >= o.global) return false;
      global.push(now);
      return true;
    },
  };
}
