/**
 * CMS settings from the environment, and the fetch client (fixed endpoint, no redirects, secret header, timeout,
 * size cap, content type, validation).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cmsImageOrigin, loadCmsConfig, ENDPOINT_PATH } from "../../../src/lib/cms/config.ts";
import { fetchCmsDocument, MAX_BYTES, CmsFetchError } from "../../../src/lib/cms/client.ts";
import { CmsInvalidError } from "../../../src/lib/cms/validate.ts";

const fixtureText = readFileSync(resolve(import.meta.dirname, "../../../e2e/fixtures/wp-site-content.json"), "utf8");
const quiet = () => undefined;

test("no WP_BASE_URL (unset, empty, blank) disables the CMS", () => {
  for (const env of [{}, { WP_BASE_URL: "" }, { WP_BASE_URL: "   " }]) assert.equal(loadCmsConfig(env, quiet), null);
  assert.equal(cmsImageOrigin({}), null);
});

test("invalid base URLs disable the CMS (and say why)", () => {
  const msgs: string[] = [];
  for (const v of ["not a url", "ftp://cms.example.org", "http://cms.example.org", "https://user:pw@cms.example.org", "https://cms.example.org/?x=1", "https://cms.example.org/#f", "javascript:alert(1)"]) {
    assert.equal(loadCmsConfig({ WP_BASE_URL: v }, (m) => msgs.push(m)), null, v);
  }
  assert.equal(msgs.length, 7);
});

test("https base: endpoint built from the base, media origin = base origin, secrets and ttl read", () => {
  const c = loadCmsConfig({ WP_BASE_URL: "https://cms.example.org/", WP_CONTENT_SECRET: " s1 ", WP_REVALIDATE_SECRET: "s2", CMS_REVALIDATE_SECONDS: "120" }, quiet)!;
  assert.equal(c.baseUrl, "https://cms.example.org");
  assert.equal(c.endpoint, `https://cms.example.org${ENDPOINT_PATH}`);
  assert.equal(c.mediaOrigin, "https://cms.example.org");
  assert.equal(c.contentSecret, "s1");
  assert.equal(c.revalidateSecret, "s2");
  assert.equal(c.ttlMs, 120_000);
  assert.equal(c.allowLoopbackHttp, false);
  assert.equal(cmsImageOrigin({ WP_BASE_URL: "https://cms.example.org" }), "https://cms.example.org");
});

test("a path prefix is kept; ttl is clamped and defaults to 60 s", () => {
  assert.equal(loadCmsConfig({ WP_BASE_URL: "https://example.org/blog/" }, quiet)!.endpoint, `https://example.org/blog${ENDPOINT_PATH}`);
  assert.equal(loadCmsConfig({ WP_BASE_URL: "https://example.org", CMS_REVALIDATE_SECONDS: "1" }, quiet)!.ttlMs, 5000);
  assert.equal(loadCmsConfig({ WP_BASE_URL: "https://example.org", CMS_REVALIDATE_SECONDS: "999999" }, quiet)!.ttlMs, 3_600_000);
  assert.equal(loadCmsConfig({ WP_BASE_URL: "https://example.org", CMS_REVALIDATE_SECONDS: "abc" }, quiet)!.ttlMs, 60_000);
});

test("http is allowed for loopback and single-label private hosts only; images then need an explicit https media origin", () => {
  const dev = loadCmsConfig({ WP_BASE_URL: "http://localhost:8080" }, quiet)!;
  assert.equal(dev.mediaOrigin, "http://localhost:8080");
  assert.equal(dev.allowLoopbackHttp, true);
  const internal = loadCmsConfig({ WP_BASE_URL: "http://wordpress:80" }, quiet)!;
  assert.equal(internal.endpoint, `http://wordpress${ENDPOINT_PATH}`, "the default port is dropped by URL normalisation");
  assert.equal(internal.mediaOrigin, null, "an internal host is not reachable by browsers: no images unless WP_MEDIA_ORIGIN");
  const withMedia = loadCmsConfig({ WP_BASE_URL: "http://wordpress:80", WP_MEDIA_ORIGIN: "https://media.example.org" }, quiet)!;
  assert.equal(withMedia.mediaOrigin, "https://media.example.org");
  assert.equal(cmsImageOrigin({ WP_BASE_URL: "http://wordpress:80", WP_MEDIA_ORIGIN: "https://media.example.org" }), "https://media.example.org");
});

test("a bad media origin disables images but not the CMS", () => {
  for (const v of ["http://media.example.org", "https://media.example.org/uploads", "nonsense"]) {
    const c = loadCmsConfig({ WP_BASE_URL: "https://cms.example.org", WP_MEDIA_ORIGIN: v }, quiet)!;
    assert.equal(c.mediaOrigin, null, v);
  }
});

const cfg = loadCmsConfig({ WP_BASE_URL: "http://localhost:3199", WP_CONTENT_SECRET: "topsecret" }, quiet)!;
const json = (body: string, init: ResponseInit = {}) => new Response(body, { status: 200, headers: { "content-type": "application/json; charset=UTF-8" }, ...init });

test("client: fixed endpoint, secret header, no redirects, no cache, timeout signal", async () => {
  let seen: { url: string; init: RequestInit } | null = null;
  const r = await fetchCmsDocument(cfg, async (url, init) => { seen = { url, init }; return json(fixtureText); });
  assert.equal(r.doc.news.length, 4);
  assert.equal(seen!.url, `http://localhost:3199${ENDPOINT_PATH}`);
  assert.equal(seen!.init.redirect, "error");
  assert.equal(seen!.init.cache, "no-store");
  assert.equal((seen!.init.headers as Record<string, string>)["x-nymbus-content-secret"], "topsecret");
  assert.ok(seen!.init.signal instanceof AbortSignal);
});

test("client: no secret header when none is configured", async () => {
  const c = { ...cfg, contentSecret: null };
  let headers: Record<string, string> = {};
  await fetchCmsDocument(c, async (_u, init) => { headers = init.headers as Record<string, string>; return json(fixtureText); });
  assert.equal("x-nymbus-content-secret" in headers, false);
});

test("client: transport errors, HTTP errors, wrong type, invalid JSON, oversize and wrong schema all throw", async () => {
  await assert.rejects(fetchCmsDocument(cfg, async () => { throw new TypeError("fetch failed: secret topsecret"); }), (e: unknown) => e instanceof CmsFetchError && !String(e.message).includes("topsecret"));
  await assert.rejects(fetchCmsDocument(cfg, async () => { throw Object.assign(new Error("x"), { name: "TimeoutError" }); }), /timeout/);
  await assert.rejects(fetchCmsDocument(cfg, async () => json("{}", { status: 503 })), /HTTP 503/);
  await assert.rejects(fetchCmsDocument(cfg, async () => new Response(fixtureText, { status: 200, headers: { "content-type": "text/html" } })), /content type/);
  await assert.rejects(fetchCmsDocument(cfg, async () => json("{not json")), /invalid JSON/);
  await assert.rejects(fetchCmsDocument(cfg, async () => json(JSON.stringify({ schemaVersion: 9, news: [], team: [] }))), CmsInvalidError);
  await assert.rejects(fetchCmsDocument(cfg, async () => json("x".repeat(MAX_BYTES + 10))), /too large/);
  await assert.rejects(fetchCmsDocument(cfg, async () => json("{}", { headers: { "content-type": "application/json", "content-length": String(MAX_BYTES + 1) } })), /too large/);
});

test("client: a real redirect is refused by fetch itself (redirect: error)", async () => {
  const { createServer } = await import("node:http");
  const srv = createServer((_req, res) => { res.writeHead(302, { location: "http://127.0.0.1:1/elsewhere" }); res.end(); });
  await new Promise<void>((r) => srv.listen(0, "127.0.0.1", r));
  const port = (srv.address() as { port: number }).port;
  try {
    const c = loadCmsConfig({ WP_BASE_URL: `http://127.0.0.1:${port}` }, quiet)!;
    await assert.rejects(fetchCmsDocument(c), CmsFetchError);
  } finally {
    srv.close();
  }
});
