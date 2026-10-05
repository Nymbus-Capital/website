import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, rm, writeFile, utimes } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getRun, listRuns, pipelineStatus, publishRun, pruneSnapshots, runPipeline, type RunReport } from "../../../src/lib/pipeline/index.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
let dir = "";

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "site-data-"));
  const env = fixtureEnv({ SITE_DATA_DIR: dir });
  for (const k of ["DATAPLATFORM_TOKEN", "DATAPLATFORM_USERNAME", "GRAPH_TENANT_ID", "PIPELINE_ALERT_WEBHOOK", "FTSE_INDEX_SEST", "PIPELINE_SCHEDULE", "PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH", "GITHUB_TOKEN"]) delete process.env[k];
  Object.assign(process.env, env);
  // most scenarios exercise auto publishing; the default without content is covered separately
  await setMode("auto");
});

// every scenario writes snapshots (raw payloads of every class): never leave them behind in the temp directory
afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
});

const readJ = async <T>(...parts: string[]): Promise<T> => JSON.parse(await readFile(path.join(dir, ...parts), "utf8")) as T;
const setMode = async (mode: "auto" | "review"): Promise<void> => {
  await mkdir(path.join(dir, "content"), { recursive: true });
  await writeFile(path.join(dir, "content", "site-content.json"), JSON.stringify({ version: 1, updatedAt: "x", updatedBy: "x", firm: {}, funds: {}, pipeline: { publishMode: mode } }));
};
async function run(opts: { dryRun?: boolean; routes?: Route[]; now?: Date } = {}): Promise<RunReport> {
  const r = await runPipeline({ trigger: "manual", by: "tester@nymbus.ca", dryRun: opts.dryRun, fetchImpl: mockFetch(...(opts.routes ?? [])).fetch, now: opts.now ?? NOW });
  assert.ok(!("locked" in r));
  return r as RunReport;
}

test("auto mode: run is snapshotted and published; audit and meta written", async () => {
  const r = await run();
  assert.equal(r.status, "published");
  assert.match(r.id, /^[0-9A-Za-z-]+$/);
  assert.equal(r.trigger, "manual");
  assert.equal(r.by, "tester@nymbus.ca");
  assert.deepEqual(r.asOf, { performance: "2026-08-31", nav: "2026-09-28", aum: "2026-09-28", factsheet: "2026-08" });
  assert.deepEqual(r.funds, { "monthly-income": "updated", "sustainable-enhanced-bonds": "updated", "multi-strategy": "updated", "global-minimum-volatility": "updated" });
  assert.ok(r.sources.length >= 10 && r.sources.every((s) => s.ok || s.name.includes("ftse") || s.name.includes(" class ")));
  assert.ok(r.publishedAt);
  const snap = await readdir(path.join(dir, "snapshots", r.id));
  assert.deepEqual(snap.sort(), ["raw", "report.json", "site-data.json"]);
  const published = await readJ<SiteData>("published", "site-data.json");
  const { publishedAt, publishedBy, ...rest } = published;
  assert.deepEqual(rest, await readJ<SiteData>("snapshots", r.id, "site-data.json"));
  assert.equal(published.runId, r.id, "self-describing");
  assert.equal(publishedAt, r.publishedAt);
  assert.equal(publishedBy, "pipeline (manual, tester@nymbus.ca)");
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, r.id);
  const auditLog = await readFile(path.join(dir, "audit", "audit.jsonl"), "utf8");
  assert.match(auditLog, /"action":"pipeline.run"/);
  assert.deepEqual(await readdir(path.join(dir, "locks")), [], "lock released");
  const got = await getRun(r.id);
  assert.equal(got!.report.id, r.id);
  assert.equal(got!.data.mode, "live");
  assert.equal(await getRun("../etc"), null);
  assert.equal(await getRun("nope"), null);
});

