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

/**
 * Shape of an X-Forwarded-For header for the boot diagnostic: the hop count and each hop's class (public / internal,
 * v4 / v6), never an address. Lets ops confirm on the platform that the rightmost public hop is the visitor.
 */
export function forwardedShape(forwardedFor: string | null | undefined): string {
  const parts = (forwardedFor ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const cls = (a: string): string => {
    const v = a.replace(/^\[|\]$/g, "");
    const fam = /^\d{1,3}(\.\d{1,3}){3}$/.test(v) ? "v4" : expandIPv6(v) ? "v6" : null;
    return fam ? `${isInternalAddress(v) ? "internal" : "public"}-${fam}` : "invalid";
  };
  return `hops=${parts.length}${parts.length ? ` [${parts.map(cls).join(", ")}]` : ""}`;
}

/** Full 8-group form of an IPv6 address (lower case, no zero compression), or null when it is not one. */
export function expandIPv6(a: string): string[] | null {
  let v = a.toLowerCase().replace(/^\[|\]$/g, "").replace(/%.*$/, "");
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v);
  if (v4) {
    const n = v4.slice(1).map(Number);
    if (n.some((x) => x > 255)) return null;
    v = v.slice(0, v4.index) + `${((n[0] << 8) | n[1]).toString(16)}:${((n[2] << 8) | n[3]).toString(16)}`;
  }
  if (!/^[0-9a-f:]+$/.test(v) || (v.match(/::/g) ?? []).length > 1) return null;
  const [head, tail] = v.includes("::") ? v.split("::") : [v, null];
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const fill = tail === null ? 0 : 8 - h.length - t.length;
  if (fill < 0 || (tail !== null && fill < 1)) return null;
  const g = [...h, ...Array<string>(fill).fill("0"), ...t];
  if (g.length !== 8 || g.some((x) => !/^[0-9a-f]{1,4}$/.test(x))) return null;
  return g.map((x) => x.replace(/^0+(?=.)/, ""));
}

/**
 * Rate-limit bucket of a client address: an IPv4 address on its own; an IPv6 address by its /64 (one subscriber's
 * network: rotating through the 2^64 addresses of one's own prefix does not open new buckets); IPv4-mapped IPv6 as IPv4.
 */
export function limiterKey(addr: string): string {
  const a = addr.toLowerCase();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(a)) return a;
  const g = expandIPv6(a);
  if (!g) return a;
  if (g.slice(0, 5).every((x) => x === "0") && g[5] === "ffff") {
    const n = parseInt(g[6], 16), m = parseInt(g[7], 16);
    return `${n >> 8}.${n & 255}.${m >> 8}.${m & 255}`;
  }
  return `${g.slice(0, 4).join(":")}::/64`;
}

export interface ContactLimits {
  /** attempts (valid or not) per client bucket and window */
  perClient: number;
  perClientWindowMs: number;
  /** stored inquiries for the whole site and window (bounds what a spoofed or distributed flood can write) */
  global: number;
  globalWindowMs: number;
  /** tracked buckets; past it, the least recently used one is forgotten (never a shared bucket) */
  maxClients: number;
}

export const CONTACT_LIMITS: ContactLimits = { perClient: 5, perClientWindowMs: 15 * 60_000, global: 40, globalWindowMs: 60 * 60_000, maxClients: 5000 };

export interface ContactLimiter {
  /** count an attempt of `key` (an address: bucketed by limiterKey); false when over budget (the refused attempt is not counted) */
  take(key: string, now?: number): boolean;
  /** reserve one stored inquiry; false when the site-wide budget is spent */
  takeGlobal(now?: number): boolean;
  /** give back a reservation that stored nothing (duplicate, refused, failed write) */
  refundGlobal(): void;
  /** tracked buckets (tests, diagnostics) */
  size(): number;
}

/** In-memory limiter (one instance; a restart resets it). Buckets live in a Map kept in least-recently-used order. */
export function contactLimiter(o: ContactLimits = CONTACT_LIMITS): ContactLimiter {
  const by = new Map<string, number[]>();
  let global: number[] = [];
  return {
    take(addr, now = Date.now()) {
      const k = limiterKey(addr);
      const t = (by.get(k) ?? []).filter((x) => now - x < o.perClientWindowMs);
      by.delete(k); // re-inserted last: most recently used
      if (t.length >= o.perClient) {
        by.set(k, t);
        return false;
      }
      t.push(now);
      while (by.size >= o.maxClients) by.delete(by.keys().next().value as string);
      by.set(k, t);
      return true;
    },
    takeGlobal(now = Date.now()) {
      global = global.filter((x) => now - x < o.globalWindowMs);
      if (global.length >= o.global) return false;
      global.push(now);
      return true;
    },
    refundGlobal() {
      global.pop();
    },
    size: () => by.size,
  };
}
