/**
 * Pure request guards for the admin — no I/O, no dependencies (unit tested in tests/unit/auth/*.test.ts):
 *  - `sanitizeReturnTo`: post-login redirect target, same-site relative paths only (no open redirect),
 *  - `sessionCookieSpec`: session cookie name/flags (`__Host-` + Secure unless the explicit localhost e2e opt-in),
 *  - `checkCsrf`: Origin + custom header / JSON content-type check for mutating admin API calls,
 *  - `timingSafeEqualStr`: constant-time string comparison.
 */

export const SESSION_COOKIE = "__Host-nymbus_admin";
export const SESSION_COOKIE_INSECURE = "nymbus_admin";
const FLOW_COOKIE = "__Host-nymbus_oidc";
const FLOW_COOKIE_INSECURE = "nymbus_oidc";
const CSRF_HEADER = "x-nymbus-admin";
export const SESSION_TTL_SECONDS = 4 * 60 * 60;
export const FLOW_TTL_SECONDS = 10 * 60;

const DEFAULT_RETURN = "/admin";

/**
 * Accept only a same-site absolute path such as `/admin/funds?x=1#y`.
 * Rejects: schemes (`https:`, `javascript:`), protocol-relative `//host`, backslashes (browsers treat `\` as `/`),
 * control characters / whitespace, encoded slashes or backslashes that would decode into the above, `..` segments,
 * and anything over 512 chars. Optionally restricts to a path prefix (default: `/admin`).
 */
export function sanitizeReturnTo(raw: unknown, allowedPrefix = "/admin"): string {
  if (typeof raw !== "string") return DEFAULT_RETURN;
  const v = raw;
  if (v.length === 0 || v.length > 512) return DEFAULT_RETURN;
  if (v[0] !== "/") return DEFAULT_RETURN;
  if (v.startsWith("//") || v.includes("\\")) return DEFAULT_RETURN;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0020\u007f-\u009f\u2028\u2029]/.test(v)) return DEFAULT_RETURN;
  if (/%(?:2f|5c|00|0a|0d|09)/i.test(v)) return DEFAULT_RETURN;
  let decoded: string;
  try {
    decoded = decodeURIComponent(v);
  } catch {
    return DEFAULT_RETURN;
  }
  if (decoded.startsWith("//") || decoded.includes("\\")) return DEFAULT_RETURN;
  const pathOnly = v.split(/[?#]/, 1)[0];
  if (pathOnly.split("/").some((seg) => seg === ".." || seg === "." || /^%2e/i.test(seg))) return DEFAULT_RETURN;
  // resolve against a dummy origin: must stay on it with the same path
  let u: URL;
  try {
    u = new URL(v, "https://placeholder.invalid");
  } catch {
    return DEFAULT_RETURN;
  }
  if (u.origin !== "https://placeholder.invalid") return DEFAULT_RETURN;
  if (allowedPrefix && u.pathname !== allowedPrefix && !u.pathname.startsWith(allowedPrefix + "/")) return DEFAULT_RETURN;
  return u.pathname + u.search + u.hash;
}

export interface CookieSpec {
  name: string;
  flowName: string;
  secure: boolean;
  httpOnly: true;
  sameSite: "lax";
  path: "/";
}

/**
 * Secure `__Host-` cookies always, except when BOTH the explicit opt-in AUTH_INSECURE_COOKIES_FOR_LOCALHOST=1 is set
 * AND PUBLIC_URL is plain http on localhost / 127.0.0.1 (the e2e server). Anything else falls back to secure.
 */
export function sessionCookieSpec(env: { AUTH_INSECURE_COOKIES_FOR_LOCALHOST?: string; PUBLIC_URL?: string }): CookieSpec {
  const insecure = env.AUTH_INSECURE_COOKIES_FOR_LOCALHOST === "1" && isLocalhostUrl(env.PUBLIC_URL);
  return insecure
    ? { name: SESSION_COOKIE_INSECURE, flowName: FLOW_COOKIE_INSECURE, secure: false, httpOnly: true, sameSite: "lax", path: "/" }
    : { name: SESSION_COOKIE, flowName: FLOW_COOKIE, secure: true, httpOnly: true, sameSite: "lax", path: "/" };
}

export function isLocalhostUrl(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return (u.protocol === "http:" || u.protocol === "https:") && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

/** Serialise a Set-Cookie header value (used where a raw header is needed). */
export function serializeCookie(name: string, value: string, spec: CookieSpec, maxAgeSeconds: number): string {
  const parts = [`${name}=${value}`, `Path=${spec.path}`, `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`, "HttpOnly", "SameSite=Lax"];
  if (spec.secure) parts.push("Secure");
  if (maxAgeSeconds <= 0) parts.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  return parts.join("; ");
}

/** Normalised origin of PUBLIC_URL (`https://www.nymbus.ca`), or null if invalid. */
export function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

type CsrfResult = { ok: true } | { ok: false; reason: string };

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF check for /api/admin: for non-safe methods the Origin header must be present and equal PUBLIC_URL's origin,
 * AND the request must carry `x-nymbus-admin: 1` or be `application/json` (neither can be sent cross-site without a
 * CORS preflight, which we never grant). `Sec-Fetch-Site`, when sent, must be same-origin.
 */
export function checkCsrf(req: { method: string; headers: { get(name: string): string | null } }, publicUrl: string | undefined): CsrfResult {
  const method = req.method.toUpperCase();
  if (SAFE_METHODS.has(method)) return { ok: true };
  const expected = originOf(publicUrl);
  if (!expected) return { ok: false, reason: "PUBLIC_URL is not configured" };
  const origin = req.headers.get("origin");
  if (!origin) return { ok: false, reason: "missing Origin header" };
  if (origin === "null" || originOf(origin) !== expected || origin.replace(/\/$/, "") !== expected) {
    return { ok: false, reason: "cross-origin request" };
  }
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return { ok: false, reason: "cross-site request" };
  const custom = req.headers.get(CSRF_HEADER);
  const ct = (req.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  if (custom !== "1" && ct !== "application/json") return { ok: false, reason: `missing ${CSRF_HEADER} header` };
  return { ok: true };
}

/** Constant-time comparison of two strings (length leak only). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
