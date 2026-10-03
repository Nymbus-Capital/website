/** Third-party rankings policy: what may be shown (confirmed, complete, sourced, fresh), drafts, staleness, wording. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_MAX_AGE_MONTHS, isFresh, lastShowDay, ordinal, policyMonths, publicFundRankings, publicRankings, thirdPartyStatus,
} from "../../../src/lib/rankings/policy.ts";
import { mergeContent, SEEDED_THIRD_PARTY } from "../../../src/lib/data/defaults.ts";
import { cleanFundContent } from "../../../src/components/admin/fund-content.ts";
import type { SiteContent, ThirdPartyRanking } from "../../../src/lib/data/types.ts";

const NOW = new Date("2026-10-02T12:00:00Z");
const rbc = (over: Partial<ThirdPartyRanking> = {}): ThirdPartyRanking => ({
  provider: "rbc-pfs", classLabel: "Pooled fund", category: { en: "Canadian Fixed Income", fr: "Revenu fixe canadien" }, asOf: "2026-06-30", edition: "Q2 2026",
  rows: [{ period: "3M", percentile: 1 }, { period: "1Y", percentile: 1 }], url: "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf", confirmed: true, ...over,
});

test("staleness: same day N months later (clamped to month end), future dates never fresh", () => {
  assert.equal(lastShowDay("2026-08-31", 6), "2027-02-28");
  assert.equal(lastShowDay("2026-06-30", 6), "2026-12-30");
  assert.equal(lastShowDay("2026-02-30", 6), null, "not a calendar date");
  assert.equal(isFresh("2026-06-30", new Date("2026-12-30T23:00:00Z"), 6), true);
  assert.equal(isFresh("2026-06-30", new Date("2026-12-31T00:00:00Z"), 6), false);
  assert.equal(isFresh("2026-10-03", NOW, 6), true, "tomorrow tolerated (time zones)");
  assert.equal(isFresh("2026-10-05", NOW, 6), false, "a future as-of date is a typo");
  assert.equal(isFresh("", NOW, 6), false);
});

test("policyMonths: default 6, clamped to 1..24, integers only", () => {
  assert.equal(policyMonths(null), DEFAULT_MAX_AGE_MONTHS);
  assert.equal(policyMonths({ rankingPolicy: { maxAgeMonths: 12 } }), 12);
  assert.equal(policyMonths({ rankingPolicy: { maxAgeMonths: 99 } }), 24);
  assert.equal(policyMonths({ rankingPolicy: { maxAgeMonths: 0 } }), 1);
  assert.equal(policyMonths({ rankingPolicy: { maxAgeMonths: 2.5 } }), DEFAULT_MAX_AGE_MONTHS);
});

test("third-party entries: shown only when confirmed, complete, sourced and fresh", () => {
  assert.equal(thirdPartyStatus(rbc(), NOW, 6), "shown");
  assert.equal(thirdPartyStatus(rbc({ confirmed: false }), NOW, 6), "draft");
  for (const [why, over] of [
    ["no URL", { url: undefined }], ["http URL", { url: "http://example.com/x.pdf" }], ["no as-of", { asOf: "" }], ["no class", { classLabel: " " }],
    ["no FR category", { category: { en: "x", fr: "" } }], ["no rows", { rows: [] }], ["empty row", { rows: [{ period: "1Y", percentile: null }] }],
    ["percentile 0", { rows: [{ period: "1Y", percentile: 0 }] }], ["percentile 101", { rows: [{ period: "1Y", percentile: 101 }] }],
    ["rank above N", { rows: [{ period: "1Y", percentile: null, rank: 9, of: 3 }] }],
  ] as [string, Partial<ThirdPartyRanking>][]) {
    assert.equal(thirdPartyStatus(rbc(over), NOW, 6), "incomplete", why);
  }
  assert.equal(thirdPartyStatus(rbc({ rows: [{ period: "1Y", percentile: null, rank: 2, of: 40 }] }), NOW, 6), "shown", "rank out of N instead of a percentile");
  assert.equal(thirdPartyStatus(rbc({ asOf: "2025-12-31" }), NOW, 6), "stale");
  assert.equal(thirdPartyStatus(rbc({ asOf: "2025-12-31" }), NOW, 12), "shown", "configured limit");
  assert.equal(thirdPartyStatus(rbc({ fundserv: "LDM001" }), NOW, 6, [{ fundserv: "LDM201" }]), "other-class");
});

test("publicRankings: drafts, notes and stale entries never reach the page; network state plays no part", () => {
  const r = publicRankings({ thirdParty: [rbc({ note: "internal" }), rbc({ confirmed: false, provider: "evestment" }), rbc({ provider: "gmr", asOf: "2025-01-31" })] }, { now: NOW, months: 6 });
  assert.equal(r.thirdParty.length, 1);
  assert.equal(r.thirdParty[0].provider, "rbc-pfs");
  assert.equal("note" in r.thirdParty[0], false, "admin note stripped");
  assert.equal(publicFundRankings({ thirdParty: [rbc({ confirmed: false })] }, { now: NOW, months: 6 }), undefined, "nothing to show → no rankings at all");
  // without a clock (client side) only the format is checked: the server already applied the age limit
  assert.equal(publicRankings({ thirdParty: [rbc({ asOf: "2020-03-31" })] }, { now: null }).thirdParty.length, 1);
});

test("seeded RBC Q2 2026 entries: confirmed, fund-level, gross of fees, exact percentiles; old drafts migrate; removal sticks", () => {
  const seb = SEEDED_THIRD_PARTY["sustainable-enhanced-bonds"]![0];
  const mi = SEEDED_THIRD_PARTY["monthly-income"]![0];
  for (const e of [seb, mi]) {
    assert.equal(e.provider, "rbc-pfs");
    assert.equal(e.confirmed, true);
    assert.equal(e.url, "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf");
    assert.equal(e.asOf, "2026-06-30");
    assert.equal(e.edition, "Q2 2026");
    assert.equal(e.scope, "fund");
    assert.equal(e.classLabel, "", "no invented class");
    assert.match(e.basis!.en, /gross of management fees/);
    assert.match(e.basis!.fr, /avant déduction des frais de gestion/);
    assert.deepEqual(e.rows.map((r) => r.period), ["3M", "1Y", "2Y", "3Y", "5Y"], "10 years n/a: not seeded");
    // "Four year periods ending June 30": rolling 4-year periods, not one-year periods
    assert.deepEqual(e.rolling!.map((x) => [x.end, x.years, x.percentile]), [["2026-06-30", 4, 1], ["2025-06-30", 4, 1], ["2024-06-30", 4, 1], ["2023-06-30", 4, 1]]);
    assert.equal(e.trackSince, "2019-01", "strategy track record since January 2019 (before the fund's launch)");
    assert.equal(e.category.fr, e.category.en, "the survey's English category names in both languages");
    assert.equal(thirdPartyStatus(e, NOW, 6), "shown");
  }
  assert.deepEqual(seb.rows.map((r) => r.percentile), [1, 1, 1, 1, 1]);
  assert.deepEqual(mi.rows.map((r) => r.percentile), [4, 1, 1, 1, 1], "Monthly Income 1 quarter: 4th percentile, never '1st across all periods'");
  assert.deepEqual(seb.rows.map((r) => r.ror), [3.16, 10.04, 9.51, 11.39, 6.83]);
  assert.deepEqual(mi.rows.map((r) => r.ror), [2.02, 12.42, 10.9, 13.38, 7.23]);
  assert.equal(seb.category.en, "Canadian Fixed Income");
  assert.equal(mi.category.en, "Canadian Short Term Fixed Income");
  assert.equal(mi.category.fr, "Canadian Short Term Fixed Income");

  // public payload: percentiles only (no returns, no admin note / source reference)
  const pub = publicFundRankings({ thirdParty: [mi] }, { now: NOW, months: 6 })!.thirdParty![0];
  assert.equal("note" in pub || "sourceRef" in pub, false);
  assert.equal(pub.rows.some((r) => "ror" in r), false);
  assert.equal(pub.rolling!.some((x) => "ror" in x), false);
  assert.equal(pub.trackSince, "2019-01");
  assert.equal(pub.rows[0].percentile, 4);

  const empty = mergeContent(null);
  assert.equal(empty.funds["monthly-income"]!.rankings!.thirdParty![0].confirmed, true);
  assert.equal(empty.funds["multi-strategy"]!.rankings!.thirdParty, undefined);
  // migration: a stored copy of the old pristine draft becomes the confirmed entry; other entries are kept
  const oldDraft = { provider: "rbc-pfs", classLabel: "", category: { en: "", fr: "" }, asOf: "", rows: [{ period: "1Y", percentile: 1 }], confirmed: false };
  const other = rbc({ provider: "evestment" });
  const stored = { version: 1, updatedAt: "x", updatedBy: "x", firm: {}, pipeline: { publishMode: "review" }, funds: {
    "monthly-income": { rankings: { fundLibrary: [], thirdParty: [oldDraft, other] } },
    "sustainable-enhanced-bonds": cleanFundContent({ rankings: { thirdParty: [] } }),
  } } as unknown as SiteContent;
  const m = mergeContent(stored);
  assert.deepEqual(m.funds["monthly-income"]!.rankings!.thirdParty!.map((e) => [e.provider, e.confirmed]), [["rbc-pfs", true], ["evestment", true]]);
  assert.deepEqual(m.funds["sustainable-enhanced-bonds"]!.rankings!.thirdParty, [], "removed by the admin: stays empty");
  // an RBC entry the admin edited is never replaced
  const edited = { ...oldDraft, url: "https://www.rbcis.com/x.pdf" };
  const m2 = mergeContent({ ...stored, funds: { "monthly-income": { rankings: { thirdParty: [edited] } } } } as unknown as SiteContent);
  assert.equal(m2.funds["monthly-income"]!.rankings!.thirdParty![0].url, "https://www.rbcis.com/x.pdf");
});

test("fund-level entries: no class needed when scope is fund; basis needs EN and FR; rolling periods valid and within as-of", () => {
  assert.equal(thirdPartyStatus(rbc({ classLabel: "", scope: "fund" }), NOW, 6), "shown");
  assert.equal(thirdPartyStatus(rbc({ classLabel: "" }), NOW, 6), "incomplete");
  assert.equal(thirdPartyStatus(rbc({ basis: { en: "gross", fr: "" } }), NOW, 6), "incomplete");
  assert.equal(thirdPartyStatus(rbc({ rolling: [{ end: "2026-06-30", years: 4, percentile: 1 }] }), NOW, 6), "shown");
  assert.equal(thirdPartyStatus(rbc({ rolling: [{ end: "2026-09-30", years: 4, percentile: 1 }] }), NOW, 6), "incomplete", "ends after the as-of date");
  assert.equal(thirdPartyStatus(rbc({ rolling: [{ end: "2026-06-30", years: 4, percentile: null }] }), NOW, 6), "incomplete");
  assert.equal(thirdPartyStatus(rbc({ rolling: [{ end: "2026-06-30", years: 0, percentile: 1 }] }), NOW, 6), "incomplete", "length in years required");
  assert.equal(thirdPartyStatus(rbc({ trackSince: "2019-13" }), NOW, 6), "incomplete");
});

test("migration: entries saved with the previous 'annual' list become rolling 4-year periods; the seeded RBC copy gets its strategy scope and English categories", () => {
  const legacy = {
    provider: "rbc-pfs", classLabel: "", scope: "fund", category: { en: "Canadian Short Term Fixed Income", fr: "Revenu fixe canadien à court terme" }, asOf: "2026-06-30",
    url: "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf", confirmed: true, rows: [{ period: "1Y", percentile: 1 }],
    annual: [{ end: "2026-06-30", percentile: 1, ror: 11.52 }],
  };
  const m = mergeContent({ version: 1, updatedAt: "x", updatedBy: "x", firm: {}, pipeline: { publishMode: "review" }, funds: { "monthly-income": { rankings: { thirdParty: [legacy] } } } } as unknown as SiteContent);
  const e = m.funds["monthly-income"]!.rankings!.thirdParty![0] as ThirdPartyRanking & { annual?: unknown };
  assert.equal(e.annual, undefined);
  assert.deepEqual(e.rolling, [{ end: "2026-06-30", percentile: 1, ror: 11.52, years: 4 }]);
  assert.equal(e.trackSince, "2019-01");
  assert.equal(e.category.fr, "Canadian Short Term Fixed Income");
});

test("cleanFundContent keeps third-party drafts and drops their empty optional fields", () => {
  const c = cleanFundContent({ rankings: { thirdParty: [{ ...rbc({ confirmed: false }), fundserv: "", edition: "", url: undefined, note: "" }] } });
  const e = c.rankings!.thirdParty![0];
  assert.equal(e.confirmed, undefined);
  assert.equal("fundserv" in e || "edition" in e || "note" in e, false);
});

test("ordinal: EN st/nd/rd/th (11-13th), FR 1er / Ne", () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 100].map((n) => ordinal(n, "en")), ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "23rd", "100th"]);
  assert.deepEqual([1, 2, 10].map((n) => ordinal(n, "fr")), ["1er", "2e", "10e"]);
});
