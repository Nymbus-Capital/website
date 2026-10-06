/** Awards and rankings: what the tab shows, the CIFSC fact, and the EN / FR parity of the new page copy. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { cifscCategory, rankingsToShow } from "../../../src/components/fund/lib/rankings.ts";
import { T } from "../../../src/components/fund/fund.copy.ts";
import { SEEDED_RANKINGS, SEEDED_THIRD_PARTY } from "../../../src/lib/data/defaults.ts";
import { awardsEligible, gateAwards } from "../../../src/lib/rankings/policy.ts";
import type { FundContent } from "../../../src/lib/data/types.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../../..");

const NOW = new Date("2026-10-01T12:00:00Z");
const seb = (): FundContent => ({ rankings: SEEDED_RANKINGS["sustainable-enhanced-bonds"] });

test("rankingsToShow: seeded Fundata data and the 5-star Morningstar rating", () => {
  const r = rankingsToShow(seb(), undefined, NOW)!;
  assert.equal(r.fundLibrary.length, 1);
  assert.equal(r.morningstar?.stars, 5);
  assert.equal(r.fundLibrary[0].fundGrade, "A");
});

test("rankingsToShow: hidden, empty or malformed entries show nothing", () => {
  assert.equal(rankingsToShow(null, undefined, NOW), null);
  assert.equal(rankingsToShow({}, undefined, NOW), null);
  assert.equal(rankingsToShow({ ...seb(), hide: { rankings: true } }, undefined, NOW), null);
  assert.equal(rankingsToShow({ rankings: { fundLibrary: [{ classLabel: "Class F", category: { en: "x", fr: "y" }, asOf: "2026-08-31", rows: [] }] } }, undefined, NOW), null);
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 7 as never, asOf: "2026-08-31", classLabel: "Class F" } } }, undefined, NOW), null, "stars outside 1 to 5");
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 5, asOf: "", classLabel: "Class F" } } }, undefined, NOW), null, "a rating needs its as-at date");
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 5, asOf: "2026-08-31", classLabel: "Class F" } } }, undefined, NOW), null, "a rating needs its source link");
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 5, asOf: "2026-08-31", classLabel: "Class F", url: "https://global.morningstar.com/x" } } }, undefined, NOW), null, "a valid Morningstar rating alone: no Fundata FundGrade A or B, no awards");
  assert.equal(rankingsToShow({ rankings: { ...seb().rankings!, morningstar: { stars: 5, asOf: "2026-08-31", classLabel: "Class F", url: "https://global.morningstar.com/x" } } }, undefined, NOW)!.morningstar!.stars, 5);
  assert.equal(rankingsToShow({ rankings: { fundLibrary: [{ ...seb().rankings!.fundLibrary![0], url: undefined }] } }, undefined, NOW), null, "a Fundata ranking needs its source link");
  assert.equal(rankingsToShow({ rankings: { morningstar: { stars: 5, asOf: "2026-08-31" } as never } }, undefined, NOW), null, "a rating needs its class");
});

test("cifscCategory: the admin's, else the Fundata category when unambiguous, in the page language", () => {
  assert.equal(cifscCategory(seb(), "en", undefined, NOW), "Canadian Fixed Income");
  assert.equal(cifscCategory(seb(), "fr", undefined, NOW), "Revenu fixe canadien");
  assert.equal(cifscCategory({ ...seb(), cifscCategory: { en: "Own", fr: "Propre" } }, "fr"), "Propre");
  assert.equal(cifscCategory({}, "en"), null);
  const two = { rankings: { fundLibrary: [...seb().rankings!.fundLibrary!, ...SEEDED_RANKINGS["multi-strategy"]!.fundLibrary!] } };
  assert.equal(cifscCategory(two, "en", undefined, NOW), null, "two different categories: none is claimed");
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

test("rankingsToShow: Fundata entries of a class the fund does not have are dropped; blocks older than ~6 months are hidden", () => {
  const own = [{ fundserv: "LDM201" }, { fundserv: "ldm202" }];
  assert.equal(rankingsToShow(seb(), own, NOW)!.fundLibrary.length, 1);
  assert.equal(rankingsToShow(seb(), [{ fundserv: "LDM001" }], NOW), null, "other fund's class: entry dropped, so no FundGrade and no awards (Morningstar alone does not qualify)");
  assert.equal(rankingsToShow({ rankings: { fundLibrary: [{ ...seb().rankings!.fundLibrary![0], fundserv: undefined }] } }, own, NOW), null, "no FundServ: cannot be matched");
  const late = new Date("2027-05-01T00:00:00Z");
  assert.equal(rankingsToShow(seb(), own, late), null, "as at 2026-08-31 and 2026-10-01: both older than 6 months");
  const mixed = { rankings: { fundLibrary: seb().rankings!.fundLibrary, morningstar: { stars: 5 as const, asOf: "2027-02-01", classLabel: "Class F", url: "https://global.morningstar.com/x" } } };
  assert.equal(rankingsToShow(mixed, own, late), null, "the stale Fundata entry carried the FundGrade: a fresh Morningstar rating alone shows nothing");
  const fresh = { rankings: { ...mixed.rankings, fundLibrary: [{ ...seb().rankings!.fundLibrary![0], asOf: "2027-04-30" }] } };
  const r = rankingsToShow(fresh, own, late)!;
  assert.equal(r.fundLibrary.length, 1); assert.equal(r.morningstar?.stars, 5);
});

/* ------------------------------------------------------------------ awards gate (Gabriel, 2026-10-04) */