test("raw folder: AUM contains fund totals only (no investor-level fields)", async () => {
  const r = await run();
  const rawFiles = await readdir(path.join(dir, "snapshots", r.id, "raw"));
  assert.ok(rawFiles.includes("aum.json"));
  assert.ok(rawFiles.includes("monthly-net-returns_SEST.json"));
  assert.ok(rawFiles.includes("factsheets_bonds_data_2026-08.json"));
  for (const f of ["holdings_SEST.json", "holdings-month-end_SEB.json", "instruments.json", "nav-history_LDM201.json", "nav-history_LDM081.json"]) assert.ok(rawFiles.includes(f), f);
  assert.ok(!rawFiles.some((f) => f.startsWith("distributions_")), "no distributions endpoint on the dataplatform main branch");
  assert.ok(r.sources.some((s) => s.name === "dataplatform nav-timeseries LDM202 (daily history)" && s.ok));
  assert.ok(r.sources.some((s) => s.name === "dataplatform apex/holdings SEST" && s.ok));
  assert.ok(r.sources.some((s) => s.name === "dataplatform instruments (batch + bond universe)" && s.ok));
  const aum = await readFile(path.join(dir, "snapshots", r.id, "raw", "aum.json"), "utf8");
  assert.deepEqual(Object.keys(JSON.parse(aum).data.totals).sort(), ["Multistrat", "OTHER", "SEB", "SEST"]);
  const all = (await Promise.all(rawFiles.map((f) => readFile(path.join(dir, "snapshots", r.id, "raw", f), "utf8")))).join("\n");
  for (const bad of ["investor_no", "shareholder_id", "agent_name", "dealer_name", "SYN-INV", "Synthetic Advisor", "SYN-ACCT"]) assert.ok(!all.includes(bad), `raw contains ${bad}`);
});

test("review mode: run waits, publishRun approves it; rollback to an older run", async () => {
  const first = await run();
  await setMode("review");
  const second = await run({ now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(second.status, "pending-review");
  assert.equal(second.publishedAt, undefined);
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, first.id, "still the first run");
  const approved = await publishRun(second.id, "approver@nymbus.ca");
  assert.equal(approved.status, "published");
  assert.equal(approved.publishedBy, "approver@nymbus.ca");
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, second.id);
  assert.equal((await getRun(second.id))!.report.status, "published");
  // rollback
  const back = await publishRun(first.id, "approver@nymbus.ca");
  assert.equal(back.id, first.id);
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, first.id);
  const pubBack = await readJ<SiteData>("published", "site-data.json");
  assert.equal(pubBack.runId, first.id);
  assert.deepEqual(pubBack.funds, (await readJ<SiteData>("snapshots", first.id, "site-data.json")).funds);
  const auditLog = await readFile(path.join(dir, "audit", "audit.jsonl"), "utf8");
  assert.match(auditLog, /"action":"pipeline.publish"/);
  assert.match(auditLog, /"action":"pipeline.rollback"/);
  await assert.rejects(publishRun("../../x", "a"), /invalid run id/);
  await assert.rejects(publishRun("20260101T000000-deadbeef", "a"), /not found/);
});

test("dry run: stored, never published, cannot be published", async () => {
  const r = await run({ dryRun: true });
  assert.equal(r.status, "dry-run");
  await assert.rejects(readFile(path.join(dir, "published", "site-data.json")), /ENOENT/);
  await assert.rejects(publishRun(r.id, "a"), /dry-run/);
});

test("lock: a concurrent run is refused; a stale lock is taken over", async () => {
  await mkdir(path.join(dir, "locks", "pipeline.lock"), { recursive: true });
  const r = await runPipeline({ trigger: "manual", by: "x", fetchImpl: mockFetch().fetch, now: NOW });
  assert.deepEqual(r, { locked: true });
  assert.equal((await pipelineStatus(NOW)).running, true);
  await assert.rejects(publishRun("20260101T000000-deadbeef", "a"), /in progress/);
  const old = new Date(Date.now() - 31 * 60_000);
  await utimes(path.join(dir, "locks", "pipeline.lock"), old, old);
  assert.equal((await pipelineStatus(NOW)).running, false);
  const r2 = await run();
  assert.equal(r2.status, "published");
});

