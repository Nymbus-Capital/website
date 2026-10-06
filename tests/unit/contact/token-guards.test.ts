import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { checkFormToken, formKey, issueFormToken, MAX_AGE_MS, MIN_FILL_MS, screenSubmission } from "../../../src/lib/contact/token.ts";
import { checkSameOrigin, clientKey, contactLimiter, isInternalAddress } from "../../../src/lib/contact/guards.ts";

const KEY = crypto.randomBytes(32);

test("token: too fast, ok, expired, forged", () => {
  const t0 = Date.UTC(2026, 9, 6, 12);
  const tok = issueFormToken(t0, KEY);
  assert.match(tok, /^v1\.[0-9a-z]+\.[A-Za-z0-9_-]{32}$/);
  assert.equal(checkFormToken(tok, t0 + 500, KEY), "too-fast");
  assert.equal(checkFormToken(tok, t0 + MIN_FILL_MS, KEY), "ok");
  assert.equal(checkFormToken(tok, t0 + MAX_AGE_MS + 1, KEY), "expired");
  assert.equal(checkFormToken(tok, t0 + 10_000, crypto.randomBytes(32)), "invalid", "another key");
  const [v, issued, sig] = tok.split(".");
  const earlier = (t0 - 60_000).toString(36);
  assert.equal(checkFormToken(`${v}.${earlier}.${sig}`, t0 + 10_000, KEY), "invalid", "backdated timestamp");
  const flipped = `${sig.slice(0, -1)}${sig.endsWith("A") ? "B" : "A"}`;
  assert.equal(checkFormToken(`${v}.${issued}.${flipped}`, t0 + 10_000, KEY), "invalid", "tampered signature");
  assert.equal(checkFormToken(issueFormToken(t0 + 3_600_000, KEY), t0, KEY), "invalid", "issued in the future");
  for (const bad of ["", "v1..", "v2.abc.def", 42, null, "x".repeat(100)]) assert.equal(checkFormToken(bad, t0, KEY), "invalid");
});

test("token: key derived from AUTH_SECRET, stable, never the secret itself", () => {
  const env = { AUTH_SECRET: "s".repeat(40) };
  assert.deepEqual(formKey(env), formKey(env));
  assert.notDeepEqual(formKey(env), formKey({ AUTH_SECRET: "t".repeat(40) }));
  assert.ok(!formKey(env).toString("utf8").includes("s".repeat(40)));
});

test("same origin: Origin, else Referer; Sec-Fetch-Site; unconfigured", () => {
  const H = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
  const PUB = "https://www.nymbus.ca";
  assert.equal(checkSameOrigin(H({ origin: PUB }), PUB), "ok");
  assert.equal(checkSameOrigin(H({ origin: PUB, "sec-fetch-site": "same-origin" }), `${PUB}/`), "ok");
  assert.equal(checkSameOrigin(H({ origin: "https://evil.example" }), PUB), "cross-origin");
  assert.equal(checkSameOrigin(H({ origin: "null" }), PUB), "cross-origin");
  assert.equal(checkSameOrigin(H({ origin: "https://www.nymbus.ca.evil.example" }), PUB), "cross-origin");
  assert.equal(checkSameOrigin(H({ origin: PUB, "sec-fetch-site": "cross-site" }), PUB), "cross-origin");
  assert.equal(checkSameOrigin(H({ referer: `${PUB}/contact` }), PUB), "ok");
  assert.equal(checkSameOrigin(H({ referer: "https://evil.example/contact" }), PUB), "cross-origin");
  assert.equal(checkSameOrigin(H({}), PUB), "cross-origin");
  assert.equal(checkSameOrigin(H({ origin: PUB }), undefined), "unconfigured");
  assert.equal(checkSameOrigin(H({ origin: PUB }), "not a url"), "unconfigured");
});

test("client key: rightmost non-internal X-Forwarded-For entry (the left part is forgeable)", () => {
  assert.equal(clientKey("203.0.113.9"), "203.0.113.9");
  assert.equal(clientKey("1.2.3.4, 203.0.113.9"), "203.0.113.9");
  assert.equal(clientKey("1.2.3.4, 203.0.113.9, 10.0.0.7"), "203.0.113.9", "skips the platform's internal proxies");
  assert.equal(clientKey("203.0.113.9, 172.20.1.1, 192.168.0.2"), "203.0.113.9");
  assert.equal(clientKey("10.0.0.7"), "10.0.0.7", "only internal: the leftmost is used");
  assert.equal(clientKey("2001:DB8::1"), "2001:db8::1");
  assert.equal(clientKey(""), "unknown");
  assert.equal(clientKey(null), "unknown");
  assert.equal(clientKey("1.2.3.4, <script>"), "unknown");
  for (const a of ["10.1.2.3", "127.0.0.1", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.1.1", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) assert.ok(isInternalAddress(a), a);
  for (const a of ["8.8.8.8", "172.32.0.1", "100.128.0.1", "2001:db8::1", "203.0.113.9"]) assert.ok(!isInternalAddress(a), a);
});

test("rate limit: per client within its window, site-wide on stored inquiries, bounded memory", () => {
  const lim = contactLimiter({ perClient: 3, perClientWindowMs: 1000, global: 2, globalWindowMs: 5000, maxClients: 2 });
  assert.ok(lim.take("a", 0) && lim.take("a", 1) && lim.take("a", 2));
  assert.equal(lim.take("a", 3), false);
  assert.equal(lim.take("a", 500), false, "refused attempts are not counted, but the window still runs");
  assert.ok(lim.take("a", 1001), "window passed for the first attempt");
  assert.ok(lim.take("b", 10));
  // past maxClients, new addresses share one bucket
  assert.ok(lim.take("c", 20) && lim.take("d", 21) && lim.take("e", 22));
  assert.equal(lim.take("f", 23), false);
  assert.ok(lim.takeGlobal(0) && lim.takeGlobal(1));
  assert.equal(lim.takeGlobal(2), false);
  assert.ok(lim.takeGlobal(5001));
});

test("screen: honeypot, forged or too fast token = bot (fake success); old page = expired; else ok", () => {
  const t0 = Date.UTC(2026, 9, 6, 12);
  const token = issueFormToken(t0, KEY);
  const later = t0 + 20_000;
  assert.equal(screenSubmission({ honeypot: "", token }, later, KEY), "ok");
  assert.equal(screenSubmission({ honeypot: "  ", token }, later, KEY), "ok", "whitespace only is not a filled honeypot");
  assert.equal(screenSubmission({ honeypot: "https://spam.example", token }, later, KEY), "bot");
  assert.equal(screenSubmission({ honeypot: "", token }, t0 + 1_000, KEY), "bot", "faster than a person");
  assert.equal(screenSubmission({ honeypot: "", token: "v1.abc.forged" }, later, KEY), "bot");
  assert.equal(screenSubmission({ honeypot: "", token: "" }, later, KEY), "bot");
  assert.equal(screenSubmission({ honeypot: "", token }, t0 + MAX_AGE_MS + 1, KEY), "expired");
});
