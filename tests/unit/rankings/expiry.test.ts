/** Rankings about to be hidden by the staleness limit: dashboard issue 30 days ahead and a webhook alert once per entry and phase. */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { rankingExpiries, rankingIssues } from "../../../src/lib/rankings/issues.ts";
import { alertRankingExpiries } from "../../../src/lib/rankings/expiry-alert.ts";
import { ALERT_DELIVERY } from "../../../src/lib/pipeline/alerts.ts";
import type { SiteContent, ThirdPartyRanking } from "../../../src/lib/data/types.ts";

let dir = "";
const saved = ALERT_DELIVERY.delays;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "rk-expiry-"));
  process.env.SITE_DATA_DIR = dir;
  ALERT_DELIVERY.delays = [0];
});
afterEach(async () => {
  ALERT_DELIVERY.delays = saved;
  await rm(dir, { recursive: true, force: true });
});

const rbc = (over: Partial<ThirdPartyRanking> = {}): ThirdPartyRanking => ({
  provider: "rbc-pfs", classLabel: "", scope: "fund", category: { en: "Canadian Fixed Income", fr: "Revenu fixe canadien" }, asOf: "2026-06-30", edition: "Q2 2026",
  rows: [{ period: "1Y", percentile: 1 }], url: "https://www.rbcis.com/x.pdf", confirmed: true, ...over,
});
const content = (funds: Record<string, unknown>): Pick<SiteContent, "funds" | "rankingPolicy"> => ({ funds, rankingPolicy: { maxAgeMonths: 6 } }) as unknown as Pick<SiteContent, "funds" | "rankingPolicy">;
const C = content({
  "sustainable-enhanced-bonds": { rankings: { morningstar: { stars: 5, asOf: "2026-10-01", classLabel: "Class F", url: "https://www.morningstar.ca/x" }, thirdParty: [rbc(), rbc({ confirmed: false, asOf: "2026-03-31" })] } },
  "multi-strategy": { hide: { rankings: true }, rankings: { thirdParty: [rbc()] } },
});

test("expiries: shown entries within 30 days of their last day, then just-hidden ones; drafts and hidden rankings ignored", () => {
  // RBC as of 2026-06-30 with 6 months: last day shown 2026-12-30
  assert.deepEqual(rankingExpiries(C, { now: new Date("2026-11-29T12:00:00Z"), months: 6 }), [], "31 days left: nothing yet");
  const x = rankingExpiries(C, { now: new Date("2026-11-30T12:00:00Z"), months: 6 });
  assert.equal(x.length, 1);
  assert.deepEqual([x[0].fund, x[0].kind, x[0].phase, x[0].lastShowDay, x[0].daysLeft], ["sustainable-enhanced-bonds", "tp", "expiring", "2026-12-30", 30]);
  assert.match(x[0].label, /RBC Investor Services ranking Q2 2026/);
  const h = rankingExpiries(C, { now: new Date("2026-12-31T12:00:00Z"), months: 6 });
  assert.deepEqual(h.map((e) => e.phase), ["hidden"]);
  assert.deepEqual(rankingExpiries(C, { now: new Date("2027-02-15T12:00:00Z"), months: 6 }).filter((e) => e.kind === "tp"), [], "hidden more than 30 days ago: no longer announced");
  const issues = rankingIssues(C, { now: new Date("2026-12-20T12:00:00Z"), months: 6, brand: { "morningstar-logo": "/x", "morningstar-stars-5": "/y" } as never, rbc: null });
  assert.ok(issues.some((i) => i.key === "rankings.sustainable-enhanced-bonds.tp.0.expiring" && i.level === "warn" && /will be hidden after 2026-12-30 \(in 10 days\)/.test(i.message)), JSON.stringify(issues));
});

test("expiry alert: each entry once per phase, with what to do", async () => {
  const posted: { title: string; lines: string[] }[] = [];
  const fetchImpl = (async (_u: string | URL | Request, init?: RequestInit) => (posted.push(JSON.parse(String(init?.body))), new Response("", { status: 200 }))) as typeof fetch;
  const env = { PIPELINE_ALERT_WEBHOOK: "https://hooks.example.test/x" };
  assert.equal(await alertRankingExpiries(C, { fetchImpl, env, now: new Date("2026-11-30T12:00:00Z") }), "sent");
  assert.equal(await alertRankingExpiries(C, { fetchImpl, env, now: new Date("2026-12-10T12:00:00Z") }), "none", "already posted");
  assert.equal(posted.length, 1);
  assert.match(posted[0].lines[0], /sustainable-enhanced-bonds: RBC Investor Services ranking Q2 2026 as of 2026-06-30 — hidden after 2026-12-30 \(30 days left\)/);
  assert.ok(posted[0].lines.some((l) => /What to do: in \/admin\/funds/.test(l)));
  assert.equal(await alertRankingExpiries(C, { fetchImpl, env, now: new Date("2026-12-31T12:00:00Z") }), "sent");
  assert.match(posted[1].lines[0], /now HIDDEN/);
  // re-confirmed with the newer edition: nothing to announce
  const fresh = content({ "sustainable-enhanced-bonds": { rankings: { thirdParty: [rbc({ asOf: "2026-12-31", edition: "Q4 2026" })] } } });
  assert.equal(await alertRankingExpiries(fresh, { fetchImpl, env, now: new Date("2027-01-02T12:00:00Z") }), "none");
  assert.equal(await alertRankingExpiries(C, { env: {}, now: new Date("2026-11-30T12:00:00Z") }), "off");
});
