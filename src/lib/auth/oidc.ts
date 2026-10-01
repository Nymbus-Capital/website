/**
 * Microsoft Entra ID (single tenant) OpenID Connect: authorization code flow + PKCE (S256), state and nonce.
 * Server only. Never logs tokens.
 */
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { AuthConfig } from "./config.ts";
import { pkceChallenge } from "./pkce.ts";
import { timingSafeEqualStr } from "./guards.ts";

export const OIDC_SCOPE = "openid profile email";

export async function authorizeUrl(cfg: AuthConfig, f: { state: string; nonce: string; verifier: string }): Promise<string> {
  const u = new URL(cfg.authorizeEndpoint);
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("response_mode", "query");
  u.searchParams.set("scope", OIDC_SCOPE);
  u.searchParams.set("state", f.state);
  u.searchParams.set("nonce", f.nonce);
  u.searchParams.set("code_challenge", await pkceChallenge(f.verifier));
  u.searchParams.set("code_challenge_method", "S256");
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

let jwks: { uri: string; set: ReturnType<typeof createRemoteJWKSet> } | null = null;
function keySet(cfg: AuthConfig) {
  if (!jwks || jwks.uri !== cfg.jwksUri) {
    jwks = { uri: cfg.jwksUri, set: createRemoteJWKSet(new URL(cfg.jwksUri), { timeoutDuration: 5000, cooldownDuration: 30_000, cacheMaxAge: 6 * 3600_000 }) };
  }
  return jwks.set;
}

export class OidcError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Exchange the authorization code (confidential client + PKCE verifier). Returns the raw id_token. */
export async function exchangeCode(cfg: AuthConfig, code: string, verifier: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    code_verifier: verifier,
    scope: OIDC_SCOPE,
  });
  let res: Response;
  try {
    res = await fetch(cfg.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new OidcError("token_unreachable", "Could not reach the Microsoft token endpoint.");
  }
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    // only the error code (never the body, which may contain correlation data / tokens)
    const code = typeof data.error === "string" ? data.error.replace(/[^a-z_]/gi, "").slice(0, 60) : `http_${res.status}`;
    throw new OidcError("token_error", `The Microsoft token endpoint refused the code (${code}).`);
  }
  if (typeof data.id_token !== "string") throw new OidcError("no_id_token", "The token response has no id_token.");
  return data.id_token;
}

/** Verify the id_token: RS256 signature against the tenant JWKS, exact issuer, audience, lifetime, nonce, tid. */
export async function verifyIdToken(cfg: AuthConfig, idToken: string, expectedNonce: string): Promise<JWTPayload> {
  let payload: JWTPayload;
  try {
    const r = await jwtVerify(idToken, keySet(cfg), {
      issuer: cfg.issuer,
      audience: cfg.clientId,
      algorithms: ["RS256"],
      clockTolerance: 60,
      maxTokenAge: "1h",
      requiredClaims: ["iat", "exp", "nonce", "tid", "oid"],
    });
    payload = r.payload;
  } catch {
    throw new OidcError("id_token_invalid", "The sign-in token could not be verified.");
  }
  const nonce = typeof payload.nonce === "string" ? payload.nonce : "";
  if (!timingSafeEqualStr(nonce, expectedNonce)) throw new OidcError("nonce", "The sign-in token nonce does not match.");
  if (typeof payload.tid !== "string" || payload.tid.toLowerCase() !== cfg.tenantId) {
    throw new OidcError("tenant", "This account does not belong to the Nymbus Microsoft tenant.");
  }
  // azp, when present, must be our client (single audience token)
  if (payload.azp !== undefined && payload.azp !== cfg.clientId) throw new OidcError("azp", "The sign-in token was issued to another client.");
  return payload;
}
