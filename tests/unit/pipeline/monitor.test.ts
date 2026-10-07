import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { oldestNavDate, publicStatus, runMonitor, siteStatus } from "../../../src/lib/pipeline/monitor.ts";
import { ALERT_DELIVERY, readAlertState } from "../../../src/lib/pipeline/alerts.ts";

let dir = "";
const saved = ALERT_DELIVERY.delays;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "monitor-"));
  process.env.SITE_DATA_DIR = dir;
  ALERT_DELIVERY.delays = [0];
});
afterEach(async () => {
  ALERT_DELIVERY.delays = saved;
  await rm(dir, { recursive: true, force: true });
});

const put = async (rel: string[], v: unknown): Promise<void> => {
  await mkdir(path.join(dir, ...rel.slice(0, -1)), { recursive: true });
  await writeFile(path.join(dir, ...rel), JSON.stringify(v));
};

const fund = (perf: string | null, nav: string | null) => ({
  performance: perf ? { asOf: perf } : null,
  nav: nav ? { asOf: nav, classes: [] } : null,
});

async function publish(at: string, o: { perf?: string; nav?: string } = {}): Promise<void> {
  const perf = o.perf ?? "2026-08-31";
  const nav = o.nav ?? "2026-10-06";
  await put(["published", "site-data.json"], {
    schemaVersion: 1,
    generatedAt: at,
    mode: "live",
    runId: "r1",
    publishedAt: at,
    publishedBy: "pipeline",
    asOf: { performance: perf, nav, aum: null, factsheet: null },
    provenance: {},
    issues: [{ key: "secret.issue", level: "error", message: "http://internal-host:8000 failed" }],
    funds: {
      "monthly-income": fund(perf, nav),
      "sustainable-enhanced-bonds": fund(perf, nav),
      "multi-strategy": fund(perf, nav),
      "global-minimum-volatility": fund(perf, null),
    },
  });
  await put(["published", "meta.json"], { runId: "r1", publishedAt: at, publishedBy: "pipeline" });
  await put(["snapshots", "20261006T224500-aaaaaaaa", "report.json"], {
    id: "20261006T224500-aaaaaaaa",
    trigger: "schedule",
    by: "scheduler",
    startedAt: "2026-10-06T22:45:00Z",
    finishedAt: "2026-10-06T22:46:00Z",
    status: "published",
    issues: [{ key: "x", level: "error", message: "http://internal-host" }],
    sources: [{ name: "dataplatform", ok: false, detail: "http://internal-host" }],
    funds: {},
  });
}

const NOW = new Date("2026-10-07T14:00:00Z");

test("status: fresh data → ok; the public projection holds only publication time, verdict and as-of dates", async () => {
  await publish("2026-10-06T22:46:00Z");
  const s = await siteStatus(NOW, { PIPELINE_SCHEDULE: "06:45,12:45,18:45" });
  assert.equal(s.ok, true, s.reasons.join("; "));
  assert.equal(s.lastRun!.status, "published", "the ops view has the run");
  assert.equal(s.funds["global-minimum-volatility"].navLagBusinessDays, null, "managed accounts: no NAV expected");
  assert.deepEqual(s.scheduler.schedule, ["06:45", "12:45", "18:45"]);
  const p = publicStatus(s);
  assert.deepEqual(Object.keys(p).sort(), ["checkedAt", "funds", "lastPublishAt", "ok", "stale", "verdict"]);
  assert.equal(p.lastPublishAt, "2026-10-06T22:46:00Z");
  assert.deepEqual(p.funds["monthly-income"], { performanceAsOf: "2026-08-31", navAsOf: "2026-10-06", verdict: "ok" });
  assert.deepEqual(
    p.funds["global-minimum-volatility"],
    { performanceAsOf: "2026-08-31", verdict: "ok" },
    "no NAV field for a strategy",
  );
  const body = JSON.stringify(p);
  for (const leak of [
    "internal-host",
    "secret.issue",
    "dataplatform",
    "http",
    'published"',
    "blocked",
    "pending",
    "schedule",
    "running",
    "retry",
  ])
    assert.ok(!body.includes(leak), leak);
});

