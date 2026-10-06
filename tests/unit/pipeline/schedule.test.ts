import { test } from "node:test";
import assert from "node:assert/strict";
import { catchUpDue, nextRun, parseSchedule, previousRun, retryWanted, schedulerState, startScheduler, stopScheduler, zonedToUtc } from "../../../src/lib/pipeline/schedule.ts";
import type { RunReport } from "../../../src/lib/pipeline/run.ts";

const DEF = parseSchedule(undefined);
const iso = (d: Date | null): string | null => (d ? d.toISOString() : null);

test("parseSchedule", () => {
  assert.deepEqual(DEF, [{ h: 6, m: 45 }, { h: 12, m: 45 }, { h: 18, m: 45 }]);
  assert.deepEqual(parseSchedule("18:00, 6:05,18:00"), [{ h: 6, m: 5 }, { h: 18, m: 0 }]);
  assert.deepEqual(parseSchedule("off"), []);
  assert.deepEqual(parseSchedule("OFF"), []);
  assert.throws(() => parseSchedule("25:00"), /invalid/);
  assert.throws(() => parseSchedule("noon"), /invalid/);
});

test("next run in EDT (UTC-4) and EST (UTC-5)", () => {
  assert.equal(iso(nextRun(new Date("2026-07-15T10:00:00Z"), DEF)), "2026-07-15T10:45:00.000Z"); // 06:00 EDT -> 06:45 EDT
  assert.equal(iso(nextRun(new Date("2026-07-15T10:45:00Z"), DEF)), "2026-07-15T16:45:00.000Z", "strictly after now");
  assert.equal(iso(nextRun(new Date("2026-07-15T23:00:00Z"), DEF)), "2026-07-16T10:45:00.000Z", "after 18:45 -> next morning");
  assert.equal(iso(nextRun(new Date("2026-01-15T12:00:00Z"), DEF)), "2026-01-15T17:45:00.000Z"); // 07:00 EST -> 12:45 EST
  assert.equal(iso(nextRun(new Date("2026-12-31T23:50:00Z"), DEF)), "2027-01-01T11:45:00.000Z", "year boundary");
  assert.equal(nextRun(new Date(), []), null);
});

test("across DST: spring forward (2026-03-08) and fall back (2026-11-01)", () => {
  // Saturday evening EST -> Sunday 06:45 is EDT
  assert.equal(iso(nextRun(new Date("2026-03-08T00:00:00Z"), DEF)), "2026-03-08T10:45:00.000Z");
  // Saturday 18:45 EST before the change
  assert.equal(iso(nextRun(new Date("2026-03-07T20:00:00Z"), DEF)), "2026-03-07T23:45:00.000Z");
  // Sunday 06:45 after fall back is EST
  assert.equal(iso(nextRun(new Date("2026-11-01T02:00:00Z"), DEF)), "2026-11-01T11:45:00.000Z");
  // Saturday 18:45 is still EDT
  assert.equal(iso(nextRun(new Date("2026-10-31T20:00:00Z"), DEF)), "2026-10-31T22:45:00.000Z");
  // a time inside the spring-forward gap (02:30 does not exist) runs right after the gap, once
  const gap = parseSchedule("02:30");
  assert.equal(iso(nextRun(new Date("2026-03-08T05:00:00Z"), gap)), "2026-03-08T07:30:00.000Z");
  assert.equal(iso(nextRun(new Date("2026-03-08T07:30:00Z"), gap)), "2026-03-09T06:30:00.000Z");
  // an ambiguous time (01:30 happens twice) runs once, at its first occurrence (EDT)
  const amb = parseSchedule("01:30");
  assert.equal(iso(nextRun(new Date("2026-11-01T04:00:00Z"), amb)), "2026-11-01T05:30:00.000Z");
  assert.equal(iso(nextRun(new Date("2026-11-01T05:30:00Z"), amb)), "2026-11-02T06:30:00.000Z");
  assert.equal(iso(zonedToUtc(2026, 6, 1, 0, 0, "America/Toronto")), "2026-06-01T04:00:00.000Z");
});

test("scheduler starts once (hot-reload guard) and honours off", () => {
  const logs: string[] = [];
  stopScheduler();
  assert.equal(startScheduler({ schedule: "off", log: (m) => logs.push(m) }), null);
  const a = startScheduler({ schedule: "06:45", log: (m) => logs.push(m) });
  const b = startScheduler({ schedule: "07:00", log: (m) => logs.push(m) });
  assert.ok(a && a === b, "second start returns the running scheduler");
  assert.equal(schedulerState()!.times.length, 1);
  assert.ok(schedulerState()!.next);
  assert.ok(logs.some((l) => l.includes("scheduler started")));
  assert.equal(startScheduler({ schedule: "bad", log: () => undefined }), a, "already started");
  stopScheduler();
  assert.equal(schedulerState(), undefined);
  assert.equal(startScheduler({ schedule: "bad", log: (m) => logs.push(m) }), null);
  assert.ok(logs.some((l) => l.includes("not started")));
});

/* ------------------------------------------------------------------ catch-up, retry */

test("previousRun: latest slot at or before now, DST-aware", () => {
  assert.equal(iso(previousRun(new Date("2026-07-15T17:00:00Z"), DEF)), "2026-07-15T16:45:00.000Z");
  assert.equal(iso(previousRun(new Date("2026-07-15T16:45:00Z"), DEF)), "2026-07-15T16:45:00.000Z", "at the slot");
  assert.equal(iso(previousRun(new Date("2026-07-15T06:00:00Z"), DEF)), "2026-07-14T22:45:00.000Z", "night: yesterday 18:45 EDT");
  assert.equal(iso(previousRun(new Date("2026-11-02T12:00:00Z"), DEF)), "2026-11-02T11:45:00.000Z", "EST after fall back");
  assert.equal(previousRun(new Date(), []), null);
});

