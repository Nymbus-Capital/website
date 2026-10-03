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

test("seeded RBC drafts: pre-filled 1st percentile, hidden until confirmed with URL and date; removing them sticks", () => {
  for (const [key, list] of Object.entries(SEEDED_THIRD_PARTY)) {
    for (const e of list!) {
      assert.equal(e.provider, "rbc-pfs");
      assert.equal(e.confirmed, false, `${key}: draft`);
      assert.equal(e.url, undefined, `${key}: no URL seeded (the PDF could not be read)`);
      assert.equal(e.asOf, "", `${key}: no as-of seeded`);
      assert.ok(e.rows.every((r) => r.percentile === 1));
      assert.equal(thirdPartyStatus(e, NOW, 6), "draft");
    }
  }
  const empty = mergeContent(null);
  assert.equal(empty.funds["monthly-income"]!.rankings!.thirdParty!.length, 1);
  assert.equal(empty.funds["sustainable-enhanced-bonds"]!.rankings!.thirdParty![0].rows.length, 6);
  assert.equal(empty.funds["multi-strategy"]!.rankings!.thirdParty, undefined);
  assert.equal(publicFundRankings(empty.funds["monthly-income"]!.rankings, { now: NOW, months: 6 })!.thirdParty, undefined, "draft not public");
  // stored rankings without the list get the drafts; an admin who removed them saves [] and it stays empty
  const stored = { version: 1, updatedAt: "x", updatedBy: "x", firm: {}, pipeline: { publishMode: "review" }, funds: {
    "monthly-income": { rankings: { fundLibrary: [] } },
    "sustainable-enhanced-bonds": cleanFundContent({ rankings: { thirdParty: [] } }),
  } } as unknown as SiteContent;
  const m = mergeContent(stored);
  assert.equal(m.funds["monthly-income"]!.rankings!.thirdParty!.length, 1);
  assert.deepEqual(m.funds["monthly-income"]!.rankings!.fundLibrary, []);
  assert.deepEqual(m.funds["sustainable-enhanced-bonds"]!.rankings!.thirdParty, []);
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
