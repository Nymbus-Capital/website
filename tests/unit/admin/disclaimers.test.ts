import { test } from "node:test";
import assert from "node:assert/strict";
import { DISC, DISCLAIMERS, FUND_INCEPTION, disclaimersHash, footerDisclaimers, preInceptionNote } from "../../../src/content/disclaimers.ts";
import { complianceState, currentDisclaimersHash } from "../../../src/components/admin/compliance.ts";
import { T } from "../../../src/components/fund/copy.ts";
import type { SiteContent } from "../../../src/lib/data/types.ts";

test("every disclaimer is bilingual, located and has review points", () => {
  const ids = new Set<string>();
  for (const d of DISCLAIMERS) {
    assert.ok(!ids.has(d.id), `duplicate id ${d.id}`);
    ids.add(d.id);
    assert.ok(d.text.en.length > 30 && d.text.fr.length > 30, d.id);
    assert.notEqual(d.text.en, d.text.fr, d.id);
    assert.ok(d.where.length > 0 && d.where.every((w) => w.href.startsWith("/")), d.id);
    assert.ok(d.review.length > 0, d.id);
  }
});

test("required boilerplate elements are present (EN and FR)", () => {
  const all = (l: "en" | "fr") => footerDisclaimers().map((t) => t[l]).join(" ");
  const en = all("en");
  for (const s of ["trailing commissions", "management fees and expenses", "fund facts", "not guaranteed", "values change frequently", "past performance may not be repeated",
    "historical annual compounded total returns", "reinvestment of all distributions", "income taxes", "FTSE", "not investment", "offer", "gross of", "managed accounts", "October 5, 2021", "January 2019", "Autorité des marchés financiers"]) {
    assert.ok(en.toLowerCase().includes(s.toLowerCase()), `EN missing: ${s}`);
  }
  const fr = all("fr");
  for (const s of ["commissions de suivi", "frais de gestion", "aperçu du fonds", "ne sont pas garantis", "fluctue souvent", "rendement passé", "réinvestissement", "impôt", "FTSE", "offre", "comptes gérés", "5 octobre 2021", "janvier 2019"]) {
    assert.ok(fr.toLowerCase().includes(s.toLowerCase()), `FR missing: ${s}`);
  }
});

test("fund page copy uses the single disclaimers module", () => {
  assert.equal(T.disclosure.standard, DISCLAIMERS.find((d) => d.id === "fundStandard")!.text);
  assert.equal(T.disclosure.net, DISCLAIMERS.find((d) => d.id === "returnsNet")!.text);
  assert.equal(T.hero.grossNote, DISCLAIMERS.find((d) => d.id === "gmvGross")!.text);
  assert.equal(T.disclosure.general, DISCLAIMERS.find((d) => d.id === "firm")!.text);
});

test("pre-launch note only where configured", () => {
  assert.ok(preInceptionNote("monthly-income")!.en.includes("2021"));
  assert.equal(preInceptionNote("multi-strategy"), null);
  assert.ok(FUND_INCEPTION["monthly-income"]);
});

test("admin firm override replaces the boilerplate firm text in the footer", () => {
  const o = { en: "Custom firm text", fr: "Texte personnalisé" };
  assert.equal(footerDisclaimers(o)[0], o);
  assert.notEqual(footerDisclaimers({ en: " ", fr: "" })[0].en, " ");
  assert.equal(footerDisclaimers().length, footerDisclaimers(o).length);
});

test("hash changes with overrides, ignores empty ones and key order", () => {
  const h0 = disclaimersHash();
  assert.match(h0, /^[0-9a-f]{16}$/);
  assert.equal(disclaimersHash({ firm: { en: "", fr: " " }, performanceNotes: { x: { en: "", fr: "" } } }), h0);
  const h1 = disclaimersHash({ firm: { en: "A", fr: "B" } });
  assert.notEqual(h1, h0);
  const a = disclaimersHash({ performanceNotes: { "monthly-income": { en: "n", fr: "n" }, "multi-strategy": { en: "m", fr: "m" } } });
  const b = disclaimersHash({ performanceNotes: { "multi-strategy": { en: "m", fr: "m" }, "monthly-income": { en: "n", fr: "n" } } });
  assert.equal(a, b);
  assert.notEqual(a, h0);
});

const content = (o: Partial<SiteContent> = {}): SiteContent => ({
  version: 3, updatedAt: "", updatedBy: "", firm: {}, funds: {}, pipeline: { publishMode: "auto" }, ...o,
});

test("compliance state: never → approved → changed when an override changes", () => {
  const c = content();
  assert.equal(complianceState(c).status, "never");
  const approved = content({ compliance: { approvedAt: "2026-09-29T00:00:00Z", approvedBy: "cco@nymbus.ca", textsHash: currentDisclaimersHash(c) } });
  assert.equal(complianceState(approved).status, "approved");
  const changedNote = { ...approved, funds: { "monthly-income": { performanceNote: { en: "new", fr: "nouveau" } } } };
  assert.equal(complianceState(changedNote).status, "changed");
  const changedFirm = { ...approved, firm: { disclaimer: { en: "x", fr: "y" } } };
  assert.equal(complianceState(changedFirm).status, "changed");
  // other content edits do not require a new review
  const otherEdit = { ...approved, firm: { aumLabel: { en: "2 B$", fr: "2 G$" } }, funds: { "multi-strategy": { mer: "1%" } } };
  assert.equal(complianceState(otherEdit).status, "approved");
});

test("pre-launch footer paragraph is omitted when its fund is hidden", () => {
  const shown = footerDisclaimers(null).map((t) => t.en).join(" ");
  const hidden = footerDisclaimers(null, ["monthly-income"]).map((t) => t.en).join(" ");
  assert.ok(shown.includes("October 5, 2021"));
  assert.ok(!hidden.includes("October 5, 2021"));
  assert.ok(hidden.includes("not guaranteed"));
});

test("other regulatory-sounding fund strings come from the module (covered by the compliance hash)", () => {
  const ids = DISCLAIMERS.map((d) => d.id);
  for (const id of ["basisLabels", "sample", "provenance"]) assert.ok(ids.includes(id), id);
  assert.equal(T.hero.basisGross, DISC.basisGross);
  assert.equal(T.hero.basisNet, DISC.basisNet);
  assert.equal(T.disclosure.sample, DISC.sample);
  assert.equal(T.disclosure.provenance, DISC.provenance);
  assert.ok(DISCLAIMERS.find((d) => d.id === "basisLabels")!.text.en.includes(DISC.basisGross.en));
});
