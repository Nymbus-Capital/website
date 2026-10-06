import { test } from "node:test";
import assert from "node:assert/strict";
import { aumPublic, cleanFundContent } from "../../../src/components/admin/fund-content.ts";
import { benchmarkLabel } from "../../../src/components/fund/lib/performance.ts";
import { tr } from "../../../src/lib/i18n/config.ts";

test("hide keeps true entries and an explicit aum:false (AUM published)", () => {
  const c = cleanFundContent({ hide: { aum: false, esg: true, nav: false, risk: undefined as unknown as boolean } });
  assert.deepEqual(c.hide, { aum: false, esg: true });
  assert.equal(aumPublic(c), true);
  assert.equal(aumPublic(cleanFundContent({ hide: { aum: true } })), false);
  assert.equal(aumPublic(cleanFundContent({})), false, "hidden by default");
  assert.equal(cleanFundContent({ hide: { nav: false } }).hide, undefined);
});

test("empty strings / L10n / lists are dropped", () => {
  const c = cleanFundContent({ mer: "", tagline: { en: "", fr: "" }, managers: [], description: { en: "d", fr: "d" }, pinnedSnapshot: null });
  assert.deepEqual(c, { description: { en: "d", fr: "d" } });
});

test("tr falls back to EN for an empty FR string", () => {
  assert.equal(tr({ en: "hello", fr: "" }, "fr"), "hello");
  assert.equal(tr({ en: "hello", fr: "bonjour" }, "fr"), "bonjour");
});

test("benchmark label: localized registry name in FR, published index name in EN", () => {
  const b = { en: "FTSE Canada Universe Bond Index", fr: "Indice FTSE Canada des obligations universelles" };
  assert.equal(benchmarkLabel("FTSE Canada Universe Bond Index (published)", b, "fr"), b.fr);
  assert.equal(benchmarkLabel("FTSE Canada Universe Bond Index (published)", b, "en"), "FTSE Canada Universe Bond Index (published)");
  assert.equal(benchmarkLabel(null, b, "en"), b.en);
  assert.equal(benchmarkLabel("X", null, "fr"), "X");
  assert.equal(benchmarkLabel(null, null, "fr"), null);
});

test("bilingual overrides need both languages (or neither)", async () => {
  const { bothOrNeither } = await import("../../../src/components/admin/fund-content.ts");
  assert.equal(bothOrNeither({ en: "a", fr: "b" }), true);
  assert.equal(bothOrNeither({ en: "", fr: "" }), true);
  assert.equal(bothOrNeither({ en: "a", fr: "" }), false);
  assert.equal(bothOrNeither({ en: "", fr: "b" }), false);
  assert.equal(bothOrNeither({ en: "a", fr: "  " }), false);
});
