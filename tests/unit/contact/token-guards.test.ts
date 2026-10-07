import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  checkFormToken,
  formKey,
  issueFormToken,
  MAX_AGE_MS,
  MIN_FILL_MS,
  screenSubmission,
} from "../../../src/lib/contact/token.ts";
import {
  checkSameOrigin,
  clientKey,
  contactLimiter,
  expandIPv6,
  forwardedShape,
  isInternalAddress,
  limiterKey,
} from "../../../src/lib/contact/guards.ts";

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
  for (const bad of ["", "v1..", "v2.abc.def", 42, null, "x".repeat(100)])
    assert.equal(checkFormToken(bad, t0, KEY), "invalid");
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
  for (const a of [
    "10.1.2.3",
    "127.0.0.1",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.1.1",
    "100.64.0.1",
    "::1",
    "fd00::1",
    "fe80::1",
    "::ffff:10.0.0.1",
  ])
    assert.ok(isInternalAddress(a), a);
  for (const a of ["8.8.8.8", "172.32.0.1", "100.128.0.1", "2001:db8::1", "203.0.113.9"])
    assert.ok(!isInternalAddress(a), a);
});

test("rate limit: per client within its window, site-wide on stored inquiries with refunds", () => {
  const lim = contactLimiter({
    perClient: 3,
    perClientWindowMs: 1000,
    global: 2,
    globalWindowMs: 5000,
    maxClients: 100,
  });
  assert.ok(lim.take("203.0.113.1", 0) && lim.take("203.0.113.1", 1) && lim.take("203.0.113.1", 2));
  assert.equal(lim.take("203.0.113.1", 3), false);
  assert.equal(lim.take("203.0.113.1", 500), false, "refused attempts are not counted, but the window still runs");
  assert.ok(lim.take("203.0.113.1", 1001), "window passed for the first attempt");
  assert.ok(lim.take("203.0.113.2", 10), "another IPv4 address is its own bucket");
  assert.ok(lim.takeGlobal(0) && lim.takeGlobal(1));
  assert.equal(lim.takeGlobal(2), false);
  lim.refundGlobal(); // e.g. a duplicate: nothing stored
  assert.ok(lim.takeGlobal(3), "a refunded reservation frees its slot");
  assert.equal(lim.takeGlobal(4), false);
  assert.ok(lim.takeGlobal(5001));
});

test("rate limit: table overflow forgets the least recently used bucket, never a shared bucket", () => {
  const lim = contactLimiter({ perClient: 2, perClientWindowMs: 60_000, global: 99, globalWindowMs: 1, maxClients: 3 });
  assert.ok(lim.take("198.51.100.1", 0) && lim.take("198.51.100.1", 1));
  assert.equal(lim.take("198.51.100.1", 2), false, "victim over budget");
  // a flood of new addresses: each gets its own fresh bucket (no shared "*" bucket that would lock everyone out)
  for (let i = 10; i < 200; i++) assert.ok(lim.take(`192.0.2.${i % 250}`, 3 + i), `flood ${i}`);
  assert.ok(lim.size() <= 3);
  // a recently active client keeps its count while older ones are evicted
  const lim2 = contactLimiter({
    perClient: 2,
    perClientWindowMs: 60_000,
    global: 99,
    globalWindowMs: 1,
    maxClients: 3,
  });
  lim2.take("198.51.100.7", 0);
  lim2.take("198.51.100.7", 1);
  lim2.take("192.0.2.1", 2);
  lim2.take("192.0.2.2", 3);
  assert.equal(lim2.take("198.51.100.7", 4), false, "touched: now most recently used");
  lim2.take("192.0.2.3", 5); // evicts 192.0.2.1, the least recently used
  assert.equal(lim2.take("198.51.100.7", 6), false, "still limited");
  assert.equal(lim2.size(), 3);
});

test("rate limit: IPv6 by /64 (rotating inside one's own prefix does not help), IPv4 per address", () => {
  assert.deepEqual(expandIPv6("2001:db8::1"), ["2001", "db8", "0", "0", "0", "0", "0", "1"]);
  assert.deepEqual(expandIPv6("[::ffff:192.0.2.5]"), ["0", "0", "0", "0", "0", "ffff", "c000", "205"]);
  for (const bad of ["1::2::3", "2001:db8:::1", "g::1", "1:2:3:4:5:6:7:8:9", "::1.2.3.999"])
    assert.equal(expandIPv6(bad), null, bad);
  assert.equal(limiterKey("2001:DB8:0:1:aaaa::1"), "2001:db8:0:1::/64");
  assert.equal(limiterKey("2001:db8:0:1:ffff:1:2:3"), "2001:db8:0:1::/64");
  assert.notEqual(limiterKey("2001:db8:0:2::1"), limiterKey("2001:db8:0:1::1"));
  assert.equal(limiterKey("::ffff:192.0.2.5"), "192.0.2.5");
  assert.equal(limiterKey("192.0.2.5"), "192.0.2.5");
  assert.equal(limiterKey("unknown"), "unknown");
  const lim = contactLimiter({
    perClient: 2,
    perClientWindowMs: 60_000,
    global: 99,
    globalWindowMs: 1,
    maxClients: 100,
  });
  assert.ok(lim.take("2001:db8:0:1::1", 0) && lim.take("2001:db8:0:1::2", 1));
  for (let i = 3; i < 50; i++)
    assert.equal(lim.take(`2001:db8:0:1:${i.toString(16)}::9`, i), false, "same /64, rotated address");
  assert.ok(lim.take("2001:db8:0:2::1", 60), "another /64");
});

test("screen: honeypot, forged or too fast token = bot (fake success); old page = expired; else ok", () => {
  const t0 = Date.UTC(2026, 9, 6, 12);
  const token = issueFormToken(t0, KEY);
  const later = t0 + 20_000;
  assert.equal(screenSubmission({ honeypot: "", token }, later, KEY), "ok");
  assert.equal(
    screenSubmission({ honeypot: "  ", token }, later, KEY),
    "ok",
    "whitespace only is not a filled honeypot",
  );
  assert.equal(screenSubmission({ honeypot: "https://spam.example", token }, later, KEY), "bot");
  assert.equal(screenSubmission({ honeypot: "", token }, t0 + 1_000, KEY), "bot", "faster than a person");
  assert.equal(screenSubmission({ honeypot: "", token: "v1.abc.forged" }, later, KEY), "bot");
  assert.equal(screenSubmission({ honeypot: "", token: "" }, later, KEY), "bot");
  assert.equal(screenSubmission({ honeypot: "", token }, t0 + MAX_AGE_MS + 1, KEY), "expired");
});

test("xff diagnostic: hop count and classes only, never an address", () => {
  const out = forwardedShape("198.51.100.23, 2001:db8::7, 10.0.0.4, [fd00::1], junk");
  assert.equal(out, "hops=5 [public-v4, public-v6, internal-v4, internal-v6, invalid]");
  for (const a of ["198.51.100.23", "2001:db8", "10.0.0.4", "fd00", "junk"]) assert.ok(!out.includes(a), a);
  assert.equal(forwardedShape(null), "hops=0");
});
