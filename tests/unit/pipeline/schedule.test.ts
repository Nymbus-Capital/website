import { test } from "node:test";
import assert from "node:assert/strict";
import { nextRun, parseSchedule, schedulerState, startScheduler, stopScheduler, zonedToUtc } from "../../../src/lib/pipeline/schedule.ts";

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