test("status: old NAV → stale (no publication-age rule); hidden fund / hidden blocks not reported nor checked; no data → stale", async () => {
  await publish("2026-10-01T22:46:00Z", { nav: "2026-09-29" });
  await put(["content", "site-content.json"], {
    funds: {
      "multi-strategy": { hidden: true },
      "sustainable-enhanced-bonds": { hide: { nav: true, performance: true } },
    },
  });
  const s = await siteStatus(NOW, {});
  assert.equal(s.ok, false);
  assert.deepEqual(s.stale, ["monthly-income:nav"]);
  assert.equal(s.funds["multi-strategy"], undefined);
  assert.equal(s.funds["sustainable-enhanced-bonds"].verdict, "ok");
  assert.deepEqual(
    publicStatus(s).funds["sustainable-enhanced-bonds"],
    { verdict: "ok" },
    "hidden blocks left out of the public payload",
  );
  await rm(path.join(dir, "published"), { recursive: true, force: true });
  await rm(path.join(dir, "content"), { recursive: true, force: true });
  const none = await siteStatus(NOW, {});
  assert.equal(none.ok, false);
  assert.ok(none.stale.includes("monthly-income:performance"));
  assert.equal(none.lastPublishAt, null);
});

test("NAV freshness uses the fund's oldest class with a NAV", () => {
  assert.equal(
    oldestNavDate({
      asOf: "2026-10-06",
      classes: [
        { nav: 10, date: "2026-10-06" },
        { nav: 11, date: "2026-09-25" },
        { nav: null, date: "2026-01-01" },
      ],
    } as never),
    "2026-09-25",
  );
  assert.equal(oldestNavDate({ asOf: "2026-10-06", classes: [] } as never), "2026-10-06");
  assert.equal(oldestNavDate(null), null);
});

test("stale-data alert: posted when it turns stale, not again, reminded daily, re-posted when what is stale changes, resolved once", async () => {
  const posted: { title: string; lines: string[] }[] = [];
  const fetchImpl = (async (_u: string | URL | Request, init?: RequestInit) => (
    posted.push(JSON.parse(String(init?.body))),
    new Response("", { status: 200 })
  )) as typeof fetch;
  const env = { PIPELINE_ALERT_WEBHOOK: "https://hooks.example.test/x", PUBLIC_URL: "https://www.example.test" };
  await publish("2026-10-06T22:46:00Z", { nav: "2026-09-29" });
  const at = (h: number): Date => new Date(NOW.getTime() + h * 3_600_000);
  await runMonitor({ fetchImpl, env, now: at(0) });
  assert.equal(posted.length, 1);
  assert.match(posted[0].title, /public fund data is STALE/);
  assert.ok(posted[0].lines.some((l) => /NAV as of 2026-09-29/.test(l)));
  assert.ok(posted[0].lines.some((l) => /What to do: open \/admin\/runs/.test(l)));
  assert.ok(
    posted[0].lines.some((l) => l === "Admin: https://www.example.test/admin/runs") ||
      JSON.stringify(posted[0]).includes("https://www.example.test/admin/runs"),
  );
  await runMonitor({ fetchImpl, env, now: at(0.5) });
  await runMonitor({ fetchImpl, env, now: at(12) });
  assert.equal(posted.length, 1, "deduped");
  // still published on schedule (so only the NAV is stale), a day later: one reminder
  await publish("2026-10-08T10:46:00Z", { nav: "2026-09-29" });
  await runMonitor({ fetchImpl, env, now: at(24) });
  assert.equal(posted.length, 2);
  assert.match(posted[1].title, /^\[www\.example\.test\] Reminder \(daily, since 2026-10-07 14:00 UTC\)/);
  // another fund turns stale: what is stale changed → posted
  await publish("2026-10-08T10:46:00Z", { nav: "2026-09-29", perf: "2026-07-31" });
  await runMonitor({ fetchImpl, env, now: at(25) });
  assert.equal(posted.length, 3);
  assert.ok(posted[2].lines[0].startsWith("What is stale changed"));
  // fresh again → resolved once
  await publish("2026-10-08T22:46:00Z", { nav: "2026-10-08" });
  await runMonitor({ fetchImpl, env, now: at(34) });
  await runMonitor({ fetchImpl, env, now: at(35) });
  assert.equal(posted.length, 4);
  assert.match(posted[3].title, /Resolved: .*fresh again/);
  assert.deepEqual((await readAlertState()).open, {});
});
