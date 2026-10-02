import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsp, makeNonce } from "../../../src/lib/auth/csp.ts";

test("nonces are random base64 of 128 bits", () => {
  const a = makeNonce();
  assert.match(a, /^[A-Za-z0-9+/]{22}==$/);
  assert.notEqual(a, makeNonce());
});

test("CSP: nonce + strict-dynamic, no script unsafe-inline, framing denied", () => {
  const n = makeNonce();
  const csp = buildCsp(n);
  const script = csp.split("; ").find((d) => d.startsWith("script-src"))!;
  assert.equal(script, `script-src 'self' 'nonce-${n}' 'strict-dynamic'`);
  assert.doesNotMatch(script, /unsafe-inline|unsafe-eval/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.doesNotMatch(csp, /upgrade-insecure-requests/);
  assert.match(buildCsp(n, { upgradeInsecure: true }), /upgrade-insecure-requests/);
  assert.match(buildCsp(n, { dev: true }), /'strict-dynamic' 'unsafe-eval'/);
});

test("CSP refuses a malformed nonce (header injection)", () => {
  assert.throws(() => buildCsp("abc'; script-src *"));
  assert.throws(() => buildCsp(""));
});

test("CSP img-src: CMS media origins are validated again (https, loopback http incl. [::1]); anything else is dropped", () => {
  const n = makeNonce();
  const img = (o: string) => buildCsp(n, { imgOrigins: [o] }).split("; ").find((d) => d.startsWith("img-src"))!;
  assert.match(img("http://[::1]:3199"), / http:\/\/\[::1\]:3199/);
  assert.match(img("http://localhost:3199"), / http:\/\/localhost:3199/);
  assert.match(img("https://cms.example.org"), / https:\/\/cms\.example\.org/);
  for (const bad of ["http://[fd00::1]:80", "http://cms.example.org", "https://a.example *", "http://[::1]/x"]) assert.doesNotMatch(img(bad), /fd00|cms\.example|\*|\/x/, bad);
});
