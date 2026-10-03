/**
 * Content v3 (2026-10-02): team data from the nymbus-decks team list (photos self-hosted, credentials as text),
 * credential counters computed from the data, approach risk-first and multi-strategy sections, solutions use cases
 * with their disclosures, the advisors rankings slot, and Global Minimum Volatility figures always named by variant.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { team } from "../../../src/data/team.ts";
import { badgesOf, combinedExperience, countCharter, countEngineering, countGraduate, countHolding, countPhD } from "../../../src/components/site/pages/lib/people.ts";
import { AP } from "../../../src/components/site/pages/copy-approach.ts";
import { AB } from "../../../src/components/site/pages/copy-about.ts";
import { AUDIENCES } from "../../../src/components/site/pages/solutions-copy.ts";
import { HOME_COPY, FUND_COPY } from "../../../src/components/site/home/copy.ts";
import { SU } from "../../../src/components/site/pages/copy-sustainability.ts";
import { FUND_TEXTS } from "../../../src/components/fund/copy.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import { toFundCard } from "../../../src/components/site/home/data.ts";
import type { FundData } from "../../../src/lib/data/types.ts";

const ROOT = resolve(import.meta.dirname, "../../..");
const OVERLAY_ADDS = "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.";
const OVERLAY_ADDS_FR = "La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.";

/* ------------------------------------------------------------------ team */

test("team: self-hosted photos exist, are small WebP portraits, and only portraits are in public/team (no logos)", () => {
  const dir = join(ROOT, "public/team");
  const files = readdirSync(dir);
  for (const f of files) {
    assert.match(f, /^[a-z-]+\.webp$/, `unexpected file in public/team: ${f}`);
    assert.ok(statSync(join(dir, f)).size < 40_000, `${f} is larger than 40 kB`);
    // every file is somebody's portrait
    assert.ok(team.some((m) => m.photo === `/team/${f}`), `${f} is not a team portrait`);
  }
  for (const m of team) if (m.photo?.startsWith("/")) assert.ok(existsSync(join(ROOT, "public", m.photo)), `${m.name}: ${m.photo} missing`);
});

test("team: LinkedIn links are https linkedin.com profiles, each person's own (no duplicate URL)", () => {
  const links = team.filter((m) => m.linkedin).map((m) => m.linkedin!);
  for (const u of links) assert.match(u, /^https:\/\/www\.linkedin\.com\/in\/[\w%-]+\/?$/);
  assert.equal(new Set(links).size, links.length, "two people share a LinkedIn URL (the decks data had copy-paste errors)");
});

test("team: credential counts are computed from the data, never typed", () => {
  const holding = (re: RegExp) => team.filter((m) => [...(m.designations ?? []), ...(m.education ?? [])].some((d) => re.test(d))).length;
  assert.equal(countPhD(team), holding(/^PhD\b/i));
  assert.equal(countCharter(team), holding(/^(CFA|CIM)$/));
  assert.equal(countGraduate(team), holding(/^(PhD|M\.?\s?Sc|MBA)\b/i));
  assert.equal(countEngineering(team), team.filter((m) => (m.education ?? []).some((d) => /engineering|computer science/i.test(d))).length);
  const exp = combinedExperience(team)!;
  assert.equal(exp.years, team.reduce((a, m) => a + (m.yearsExperience ?? 0), 0));
  assert.equal(exp.plus, true, "lower bounds (+40) and people without a stated figure make the sum a minimum");
  assert.equal(combinedExperience([]), null);
  assert.equal(countHolding([], /x/), 0);
});

test("team: the counters see what the data holds today (2 PhDs, 3 engineering / CS degrees, 7 CFA or CIM; live decks team 2026-10-03)", () => {
  // pinned so a data change is a visible, reviewed change of the public figures
  assert.equal(countPhD(team), 2);
  assert.equal(countEngineering(team), 3);
  assert.equal(countCharter(team), 7);
  assert.equal(countGraduate(team), 10);
  assert.equal(combinedExperience(team)!.years, 293);
  assert.equal(team.length, 20);
});

test("team: badges are short text credentials, key ones (PhD, CFA, CIM) flagged, French forms in French", () => {
  const jessica = team.find((m) => m.name === "Jessica Martins")!;
  assert.deepEqual(badgesOf(jessica, "en").map((b) => [b.label, b.key]), [["PhD", true]]);
  assert.deepEqual(badgesOf(jessica, "fr").map((b) => [b.label, b.key]), [["Ph. D.", true]]);
  assert.equal(badgesOf(team.find((m) => m.name === "Gabriel Cefaloni")!, "fr")[0].long, "Gestionnaire de placements agréé (CIM)");
  const diane = team.find((m) => m.name === "Diane Dusabimana")!;
  assert.deepEqual(badgesOf(diane, "en").map((b) => b.label), ["CFA", "CPA", "MBA"]);
});

test("team: wording gives the futures overlays room next to fixed income (about intro, overlay lead's bio)", () => {
  assert.match(AB.intro.points[0].en, /systematic fixed income and futures overlays/);
  assert.match(AB.intro.points[0].fr, /revenu fixe systématique et superpositions/);
  const mpb = team.find((m) => m.name === "Mathieu Poulin-Brière")!;
  assert.match(mpb.bio, /overlay strategies on listed futures/);
  for (const m of team) if (m.educationFr) assert.equal(m.educationFr.length, m.education?.length, `${m.name}: education EN/FR lengths differ`);
});

