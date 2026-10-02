/**
 * The CMS source: time-based reuse, stale-while-revalidate, last good copy on the volume, behaviour when WordPress is
 * down, bad responses never replace good ones, forced revalidation (coalesced, rate-limited).
 */
import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "nymbus-cms-"));
process.env.SITE_DATA_DIR = dir;
after(() => rmSync(dir, { recursive: true, force: true }));

const { createCmsSource, LAST_GOOD, LAST_GOOD_PREV, LAST_GOOD_META, FAIL_BACKOFF_MS, MIN_FETCH_GAP_MS, shrinkProblem } = await import("../../../src/lib/cms/source.ts");
const { loadCmsConfig } = await import("../../../src/lib/cms/config.ts");

const fixture = readFileSync(path.resolve(import.meta.dirname, "../../../e2e/fixtures/wp-site-content.json"), "utf8");
const cfg = loadCmsConfig({ WP_BASE_URL: "http://localhost:3199", CMS_REVALIDATE_SECONDS: "60" }, () => undefined)!;
const lastGoodFile = path.join(dir, ...LAST_GOOD);

const ok = (body = fixture) => new Response(body, { status: 200, headers: { "content-type": "application/json" } });

function harness(handler: () => Response | Promise<Response>) {
  let t = 1_000_000;
  let calls = 0;
  const logs: string[] = [];
  const mode = { fn: handler };
  const src = createCmsSource(cfg, { fetchImpl: async () => { calls++; return mode.fn(); }, now: () => t, log: (m) => logs.push(m) });
  return { src, mode, logs, calls: () => calls, advance: (ms: number) => { t += ms; } };
}
const tick = () => new Promise((r) => setTimeout(r, 20));

beforeEach(() => { rmSync(path.join(dir, "cms"), { recursive: true, force: true }); });

test("first request fetches, validates and stores the last good copy", async () => {
  const h = harness(() => ok());
  const s = await h.src.get();
  assert.equal(s!.origin, "live");
  assert.equal(s!.doc.team.length, 3);
  assert.equal(h.calls(), 1);
  assert.equal(JSON.parse(readFileSync(lastGoodFile, "utf8")).news.length, 4);
});

test("within the TTL nothing is refetched; after it the stale copy is served while ONE refresh runs", async () => {
  const h = harness(() => ok());
  await h.src.get();
  h.advance(30_000);
  await h.src.get();
  assert.equal(h.calls(), 1);
  h.advance(31_000);
  let release: (r: Response) => void = () => undefined;
  h.mode.fn = () => new Promise<Response>((res) => { release = res; });
  const [a, b, c] = await Promise.all([h.src.get(), h.src.get(), h.src.get()]);
  assert.equal(a!.origin, "live");
  assert.equal(a, b);
  assert.equal(b, c);
  assert.equal(h.calls(), 2, "three concurrent stale requests share one refresh");
  release(ok(JSON.stringify({ ...JSON.parse(fixture), news: JSON.parse(fixture).news.slice(1) })));
  await tick();
  assert.equal((await h.src.get())!.doc.news.length, 3, "the refreshed document replaces the stale one");
  assert.equal(JSON.parse(readFileSync(path.join(dir, ...LAST_GOOD_PREV), "utf8")).news.length, 4, "the replaced copy is kept as last-good.prev.json");
});

test("WordPress down on a cold start with an empty volume: null (callers use the static sources)", async () => {
  const h = harness(() => { throw new TypeError("fetch failed"); });
  assert.equal(await h.src.get(), null);
  assert.equal(existsSync(lastGoodFile), false);
  assert.match(h.logs[0], /not used/);
});

test("WordPress down on a cold start: the last good copy on the volume is used and re-validated", async () => {
  const good = harness(() => ok());
  await good.src.get();
  const down = harness(() => new Response("bad gateway", { status: 502 }));
  const s = await down.src.get();
  assert.equal(s!.origin, "last-good");
  assert.equal(s!.doc.news[0].id, "cms-test-launch");
  assert.equal(down.calls(), 1);
  // not retried on every request: backoff
  down.advance(FAIL_BACKOFF_MS - 1000);
  await down.src.get();
  assert.equal(down.calls(), 1);
  // after the backoff and the TTL it tries again; WordPress is back
  down.advance(61_000);
  down.mode.fn = () => ok();
  await down.src.get();
  await tick();
  assert.equal((await down.src.get())!.origin, "live");
});

test("a damaged or hostile last good file is ignored", async () => {
  mkdirSync(path.dirname(lastGoodFile), { recursive: true });
  writeFileSync(lastGoodFile, "{ not json");
  const h = harness(() => new Response("x", { status: 500 }));
  assert.equal(await h.src.get(), null);
  writeFileSync(lastGoodFile, JSON.stringify({ schemaVersion: 7, news: [], team: [] }));
  const h2 = harness(() => new Response("x", { status: 500 }));
  assert.equal(await h2.src.get(), null);
  // images of a file written under another media origin are dropped on read
  writeFileSync(lastGoodFile, fixture);
  writeFileSync(path.join(dir, ...LAST_GOOD_META), JSON.stringify({ at: Date.now() }));
  const other = createCmsSource(loadCmsConfig({ WP_BASE_URL: "https://cms.example.org" }, () => undefined)!, { fetchImpl: async () => new Response("x", { status: 500 }), log: () => undefined });
  const s = await other.get();
  assert.equal(s!.origin, "last-good");
  assert.equal(s!.doc.news[0].image, null);
});

