/**
 * ESG scope (Gabriel, 2026-10-02): "it's only our sustainable enhanced bond fund that has these exclusions, make sure
 * that it doesn't make it look like this is applied firmwide." On the firm-level pages (home, approach, about,
 * solutions, sustainability, strategies, news, the other funds' texts and registry entries), any EN or FR string that
 * talks about exclusions, ESG screens or ESG criteria must name the Sustainable Enhanced Bonds Fund, either in the
 * string itself or in the block it belongs to (a section's title / lead / eyebrow next to it).
 * Firm commitments (PRI signatory, Tobacco-Free Finance Pledge) do not use that wording and stay firm-level.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { FUND_TEXTS } from "../../../src/components/fund/copy.ts";
import { HOME_COPY, FUND_COPY } from "../../../src/components/site/home/copy.ts";
import { SCAN_COPY } from "../../../src/components/site/fx/scan-copy.ts";
import { NEWS } from "../../../src/components/site/home/news.ts";
import { AB } from "../../../src/components/site/pages/copy-about.ts";
import { AP } from "../../../src/components/site/pages/copy-approach.ts";
import { CT } from "../../../src/components/site/pages/copy-contact.ts";
import { SU } from "../../../src/components/site/pages/copy-sustainability.ts";
import { SOL_COPY, AUDIENCES } from "../../../src/components/site/pages/solutions-copy.ts";
import { STRAT_COPY } from "../../../src/components/site/pages/strategies-copy.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import { team } from "../../../src/data/team.ts";

type Lang = "en" | "fr";
const SCOPE: Record<Lang, RegExp> = {
  en: /exclu|\bESG\b|(?:positive|negative|sustainab\w*|exclusion)\s+screen/i,
  fr: /exclu|\bESG\b|filtr\w*\s+(?:positif|négatif|d’exclusion|de durabilité)/i,
};
const SEB: Record<Lang, RegExp> = {
  en: /Sustainable Enhanced Bonds? Fund/,
  fr: /Fonds Obligations Durables Bonifiées/,
};

const isL = (x: unknown): x is { en: string; fr: string } =>
  !!x && typeof x === "object" && typeof (x as { en?: unknown }).en === "string" && typeof (x as { fr?: unknown }).fr === "string";

/** Strings of `lang` that use exclusion / ESG-screen wording without the fund's name in the string or its block. */
export function unscoped(value: unknown, where: string, lang: Lang, context: string[] = [], out: string[] = []): string[] {
  if (isL(value)) {
    const s = value[lang];
    if (SCOPE[lang].test(s) && !SEB[lang].test(s) && !context.some((c) => SEB[lang].test(c))) out.push(`${where} (${lang}): ${s.slice(0, 90)}`);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => unscoped(v, `${where}[${i}]`, lang, context, out));
    return out;
  }
  if (value && typeof value === "object") {
    // the block's own texts (title, lead, eyebrow, …) scope everything inside it
    const own = Object.values(value as Record<string, unknown>).filter(isL).map((x) => x[lang]);
    const ctx = [...context, ...own];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) unscoped(v, `${where}.${k}`, lang, ctx, out);
  }
  return out;
}

const SEB_KEY = "sustainable-enhanced-bonds";

const FIRM_LEVEL: [string, unknown][] = [
  ["home HOME_COPY", HOME_COPY], ["home FUND_COPY", FUND_COPY], ["home SCAN_COPY", SCAN_COPY], ["news NEWS", NEWS],
  ["about AB", AB], ["approach AP", AP], ["contact CT", CT], ["sustainability SU", SU],
  ["solutions SOL_COPY", SOL_COPY], ["solutions AUDIENCES", AUDIENCES], ["strategies STRAT_COPY", STRAT_COPY],
  // the other funds' own texts and registry entries must not carry the SEB fund's exclusions either
  ...Object.entries(FUND_TEXTS).filter(([k]) => k !== SEB_KEY).map(([k, v]) => [`FUND_TEXTS ${k}`, v] as [string, unknown]),
  ...FUNDS.filter((f) => f.key !== SEB_KEY).map((f) => [`funds.ts ${f.key}`, { name: f.name, short: f.short, assetClass: f.assetClass, defaults: f.defaults }] as [string, unknown]),
  ["team.ts", team.map((m) => ({ bio: { en: m.bio, fr: m.bioFr ?? m.bio }, title: { en: m.title, fr: m.titleFr ?? m.title } }))],
];

test("ESG scope: exclusion / ESG-screen wording on firm-level pages always names the Sustainable Enhanced Bonds Fund (EN + FR)", () => {
  const bad: string[] = [];
  for (const [name, value] of FIRM_LEVEL) for (const lang of ["en", "fr"] as const) unscoped(value, name, lang, [], bad);
  assert.deepEqual(bad, []);
});

test("ESG scope: the sustainability page says the criteria are the fund's, and keeps the firm commitments firm-level", () => {
  for (const lang of ["en", "fr"] as const) {
    assert.match(SU.hero.lead[lang], SEB[lang], `hero lead (${lang})`);
    assert.match(SU.exclusions.lead[lang], SEB[lang], `exclusions lead (${lang})`);
    assert.match(SU.integration.eyebrow[lang], SEB[lang], `integration eyebrow (${lang})`);
  }
  assert.match(SU.exclusions.lead.en, /^The ESG criteria and exclusions below are those of the Sustainable Enhanced Bonds Fund/);
  // attribution only: no claim about what the firm's other portfolios exclude, and the pledge never reads as a portfolio exclusion
  for (const lang of ["en", "fr"] as const) {
    assert.ok(!/other funds|autres fonds/i.test(JSON.stringify(SU)), "no statement about the other funds' exclusions");
    for (const c of SU.commitments.items) assert.ok(!/exclu/i.test(c.d[lang]), `pledge text (${lang}) implies a portfolio exclusion`);
  }
  assert.ok(SU.commitments.items.some((c) => /PRI/.test(c.t.en)) && SU.commitments.items.some((c) => /Tobacco-Free Finance Pledge/.test(c.t.en)));
});

test("ESG scope: the check catches firm-wide wording and accepts a scoped block (self-test)", () => {
  const firmWide = { a: { en: "We apply ESG exclusions to every portfolio.", fr: "Nous appliquons des exclusions ESG à chaque portefeuille." } };
  assert.equal(unscoped(firmWide, "t", "en").length, 1);
  assert.equal(unscoped(firmWide, "t", "fr").length, 1);
  const scoped = {
    lead: { en: "The Sustainable Enhanced Bonds Fund excludes the issuers below.", fr: "Le Fonds Obligations Durables Bonifiées exclut les émetteurs ci-dessous." },
    items: [{ t: { en: "Exclusion screening", fr: "Filtrage d’exclusion" } }],
  };
  assert.deepEqual(unscoped(scoped, "t", "en"), []);
  assert.deepEqual(unscoped(scoped, "t", "fr"), []);
  // a sibling block does not lend its scope
  assert.equal(unscoped({ x: scoped, y: { t: { en: "Exclusions apply.", fr: "Des exclusions s’appliquent." } } }, "t", "en").length, 1);
});
