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
const LEVERAGE_FR = "La superposition ajoute une exposition à effet de levier au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.";
const LOW_CORR_FR = "conçue pour avoir une faible corrélation avec les obligations et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes.";
const DIST_FR = "Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.";

test("concise copy: page leads are short (15 words or fewer)", () => {
  const leads: [string, L][] = [
    ["home hero", HOME_COPY.hero.lead], ["home strategies", HOME_COPY.strategies.lead],
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
    ["about intro", AB.intro.points],
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
  assert.deepEqual(AP.overlay.solD, {
    en: "Our overlay is designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money.*",
    fr: "Notre stratégie de superposition est conçue pour avoir une faible corrélation avec les obligations et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes.*",
  });
  assert.ok(AP.overlay.stackD.en.includes(LEVERAGE));
  assert.match(AP.overlay.foot1.en, /^\* Source: Nymbus Capital Inc\. Statements reflect historical observations/);
  assert.match(AP.overlay.foot2.en, /^\*\* Source: Nymbus Capital Inc\. For illustrative purposes only\./);
  // sustainability: the scope of ESG criteria and exclusions
  assert.match(SU.hero.lead.en, /do not apply in the same way to our futures overlays, which trade exchange-traded futures rather than securities of individual issuers\.$/);
  assert.match(SU.exclusions.lead.en, /They do not apply to exchange-traded futures used in our overlays\.$/);
  assert.match(HOME_COPY.process.steps[3].text.en, /Risk management does not eliminate the risk of loss\.$/);
});

test("concise copy: the same disclosures in French, and the other condensed blocks' caveats", () => {
  const all = (k: keyof typeof FUND_TEXTS) => {
    const f = FUND_TEXTS[k];
    return [f.summary.fr, f.note?.fr ?? "", ...f.feature.cards.map((c) => c.text.fr)].join(" ");
  };
  for (const k of ["monthly-income", "sustainable-enhanced-bonds", "global-minimum-volatility"] as const) {
    assert.ok(all(k).includes(LEVERAGE_FR), `${k}: leverage disclosure (fr)`);
    if (k !== "global-minimum-volatility") assert.ok(all(k).includes(LOW_CORR_FR), `${k}: low-correlation caveat (fr)`);
  }
  assert.ok(FUND_TEXTS["global-minimum-volatility"].summary.fr.endsWith("elle peut ne pas y parvenir et peut subir des pertes."));
  // GMV audience (Gabriel 2026-10-01): primarily family offices, also institutions
  assert.ok(FUND_TEXTS["global-minimum-volatility"].summary.en.startsWith("A managed-futures overlay for family offices and institutions, offered through separately managed accounts."));
  assert.ok(FUND_TEXTS["global-minimum-volatility"].summary.fr.startsWith("Une stratégie de superposition de contrats à terme gérés pour les bureaux de gestion familiale et les institutions, offerte en comptes gérés distincts."));
  const family = AUDIENCES.find((a) => a.key === "family")!;
  assert.equal(family.funds[0], "global-minimum-volatility");
  const managed = family.vehicles.find((v) => v.name.en === "Managed accounts")!.text;
  assert.ok(managed.en.endsWith(LEVERAGE) && managed.fr.endsWith(LEVERAGE_FR), "family managed accounts: leverage disclosure");
  assert.ok(FUND_TEXTS["monthly-income"].summary.fr.includes(DIST_FR));
  assert.ok(FUND_TEXTS["monthly-income"].feature.cards.find((c) => c.icon === "calendar")!.text.fr.includes(DIST_FR));
  // Multi-Strategy hedging caveat
  const hedge = FUND_TEXTS["multi-strategy"].feature.cards.find((c) => c.icon === "umbrella")!.text;
  assert.ok(hedge.en.endsWith("; it may not do so."));
  assert.ok(hedge.fr.endsWith("; elle peut ne pas y parvenir."));
  // SEB: the futures-overlay exception
  const seb = FUND_TEXTS["sustainable-enhanced-bonds"].feature.lead;
  assert.ok(seb.en.endsWith("They do not apply to the futures overlay, which holds no securities of individual issuers."));
  assert.ok(seb.fr.endsWith("Ils ne visent pas la stratégie de superposition, qui ne détient aucun titre d’émetteurs individuels."));
  // approach: leverage (fr), footnotes (fr), step-4 hedging note
  assert.ok(AP.overlay.stackD.fr.includes(LEVERAGE_FR));
  assert.match(AP.overlay.foot1.fr, /^\* Source\u00a0: Nymbus Capital Inc\. Les déclarations présentées reflètent des observations historiques/);
  assert.match(AP.overlay.foot2.fr, /^\*\* Source\u00a0: Nymbus Capital Inc\. À titre indicatif uniquement\./);
  const step4 = AP.steps[3] as { note?: { en: string; fr: string } };
  assert.deepEqual(step4.note, {
    en: "Hedging seeks to limit losses in adverse conditions; it does not eliminate the risk of loss.",
    fr: "La couverture cherche à limiter les pertes en conditions défavorables; elle n’élimine pas le risque de perte.",
  });
  // solutions: the futures-overlay vehicle keeps the leverage disclosure
  const overlay = AUDIENCES.find((a) => a.key === "institutional")!.vehicles.find((v) => v.name.en === "Futures overlay")!.text;
  assert.ok(overlay.en.endsWith(LEVERAGE));
  assert.ok(overlay.fr.endsWith(LEVERAGE_FR));
  assert.ok(overlay.en.includes("most of the capital stays invested in the bonds"));
  // sustainability: ESG scope (fr) and the principles exception
  assert.ok(SU.hero.lead.fr.endsWith("Ils ne s’appliquent pas de la même façon à nos stratégies de superposition, qui portent sur des contrats à terme cotés plutôt que sur des titres d’émetteurs individuels."));
  assert.ok(SU.exclusions.lead.fr.endsWith("Elles ne visent pas les contrats à terme cotés utilisés dans nos stratégies de superposition."));
  assert.ok(SU.principles.lead.en.endsWith("Futures overlays, which do not hold securities of individual issuers, are outside their scope."));
  assert.ok(SU.principles.lead.fr.endsWith("Les stratégies de superposition, qui ne détiennent pas de titres d’émetteurs individuels, n’en font pas partie."));
  assert.ok(HOME_COPY.process.steps[3].text.fr.endsWith("La gestion des risques n’élimine pas le risque de perte."));
});
