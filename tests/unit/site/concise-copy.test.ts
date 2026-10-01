/**
 * Concise copy (2026-09-30): short leads, short bullet lists, one- or two-sentence bios, and the regulatory
 * sentences of the condensed blocks kept word for word.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { FUND_TEXTS } from "../../../src/components/fund/copy.ts";
import { HOME_COPY } from "../../../src/components/site/home/copy.ts";
import { AB } from "../../../src/components/site/pages/copy-about.ts";
import { AP } from "../../../src/components/site/pages/copy-approach.ts";
import { CT } from "../../../src/components/site/pages/copy-contact.ts";
import { SU } from "../../../src/components/site/pages/copy-sustainability.ts";
import { SOL_COPY, AUDIENCES } from "../../../src/components/site/pages/solutions-copy.ts";
import { STRAT_COPY } from "../../../src/components/site/pages/strategies-copy.ts";
import { team } from "../../../src/data/team.ts";

type L = { en: string; fr: string };
const words = (s: string) => s.trim().split(/\s+/).length;
const sentences = (s: string) => s.split(/(?<=[a-z0-9)][.!?])\s+(?=[A-ZÀ-Ý0-9])/).filter(Boolean).length;

const LEVERAGE = "The overlay adds leveraged futures exposure; its losses add to those of the underlying portfolio and may require additional margin.";
const LOW_CORR = "designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money.";
const DIST = "Distributions are not guaranteed, may change and may include a return of capital.";

test("concise copy: page leads are short (15 words or fewer)", () => {
  const leads: [string, L][] = [
    ["home hero", HOME_COPY.hero.lead], ["home approach", HOME_COPY.approach.lead], ["home strategies", HOME_COPY.strategies.lead],
    ["home process", HOME_COPY.process.lead], ["strategies", STRAT_COPY.lead], ["solutions", SOL_COPY.lead],
    ["approach hero", AP.hero.lead], ["approach pipeline", AP.pipe.lead], ["approach bonds", AP.bonds.lead],
    ["about hero", AB.hero.lead], ["contact hero", CT.hero.lead], ["sustainability integration", SU.integration.lead],
    ...AUDIENCES.map((a) => [`solutions ${a.key}`, a.intro] as [string, L]),
    ...Object.entries(FUND_TEXTS).filter(([k]) => k !== "global-minimum-volatility").map(([k, f]) => [`${k} summary (first sentence)`, { en: f.summary.en.split(/(?<=\.)\s/)[0], fr: "" }] as [string, L]),
  ];
  for (const [name, l] of leads) assert.ok(words(l.en) <= 15, `${name}: ${words(l.en)} words`);
});

test("concise copy: bullet lists have 3 to 5 short items, in both languages", () => {
  const lists: [string, L[]][] = [
    ["home approach", HOME_COPY.approach.points], ["about intro", AB.intro.points],
    ...AP.steps.map((s, i) => [`approach step ${i + 1}`, s.bullets] as [string, L[]]),
    ...Object.entries(FUND_TEXTS).map(([k, f]) => [`${k} focus`, f.focus] as [string, L[]]),
    ...AUDIENCES.map((a) => [`solutions ${a.key}`, a.benefits] as [string, L[]]),
  ];
  for (const [name, items] of lists) {
    assert.ok(items.length >= 3 && items.length <= 5, `${name}: ${items.length} items`);
    for (const it of items) {
      assert.ok(it.en.trim() && it.fr.trim(), `${name}: missing translation`);
      assert.ok(words(it.en) <= 12, `${name}: "${it.en}" has ${words(it.en)} words`);
    }
  }
});

test("concise copy: biographies are one or two sentences", () => {
  for (const m of team) {
    assert.ok(sentences(m.bio) <= 2, `${m.name} (en): ${sentences(m.bio)} sentences`);
    if (m.bioFr) assert.ok(sentences(m.bioFr) <= 2, `${m.name} (fr): ${sentences(m.bioFr)} sentences`);
  }
});

test("concise copy: overlay and distribution disclosures survive the cut, word for word", () => {
  const all = (k: keyof typeof FUND_TEXTS) => {
    const f = FUND_TEXTS[k];
    return [f.summary.en, f.note?.en ?? "", ...f.feature.cards.map((c) => c.text.en)].join(" ");
  };
  for (const k of ["monthly-income", "sustainable-enhanced-bonds", "global-minimum-volatility"] as const) {
    assert.ok(all(k).includes(LEVERAGE), `${k}: leverage disclosure`);
    assert.ok(all(k).includes(LOW_CORR), `${k}: low-correlation caveat`);
    assert.ok(FUND_TEXTS[k].note?.en.includes(k === "global-minimum-volatility" ? LEVERAGE : LOW_CORR), `${k}: note under the approach`);
  }
  assert.ok(FUND_TEXTS["monthly-income"].summary.en.includes(DIST));
  assert.ok(FUND_TEXTS["monthly-income"].feature.cards.find((c) => c.icon === "calendar")!.text.en.includes(DIST));
  // approach page: the overlay caveat, the leverage disclosure and both footnotes
  assert.ok(AP.overlay.solD.en.includes(LOW_CORR.replace(/\.$/, "")));
  assert.ok(AP.overlay.stackD.en.includes(LEVERAGE));
  assert.match(AP.overlay.foot1.en, /^\* Source: Nymbus Capital Inc\. Statements reflect historical observations/);
  assert.match(AP.overlay.foot2.en, /^\*\* Source: Nymbus Capital Inc\. For illustrative purposes only\./);
  // sustainability: the scope of ESG criteria and exclusions
  assert.match(SU.hero.lead.en, /do not apply in the same way to our futures overlays, which trade exchange-traded futures rather than securities of individual issuers\.$/);
  assert.match(SU.exclusions.lead.en, /They do not apply to exchange-traded futures used in our overlays\.$/);
  assert.match(HOME_COPY.approach.cards[2].text.en, /Risk management does not eliminate the risk of loss\.$/);
});
