/**
 * GET /api/auth/login?returnTo=/admin/... — starts the Entra ID authorization code flow (PKCE S256, state, nonce).
 * The transient state goes into an encrypted, 10-minute, HttpOnly cookie; nothing secret is put in the URL except
 * the PKCE challenge (a hash) and the random state / nonce.
 */
import { NextResponse, type NextRequest } from "next/server";
import { authConfig, sealFlow } from "@/lib/auth/session";
import { authorizeUrl } from "@/lib/auth/oidc";
import { randomToken } from "@/lib/auth/pkce";
import { FLOW_TTL_SECONDS, sanitizeReturnTo } from "@/lib/auth/guards";
import { denyPage } from "@/lib/auth/deny";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const c = authConfig();
  if (!c.ok) {
    console.error(`[auth] admin sign-in disabled: ${c.error}`);
    return denyPage(503, "admin unavailable", "Admin sign-in is not configured on this server.");
  }
  const cfg = c.config;
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const flow = { state: randomToken(), nonce: randomToken(), verifier: randomToken(48), returnTo };
  const res = NextResponse.redirect(await authorizeUrl(cfg, flow), { status: 302 });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(cfg.cookie.flowName, await sealFlow(flow, cfg), {
    httpOnly: true,
    secure: cfg.cookie.secure,
    sameSite: "lax", // the callback is a top-level GET navigation from login.microsoftonline.com
    path: "/",
    maxAge: FLOW_TTL_SECONDS,
  });
  return res;
}
