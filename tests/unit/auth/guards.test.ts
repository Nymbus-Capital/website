import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  checkCsrf,
  sanitizeReturnTo,
  serializeCookie,
  sessionCookieSpec,
  timingSafeEqualStr,
  SESSION_COOKIE,
  SESSION_COOKIE_INSECURE,
} from "../../../src/lib/auth/guards.ts";
import { loadAuthConfig } from "../../../src/lib/auth/config.ts";
import { isValidVerifier, pkceChallenge, randomToken } from "../../../src/lib/auth/pkce.ts";

test("returnTo: same-site admin paths are kept", () => {
  assert.equal(sanitizeReturnTo("/admin"), "/admin");
  assert.equal(sanitizeReturnTo("/admin/funds/multi-strategy?tab=x#top"), "/admin/funds/multi-strategy?tab=x#top");
  assert.equal(sanitizeReturnTo("/admin/runs/20260929T064500-abcd1234"), "/admin/runs/20260929T064500-abcd1234");
});

test("returnTo: open redirect attempts fall back to /admin", () => {
  for (const bad of [
    "https://evil.com",
    "http://evil.com/admin",
    "//evil.com",
    "//evil.com/admin",
    "/\\evil.com",
    "\\\\evil.com",
    "/admin\\..\\x",
    "javascript:alert(1)",
    "data:text/html,x",
    "admin",
    "",
    " /admin",
    "/admin\n",
    "/admin\t",
    "/%2F%2Fevil.com",
    "/admin/%2e%2e/x",
    "/admin/../api/x",
    "/admin/./x",
    "/%5Cevil.com",
    "/administrator",
    "/",
    "/strategies",
    "/api/admin/status",
    "/admin%00",
    "x".repeat(600),
    "/ admin",
    "/%E0%A4%A",
    null,
    undefined,
    42,
    ["/admin"],
  ]) {
    assert.equal(sanitizeReturnTo(bad as unknown), "/admin", `accepted: ${JSON.stringify(bad)}`);
  }
});

