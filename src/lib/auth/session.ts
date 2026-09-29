/**
 * Admin session + OIDC flow cookies (jose). Server only, Node runtime (used by src/proxy.ts and route handlers).
 *
 *  - session: HS256 JWT signed with AUTH_SECRET, 8 h, claims { sub (oid), email, name, tid, iat, exp },
 *    iss/aud "nymbus-admin", in the `__Host-nymbus_admin` cookie (HttpOnly, Secure, SameSite=Lax, Path=/).
 *  - OIDC transient state (state, nonce, PKCE verifier, returnTo): encrypted + authenticated JWE
 *    (dir / A256GCM, key derived from AUTH_SECRET), 10 min, in `__Host-nymbus_oidc`.
 *
 * Every verification re-applies the tenant / member / domain policy (src/lib/auth/policy.ts) to the claims.
 */
import { EncryptJWT, SignJWT, jwtDecrypt, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { loadAuthConfig, type AuthConfig } from "./config.ts";
import { evaluateSession, type PolicyResult } from "./policy.ts";
import { FLOW_TTL_SECONDS, SESSION_TTL_SECONDS, checkCsrf, sanitizeReturnTo } from "./guards.ts";

export const SESSION_ISSUER = "nymbus-admin";
export const SESSION_AUDIENCE = "nymbus-admin";

export interface AdminUser {
  oid: string;
  email: string;
  name: string;
  tid: string;
}

export function authConfig(): ReturnType<typeof loadAuthConfig> {
  return loadAuthConfig(process.env);
}

const enc = new TextEncoder();
const sessionKey = (cfg: AuthConfig) => enc.encode(cfg.secret);

let flowKeyCache: { secret: string; key: Uint8Array } | null = null;
async function flowKey(cfg: AuthConfig): Promise<Uint8Array> {
  if (flowKeyCache && flowKeyCache.secret === cfg.secret) return flowKeyCache.key;
  // domain separation: the JWE key is not the session HMAC key
  const d = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(`nymbus-oidc-flow-v1\u0000${cfg.secret}`));
  const key = new Uint8Array(d);
  flowKeyCache = { secret: cfg.secret, key };
  return key;
}

/* ------------------------------------------------------------------ session */

export async function createSessionToken(user: AdminUser, cfg: AuthConfig): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, tid: user.tid })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.oid)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionKey(cfg));
}

export type SessionCheck =
  | { status: "ok"; user: AdminUser }
  | { status: "none" } // no / invalid / expired cookie → sign in
  | { status: "denied"; message: string } // valid signature but the policy refuses → 403
  | { status: "misconfigured"; message: string }; // auth disabled (fail closed) → 503

export async function verifySessionToken(token: string | undefined, cfg: AuthConfig): Promise<SessionCheck> {
  if (!token || token.length > 4096) return { status: "none" };
  let payload: Record<string, unknown>;
  try {
    const r = await jwtVerify(token, sessionKey(cfg), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      clockTolerance: 30,
      maxTokenAge: `${SESSION_TTL_SECONDS + 60}s`,
      requiredClaims: ["sub", "iat", "exp", "email", "tid"],
    });
    payload = r.payload as Record<string, unknown>;
  } catch {
    return { status: "none" };
  }
  const res: PolicyResult = evaluateSession(
    { sub: payload.sub, email: payload.email, name: payload.name, tid: payload.tid },
    { tenantId: cfg.tenantId, allowedDomains: cfg.allowedDomains, allowedGroupIds: cfg.allowedGroupIds },
  );
  if (!res.ok) return { status: "denied", message: res.message };
  return { status: "ok", user: { oid: res.oid, email: res.email, name: res.name, tid: res.tid } };
}

export async function checkRequestSession(req: NextRequest): Promise<SessionCheck> {
  const c = authConfig();
  if (!c.ok) return { status: "misconfigured", message: "Admin sign-in is not configured on this server." };
  return verifySessionToken(req.cookies.get(c.config.cookie.name)?.value, c.config);
}

/* ------------------------------------------------------------------ OIDC flow state */

export interface FlowState {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
}

export async function sealFlow(f: FlowState, cfg: AuthConfig): Promise<string> {
  return new EncryptJWT({ st: f.state, nn: f.nonce, cv: f.verifier, rt: f.returnTo })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${FLOW_TTL_SECONDS}s`)
    .setAudience("nymbus-oidc-flow")
    .encrypt(await flowKey(cfg));
}

export async function openFlow(token: string | undefined, cfg: AuthConfig): Promise<FlowState | null> {
  if (!token || token.length > 4096) return null;
  try {
    const { payload } = await jwtDecrypt(token, await flowKey(cfg), {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
      audience: "nymbus-oidc-flow",
      clockTolerance: 5,
      maxTokenAge: `${FLOW_TTL_SECONDS}s`,
      requiredClaims: ["iat", "exp"],
    });
    const { st, nn, cv, rt } = payload as Record<string, unknown>;
    if (typeof st !== "string" || typeof nn !== "string" || typeof cv !== "string") return null;
    return { state: st, nonce: nn, verifier: cv, returnTo: sanitizeReturnTo(rt) };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ route handler guard */

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Defence in depth for every /api/admin route handler (the proxy already checked): verifies the session and the
 * policy, and for mutating methods the CSRF rules. Returns the user, or the error Response to return as is.
 *
 *   const auth = await requireAdmin(request); if (auth instanceof Response) return auth;
 */
export async function requireAdmin(req: NextRequest): Promise<AdminUser | Response> {
  const s = await checkRequestSession(req);
  if (s.status === "misconfigured") return json(503, { error: "auth_unavailable", message: s.message });
  if (s.status === "none") return json(401, { error: "unauthenticated", message: "Sign in required." });
  if (s.status === "denied") return json(403, { error: "forbidden", message: s.message });
  const c = authConfig();
  const csrf = checkCsrf(req, c.ok ? c.config.origin : undefined);
  if (!csrf.ok) return json(403, { error: "csrf", message: `Request rejected: ${csrf.reason}.` });
  return s.user;
}