test("a failed source produces issues and a BLOCKED (not silently published) run; everything down -> failed", async () => {
  const first = await run();
  const posted: string[] = [];
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/x";
  const hook: Route = (u, init) => (u.hostname === "hooks.example.test" ? (posted.push(String(init?.body)), new Response("ok")) : undefined);
  const aumDown: Route = (u) => (u.pathname === "/api/unitholders/aum" ? json({ detail: "x" }, 500) : undefined);
  const r = await run({ routes: [hook, aumDown], now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "blocked", "AUM carried over: needs attention");
  assert.ok(r.publishedAt, "still published in auto mode (other data fresh)");
  assert.ok(r.sources.some((s) => s.name === "dataplatform unitholders/aum" && !s.ok && /HTTP 500/.test(s.detail!)));
  assert.ok(r.issues.some((i) => i.key === "funds.monthly-income" && i.message === "needs attention: aum carried over"));
  assert.equal(posted.length, 1);
  const pub = await readJ<SiteData>("published", "site-data.json");
  const prev = await readJ<SiteData>("snapshots", first.id, "site-data.json");
  assert.deepEqual(pub.funds["monthly-income"]!.aum, prev.funds["monthly-income"]!.aum, "AUM carried over");
  delete process.env.PIPELINE_ALERT_WEBHOOK;

  process.env.FACTSHEET_DATA_DIR = path.join(dir, "no-such-dir");
  const allDown: Route = () => { throw new TypeError("fetch failed"); };
  const r2 = await run({ routes: [allDown], now: new Date("2026-10-01T14:00:00Z") });
  assert.equal(r2.status, "failed");
  assert.equal(r2.publishedAt, undefined);
  assert.ok(r2.sources.filter((s) => s.name !== "analytics fund_returns.json").every((s) => !s.ok));
  assert.ok(r2.issues.some((i) => i.key === "run" && /nothing published/.test(i.message)));
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, r.id, "published data untouched");
  await assert.rejects(publishRun(r2.id, "a"), /failed/);
});

test("H1/H3: with the opt-in factsheet gate a held month is published without alert; stale performance alerts", async () => {
  process.env.PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH = "1";
  const fsDir = path.join(dir, "fs");
  await mkdir(fsDir, { recursive: true });
  for (const f of ["bonds_data_2026-07.json", "factsheet_data_2026-07.json"]) await writeFile(path.join(fsDir, f), await readFile(path.join(FIXTURE_FACTSHEETS_DIR, f)));
  process.env.FACTSHEET_DATA_DIR = fsDir;
  const posted: string[] = [];
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/x";
  const hook: Route = (u, init) => (u.hostname === "hooks.example.test" ? (posted.push(String(init?.body)), new Response("ok")) : undefined);
  // SEB is class H; the July archive publishes class F: not compared (class mismatch, info), July still counts as its factsheet
  const r = await run({ routes: [hook] });
  // performance at 2026-07 (held until the August factsheet), factsheet parts from July: not an alert
  assert.equal(r.asOf.performance, "2026-07-31");
  assert.equal(r.status, "published", JSON.stringify(r.issues.filter((i) => i.level === "error")));
  // no alert (only the non-blocking notice of the synthetic source-defect months, when new)
  assert.ok(posted.every((p) => /attention \(not blocking\)/.test(p) && /PUBLISHED/.test(p)), posted.join("\n"));
  const before = posted.length;
  // two months later nothing moved: stale -> blocked + alert
  const late = await run({ routes: [hook], now: new Date("2026-11-03T14:00:00Z") });
  assert.equal(late.status, "blocked");
  assert.ok(late.issues.some((i) => /stale: performance as of 2026-07 while 2026-10 is closed/.test(i.message)));
  assert.equal(posted.length, before + 1);
  assert.match(posted[posted.length - 1], /BLOCKED/);
  delete process.env.PIPELINE_ALERT_WEBHOOK;
  delete process.env.PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH;
});