test("cookie options: secure __Host- by default", () => {
  for (const env of [
    {},
    { PUBLIC_URL: "https://www.nymbus.ca" },
    { AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1", PUBLIC_URL: "https://www.nymbus.ca" },
    { AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1", PUBLIC_URL: "http://localhost.evil.com:3000" },
    { AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1", PUBLIC_URL: "http://127.0.0.1.nip.io" },
    { AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "true", PUBLIC_URL: "http://localhost:3100" },
    { AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1" },
    { PUBLIC_URL: "http://localhost:3100" },
  ]) {
    const s = sessionCookieSpec(env);
    assert.equal(s.secure, true, JSON.stringify(env));
    assert.equal(s.name, SESSION_COOKIE);
    assert.ok(s.name.startsWith("__Host-"));
    assert.equal(s.httpOnly, true);
    assert.equal(s.sameSite, "lax");
    assert.equal(s.path, "/");
  }
});

test("cookie options: insecure only with the opt-in AND a localhost PUBLIC_URL", () => {
  for (const url of ["http://localhost:3100", "http://127.0.0.1:3000"]) {
    const s = sessionCookieSpec({ AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1", PUBLIC_URL: url });
    assert.equal(s.secure, false);
    assert.equal(s.name, SESSION_COOKIE_INSECURE);
    assert.ok(!s.name.startsWith("__Host-"));
    assert.equal(s.httpOnly, true);
  }
});

test("serializeCookie includes the security attributes", () => {
  const c = serializeCookie("__Host-x", "v", sessionCookieSpec({}), 60);
  assert.match(c, /HttpOnly/);
  assert.match(c, /Secure/);
  assert.match(c, /SameSite=Lax/);
  assert.match(c, /Path=\//);
  assert.doesNotMatch(c, /Domain=/);
});

const req = (method: string, h: Record<string, string>) => ({
  method,
  headers: { get: (n: string) => h[n.toLowerCase()] ?? null },
});
const PUB = "https://www.nymbus.ca";

test("CSRF: safe methods pass", () => {
  assert.deepEqual(checkCsrf(req("GET", {}), PUB), { ok: true });
  assert.deepEqual(checkCsrf(req("HEAD", {}), PUB), { ok: true });
});

test("CSRF: mutations need a matching Origin and the custom header or JSON", () => {
  assert.equal(checkCsrf(req("POST", { origin: PUB, "x-nymbus-admin": "1" }), PUB).ok, true);
  assert.equal(checkCsrf(req("PUT", { origin: PUB, "content-type": "application/json; charset=utf-8" }), PUB).ok, true);
  assert.equal(
    checkCsrf(req("DELETE", { origin: PUB, "x-nymbus-admin": "1", "sec-fetch-site": "same-origin" }), PUB).ok,
    true,
  );

  assert.equal(checkCsrf(req("POST", { "x-nymbus-admin": "1" }), PUB).ok, false, "missing origin");
  assert.equal(checkCsrf(req("POST", { origin: "null", "x-nymbus-admin": "1" }), PUB).ok, false);
  assert.equal(checkCsrf(req("POST", { origin: "https://evil.com", "x-nymbus-admin": "1" }), PUB).ok, false);
  assert.equal(
    checkCsrf(req("POST", { origin: "https://www.nymbus.ca.evil.com", "x-nymbus-admin": "1" }), PUB).ok,
    false,
  );
  assert.equal(checkCsrf(req("POST", { origin: "http://www.nymbus.ca", "x-nymbus-admin": "1" }), PUB).ok, false);
  assert.equal(checkCsrf(req("POST", { origin: "https://www.nymbus.ca:8443", "x-nymbus-admin": "1" }), PUB).ok, false);
  assert.equal(checkCsrf(req("POST", { origin: PUB }), PUB).ok, false, "no custom header");
  assert.equal(checkCsrf(req("POST", { origin: PUB, "content-type": "text/plain" }), PUB).ok, false);
  assert.equal(
    checkCsrf(req("POST", { origin: PUB, "content-type": "multipart/form-data; boundary=x" }), PUB).ok,
    false,
  );
  assert.equal(checkCsrf(req("POST", { origin: PUB, "x-nymbus-admin": "0" }), PUB).ok, false);
  assert.equal(
    checkCsrf(req("POST", { origin: PUB, "x-nymbus-admin": "1", "sec-fetch-site": "cross-site" }), PUB).ok,
    false,
  );
  assert.equal(checkCsrf(req("PATCH", { origin: PUB, "x-nymbus-admin": "1" }), undefined).ok, false, "no PUBLIC_URL");
});

test("timingSafeEqualStr", () => {
  assert.equal(timingSafeEqualStr("abc", "abc"), true);
  assert.equal(timingSafeEqualStr("abc", "abd"), false);
  assert.equal(timingSafeEqualStr("abc", "abcd"), false);
  assert.equal(timingSafeEqualStr("", ""), true);
});

test("PKCE S256 challenge = base64url(sha256(verifier))", async () => {
  // independent reference: node:crypto SHA-256 → base64url without padding
  const v0 = "dBjftJeZ4CVP-mJ92K1FZtHBgGP0kBVy2Z6nDZ26pVQ";
  assert.equal(await pkceChallenge(v0), createHash("sha256").update(v0).digest("base64url"));
  assert.equal(await pkceChallenge(v0), "m2ErHq7la0hzoIsCKicAbIwfrDmCzmiQko4Z5Ee4wvs");
  const v = randomToken(48);
  assert.equal(isValidVerifier(v), true);
  assert.notEqual(randomToken(), randomToken());
});

const GOOD_ENV = {
  AZURE_TENANT_ID: "00000000-0000-0000-0000-00000000abcd",
  AZURE_CLIENT_ID: "11111111-1111-1111-1111-111111111111",
  AZURE_CLIENT_SECRET: "x",
  AUTH_SECRET: "0123456789abcdefghijklmnopqrstuvwxyz",
  PUBLIC_URL: "https://www.nymbus.ca/",
};

test("auth config: endpoints derived from the tenant, fails closed on weak / missing settings", () => {
  const r = loadAuthConfig(GOOD_ENV);
  assert.equal(r.ok, true);
  if (r.ok) {
    const t = GOOD_ENV.AZURE_TENANT_ID;
    assert.equal(r.config.issuer, `https://login.microsoftonline.com/${t}/v2.0`);
    assert.equal(r.config.authorizeEndpoint, `https://login.microsoftonline.com/${t}/oauth2/v2.0/authorize`);
    assert.equal(r.config.tokenEndpoint, `https://login.microsoftonline.com/${t}/oauth2/v2.0/token`);
    assert.equal(r.config.jwksUri, `https://login.microsoftonline.com/${t}/discovery/v2.0/keys`);
    assert.equal(r.config.redirectUri, "https://www.nymbus.ca/api/auth/callback");
    assert.equal(r.config.cookie.secure, true);
    assert.deepEqual(r.config.allowedDomains, ["nymbus.ca"]);
  }
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AUTH_SECRET: "short" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AUTH_SECRET: "a".repeat(64) }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AUTH_SECRET: undefined }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AZURE_TENANT_ID: "common" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AZURE_TENANT_ID: "organizations" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AZURE_CLIENT_SECRET: "" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, PUBLIC_URL: "http://www.nymbus.ca" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, PUBLIC_URL: "" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, ADMIN_ALLOWED_DOMAINS: "*" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, ADMIN_ALLOWED_GROUP_IDS: "admins" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, PUBLIC_URL: "http://localhost:3100" }).ok, true);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, ADMIN_REQUIRED_ROLE: "bad role" }).ok, false);
});

