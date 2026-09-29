import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, writeFile, utimes } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getRun, listRuns, pipelineStatus, publishRun, pruneSnapshots, runPipeline, type RunReport } from "../../../src/lib/pipeline/index.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { fixtureEnv, json, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
let dir = "";

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "site-data-"));
  const env = fixtureEnv({ SITE_DATA_DIR: dir });
  for (const k of ["DATAPLATFORM_TOKEN", "DATAPLATFORM_USERNAME", "GRAPH_TENANT_ID", "PIPELINE_ALERT_WEBHOOK", "FTSE_INDEX_SEST", "PIPELINE_SCHEDULE"]) delete process.env[k];
  Object.assign(process.env, env);
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
  assert.ok(r.sources.length >= 10 && r.sources.every((s) => s.ok || s.name.includes("ftse")));
  assert.ok(r.publishedAt);
  const snap = await readdir(path.join(dir, "snapshots", r.id));
  assert.deepEqual(snap.sort(), ["raw", "report.json", "site-data.json"]);
  const published = await readJ<SiteData>("published", "site-data.json");
  assert.deepEqual(published, await readJ<SiteData>("snapshots", r.id, "site-data.json"));
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
  assert.deepEqual(await readJ<SiteData>("published", "site-data.json"), await readJ<SiteData>("snapshots", first.id, "site-data.json"));
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

test("a failed source produces issues, not a crash; everything down -> failed, nothing published", async () => {
  const first = await run();
  const aumDown: Route = (u) => (u.pathname === "/api/unitholders/aum" ? json({ detail: "x" }, 500) : undefined);
  const r = await run({ routes: [aumDown], now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "published");
  assert.ok(r.sources.some((s) => s.name === "dataplatform unitholders/aum" && !s.ok && /HTTP 500/.test(s.detail!)));
  assert.ok(r.issues.some((i) => i.key === "funds.monthly-income.aum" && i.level === "warn"));
  const pub = await readJ<SiteData>("published", "site-data.json");
  const prev = await readJ<SiteData>("snapshots", first.id, "site-data.json");
  assert.deepEqual(pub.funds["monthly-income"]!.aum, prev.funds["monthly-income"]!.aum, "AUM carried over");

  process.env.FACTSHEET_DATA_DIR = path.join(dir, "no-such-dir");
  const allDown: Route = () => { throw new TypeError("fetch failed"); };
  const r2 = await run({ routes: [allDown], now: new Date("2026-10-01T14:00:00Z") });
  assert.equal(r2.status, "failed");
  assert.equal(r2.publishedAt, undefined);
  assert.ok(r2.sources.every((s) => !s.ok));
  assert.ok(r2.issues.some((i) => i.key === "run" && /nothing published/.test(i.message)));
  assert.deepEqual(r2.funds, { "monthly-income": "kept-previous", "sustainable-enhanced-bonds": "kept-previous", "multi-strategy": "kept-previous", "global-minimum-volatility": "kept-previous" });
  assert.equal((await readJ<{ runId: string }>("published", "meta.json")).runId, r.id, "published data untouched");
  await assert.rejects(publishRun(r2.id, "a"), /failed/);
});

test("blocked fund: others published (auto), blocked fund keeps previous, alert posted without secrets", async () => {
  const first = await run();
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example.test/services/SECRET-PATH";
  process.env.DATAPLATFORM_PASSWORD = "pw-should-not-leak";
  const posted: string[] = [];
  const bad: Route = (u, init) => {
    if (u.hostname === "hooks.example.test") {
      posted.push(String(init?.body));
      return new Response("ok");
    }
    if (u.pathname === "/api/performance/monthly-net-returns" && u.searchParams.get("short_name") === "SEB") {
      return (async () => {
        const res = await import("../../fixtures/pipeline/mock-fetch.ts");
        const j = res.loadFixture("dataplatform/mnr_SEB.json") as { rows: { month: string; net_return: number }[] };
        j.rows[j.rows.length - 3].net_return = 0.4;
        return json(j);
      })();
    }
    return undefined;
  };
  const r = await run({ routes: [bad], now: new Date("2026-09-30T14:00:00Z") });
  assert.equal(r.status, "blocked");
  assert.ok(r.publishedAt, "other funds published in auto mode");
  assert.equal(r.funds["sustainable-enhanced-bonds"], "kept-previous");
  assert.equal(r.funds["monthly-income"], "updated");
  const pub = await readJ<SiteData>("published", "site-data.json");
  const prev = await readJ<SiteData>("snapshots", first.id, "site-data.json");
  assert.deepEqual(pub.funds["sustainable-enhanced-bonds"], prev.funds["sustainable-enhanced-bonds"]);
  assert.equal(posted.length, 1);
  const msg = JSON.parse(posted[0]) as { text: string };
  assert.match(msg.text, /BLOCKED/);
  assert.match(msg.text, /sustainable-enhanced-bonds: kept-previous/);
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