test("awards gate: the tab and the overview rating block need a shown Fundata FundGrade of A or B", () => {
  assert.equal(awardsEligible([{ fundGrade: "A" }]), true);
  assert.equal(awardsEligible([{ fundGrade: " b " }]), true);
  for (const g of ["C", "D", "E", "", undefined]) assert.equal(awardsEligible([{ fundGrade: g }]), false, `grade ${g}`);
  assert.equal(awardsEligible([]), false);
  const content = (k: "monthly-income" | "sustainable-enhanced-bonds" | "multi-strategy"): FundContent => ({ rankings: structuredClone(SEEDED_RANKINGS[k]) });
  assert.ok(rankingsToShow(content("monthly-income"), [{ fundserv: "LDM001" }], NOW), "Monthly Income: FundGrade B");
  assert.ok(rankingsToShow(content("sustainable-enhanced-bonds"), [{ fundserv: "LDM201" }], NOW), "SEB: FundGrade A");
  assert.equal(rankingsToShow(content("multi-strategy"), [{ fundserv: "LDM301" }], NOW), null, "Multi-Strategy: FundGrade C, whole tab hidden");
  // RBC (or any percentile ranking) alone does not qualify either
  const rbcOnly: FundContent = { rankings: { thirdParty: structuredClone(SEEDED_THIRD_PARTY["monthly-income"]) } };
  assert.ok(rbcOnly.rankings!.thirdParty!.length > 0);
  assert.equal(rankingsToShow(rbcOnly, [{ fundserv: "LDM001" }], NOW), null);
});

test("awards gate, server side: a fund that does not qualify receives no rankings, its CIFSC category line survives", () => {
  const multi: FundContent = { tagline: { en: "t", fr: "t" }, rankings: structuredClone(SEEDED_RANKINGS["multi-strategy"]) };
  const g = gateAwards(multi, [{ fundserv: "LDM301" }]);
  assert.equal(g.rankings, undefined);
  assert.deepEqual(g.cifscCategory, { en: "Alternative Multi-Strategy", fr: "Multistratégies alternatives" });
  assert.equal(g.tagline?.en, "t");
  assert.equal(cifscCategory(g, "fr"), "Multistratégies alternatives");
  assert.deepEqual(gateAwards({ ...multi, cifscCategory: { en: "Own", fr: "Propre" } }).cifscCategory, { en: "Own", fr: "Propre" }, "the admin's category wins");
  const seb2 = { rankings: structuredClone(SEEDED_RANKINGS["sustainable-enhanced-bonds"]) } as FundContent;
  assert.equal(gateAwards(seb2, [{ fundserv: "LDM201" }]), seb2, "qualifying fund: unchanged");
  assert.deepEqual(gateAwards({}), {});
});

test("awards order: Morningstar, then Fundata, then RBC Investor Services before the other percentile rankings", () => {
  const base = SEEDED_RANKINGS["monthly-income"]!;
  const rbc = SEEDED_THIRD_PARTY["monthly-income"]![0];
  const ev = { ...rbc, provider: "evestment" as const, url: "https://www.evestment.example/x", edition: undefined };
  const r = rankingsToShow({ rankings: { ...base, thirdParty: [ev, rbc] } }, [{ fundserv: "LDM001" }], NOW)!;
  assert.deepEqual(r.thirdParty.map((e) => e.provider), ["rbc-pfs", "evestment"]);
  const src = readFileSync(join(ROOT, "src/components/fund/Awards.tsx"), "utf8");
  const tab = src.slice(src.indexOf("export function AwardsTab"));
  const at = (re: RegExp) => tab.search(re);
  assert.ok(at(/awards-morningstar/) > 0 && at(/awards-morningstar/) < at(/r\.fundLibrary\.map/) && at(/r\.fundLibrary\.map/) < at(/r\.thirdParty\.map/), "Morningstar → Fundata → third parties");
});