test("auth config: the committed e2e secret and a localhost PUBLIC_URL are refused outside the e2e setup", () => {
  const E2E_SECRET = "e2e-auth-secret-0123456789abcdef0123456789abcdef";
  assert.equal(loadAuthConfig({ ...GOOD_ENV, AUTH_SECRET: E2E_SECRET }).ok, false);
  assert.equal(
    loadAuthConfig({ ...GOOD_ENV, AUTH_SECRET: E2E_SECRET, AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1" }).ok,
    false,
    "https PUBLIC_URL",
  );
  assert.equal(
    loadAuthConfig({ ...GOOD_ENV, AUTH_SECRET: E2E_SECRET, PUBLIC_URL: "http://localhost:3100" }).ok,
    false,
    "no opt-in",
  );
  // the e2e server: localhost + opt-in, even with NODE_ENV=production (next start)
  assert.equal(
    loadAuthConfig({
      ...GOOD_ENV,
      AUTH_SECRET: E2E_SECRET,
      PUBLIC_URL: "http://localhost:3100",
      AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1",
      NODE_ENV: "production",
    }).ok,
    true,
  );
  assert.equal(loadAuthConfig({ ...GOOD_ENV, PUBLIC_URL: "http://localhost:3100", NODE_ENV: "production" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, PUBLIC_URL: "https://127.0.0.1", NODE_ENV: "production" }).ok, false);
  assert.equal(loadAuthConfig({ ...GOOD_ENV, NODE_ENV: "production" }).ok, true);
});

test("auth config carries the role and a policy version", () => {
  const a = loadAuthConfig({ ...GOOD_ENV });
  const b = loadAuthConfig({ ...GOOD_ENV, ADMIN_REQUIRED_ROLE: "Admin.Web" });
  assert.ok(a.ok && b.ok);
  if (a.ok && b.ok) {
    assert.equal(b.config.requiredRole, "Admin.Web");
    assert.notEqual(a.config.policyVersion, b.config.policyVersion);
  }
});