/* ------------------------------------------------------------------ approach, solutions */

test("approach: risk-first and multi-strategy sections keep low correlation as an objective, with the overlay disclosure", () => {
  assert.match(AP.risk.lead.en, /^Ultra-micro analysis, at scale/);
  assert.match(AP.risk.items[2].d.en, /^Designed to offset part of bond losses, with low correlation with bonds in down months/);
  assert.ok(!/protective|protectri/i.test(JSON.stringify([AP, AUDIENCES])), "no 'protective' overlay as a fact");
  // "liquid alternative" approved for Multi-Strategy by Gabriel (2026-10-03), category "Alternative Multi-Strategy"
  assert.match(AP.multi.offers[1].d.en, /Alternative Multi-Strategy/);
  assert.match(AP.multi.offers[1].d.fr, /Multistratégies alternatives/);
  assert.ok(!/uncorrelated|non corrélé/i.test(JSON.stringify(AP)), "no 'uncorrelated' as a fact");
  assert.match(AP.multi.lead.en, /^A liquid alternative across asset classes, designed to have low correlation with stocks and bonds in down months\.$/);
  assert.ok(AP.multi.note.en.endsWith(OVERLAY_ADDS));
  assert.ok(AP.multi.note.fr.endsWith(OVERLAY_ADDS_FR));
  assert.match(AP.multi.note.en, /^Illustration only/);
  assert.equal(AP.multi.strategies.length, 4);
});

test("solutions: three illustrative use cases; overlay ones carry the futures-exposure disclosure; no ranking claim in the copy", () => {
  for (const a of AUDIENCES) {
    assert.ok(a.useCase.steps.length >= 3, a.key);
    for (const s of a.useCase.steps) assert.ok(s.en.trim() && s.fr.trim());
  }
  for (const k of ["institutional", "family"] as const) {
    const n = AUDIENCES.find((a) => a.key === k)!.useCase.note!;
    assert.ok(n.en.includes(OVERLAY_ADDS) && n.fr.includes(OVERLAY_ADDS_FR), `${k}: overlay disclosure`);
    assert.match(n.en, /may not reach its objective and can lose money/);
  }
  const text = JSON.stringify(AUDIENCES);
  assert.ok(!/percentile|quartile|eVestment|Lipper|LSEG|GMR|pooled fund survey|top \d/i.test(text), "rankings come from the awards data, never the copy");
  assert.ok(!/guarantee/i.test(text.replace(/not guaranteed/gi, "")));
});

test("solutions: the real AdvisorRankings renders exactly once, in its own section after the advisors card (not in a use case)", () => {
  assert.ok(!existsSync(join(ROOT, "src/components/site/pages/AdvisorRankings.tsx")), "the content-v3 placeholder is gone");
  const sol = readFileSync(join(ROOT, "src/components/site/pages/Solutions.tsx"), "utf8");
  assert.match(sol, /import \{ AdvisorRankings, useAdvisorRankingItems \} from "\.\.\/AdvisorRankings";/);
  assert.equal(sol.match(/<AdvisorRankings\b/g)?.length, 1);
  const uc = sol.slice(sol.indexOf("function UseCase"), sol.indexOf("function RankingsSection"));
  assert.ok(!/<AdvisorRankings/.test(uc), "never inside the illustrative use case");
  assert.match(sol, /a\.key === "advisor" \? <RankingsSection/);
});

/* ------------------------------------------------------------------ Global Minimum Volatility: name the variant */

test("GMV: any copy that pairs the strategy with a percentage names the downside-volatility variant", () => {
  const leaves = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : []);
  const gmv = FUNDS.find((f) => f.key === "global-minimum-volatility")!;
  const all = [...leaves([HOME_COPY, FUND_COPY, AP, AB, AUDIENCES, SU, FUND_TEXTS]), ...leaves(gmv.defaults)];
  for (const s of all) {
    if (/Global Minimum Volatility|GMV/.test(s) && /\d\s?%/.test(s)) assert.match(s, /downside volatility|volatilité baissière|volatilité à la baisse/, s.slice(0, 100));
  }
});

test("GMV: the cards show the default variant's own figures and name it (6% downside volatility)", () => {
  const sample = JSON.parse(readFileSync(join(ROOT, "src/lib/data/sample-site-data.json"), "utf8")) as { funds: Record<string, FundData> };
  const spec = FUNDS.find((f) => f.key === "global-minimum-volatility")!;
  const data = sample.funds[spec.key];
  const card = toFundCard({ spec, content: {}, data, sample: true } as never);
  // one label implementation: the data-driven variant name of src/config/funds.ts (shownVariant)
  assert.deepEqual(card.perfVariant, { en: "6% downside volatility", fr: "volatilité à la baisse de 6\u00a0%" });
  assert.equal(card.si, data.variants!["6"].performance!.trailing.fund.SI);
  // a variant that is not published shows nothing rather than another variant's figures
  const none = toFundCard({ spec, content: {}, data: { ...data, variants: {} }, sample: true } as never);
  assert.equal(none.si, null);
  assert.equal(none.perfVariant, null, "no figures: no label");
  // funds without variants carry none
  const mi = FUNDS.find((f) => f.key === "monthly-income")!;
  assert.equal(toFundCard({ spec: mi, content: {}, data: sample.funds[mi.key], sample: true } as never).perfVariant, null);
});