test("source defects withholding a month of every class: published (not blocked), one non-blocking notice, posted once", async () => {
  const posted: string[] = [];
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/x";
  const hook: Route = (u, init) => (u.hostname === "hooks.example.test" ? (posted.push(String(init?.body)), new Response("ok")) : undefined);
  // SEB class H's stored return of 2024-03-28 no longer matches the other classes (an inconsistent distribution adjustment)
  const jump: Route = (u) => {
    if (u.pathname !== "/api/performance/nav-timeseries" || u.searchParams.get("fundserv") !== "LDM202") return undefined;
    const j = loadFixture("dataplatform/nav_history_LDM202.json") as { rows: Record<string, unknown>[] };
    return json({ ...j, rows: j.rows.map((x) => (x.date === "2024-03-28" ? { ...x, net_daily_return: (x.net_daily_return as number) - 0.007 } : x)) });
  };
  const r = await run({ routes: [jump, hook] });
  assert.equal(r.status, "published", JSON.stringify(r.issues.filter((x) => x.level === "error")));
  assert.ok(r.advisories?.some((a) => a.fund === "sustainable-enhanced-bonds" && /month\(s\) withheld for every class of the fund .*2024-03 classes disagree .*LDM202 /.test(a.message)));
  assert.ok(r.issues.some((x) => x.level === "warn" && /attention \(not blocking\): month\(s\) withheld for every class of the fund .*2024-03/.test(x.message)));
  assert.equal(posted.length, 1);
  assert.match(posted[0], /attention \(not blocking\) sustainable-enhanced-bonds: month\(s\) withheld for every class/);
  // the same notice on the next run: not posted again
  const r2 = await run({ routes: [jump, hook] });
  assert.equal(r2.status, "published");
  assert.equal(posted.length, 1);
  delete process.env.PIPELINE_ALERT_WEBHOOK;
});

test("M3: a new month no independent source confirms is never auto-published: auto keeps the previous performance and the run waits (pending-review + alert); review mode unchanged", async () => {
  // a first publication with the July archives only (performance as of 2026-07, confirmed by the July factsheets)
  const fsDir = path.join(dir, "fs-m3");
  await mkdir(fsDir, { recursive: true });
  for (const f of ["bonds_data_2026-07.json", "factsheet_data_2026-07.json"]) await writeFile(path.join(fsDir, f), await readFile(path.join(FIXTURE_FACTSHEETS_DIR, f)));
  process.env.FACTSHEET_DATA_DIR = fsDir;
  process.env.PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH = "1";
  const first = await run({ now: new Date("2026-09-29T14:00:00Z") });
  delete process.env.PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH;
  assert.equal(first.status, "published", JSON.stringify(first.issues.filter((x) => x.level === "error")));
  const before = await readJ<SiteData>("published", "site-data.json");
  assert.equal(before.funds["monthly-income"]!.performance!.asOf, "2026-07-31");
  // the August month now comes from the dataplatform alone (no August factsheet, no analytics month)
  const posted: string[] = [];
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/x";
  const hook: Route = (u, init) => (u.hostname === "hooks.example.test" ? (posted.push(String(init?.body)), new Response("ok")) : undefined);
  const r = await run({ routes: [hook] });
  assert.equal(r.status, "pending-review", JSON.stringify(r.issues.filter((x) => x.level === "error")));
  assert.ok(r.reviewNeeded?.includes("monthly-income"), JSON.stringify(r.reviewNeeded));
  assert.ok(r.publishedAt, "the rest of the site is published (auto)");
  const live = await readJ<SiteData>("published", "site-data.json");
  assert.equal(live.funds["monthly-income"]!.performance!.asOf, "2026-07-31", "the unconfirmed August month is not live");
  assert.equal(live.funds["monthly-income"]!.nav!.asOf, "2026-09-28", "NAV still updated");
  assert.ok(live.issues.some((x) => x.key === "funds.monthly-income.performance.review" && /needs review: new month\(s\) 2026-08 confirmed by no source independent of the dataplatform/.test(x.message)));
  const stored = await getRun(r.id);
  assert.equal(stored!.data.funds["monthly-income"]!.performance!.asOf, "2026-08-31", "the run itself holds the new month");
  assert.equal(posted.length, 1);
  assert.match(posted[0], /PENDING-REVIEW.*new month\(s\) of [a-z-, ]*monthly-income[a-z-, ]* confirmed by no independent source/s);
  // an admin publishing the run approves the month
  const approved = await publishRun(r.id, "admin@nymbus.ca");
  assert.equal(approved.status, "published");
  assert.equal((await readJ<SiteData>("published", "site-data.json")).funds["monthly-income"]!.performance!.asOf, "2026-08-31");
  // review mode: unchanged (waits as always, nothing auto-published)
  await setMode("review");
  const rv = await run({ routes: [hook] });
  assert.equal(rv.status, "pending-review");
  assert.equal(rv.publishedAt, undefined);
  delete process.env.PIPELINE_ALERT_WEBHOOK;
});