test("catch-up on start: only when a slot was missed since the last run, nothing runs, and the next slot is not close", () => {
  const at = (s: string) => new Date(s);
  const base = { times: DEF, running: false };
  // 06:45 run done, redeploy across the 12:45 slot, boot at 13:10 EDT
  assert.equal(catchUpDue({ ...base, now: at("2026-07-15T17:10:00Z"), lastStartedAt: "2026-07-15T10:45:02Z" }), true);
  // the brief's case: the last run started more than 7 h ago and a slot passed
  assert.equal(catchUpDue({ ...base, now: at("2026-07-15T21:00:00Z"), lastStartedAt: "2026-07-15T10:45:02Z" }), true);
  // night restart after the 18:45 run: no slot missed, no run at 02:00
  assert.equal(catchUpDue({ ...base, now: at("2026-07-16T06:00:00Z"), lastStartedAt: "2026-07-15T22:45:01Z" }), false);
  // a run in progress, or one started less than an hour ago (manual run just before the missed slot)
  assert.equal(catchUpDue({ ...base, running: true, now: at("2026-07-15T17:10:00Z"), lastStartedAt: "2026-07-15T10:45:02Z" }), false);
  assert.equal(catchUpDue({ ...base, now: at("2026-07-15T17:10:00Z"), lastStartedAt: "2026-07-15T16:30:00Z" }), false);
  // the next slot runs in less than 45 min: it does the job
  assert.equal(catchUpDue({ ...base, now: at("2026-07-15T22:15:00Z"), lastStartedAt: "2026-07-15T10:45:02Z" }), false);
  // never ran (new volume): one run
  assert.equal(catchUpDue({ ...base, now: at("2026-07-15T17:10:00Z"), lastStartedAt: null }), true);
  assert.equal(catchUpDue({ ...base, times: [], now: at("2026-07-15T17:10:00Z"), lastStartedAt: null }), false);
});

const report = (o: Partial<RunReport>): RunReport => ({ id: "r", trigger: "schedule", by: "scheduler", startedAt: "", finishedAt: "", status: "blocked", asOf: { performance: null, nav: null, aum: null, factsheet: null }, issues: [], sources: [], funds: {}, ...o });

test("retry: once for a run a source made fail or block (5xx, timeout, network), never for approval gates or a crash", () => {
  const down = [{ name: "dataplatform unitholders/aum", ok: false, detail: "HTTP 503 on http://dp/api/unitholders/aum" }];
  assert.equal(retryWanted(report({ sources: down })), true);
  assert.equal(retryWanted(report({ status: "failed", sources: [{ name: "x", ok: false, detail: "timeout on http://dp/x" }] })), true);
  assert.equal(retryWanted(report({ status: "failed", sources: [{ name: "x", ok: false, detail: "network error on http://dp/x: fetch failed" }] })), true);
  assert.equal(retryWanted(report({ sources: [{ name: "x", ok: false, detail: "HTTP 404 on http://dp/x" }] })), false, "refused, not unavailable");
  assert.equal(retryWanted(report({ sources: [{ name: "graph", ok: false, detail: "not configured" }] })), false);
  assert.equal(retryWanted(report({ sources: down, classChanges: ["sustainable-enhanced-bonds"] })), false, "class change: an admin decides");
  assert.equal(retryWanted(report({ sources: down, reviewNeeded: ["monthly-income"] })), false, "unconfirmed month: an admin decides");
  assert.equal(retryWanted(report({ status: "pending-review", sources: down })), false);
  assert.equal(retryWanted(report({ status: "published", sources: down })), false);
  assert.equal(retryWanted(report({ status: "failed", sources: down, issues: [{ key: "run", level: "error", message: "pipeline crashed: boom" }] })), false);
});

test("runtime: a missed slot is caught up after boot, a source outage is retried once, the monitor runs after each run", async () => {
  stopScheduler();
  // one slot two hours ago (Toronto time): missed since the last run five hours ago; the next one is tomorrow
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(Date.now() - 2 * 3_600_000));
  const calls: string[] = [];
  let monitors = 0;
  const outage = (by: string): RunReport => report({ id: by, sources: [{ name: "dataplatform apex/funds", ok: false, detail: "HTTP 502 on http://dp/api/apex/funds" }] });
  const st = startScheduler({
    schedule: p, log: () => undefined, bootDelayMs: 5, retryDelayMs: 20, monitorEveryMs: 60_000,
    deps: {
      runPipeline: async ({ by }) => (calls.push(by), outage(by)),
      lastStartedAt: async () => new Date(Date.now() - 5 * 3_600_000).toISOString(),
      running: async () => false,
      monitor: async () => { monitors++; },
    },
  });
  assert.ok(st);
  await new Promise((r) => setTimeout(r, 300));
  assert.deepEqual(calls, ["scheduler (catch-up)", "scheduler (retry: source unavailable)"], "one catch-up, then exactly one retry");
  assert.equal(monitors, 2);
  assert.equal(schedulerState()!.retryAt, null);
  stopScheduler();

  // nothing missed (last run a minute ago): no catch-up, the monitor still runs once
  calls.length = 0;
  monitors = 0;
  startScheduler({
    schedule: p, log: () => undefined, bootDelayMs: 5,
    deps: { runPipeline: async ({ by }) => (calls.push(by), outage(by)), lastStartedAt: async () => new Date(Date.now() - 60_000).toISOString(), running: async () => false, monitor: async () => { monitors++; } },
  });
  await new Promise((r) => setTimeout(r, 100));
  assert.deepEqual(calls, []);
  assert.equal(monitors, 1);
  stopScheduler();
});
