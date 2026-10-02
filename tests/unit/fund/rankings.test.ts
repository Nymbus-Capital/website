/** Awards and rankings: what the tab shows, the CIFSC fact, and the EN / FR parity of the new page copy. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { cifscCategory, rankingsToShow } from "../../../src/components/fund/lib/rankings.ts";
import { T } from "../../../src/components/fund/copy.ts";
import { SEEDED_RANKINGS } from "../../../src/lib/data/defaults.ts";
import type { FundContent } from "../../../src/lib/data/types.ts";

const seb = (): FundContent => ({ rankings: SEEDED_RANKINGS["sustainable-enhanced-bonds"] });

test("rankingsToShow: seeded Fund Library data and the 5-star Morningstar rating", () => {
  const r = rankingsToShow(seb())!;
  assert.equal(r.fundLibrary.length, 1);
  assert.equal(r.morningstar?.stars, 5);
  assert.equal(r.fundLibrary[0].fundGrade, "A");
});

test("rankingsToShow: hidden, empty or malformed entries show nothing", () => {
  assert.equal(rankingsToShow(null), null);
  assert.equal(rankingsToShow({}), null);
  assert.equal(rankingsToShow({ ...seb(), hide: { rankings: true } }), null);
  assert.equal(rankingsToShow({ rankings: { fundLibrary: [{ classLabel: "Class F", category: { en: "x", fr: "y" }, asOf: "2026-08-31", rows: [] }] } }), null);
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 7 as never, asOf: "2026-08-31" } } }), null, "stars outside 1 to 5");
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 5, asOf: "" } } }), null, "a rating needs its as-at date");
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 5, asOf: "2026-08-31" } } })!.morningstar!.stars, 5);
});

test("cifscCategory: the admin's, else the Fund Library category when unambiguous, in the page language", () => {
  assert.equal(cifscCategory(seb(), "en"), "Canadian Fixed Income");
  assert.equal(cifscCategory(seb(), "fr"), "Revenu fixe canadien");
  assert.equal(cifscCategory({ ...seb(), cifscCategory: { en: "Own", fr: "Propre" } }, "fr"), "Propre");
  assert.equal(cifscCategory({}, "en"), null);
  const two = { rankings: { fundLibrary: [...seb().rankings!.fundLibrary!, ...SEEDED_RANKINGS["multi-strategy"]!.fundLibrary!] } };
  assert.equal(cifscCategory(two, "en"), null, "two different categories: none is claimed");
});

test("new copy: EN and FR present and short; FR keeps non-breaking spaces before : and %", () => {
  const groups = [T.classes, T.variants, T.awards] as Record<string, { en: string; fr: string }>[];
  for (const g of groups) {
    for (const [k, v] of Object.entries(g)) {
      assert.ok(v.en.trim() && v.fr.trim(), `${k}: EN and FR`);
      assert.ok(v.en.length <= 420 && v.fr.length <= 480, `${k}: short`);
      assert.ok(!/ [:%]/.test(v.fr), `${k}: regular space before : or %`);
      assert.equal(/\{x\}/.test(v.en), /\{x\}/.test(v.fr), `${k}: same placeholders`);
      assert.equal(/\{date\}/.test(v.en), /\{date\}/.test(v.fr), `${k}: same placeholders`);
    }
  }
  assert.equal(T.classes.prospectus.en, "Prospectus class");
  assert.equal(T.classes.om.en, "Offering memorandum class");
});
