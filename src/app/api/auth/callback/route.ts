/**
 * GET /api/auth/callback?code&state — completes the Entra ID sign-in:
 *   flow cookie (encrypted, ≤ 10 min) → state match → code exchange with the PKCE verifier (confidential client) →
 *   id_token verification (RS256 / JWKS, issuer, audience, nonce, tid) → admin policy (member, domain, groups) →
 *   4 h session cookie → redirect to the sanitised returnTo.
 * The flow cookie is single use (cleared on every outcome). Tokens are never logged.
 */
import { NextResponse, type NextRequest } from "next/server";
import { authConfig, createSessionToken, openFlow } from "@/lib/auth/session";
import { exchangeCode, OidcError, verifyIdToken } from "@/lib/auth/oidc";
import { evaluateLogin } from "@/lib/auth/policy";
import { SESSION_TTL_SECONDS, timingSafeEqualStr } from "@/lib/auth/guards";
import { denyPage } from "@/lib/auth/deny";
import { audit } from "@/lib/data/store";

export const dynamic = "force-dynamic";

function clearFlow(res: Response, name: string, secure: boolean): Response {
  res.headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`);
  return res;
}

export async function GET(request: NextRequest) {
  const c = authConfig();
  if (!c.ok) return denyPage(503, "admin unavailable", "Admin sign-in is not configured on this server.");
  const cfg = c.config;
  const fail = (status: number, title: string, msg: string) => clearFlow(denyPage(status, title, msg), cfg.cookie.flowName, cfg.cookie.secure);

  const q = request.nextUrl.searchParams;
  const flow = await openFlow(request.cookies.get(cfg.cookie.flowName)?.value, cfg);
  if (!flow) return fail(400, "sign-in expired", "The sign-in session expired or was started in another browser. Please try again from /admin.");

  const state = q.get("state") ?? "";
  if (!timingSafeEqualStr(state, flow.state)) return fail(400, "sign-in failed", "The sign-in response does not match this browser session.");

  const err = q.get("error");
  if (err) {
    const code = err.replace(/[^a-z_]/gi, "").slice(0, 60);
    return fail(401, "sign-in cancelled", `Microsoft did not complete the sign-in (${code}).`);
  }
  const code = q.get("code");
  if (!code || code.length > 4096) return fail(400, "sign-in failed", "The sign-in response has no authorization code.");

  let claims: Record<string, unknown>;
  try {
    const idToken = await exchangeCode(cfg, code, flow.verifier);
    claims = (await verifyIdToken(cfg, idToken, flow.nonce)) as Record<string, unknown>;
  } catch (e) {
    const oe = e instanceof OidcError ? e : new OidcError("unexpected", "The sign-in could not be completed.");
    console.warn(`[auth] sign-in failed: ${oe.code}`);
    return fail(oe.code === "tenant" ? 403 : 401, "sign-in failed", oe.message);
  }

  const decision = evaluateLogin(claims, { tenantId: cfg.tenantId, allowedDomains: cfg.allowedDomains, allowedGroupIds: cfg.allowedGroupIds, requiredRole: cfg.requiredRole });
  if (!decision.ok) {
    console.warn(`[auth] admin access denied: ${decision.reason}`);
    await audit({ by: "anonymous", action: "auth.denied", detail: { reason: decision.reason } }).catch(() => undefined);
    return fail(403, "access denied", decision.message);
  }

  const token = await createSessionToken({ oid: decision.oid, email: decision.email, name: decision.name, tid: decision.tid }, cfg);
  await audit({ by: decision.email, action: "auth.login" }).catch(() => undefined);

  const res = NextResponse.redirect(new URL(flow.returnTo, cfg.origin), { status: 302 });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(cfg.cookie.name, token, { httpOnly: true, secure: cfg.cookie.secure, sameSite: "lax", path: "/", maxAge: SESSION_TTL_SECONDS });
  res.cookies.set(cfg.cookie.flowName, "", { httpOnly: true, secure: cfg.cookie.secure, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