test("M5: revision of an already published month -> blocked (auto: published + alert; review: waits)", async () => {
  const first = await run();
  await setMode("review");
  const revise: Route = (u) => {
    if (u.pathname !== "/api/performance/monthly-net-returns" || u.searchParams.get("short_name") !== "SEST") return undefined;
    const j = loadFixture("dataplatform/mnr_SEST.json") as { rows: { month: string; status: string; net_return: number | null }[] };
    Object.assign(j.rows.find((x) => x.month === "2026-07-31")!, { status: "ready", net_return: -0.0012 });
    return json(j);
  };
  const r = await run({ routes: [revise], now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "blocked");
  assert.equal(r.publishedAt, undefined, "review mode: waits for approval");
  assert.ok(r.issues.some((i) => /revised month\(s\) already published: 2026-07 -0\.14% → -0\.12%/.test(i.message)));
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, first.id);
  const ok = await publishRun(r.id, "approver@nymbus.ca");
  assert.equal(ok.publishedBy, "approver@nymbus.ca");
});

test("H2: retention never deletes a pinned snapshot", async () => {
  const pinned = "20200101T000000-00000001";
  await mkdir(path.join(dir, "snapshots", pinned), { recursive: true });
  await writeFile(path.join(dir, "snapshots", pinned, "report.json"), JSON.stringify({ id: pinned, status: "published" }));
  await mkdir(path.join(dir, "content"), { recursive: true });
  await writeFile(path.join(dir, "content", "site-content.json"), JSON.stringify({ version: 1, updatedAt: "x", updatedBy: "x", firm: {}, funds: { "multi-strategy": { pinnedSnapshot: pinned } }, pipeline: { publishMode: "auto" } }));
  for (let i = 0; i < 125; i++) {
    const id = `2027${String(i).padStart(4, "0")}T000000-${(0x10000000 + i).toString(16)}`;
    await mkdir(path.join(dir, "snapshots", id), { recursive: true });
  }
  const removed = await pruneSnapshots();
  assert.equal(removed.length, 5);
  assert.ok((await readdir(path.join(dir, "snapshots"))).includes(pinned));
});

test("LOW: lock owner token; a taken-over holder does not delete its successor's lock; published meta tolerant", async () => {
  const { withLock } = await import("../../../src/lib/data/store.ts");
  let inner: unknown = null;
  const outer = await withLock("t", async () => {
    // simulate a takeover: another process replaced the lock with its own token
    await writeFile(path.join(dir, "locks", "t.lock", "owner"), "someone-else");
    inner = await withLock("t", async () => "x");
    return "done";
  });
  assert.equal(outer, "done");
  assert.deepEqual(inner, { locked: true });
  assert.ok((await readdir(path.join(dir, "locks"))).includes("t.lock"), "successor's lock left in place");
  // published site-data.json newer than meta.json (crash between the two writes): the data wins
  const r = await run();
  await writeFile(path.join(dir, "published", "meta.json"), JSON.stringify({ runId: "20000101T000000-aaaaaaaa", publishedAt: "x", publishedBy: "x" }));
  assert.equal((await pipelineStatus(NOW)).publishedRunId, r.id);
});

