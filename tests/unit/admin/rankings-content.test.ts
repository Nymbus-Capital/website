/** Fund content: class types, fund facts, rankings: normalisation, seeded defaults and the merge with stored content. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanFundContent } from "../../../src/components/admin/fund-content.ts";
import { mergeContent, SEEDED_RANKINGS } from "../../../src/lib/data/defaults.ts";
import { RANKING_PERIODS, type FundContent, type SiteContent } from "../../../src/lib/data/types.ts";

test("seeded rankings: well-formed, dated, sourced; Morningstar only for the two bond funds", () => {
  for (const [key, r] of Object.entries(SEEDED_RANKINGS)) {
    if (key === "multi-strategy") assert.equal(r!.morningstar, undefined, `${key}: no Morningstar rating`);
    else {
      assert.equal(r!.morningstar?.stars, 5, `${key}: 5 stars`);
      assert.equal(r!.morningstar?.asOf, "2026-10-01");
      assert.equal(r!.morningstar?.classLabel, "Class F", `${key}: the class of the rating is stated`);
      assert.match(r!.morningstar?.url ?? "", /^https:\/\/global\.morningstar\.com\//);
    }
    for (const e of r!.fundLibrary ?? []) {
      assert.match(e.asOf, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(e.url ?? "", /^https:\/\/www\.fundlibrary\.com\//);
      assert.ok(e.category.en && e.category.fr);
      assert.ok(e.rows.length > 0);
      const seen = new Set<string>();
      for (const row of e.rows) {
        assert.ok(RANKING_PERIODS.includes(row.period));
        assert.ok(!seen.has(row.period), `${key}: duplicate period ${row.period}`);
        seen.add(row.period);
        assert.ok(row.rank >= 1 && row.rank <= row.of, `${key} ${row.period}: rank within the category`);
        // quartile consistent with the rank (top quarter = 1 ...), allowing the source's own rounding at the edges
        const q = Math.ceil((row.rank / row.of) * 4);
        assert.ok(
          row.quartile === null || Math.abs(row.quartile - q) <= 1,
          `${key} ${row.period}: quartile ${row.quartile} vs rank ${row.rank}/${row.of}`,
        );
      }
    }
  }
});

test("mergeContent: seeded rankings fill a fund with none stored; stored rankings win; hide.rankings is kept", () => {
  const empty = mergeContent(null);
  assert.ok(empty.funds["sustainable-enhanced-bonds"]?.rankings?.fundLibrary?.length);
  assert.equal(empty.funds["global-minimum-volatility"], undefined, "no ranking for GMV");
  const stored = {
    version: 3,
    updatedAt: "x",
    updatedBy: "x",
    firm: {},
    funds: {
      "multi-strategy": { rankings: { fundLibrary: [] }, hide: { rankings: true } },
      "monthly-income": { tagline: { en: "a", fr: "b" } },
    },
    pipeline: { publishMode: "auto" },
  } as unknown as SiteContent;
  const m = mergeContent(stored);
  assert.deepEqual(m.funds["multi-strategy"]!.rankings, { fundLibrary: [] }, "stored wins (even empty)");
  assert.equal(m.funds["multi-strategy"]!.hide?.rankings, true);
  assert.deepEqual(m.funds["monthly-income"]!.tagline, { en: "a", fr: "b" });
  assert.ok(m.funds["monthly-income"]!.rankings, "the other stored fields keep their seeded rankings");
  // never shares the seed object
  m.funds["sustainable-enhanced-bonds"]!.rankings!.fundLibrary![0].rows[0].rank = 999;
  assert.notEqual(SEEDED_RANKINGS["sustainable-enhanced-bonds"]!.fundLibrary![0].rows[0].rank, 999);
});

test("cleanFundContent: empty class types, rankings without data and empty facts are dropped", () => {
  const c = cleanFundContent({
    classTypes: { LDM081: "prospectus", LDM001: "om", LDM999: "none", LDM998: "bogus" as never },
    minSubsequent: "",
    liquidity: { en: "", fr: "" },
    cifscCategory: { en: "", fr: "" },
    rankings: {
      fundLibrary: [{ classLabel: "Class F", category: { en: "x", fr: "y" }, asOf: "2026-08-31", rows: [] }],
    },
  } as FundContent);
  assert.deepEqual(c, { classTypes: { LDM081: "prospectus", LDM001: "om", LDM999: "none" } });
  const r = cleanFundContent({ rankings: { morningstar: { stars: 5, asOf: "2026-08-31", classLabel: "Class F" } } });
  assert.deepEqual(r.rankings, { morningstar: { stars: 5, asOf: "2026-08-31", classLabel: "Class F" } });
});
