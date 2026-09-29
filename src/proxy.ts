/**
 * Request proxy (Next 16 `proxy`, Node runtime). Two jobs:
 *
 * 1. Content-Security-Policy with a per-request nonce, on every page and API response it matches
 *    (script-src 'self' 'nonce-…' 'strict-dynamic'; no 'unsafe-inline' for scripts). The nonce reaches Next through
 *    the request headers `x-nonce` + `Content-Security-Policy` (Next extracts it and applies it to its own scripts);
 *    the root layout reads `x-nonce` for its inline theme script. Using a nonce makes every page dynamic.
 *
 * 2. Admin gate, ONLY for /admin and /api/admin:
 *   - no / invalid / expired / revoked session → pages: 302 to /api/auth/login?returnTo=<path>; API: 401 JSON
 *   - valid session refused by the policy (tenant, guest, domain) → 403
 *   - auth not configured (missing env, weak AUTH_SECRET) → 503 (fail closed)
 *   - mutating API calls must pass the CSRF check (Origin = PUBLIC_URL origin + x-nymbus-admin / JSON)
 *   Every admin page and route handler verifies the session again (requireAdminPage / requireAdmin).
 *
 * Not matched: static assets, /api/documents (PDF downloads) and /api/admin/upload/* (multipart uploads up to 25 MB:
 * a matched request has its body buffered with the experimental.proxyClientMaxBodySize cap and silently truncated).
 * The upload handlers call requireAdmin() (session + policy + CSRF) before reading the body.
 */
import { NextResponse, type NextRequest } from "next/server";
import { authConfig, checkRequestSession } from "@/lib/auth/session";
import { checkCsrf, sanitizeReturnTo } from "@/lib/auth/guards";
import { buildCsp, makeNonce } from "@/lib/auth/csp";
import { denyPage } from "@/lib/auth/deny";

const NO_STORE = { "Cache-Control": "no-store" };

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");
const isAdminApi = (p: string) => p === "/api/admin" || p.startsWith("/api/admin/");

function withCsp<R extends Response>(res: R, csp: string): R {
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

async function adminGate(request: NextRequest, isApi: boolean): Promise<Response | null> {
  const { pathname, search } = request.nextUrl;
  const s = await checkRequestSession(request);
  if (s.status === "misconfigured") {
    return isApi
      ? NextResponse.json({ error: "auth_unavailable", message: s.message }, { status: 503, headers: NO_STORE })
      : denyPage(503, "admin unavailable", s.message);
  }
  if (s.status === "none") {
    if (isApi) return NextResponse.json({ error: "unauthenticated", message: "Sign in required." }, { status: 401, headers: NO_STORE });
    // absolute URL on the public origin (behind a reverse proxy nextUrl.origin can be the internal address)
    const c = authConfig();
    const login = new URL("/api/auth/login", c.ok ? c.config.origin : request.nextUrl.origin);
    login.searchParams.set("returnTo", sanitizeReturnTo(pathname + search));
    return NextResponse.redirect(login, { status: 302, headers: NO_STORE });
  }
  if (s.status === "denied") {
    return isApi
      ? NextResponse.json({ error: "forbidden", message: s.message }, { status: 403, headers: NO_STORE })
      : denyPage(403, "access denied", s.message);
  }
  if (isApi) {
    const c = authConfig();
    const csrf = checkCsrf(request, c.ok ? c.config.origin : undefined);
    if (!csrf.ok) return NextResponse.json({ error: "csrf", message: `Request rejected: ${csrf.reason}.` }, { status: 403, headers: NO_STORE });
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = makeNonce();
  const publicUrl = process.env.PUBLIC_URL || "";
  const csp = buildCsp(nonce, { dev: process.env.NODE_ENV === "development", upgradeInsecure: publicUrl.startsWith("https://") });

  const adminPage = isAdminPath(pathname);
  const adminApi = isAdminApi(pathname);
  if (adminPage || adminApi) {
    const denied = await adminGate(request, adminApi);
    if (denied) return withCsp(denied, csp);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  withCsp(res, csp);
  if (adminPage || adminApi) res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.svg|favicon\\.ico|apple-touch-icon\\.png|og\\.png|nymbus-logo\\.svg|fonts/|logos/|robots\\.txt|sitemap\\.xml|api/documents|api/admin/upload|api/health).*)",
  ],
};