test("a bad response (wrong schema, hostile or oversized) never replaces a good document", async () => {
  const h = harness(() => ok());
  await h.src.get();
  const before = readFileSync(lastGoodFile, "utf8");
  for (const bad of [() => ok(JSON.stringify({ schemaVersion: 2, news: [], team: [] })), () => ok("<html>login</html>"), () => new Response(fixture, { status: 200, headers: { "content-type": "text/html" } })]) {
    h.advance(61_000 + FAIL_BACKOFF_MS);
    h.mode.fn = bad;
    const s = await h.src.get();
    assert.equal(s!.origin, "live");
    assert.equal(s!.doc.team.length, 3, "still the good document");
    await tick();
  }
  assert.equal(readFileSync(lastGoodFile, "utf8"), before);
});

test("the last good file is only rewritten when the document changed", async () => {
  const h = harness(() => ok());
  await h.src.get();
  const m1 = statSync(lastGoodFile).mtimeMs;
  h.advance(61_000);
  await h.src.get();
  await tick();
  assert.equal(statSync(lastGoodFile).mtimeMs, m1);
});

test("revalidate forces a refetch, coalesces concurrent calls and is rate limited", async () => {
  const h = harness(() => ok());
  await h.src.get();
  assert.equal(h.calls(), 1);
  h.advance(MIN_FETCH_GAP_MS + 1);
  const [a, b] = await Promise.all([h.src.revalidate(), h.src.revalidate()]);
  assert.deepEqual(a, { ok: true, origin: "live" });
  assert.deepEqual(b, a);
  assert.equal(h.calls(), 2, "coalesced");
  const c = await h.src.revalidate(); // immediately again
  assert.equal(h.calls(), 2, "rate limited");
  assert.equal(c.origin, "live");
  h.advance(MIN_FETCH_GAP_MS + 1);
  h.mode.fn = () => new Response("down", { status: 500 });
  const d = await h.src.revalidate();
  assert.deepEqual(d, { ok: false, origin: "live" }, "failed refresh keeps the last good copy");
});

test("log lines never contain the content secret", async () => {
  const secretCfg = loadCmsConfig({ WP_BASE_URL: "http://localhost:3199", WP_CONTENT_SECRET: "sekrit-value" }, () => undefined)!;
  const logs: string[] = [];
  const src = createCmsSource(secretCfg, { fetchImpl: async () => { throw new TypeError("fetch failed sekrit-value"); }, log: (m) => logs.push(m) });
  await src.get();
  assert.ok(logs.length > 0);
  assert.ok(logs.every((l) => !l.includes("sekrit-value")));
});

test("inside the back-off with nothing in memory (no volume copy) the source answers null at once, without a request", async () => {
  const h = harness(() => { throw new TypeError("fetch failed"); });
  assert.equal(await h.src.get(), null);
  assert.equal(h.calls(), 1);
  h.advance(FAIL_BACKOFF_MS - 1000);
  assert.equal(await h.src.get(), null);
  assert.equal(h.calls(), 1, "no new request inside the back-off");
  h.advance(2000);
  h.mode.fn = () => ok();
  assert.equal((await h.src.get())!.origin, "live");
});

test("an empty or much smaller document never replaces a non-empty one (memory and volume)", async () => {
  const h = harness(() => ok());
  await h.src.get();
  const before = readFileSync(lastGoodFile, "utf8");
  const f = JSON.parse(fixture);
  const cases: Record<string, unknown> = {
    empty: { ...f, news: [], team: [] },
    "less than half": { ...f, news: f.news.slice(0, 1), team: [] },
    "lost items to validation": { ...f, news: [...f.news.slice(1), { id: "Bad Id!" }] },
  };
  for (const [name, body] of Object.entries(cases)) {
    h.advance(61_000 + FAIL_BACKOFF_MS);
    h.mode.fn = () => ok(JSON.stringify(body));
    await h.src.get();
    await tick();
    const s = await h.src.get();
    assert.equal(s!.doc.news.length, 4, `${name}: old document kept in memory`);
    assert.equal(readFileSync(lastGoodFile, "utf8"), before, `${name}: last-good untouched`);
  }
  assert.ok(h.logs.some((l) => /refused: no item/.test(l)));
  // after a restart (empty memory) the volume copy is the reference too
  const cold = harness(() => ok(JSON.stringify(cases.empty)));
  const s = await cold.src.get();
  assert.equal(s!.origin, "last-good");
  assert.equal(s!.doc.news.length, 4);
  // a first-ever empty document is accepted (nothing to protect): the callers show the static sources
  rmSync(path.join(dir, "cms"), { recursive: true, force: true });
  const first = harness(() => ok(JSON.stringify(cases.empty)));
  assert.equal((await first.src.get())!.doc.news.length, 0);
  assert.equal(shrinkProblem(null, { schemaVersion: 1, news: [], team: [], texts: {} }, 0), null);
});

test("a copy older than maxStale (72 h) is not served: null, the callers use the static sources", async () => {
  const h = harness(() => ok());
  assert.ok(await h.src.get());
  h.mode.fn = () => new Response("down", { status: 500 });
  h.advance(71 * 3_600_000);
  assert.equal((await h.src.get())!.origin, "live", "71 h: still served (stale)");
  await tick();
  h.advance(2 * 3_600_000 + FAIL_BACKOFF_MS);
  assert.equal(await h.src.get(), null, "73 h without a successful fetch");
  h.mode.fn = () => ok();
  h.advance(FAIL_BACKOFF_MS + 1);
  assert.equal((await h.src.get())!.origin, "live", "renewed as soon as WordPress answers");
  // a volume copy with no recorded fetch time is as old as it can be
  const cold = harness(() => new Response("down", { status: 500 }));
  rmSync(path.join(dir, ...LAST_GOOD_META), { force: true });
  cold.advance(100 * 3_600_000);
  assert.equal(await cold.src.get(), null);
});
