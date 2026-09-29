import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateLogin, evaluateSession, guestReason, isAllowedEmail, normalizeEmail, parseAllowedDomains, parseGroupIds,
  type Claims, type PolicyConfig,
} from "../../../src/lib/auth/policy.ts";

const TID = "00000000-0000-0000-0000-00000000abcd";
const OTHER_TID = "99999999-0000-0000-0000-00000000abcd";
const OID = "11111111-2222-3333-4444-555555555555";
const G1 = "aaaaaaaa-0000-0000-0000-000000000001";
const G2 = "aaaaaaaa-0000-0000-0000-000000000002";

const cfg: PolicyConfig = { tenantId: TID, allowedDomains: ["nymbus.ca"] };
const base = (o: Claims = {}): Claims => ({ tid: TID, oid: OID, email: "alice@nymbus.ca", name: "Alice", preferred_username: "alice@nymbus.ca", ...o });
const deny = (claims: Claims, c: PolicyConfig = cfg) => {
  const r = evaluateLogin(claims, c);
  assert.equal(r.ok, false, `expected deny for ${JSON.stringify(claims)}`);
  return r.ok ? "" : r.reason;
};

test("member of the tenant in the allowed domain is allowed", () => {
  const r = evaluateLogin(base(), cfg);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.email, "alice@nymbus.ca");
    assert.equal(r.oid, OID);
    assert.equal(r.tid, TID);
  }
});

test("tenant mismatch / missing / malformed tid is denied", () => {
  assert.equal(deny(base({ tid: OTHER_TID })), "tenant");
  assert.equal(deny(base({ tid: undefined })), "tenant");
  assert.equal(deny(base({ tid: `${TID} ` })), "tenant");
  assert.equal(deny(base({ tid: 42 })), "tenant");
  assert.equal(deny(base(), { ...cfg, tenantId: "" }), "tenant");
});

test("tid comparison is case-insensitive for GUIDs", () => {
  assert.equal(evaluateLogin(base({ tid: TID.toUpperCase() }), cfg).ok, true);
});

test("missing oid is denied", () => {
  assert.equal(deny(base({ oid: undefined })), "subject");
  assert.equal(deny(base({ oid: "not-a-guid" })), "subject");
});

test("guest accounts (#EXT#) are denied whatever the claim", () => {
  assert.equal(deny(base({ upn: "alice_gmail.com#EXT#@nymbus.onmicrosoft.com" })), "guest");
  assert.equal(deny(base({ preferred_username: "bob_evil.com#ext#@nymbus.ca" })), "guest");
  assert.equal(deny(base({ email: "x#EXT#@nymbus.ca" })), "guest");
  assert.equal(deny(base({ unique_name: "live.com#alice#EXT#@nymbus.ca" })), "guest");
});

test("foreign idp is denied, own-tenant idp is accepted", () => {
  assert.equal(deny(base({ idp: "https://sts.windows.net/9188040d-6c67-4c5b-b112-36a304b66dad/" })), "guest");
  assert.equal(deny(base({ idp: "live.com" })), "guest");
  assert.equal(deny(base({ idp: "google.com" })), "guest");
  assert.equal(deny(base({ idp: 123 })), "guest");
  assert.equal(evaluateLogin(base({ idp: `https://sts.windows.net/${TID}/` }), cfg).ok, true);
  assert.equal(guestReason(base({ idp: `https://login.microsoftonline.com/${TID}/v2.0` }), TID), null);
});

test("acct = 1 (guest) is denied, acct = 0 allowed, unexpected values denied", () => {
  assert.equal(deny(base({ acct: 1 })), "guest");
  assert.equal(deny(base({ acct: "1" })), "guest");
  assert.equal(deny(base({ acct: 2 })), "guest");
  assert.equal(evaluateLogin(base({ acct: 0 }), cfg).ok, true);
});

test("domain must match exactly: look-alikes, suffixes, subdomains are denied", () => {
  for (const email of [
    "a@evilnymbus.ca",
    "a@nymbus.ca.evil.com",
    "a@sub.nymbus.ca",
    "a@nymbus.cab",
    "a@nymbus.com",
    "a@nymbus.ca@evil.com",
    "a@ nymbus.ca",
    "nymbus.ca@evil.com",
    "a@nymbus.ca\u0000",
    "a@nymbus.ca\n",
    "@nymbus.ca",
    "a@",
    "a@nymbus-ca",
  ]) {
    assert.equal(deny(base({ email, preferred_username: email, upn: email })), email.includes("@") && normalizeEmail(email) ? "domain" : "email", email);
  }
});

