/**
 * e2e helpers for the admin. A session is minted with AUTH_SECRET exactly as /api/auth/callback would after a
 * successful Microsoft sign-in (HS256, iss/aud "nymbus-admin", jti, policy version `pv`, 4 h max). There is no auth bypass in the application:
 * these tests only work because the test knows the (test-only) secret of the e2e server.
 */
import { SignJWT } from "jose";
import type { BrowserContext, Page } from "@playwright/test";
import { E2E_ENV } from "../playwright.config";
import { parseAllowedDomains, policyVersion } from "../src/lib/auth/policy.ts";

export const BASE = E2E_ENV.PUBLIC_URL;
export const TENANT = E2E_ENV.AZURE_TENANT_ID;
export const OTHER_TENANT = "22222222-2222-2222-2222-22222222e2e2";
/** name of the session cookie on the e2e server (AUTH_INSECURE_COOKIES_FOR_LOCALHOST=1, http://localhost) */
export const SESSION_COOKIE = "nymbus_admin";

/** policy fingerprint of the e2e server (same inputs as loadAuthConfig) */
export const E2E_POLICY_VERSION = policyVersion({
  tenantId: E2E_ENV.AZURE_TENANT_ID,
  allowedDomains: parseAllowedDomains(E2E_ENV.ADMIN_ALLOWED_DOMAINS),
  allowedGroupIds: [],
  requiredRole: "",
});

export async function mintSession(o: {
  email: string;
  tid?: string;
  oid?: string;
  name?: string;
  expSeconds?: number;
  secret?: string;
  pv?: string;
  jti?: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    email: o.email,
    name: o.name ?? o.email.split("@")[0],
    tid: o.tid ?? TENANT,
    pv: o.pv ?? E2E_POLICY_VERSION,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setJti(o.jti ?? `e2e${crypto.randomUUID().replace(/-/g, "")}`)
    .setSubject(o.oid ?? "33333333-3333-3333-3333-33333333e2e3")
    .setIssuer("nymbus-admin")
    .setAudience("nymbus-admin")
    .setIssuedAt(now)
    .setExpirationTime(now + (o.expSeconds ?? 3600))
    .sign(new TextEncoder().encode(o.secret ?? E2E_ENV.AUTH_SECRET));
}

export async function signIn(
  context: BrowserContext,
  email = "alice@nymbus.ca",
  extra: { tid?: string } = {},
): Promise<string> {
  const token = await mintSession({ email, ...extra });
  await context.addCookies([{ name: SESSION_COOKIE, value: token, url: BASE, httpOnly: true, sameSite: "Lax" }]);
  return token;
}

/** Headers of a legitimate same-origin admin call from the admin UI. */
export const adminHeaders = (token: string, json = true): Record<string, string> => ({
  cookie: `${SESSION_COOKIE}=${token}`,
  origin: BASE,
  "x-nymbus-admin": "1",
  ...(json ? { "content-type": "application/json" } : {}),
});

/** A tiny valid PDF (hand-written, one empty page). */
export function tinyPdf(label = "nymbus e2e"): Buffer {
  const body = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] >> endobj
trailer << /Root 1 0 R /Info << /Title (${label}) >> >>
%%EOF
`;
  return Buffer.from(body, "latin1");
}

export async function shot(page: Page, name: string, projectName: string) {
  const { mkdirSync } = await import("node:fs");
  mkdirSync("e2e/screenshots", { recursive: true });
  await page.screenshot({
    path: `e2e/screenshots/admin-${name}${projectName === "desktop" ? "" : `-${projectName}`}.png`,
    fullPage: true,
  });
}
