/**
 * Admin gate (Next 16 `proxy`, Node runtime). Runs before /admin pages and /api/admin routes:
 *   - no / invalid / expired session → pages: 302 to /api/auth/login?returnTo=<path>; API: 401 JSON
 *   - valid session refused by the policy (tenant, guest, domain) → 403
 *   - auth not configured (missing env, weak AUTH_SECRET) → 503 (fail closed)
 *   - mutating API calls must pass the CSRF check (Origin = PUBLIC_URL origin + x-nymbus-admin / JSON)
 * Route handlers and the admin layout verify the session again (requireAdmin / currentAdmin): defence in depth.
 *
 * `/api/admin/upload/*` (multipart PDF uploads up to 25 MB) is deliberately NOT matched: when a proxy matches a
 * request, Next buffers its body with a 10 MB cap (experimental.proxyClientMaxBodySize) and silently truncates
 * larger bodies. Those handlers call requireAdmin() themselves (session + policy + CSRF) before reading the body.
 */
import { NextResponse, type NextRequest } from "next/server";
import { checkRequestSession } from "@/lib/auth/session";
import { checkCsrf, sanitizeReturnTo } from "@/lib/auth/guards";
import { authConfig } from "@/lib/auth/session";
import { denyPage } from "@/lib/auth/deny";

const NO_STORE = { "Cache-Control": "no-store" };

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");

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
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/((?!upload).*)"],
};