test("domain match is case-insensitive", () => {
  const r = evaluateLogin(base({ email: "Alice@NYMBUS.CA" }), cfg);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.email, "alice@nymbus.ca");
});

test("email falls back to preferred_username then upn", () => {
  assert.equal(evaluateLogin(base({ email: undefined, preferred_username: "p@nymbus.ca" }), cfg).ok, true);
  assert.equal(evaluateLogin(base({ email: undefined, preferred_username: undefined, upn: "u@nymbus.ca" }), cfg).ok, true);
  assert.equal(deny(base({ email: undefined, preferred_username: undefined, upn: undefined })), "email");
  // the `email` claim wins even when preferred_username is in-domain
  assert.equal(deny(base({ email: "a@evil.com", preferred_username: "a@nymbus.ca" })), "domain");
});

test("listed subdomains are allowed only when explicitly configured", () => {
  const c = { ...cfg, allowedDomains: parseAllowedDomains("nymbus.ca, research.nymbus.ca") };
  assert.equal(evaluateLogin(base({ email: "x@research.nymbus.ca" }), c).ok, true);
  assert.equal(deny(base({ email: "x@other.nymbus.ca" }), c), "domain");
});

test("group allow-list requires an intersection with the groups claim", () => {
  const c = { ...cfg, allowedGroupIds: [G1] };
  assert.equal(evaluateLogin(base({ groups: [G2, G1.toUpperCase()] }), c).ok, true);
  assert.equal(deny(base({ groups: [G2] }), c), "groups");
  assert.equal(deny(base({ groups: [] }), c), "groups");
  assert.equal(deny(base({}), c), "groups");
  assert.equal(deny(base({ groups: G1 }), c), "groups"); // not an array
  // without a group restriction the claim is ignored
  assert.equal(evaluateLogin(base({ groups: [] }), cfg).ok, true);
});

test("group overage is denied with an explicit message (not guessed)", () => {
  const c = { ...cfg, allowedGroupIds: [G1] };
  const r = evaluateLogin(base({ _claim_names: { groups: "src1" }, _claim_sources: { src1: { endpoint: "https://graph" } } }), c);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal(r.reason, "groups-overage");
    assert.match(r.message, /too many groups/);
  }
});

test("session re-check applies tenant and domain policy", () => {
  assert.equal(evaluateSession({ sub: OID, email: "alice@nymbus.ca", tid: TID }, cfg).ok, true);
  assert.equal(evaluateSession({ sub: OID, email: "bob@evil.com", tid: TID }, cfg).ok, false);
  assert.equal(evaluateSession({ sub: OID, email: "alice@nymbus.ca", tid: OTHER_TID }, cfg).ok, false);
  assert.equal(evaluateSession({ sub: "x", email: "alice@nymbus.ca", tid: TID }, cfg).ok, false);
  assert.equal(evaluateSession({ sub: OID, email: "a#EXT#@nymbus.ca", tid: TID }, cfg).ok, false);
  // a domain removed from the config takes effect for existing sessions
  assert.equal(evaluateSession({ sub: OID, email: "alice@nymbus.ca", tid: TID }, { ...cfg, allowedDomains: ["other.ca"] }).ok, false);
});

test("config parsing: defaults, normalisation, invalid entries fail closed", () => {
  assert.deepEqual(parseAllowedDomains(undefined), ["nymbus.ca"]);
  assert.deepEqual(parseAllowedDomains(""), ["nymbus.ca"]);
  assert.deepEqual(parseAllowedDomains(" @Nymbus.CA , nymbus.ca "), ["nymbus.ca"]);
  assert.throws(() => parseAllowedDomains("*.nymbus.ca"));
  assert.throws(() => parseAllowedDomains(","));
  assert.throws(() => parseAllowedDomains("nymbus"));
  assert.deepEqual(parseGroupIds(""), []);
  assert.deepEqual(parseGroupIds(`${G1.toUpperCase()},${G2}`), [G1, G2]);
  assert.throws(() => parseGroupIds("admins"));
});

test("isAllowedEmail direct checks", () => {
  assert.equal(isAllowedEmail("a@nymbus.ca", ["nymbus.ca"]), true);
  assert.equal(isAllowedEmail("a@evilnymbus.ca", ["nymbus.ca"]), false);
  assert.equal(isAllowedEmail("a@nymbus.ca.", ["nymbus.ca"]), false);
});
