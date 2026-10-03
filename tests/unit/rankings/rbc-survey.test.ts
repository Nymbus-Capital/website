/** RBC pooled fund survey freshness check: parser (hand-written fixtures), detection with a fake fetch, issues, state. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  detectLatestSurvey, expectedPdfUrl, nextQuarter, parseSurveyRefs, quarterEnd, quarterOf, rbcIssues, readRbcState, runRbcSurveyCheck, storedRbcAsOf, type RbcCheckState,
} from "../../../src/lib/rankings/rbc-survey.ts";
import { checkDue, checkIntervalDays } from "../../../src/lib/rankings/schedule.ts";
import type { SiteContent, ThirdPartyRanking } from "../../../src/lib/data/types.ts";

const fixture = (n: string) => readFileSync(new URL(`../../fixtures/rankings/${n}`, import.meta.url), "utf8");
const NOW = new Date("2026-10-02T12:00:00Z");

test("quarter helpers", () => {
  assert.equal(quarterEnd({ year: 2026, quarter: 2 }), "2026-06-30");
  assert.equal(quarterEnd({ year: 2026, quarter: 1 }), "2026-03-31");
  assert.equal(quarterEnd({ year: 2025, quarter: 4 }), "2025-12-31");
  assert.deepEqual(quarterOf("2026-09-30"), { year: 2026, quarter: 3 });
  assert.deepEqual(nextQuarter({ year: 2025, quarter: 4 }), { year: 2026, quarter: 1 });
  assert.equal(expectedPdfUrl({ year: 2026, quarter: 3 }), "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q3_2026.pdf");
});

test("parseSurveyRefs: article links, PDF links and titles; newest first; junk ignored", () => {
  const refs = parseSurveyRefs(fixture("rbc-listing.html"), "https://www.rbcis.com/en/our-insights.page");
  assert.deepEqual(refs.map((r) => `Q${r.quarter} ${r.year}`), ["Q2 2026", "Q1 2026", "Q4 2025"]);
  assert.equal(refs[0].url, "https://www.rbcis.com/en/insights/2026/08/pooled-fund-survey-q2-26");
  assert.equal(refs[1].url, "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q1_2026.pdf");
  const art = parseSurveyRefs(fixture("rbc-article.html"), "https://www.rbcis.com/en/insights/2026/11/pooled-fund-survey-q3-26");
  assert.equal(art.length, 1);
  assert.deepEqual([art[0].year, art[0].quarter], [2026, 3]);
  assert.match(art[0].url ?? "", /Pooled%20Fund%20Survey%20Q3%202026\.pdf$/);
  assert.deepEqual(parseSurveyRefs("<p>Q2 2026 Pooled Fund Survey</p>"), [{ year: 2026, quarter: 2 }]);
  assert.deepEqual(parseSurveyRefs("<p>Pooled Fund Survey Q5 2026, pooled-fund-survey-q2-1999</p><a href='http://x/pooled-fund-survey-q1-26'>x</a>").map((r) => r.url), [undefined], "http link not kept as URL");
  assert.deepEqual(parseSurveyRefs(""), []);
});

function fakeFetch(pages: Record<string, string | number>, pdfs: string[] = [], log: string[] = []): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    log.push(`${init?.method ?? "GET"} ${url}`);
    if ((init?.method ?? "GET") === "HEAD") {
      return pdfs.includes(url) ? new Response(null, { status: 200, headers: { "content-type": "application/pdf" } }) : new Response(null, { status: 404 });
    }
    const p = pages[url];
    if (p === undefined) throw new TypeError("fetch failed");
    if (typeof p === "number") return new Response("err", { status: p });
    return new Response(p, { status: 200, headers: { "content-type": "text/html" } });
  }) as typeof fetch;
}

test("detectLatestSurvey: listing + PDF probe of the next quarters; failures reported, never thrown", async () => {
  const listing = "https://l/1";
  const q3 = expectedPdfUrl({ year: 2026, quarter: 3 });
  const r = await detectLatestSurvey({ fetchImpl: fakeFetch({ [listing]: fixture("rbc-listing.html") }, [q3]), listingUrls: [listing] });
  assert.equal(r.ok, true);
  assert.deepEqual([r.latest?.year, r.latest?.quarter, r.latest?.url], [2026, 3, q3], "Q3 PDF found by the probe");
  const none = await detectLatestSurvey({ fetchImpl: fakeFetch({}), listingUrls: [listing], now: NOW });
  assert.equal(none.latest, null);
  assert.equal(none.sources[0].ok, false);
  const down = await detectLatestSurvey({ fetchImpl: fakeFetch({ [listing]: 503 }), listingUrls: [listing], known: { year: 2026, quarter: 2 } });
  assert.equal(down.latest, null);
  assert.equal(down.sources[0].status, 503);
  assert.equal(down.ok, true, "the PDF host answered (404): the check itself ran");
});

const content = (asOf: string | null, confirmed = true): Pick<SiteContent, "funds"> => ({
  funds: {
    "sustainable-enhanced-bonds": { rankings: { thirdParty: asOf === null ? [] : [{ provider: "rbc-pfs", classLabel: "F", category: { en: "a", fr: "b" }, asOf, rows: [], confirmed } as ThirdPartyRanking] } },
  },
});
const state = (over: Partial<RbcCheckState> = {}): RbcCheckState => ({
  checkedAt: NOW.toISOString(), ok: true, lastSuccessAt: NOW.toISOString(), sources: [],
  latest: { year: 2026, quarter: 2, asOf: "2026-06-30", label: "Q2 2026", detectedAt: NOW.toISOString(), url: "https://www.rbcis.com/x" }, ...over,
});

test("rbcIssues: new edition → warn per fund; failures warn but change nothing; none entered → info", () => {
  assert.deepEqual(storedRbcAsOf(content("2026-03-31")), { "sustainable-enhanced-bonds": "2026-03-31" });
  assert.deepEqual(storedRbcAsOf(content("2026-03-31", false)), {}, "drafts do not count as stored");
  const issues = rbcIssues(state(), content("2026-03-31"), NOW);
  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /New RBC pooled fund survey Q2 2026 published.*update rankings for sustainable-enhanced-bonds/);
  assert.deepEqual(rbcIssues(state(), content("2026-06-30"), NOW), [], "up to date");
  assert.equal(rbcIssues(state(), content(null), NOW)[0].key, "rankings.rbc.none");
  const failed = rbcIssues(state({ ok: false, error: "no source reachable", lastSuccessAt: "2026-08-01T00:00:00Z" }), content("2026-06-30"), NOW);
  assert.deepEqual(failed.map((i) => i.key), ["rankings.rbc.check-failed", "rankings.rbc.no-success"]);
  assert.equal(rbcIssues(null, content(null), NOW)[0].key, "rankings.rbc.never");
});

test("runRbcSurveyCheck: stores state, keeps the last edition after a failure, alerts once per edition", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "rbc-"));
  const prevDir = process.env.SITE_DATA_DIR;
  const prevHook = process.env.PIPELINE_ALERT_WEBHOOK;
  process.env.SITE_DATA_DIR = dir;
  process.env.PIPELINE_ALERT_WEBHOOK = "https://hooks.example/secret";
  try {
    const log: string[] = [];
    const pages = { "https://www.rbcis.com/en/our-insights.page": fixture("rbc-listing.html"), "https://www.rbcits.com/en/insights/": 404, "https://hooks.example/secret": "ok" };
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input) === "https://hooks.example/secret") { log.push("HOOK"); return new Response("ok"); }
      return fakeFetch(pages, [], log)(input, init);
    }) as typeof fetch;
    const c = content("2026-03-31");
    const s1 = await runRbcSurveyCheck({ fetchImpl, now: NOW, content: c, log: () => undefined });
    assert.equal(s1.ok, true);
    assert.equal(s1.latest?.label, "Q2 2026");
    assert.equal(s1.latest?.asOf, "2026-06-30");
    assert.equal(log.filter((l) => l === "HOOK").length, 1);
    assert.equal((await readRbcState())?.alertedFor, "Q2 2026");
    // second run: same edition, no second alert; then the network fails: last edition kept, ok false
    await runRbcSurveyCheck({ fetchImpl, now: NOW, content: c, log: () => undefined });
    assert.equal(log.filter((l) => l === "HOOK").length, 1, "alerted once per edition");
    const offline = (async () => { throw new TypeError("fetch failed"); }) as typeof fetch;
    const s3 = await runRbcSurveyCheck({ fetchImpl: offline, now: new Date("2026-10-09T12:00:00Z"), content: c, log: () => undefined });
    assert.equal(s3.ok, false);
    assert.equal(s3.latest?.label, "Q2 2026", "a failed check keeps the last detected edition");
    assert.equal(s3.lastSuccessAt, NOW.toISOString());
  } finally {
    if (prevDir === undefined) delete process.env.SITE_DATA_DIR; else process.env.SITE_DATA_DIR = prevDir;
    if (prevHook === undefined) delete process.env.PIPELINE_ALERT_WEBHOOK; else process.env.PIPELINE_ALERT_WEBHOOK = prevHook;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("weekly schedule: due when never run or older than the interval", () => {
  assert.equal(checkDue(null, NOW, 7), true);
  assert.equal(checkDue("2026-09-26T12:00:00Z", NOW, 7), false);
  assert.equal(checkDue("2026-09-25T12:00:00Z", NOW, 7), true);
  assert.equal(checkDue("garbage", NOW, 7), true);
  assert.equal(checkIntervalDays({}), 7);
  assert.equal(checkIntervalDays({ RANKINGS_CHECK_DAYS: "14" }), 14);
  assert.equal(checkIntervalDays({ RANKINGS_CHECK_DAYS: "0" }), 7);
});
