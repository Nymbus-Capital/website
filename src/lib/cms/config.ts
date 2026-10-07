/**
 * CMS settings from the environment. The CMS is OPTIONAL: no `WP_BASE_URL` (or an invalid one) means disabled, and the
 * site behaves exactly as before (static team, static news, admin content). Dependency-free (unit tested).
 *
 *   WP_BASE_URL          origin (+ optional path) of the WordPress site the server fetches from
 *   WP_CONTENT_SECRET    optional shared secret, sent as `X-Nymbus-Content-Secret` (same value as NYMBUS_CONTENT_SECRET in WordPress)
 *   WP_REVALIDATE_SECRET shared secret that authorises `POST /api/cms/revalidate` (same value as NYMBUS_REVALIDATE_SECRET in WordPress)
 *   WP_MEDIA_ORIGIN      optional public origin of the images (default: the origin of WP_BASE_URL when that is public https / loopback)
 *   CMS_REVALIDATE_SECONDS  optional, how long a fetched document is reused (default 60, 5 to 3600)
 *   CMS_MAX_STALE_HOURS  optional, how long the last good copy is served while WordPress fails, then the static sources (default 72, 1 to 720)
 *
 * `http` is accepted only for a loopback host (local development) or a single-label private-network host name such as
 * `http://wordpress:80` (Northflank private network, like DATAPLATFORM_URL); everything else must be https. Images are
 * only ever accepted from the media origin, which must itself be https (or loopback http).
 */
import { isLoopbackHost } from "./sanitize.ts";

export interface CmsConfig {
  /** WordPress base, no trailing slash, no query / hash */
  baseUrl: string;
  /** full URL of the normalized document */
  endpoint: string;
  /** exact origin allowed for images; null: images are not shown */
  mediaOrigin: string | null;
  /** http is only allowed for loopback hosts (affects image / link validation in dev) */
  allowLoopbackHttp: boolean;
  contentSecret: string | null;
  revalidateSecret: string | null;
  ttlMs: number;
  /** after this long without a successful fetch the CMS content is not used (static fallback) */
  maxStaleMs: number;
  timeoutMs: number;
}

export const ENDPOINT_PATH = "/wp-json/nymbus/v1/site-content";
export const CONTENT_SECRET_HEADER = "x-nymbus-content-secret";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function origin(
  v: string | undefined,
  what: string,
  warn: (m: string) => void,
  requireSecure: boolean,
): { url: URL; loopback: boolean } | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    warn(`${what} is not a valid URL: CMS disabled`);
    return null;
  }
  if (u.username || u.password || u.search || u.hash) {
    warn(`${what} must not carry credentials, a query or a fragment`);
    return null;
  }
  const loopback = isLoopbackHost(u.hostname);
  if (u.protocol === "https:") return { url: u, loopback };
  // an IPv6 literal other than ::1 is never a "private host name": plain http needs a name or loopback
  const ipv6 = u.hostname.startsWith("[");
  if (u.protocol === "http:" && (loopback || (!requireSecure && !ipv6 && !u.hostname.includes("."))))
    return { url: u, loopback };
  warn(`${what} must be https (http only for localhost or a private-network host name)`);
  return null;
}

export function loadCmsConfig(
  env: Record<string, string | undefined> = process.env,
  warn: (m: string) => void = (m) => console.warn(`[cms] ${m}`),
): CmsConfig | null {
  const base = origin(env.WP_BASE_URL, "WP_BASE_URL", warn, false);
  if (!base) return null;
  const baseUrl = (base.url.origin + base.url.pathname).replace(/\/+$/, "");
  // images: explicit media origin, else the base origin when a browser can reach it (https or loopback http)
  let media: string | null = null;
  let mediaLoopback = false;
  if ((env.WP_MEDIA_ORIGIN ?? "").trim()) {
    const m = origin(env.WP_MEDIA_ORIGIN, "WP_MEDIA_ORIGIN", warn, true);
    if (m && m.url.pathname.replace(/\/+$/, "") === "") {
      media = m.url.origin;
      mediaLoopback = m.loopback;
    } else if (m) warn("WP_MEDIA_ORIGIN must be an origin without a path: images disabled");
  } else if (base.url.protocol === "https:" || base.loopback) {
    media = base.url.origin;
    mediaLoopback = base.loopback;
  }
  const ttl = Number(env.CMS_REVALIDATE_SECONDS);
  const stale = Number(env.CMS_MAX_STALE_HOURS);
  return {
    baseUrl,
    endpoint: baseUrl + ENDPOINT_PATH,
    mediaOrigin: media,
    allowLoopbackHttp: mediaLoopback || base.loopback,
    contentSecret: env.WP_CONTENT_SECRET?.trim() || null,
    revalidateSecret: env.WP_REVALIDATE_SECRET?.trim() || null,
    ttlMs: Number.isFinite(ttl) && ttl > 0 ? clamp(Math.trunc(ttl), 5, 3600) * 1000 : 60_000,
    maxStaleMs: (Number.isFinite(stale) && stale > 0 ? clamp(Math.trunc(stale), 1, 720) : 72) * 3_600_000,
    timeoutMs: 4000,
  };
}

/** Image origin to add to the CSP `img-src` (null when the CMS is disabled or has no media origin). */
export const cmsImageOrigin = (env: Record<string, string | undefined> = process.env): string | null =>
  loadCmsConfig(env, () => undefined)?.mediaOrigin ?? null;