test("blocked fund: others published (auto), blocked fund keeps previous, alert posted without secrets", async () => {
  const first = await run();
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/services/SECRET-PATH";
  process.env.DATAPLATFORM_PASSWORD = "pw-should-not-leak";
  const posted: string[] = [];
  const hook: Route = (u, init) => (u.hostname === "hooks.example.test" ? (posted.push(String(init?.body)), new Response("ok")) : undefined);
  // GMV: a 40 % month in the published monthly table -> validation gate (±25 %) blocks the fund
  const fsDir = path.join(dir, "fs-gmv");
  await mkdir(fsDir, { recursive: true });
  for (const f of await readdir(FIXTURE_FACTSHEETS_DIR)) await writeFile(path.join(fsDir, f), await readFile(path.join(FIXTURE_FACTSHEETS_DIR, f)));
  const f8 = path.join(fsDir, "factsheet_data_2026-08.json");
  const j = JSON.parse(await readFile(f8, "utf8"));
  j.GMV_6pct["Monthly Returns Gross"]["2020"]["03-Mar"] = "40.0%";
  await writeFile(f8, JSON.stringify(j));
  process.env.FACTSHEET_DATA_DIR = fsDir;
  // SEB: monthly-net-returns restates August to 40 % after publication while the daily NAV chain still gives the
  // published value: two dataplatform views disagree -> August withheld, the published performance kept
  const bad: Route = (u) => {
    if (u.pathname === "/api/performance/monthly-net-returns" && u.searchParams.get("short_name") === "SEB") {
      const m = loadFixture("dataplatform/mnr_SEB.json") as { rows: { month: string; net_return: number | null }[] };
      Object.assign(m.rows[m.rows.length - 1], { net_return: 0.4 });
      return json(m);
    }
    return undefined;
  };
  const r = await run({ routes: [hook, bad], now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "blocked");
  assert.ok(r.publishedAt, "other funds published in auto mode");
  assert.equal(r.funds["global-minimum-volatility"], "updated", "only its performance is held");
  assert.equal(r.funds["monthly-income"], "updated");
  const pub = await readJ<SiteData>("published", "site-data.json");
  const prev = await readJ<SiteData>("snapshots", first.id, "site-data.json");
  assert.deepEqual(pub.funds["global-minimum-volatility"]!.performance, prev.funds["global-minimum-volatility"]!.performance, "previous performance kept");
  assert.deepEqual(pub.funds["global-minimum-volatility"]!.risk, prev.funds["global-minimum-volatility"]!.risk);
  assert.deepEqual(pub.funds["sustainable-enhanced-bonds"]!.performance, prev.funds["sustainable-enhanced-bonds"]!.performance, "the published performance kept, never the contradicted number");
  assert.ok(r.issues.some((i) => i.level === "error" && /2026-08: daily NAV chain .* vs monthly-net-returns 40\.0000%: two dataplatform views of the same days disagree/.test(i.message)));
  assert.ok(pub.funds["sustainable-enhanced-bonds"]!.nav, "other SEB parts still published");
  assert.equal(posted.length, 1);
  const msg = JSON.parse(posted[0]) as { text: string };
  assert.match(msg.text, /BLOCKED/);
  assert.match(msg.text, /global-minimum-volatility: updated/);
  assert.ok(!posted[0].includes("pw-should-not-leak") && !posted[0].includes("SECRET-PATH"));
  delete process.env.DATAPLATFORM_PASSWORD;
});

test("listRuns newest first; retention keeps 120 and never the published run", async () => {
  const first = await run();
  // fabricate 125 older + newer snapshots
  for (let i = 0; i < 125; i++) {
    const id = `2027${String(i).padStart(4, "0")}T000000-${(0x10000000 + i).toString(16)}`;
    await mkdir(path.join(dir, "snapshots", id), { recursive: true });
    await writeFile(path.join(dir, "snapshots", id, "report.json"), JSON.stringify({ id, status: "dry-run" }));
  }
  const removed = await pruneSnapshots();
  const left = await readdir(path.join(dir, "snapshots"));
  assert.ok(left.includes(first.id), "published run kept although it is the oldest");
  assert.equal(left.length, 121);
  assert.equal(removed.length, 5);
  const runs = await listRuns(3);
  assert.equal(runs.length, 3);
  assert.ok(runs[0].id > runs[1].id && runs[1].id > runs[2].id);
});

test("pipelineStatus: schedule, timezone, next run, last run, published run", async () => {
  const empty = await pipelineStatus(NOW);
  assert.deepEqual({ ...empty, nextRunAt: null }, { running: false, schedule: ["06:45", "12:45", "18:45"], timezone: "America/Toronto", nextRunAt: null, lastRun: null, publishedRunId: null });
  assert.equal(empty.nextRunAt, "2026-09-29T16:45:00.000Z", "12:45 EDT");
  const r = await run();
  const st = await pipelineStatus(NOW);
  assert.equal(st.lastRun!.id, r.id);
  assert.equal(st.publishedRunId, r.id);
  process.env.PIPELINE_SCHEDULE = "off";
  const off = await pipelineStatus(NOW);
  assert.deepEqual(off.schedule, []);
  assert.equal(off.nextRunAt, null);
});

test("N2/N4 end to end: bad NAV without a daily return, or analytics down -> run blocked and alerted", async () => {
  const posted: string[] = [];
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/x";
  const hook: Route = (u, init) => (u.hostname === "hooks.example.test" ? (posted.push(String(init?.body)), new Response("ok")) : undefined);
  const badNav: Route = (url) => {
    if (url.pathname !== "/api/performance/nav-timeseries" || url.searchParams.get("short_name") !== "SEST") return undefined;
    const j = loadFixture("dataplatform/nav_SEST.json") as { rows: Record<string, unknown>[] };
    for (const r of j.rows) if (r.fundserv === "LDM001" && r.date === "2026-09-28") Object.assign(r, { nav_per_share_local: 101.905, net_return_method: "nav_price_ratio", net_daily_return: null });
    return json(j);
  };
  const r = await run({ routes: [hook, badNav] });
  assert.equal(r.status, "blocked");
  const pub = await readJ<SiteData>("published", "site-data.json");
  assert.equal(pub.funds["monthly-income"]!.nav!.classes.find((c) => c.fundserv === "LDM001"), undefined, "class dropped (nothing published before)");
  process.env.ANALYTICS_RETURNS_FILE = path.join(dir, "missing.json");
  const r2 = await run({ routes: [hook], now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r2.status, "blocked");
  assert.ok(r2.issues.some((i) => /needs attention: analytics history unavailable/.test(i.message)));
  assert.equal(posted.length, 2);
  delete process.env.PIPELINE_ALERT_WEBHOOK;
});

test("N6: stale-lock takeover renames the stale dir atomically; concurrent takeovers yield exactly one holder", async () => {
  const { withLock } = await import("../../../src/lib/data/store.ts");
  const lockDir = path.join(dir, "locks", "race.lock");
  await mkdir(lockDir, { recursive: true });
  await writeFile(path.join(lockDir, "owner"), "crashed");
  const old = new Date(Date.now() - 31 * 60_000);
  await utimes(path.join(lockDir, "owner"), old, old);
  await utimes(lockDir, old, old);
  let inside = 0;
  let maxInside = 0;
  const attempt = () => withLock("race", async () => {
    inside++;
    maxInside = Math.max(maxInside, inside);
    await new Promise((res) => setTimeout(res, 30));
    inside--;
    return "ran";
  });
  // contenders start staggered, so some see the stale lock while another has already taken it over
  const results = await Promise.all(Array.from({ length: 24 }, (_, i) => new Promise((res) => setTimeout(res, i % 6)).then(attempt)));
  assert.equal(maxInside, 1, "never two holders at once");
  assert.ok(results.filter((x) => x === "ran").length >= 1);
  const left = await readdir(path.join(dir, "locks"));
  assert.ok(!left.some((f) => f.includes(".stale-")), `no stale leftovers: ${left}`);
});

test("without admin content, runs wait for approval (review is the default)", async () => {
  const { rm } = await import("node:fs/promises");
  await rm(path.join(dir, "content"), { recursive: true, force: true });
  const r = await run();
  assert.equal(r.status === "pending-review" || (r.status === "blocked" && !r.publishedAt), true, `status ${r.status}`);
  await assert.rejects(readFile(path.join(dir, "published", "site-data.json"), "utf8"));
});

test("class change (SEB F -> H): never published without an admin, even in auto mode; publishing the run approves it", async () => {
  await run(); // SEB class H, published (auto)
  // a publication whose SEB headline was class F (as the unmerged dataplatform PR #626 would have made it)
  const pub = await readJ<SiteData>("published", "site-data.json");
  Object.assign(pub.funds["sustainable-enhanced-bonds"]!.performance!, { classCode: "STRATEGY", returnClass: "F", returnClassLabel: "Series F" });
  await writeFile(path.join(dir, "published", "site-data.json"), JSON.stringify(pub));
  const r = await run({ now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "blocked");
  assert.deepEqual(r.classChanges, ["sustainable-enhanced-bonds"]);
  assert.ok(r.publishedAt, "auto mode: the run went live for the other funds");
  assert.ok(r.issues.some((i) => i.key === "funds.sustainable-enhanced-bonds.performance.class" && /class change from class F \(STRATEGY\) to class H \(STRATEGY_H\).*an admin must approve/.test(i.message)));
  const live = await readJ<SiteData>("published", "site-data.json");
  assert.equal(live.runId, r.id);
  assert.equal(live.funds["sustainable-enhanced-bonds"]!.performance!.classCode, "STRATEGY", "the class change is not live");
  assert.match(live.provenance["funds.sustainable-enhanced-bonds.performance"], /^carried over from the publication of/);
  assert.equal(live.funds["monthly-income"]!.performance!.asOf, "2026-08-31", "other funds updated");
  // the stored run holds the change (what an approval publishes)
  assert.equal((await readJ<SiteData>("snapshots", r.id, "site-data.json")).funds["sustainable-enhanced-bonds"]!.performance!.classCode, "STRATEGY_H");
  // a later run without approval still holds it back
  const again = await run({ now: new Date("2026-09-30T18:00:00Z") });
  assert.deepEqual(again.classChanges, ["sustainable-enhanced-bonds"]);
  assert.equal((await readJ<SiteData>("published", "site-data.json")).funds["sustainable-enhanced-bonds"]!.performance!.returnClass, "F");
  // approval: an admin publishes the run
  const ok = await publishRun(again.id, "approver@nymbus.ca");
  assert.equal(ok.classChangesApprovedBy, "approver@nymbus.ca");
  assert.equal((await readJ<SiteData>("published", "site-data.json")).funds["sustainable-enhanced-bonds"]!.performance!.returnClass, "H");
  // from then on class H is the published class: no change, published normally
  const next = await run({ now: new Date("2026-09-30T20:00:00Z") });
  assert.equal(next.classChanges, undefined);
  assert.equal(next.status, "published", JSON.stringify(next.issues.filter((i) => i.level === "error")));
});

test("many classes published for the first time at once: held in auto mode until an admin approves them all in one go", async () => {
  await run(); // every class published (auto, nothing before)
  // the publication made before every register class had returns: headline + class F only, no class notices
  const pub = await readJ<SiteData>("published", "site-data.json");
  for (const key of ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"] as const) {
    const f = pub.funds[key]!;
    const keep = new Set([f.defaultClass, ...Object.values(f.performanceByClass!).filter((c) => c.performance.classCode === f.performance!.classCode).map((c) => c.fundserv)]);
    f.performanceByClass = Object.fromEntries(Object.entries(f.performanceByClass!).filter(([k]) => keep.has(k)));
    delete f.classInfo;
  }
  await writeFile(path.join(dir, "published", "site-data.json"), JSON.stringify(pub));
  const r = await run({ now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "blocked");
  assert.deepEqual([...r.classChanges!].sort(), ["monthly-income", "multi-strategy", "sustainable-enhanced-bonds"]);
  const msg = r.issues.find((i) => i.key === "funds.sustainable-enhanced-bonds.performance.class")!.message;
  assert.match(msg, /2 classes published for the first time: I \(LDM203\), J \(LDM204\).*an admin must approve/);
  assert.match(r.issues.find((i) => i.key === "funds.monthly-income.performance.class")!.message, /2 classes published for the first time: I \(LDM031\), J \(LDM061\)/);
  const live = await readJ<SiteData>("published", "site-data.json");
  assert.equal(live.funds["sustainable-enhanced-bonds"]!.performanceByClass!.LDM203, undefined, "not live before the approval");
  // one approval publishes every new class of every fund
  const ok = await publishRun(r.id, "approver@nymbus.ca");
  assert.equal(ok.classChangesApprovedBy, "approver@nymbus.ca");
  const after = await readJ<SiteData>("published", "site-data.json");
  assert.ok(after.funds["sustainable-enhanced-bonds"]!.performanceByClass!.LDM203 && after.funds["monthly-income"]!.performanceByClass!.LDM061 && after.funds["multi-strategy"]!.performanceByClass!.LDM304);
  assert.equal(after.funds["monthly-income"]!.classInfo!.LDM021.status, "young");
  const next = await run({ now: new Date("2026-09-30T20:00:00Z") });
  assert.equal(next.classChanges, undefined);
});
