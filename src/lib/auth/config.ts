/**
 * Admin authentication configuration, read from the environment and validated once per call.
 * Dependency-free (unit tested): refuses to enable auth when anything is missing or weak, so a misconfigured
 * deployment fails CLOSED (the admin answers 503) instead of running with a guessable secret.
 */
import { isGuid, parseAllowedDomains, parseGroupIds, parseRequiredRole, policyVersion } from "./policy.ts";
import { isLocalhostUrl, originOf, sessionCookieSpec, type CookieSpec } from "./guards.ts";

export interface AuthConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  /** origin of PUBLIC_URL, e.g. https://www.nymbus.ca */
  origin: string;
  redirectUri: string;
  authority: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  logoutEndpoint: string;
  jwksUri: string;
  issuer: string;
  /** raw AUTH_SECRET (≥ 32 chars): HS256 key of the session, and source of the OIDC flow-cookie key */
  secret: string;
  allowedDomains: string[];
  allowedGroupIds: string[];
  /** app role required in the `roles` claim ("" = none) */
  requiredRole: string;
  /** fingerprint of the authorization policy, stored in sessions (`pv`) */
  policyVersion: string;
  cookie: CookieSpec;
}

type AuthConfigResult = { ok: true; config: AuthConfig } | { ok: false; error: string };

const MIN_SECRET_LENGTH = 32;

/**
 * AUTH_SECRET values committed to this public repository (the e2e server's). Refused unless the process is the
 * e2e / localhost setup (localhost PUBLIC_URL + the explicit insecure-cookie opt-in).
 */
const KNOWN_PUBLIC_SECRETS: readonly string[] = ["e2e-auth-secret-0123456789abcdef0123456789abcdef"];

type Env = Record<string, string | undefined>;

export function loadAuthConfig(env: Env): AuthConfigResult {
  const tenantId = (env.AZURE_TENANT_ID || "").trim().toLowerCase();
  const clientId = (env.AZURE_CLIENT_ID || "").trim().toLowerCase();
  const clientSecret = (env.AZURE_CLIENT_SECRET || "").trim(); // pasted values often carry a trailing newline
  const secret = env.AUTH_SECRET || "";
  const publicUrl = (env.PUBLIC_URL || "").trim();

  if (!isGuid(tenantId)) return { ok: false, error: "AZURE_TENANT_ID is missing or not a GUID" };
  if (!isGuid(clientId)) return { ok: false, error: "AZURE_CLIENT_ID is missing or not a GUID" };
  if (!clientSecret) return { ok: false, error: "AZURE_CLIENT_SECRET is missing" };
  if (secret.length < MIN_SECRET_LENGTH) return { ok: false, error: `AUTH_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters` };
  if (new Set(secret).size < 8) return { ok: false, error: "AUTH_SECRET is too repetitive" };
  const origin = originOf(publicUrl);
  if (!origin) return { ok: false, error: "PUBLIC_URL is missing or invalid" };
  if (!origin.startsWith("https://") && !isLocalhostUrl(origin)) return { ok: false, error: "PUBLIC_URL must be https (except localhost)" };
  const localTestSetup = isLocalhostUrl(origin) && env.AUTH_INSECURE_COOKIES_FOR_LOCALHOST === "1";
  if (env.NODE_ENV === "production" && isLocalhostUrl(origin) && !localTestSetup) {
    return { ok: false, error: "PUBLIC_URL is localhost in production (set the public https origin)" };
  }
  if (KNOWN_PUBLIC_SECRETS.includes(secret) && !localTestSetup) {
    return { ok: false, error: "AUTH_SECRET is the public test value committed in the repository: generate a new one" };
  }

  let allowedDomains: string[];
  let allowedGroupIds: string[];
  let requiredRole: string;
  try {
    allowedDomains = parseAllowedDomains(env.ADMIN_ALLOWED_DOMAINS);
    allowedGroupIds = parseGroupIds(env.ADMIN_ALLOWED_GROUP_IDS);
    requiredRole = parseRequiredRole(env.ADMIN_REQUIRED_ROLE);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const authority = `https://login.microsoftonline.com/${tenantId}`;
  return {
    ok: true,
    config: {
      tenantId,
      clientId,
      clientSecret,
      origin,
      redirectUri: `${origin}/api/auth/callback`,
      authority: `${authority}/v2.0`,
      authorizeEndpoint: `${authority}/oauth2/v2.0/authorize`,
      tokenEndpoint: `${authority}/oauth2/v2.0/token`,
      logoutEndpoint: `${authority}/oauth2/v2.0/logout`,
      jwksUri: `${authority}/discovery/v2.0/keys`,
      issuer: `${authority}/v2.0`,
      secret,
      allowedDomains,
      allowedGroupIds,
      requiredRole,
      policyVersion: policyVersion({ tenantId, allowedDomains, allowedGroupIds, requiredRole }),
      cookie: sessionCookieSpec(env),
    },
  };
}
