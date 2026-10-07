/**
 * Word budget (2026-10-01): "diminish the text as much as possible". Ceilings sit just above today's copy so
 * the pages cannot silently grow back; lower them when the copy is cut further. Legal pages are excluded.
 * Raised 2026-10-02 (content v3, Gabriel's requests): approach +risk-first section, +multi-strategy diagram and its
 * mandatory overlay disclosure; about +credentials band; solutions +three illustrative use cases, each with its risk
 * disclosure. The new texts are counted, aria labels included. 2026-10-03: approach 740 (down-month correlation wording).
 * Lowered 2026-10-03 (copy v4, Gabriel: "a little bit too much text"): body copy trimmed, disclosures verbatim; fund-page
 * marketing texts (FUND_TEXTS) now have their own ceiling. Sustainability stays at 350 (accurate pledge wording added).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { HOME_COPY } from "../../../src/components/site/home/home.copy.ts";
import { SCAN_COPY } from "../../../src/components/site/fx/scan-copy.ts";
import { OVERLAY_COPY } from "../../../src/components/site/fx/overlay.copy.ts";
import { CC } from "../../../src/components/site/concepts/concepts.copy.ts";
import { AB } from "../../../src/components/site/pages/about.copy.ts";
import { AP } from "../../../src/components/site/pages/approach.copy.ts";
import { CT } from "../../../src/components/site/pages/contact.copy.ts";
import { SU } from "../../../src/components/site/pages/sustainability.copy.ts";
import { SOL_COPY, AUDIENCES } from "../../../src/components/site/pages/solutions.copy.ts";
import { STRAT_COPY } from "../../../src/components/site/pages/strategies.copy.ts";
import { FUND_TEXTS } from "../../../src/components/fund/fund.copy.ts";

function words(x: unknown, lang: "en" | "fr"): number {
  if (Array.isArray(x)) return x.reduce((a: number, v) => a + words(v, lang), 0);
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (typeof o.en === "string" && typeof o.fr === "string")
      return String(o[lang]).trim().split(/\s+/).filter(Boolean).length;
    return Object.entries(o).reduce((a, [k, v]) => (k === "meta" ? a : a + words(v, lang)), 0);
  }
  return 0;
}

const BUDGET: [string, unknown, number][] = [
  ["home", [HOME_COPY, SCAN_COPY], 285],
  // the "diversifying engines" band (2026-10-02) has its own ceiling: home above stays as it was
  // 2026-10-05 review: + "generated" on the market group header, and a fuller accessible name (heatmap, "designed to")
  ["home engines band", OVERLAY_COPY, 180],
  // + the protective-overlay qualifier (2026-10-04, compliance: the name never stands alone)
  ["about", AB, 285],
  ["approach", AP, 690],
  // 2026-10-06 contact form backend: + consent sentence, sending / sent / error states (mailto "ready" state removed)
  ["contact", CT, 305],
  ["sustainability", SU, 350],
  ["solutions", [SOL_COPY, AUDIENCES], 520],
  ["strategies", STRAT_COPY, 120],
  ["fund pages (FUND_TEXTS)", FUND_TEXTS, 680],
  // /core-concepts (was /critical-concepts, 2026-10-03): everything counted, canvas labels, alt texts and the overlay disclosure included
  // concepts v5 (2026-10-03, Gabriel): + overlay volatility (vega) strip, note and caption sentence; + six sector names
  // in three canvas lengths (long / short / abbreviation, about 30 words); concept 3 renamed "Ultra-micro analysis, at scale"
  // core concepts (2026-10-03, Gabriel): "protective overlays" carry the "designed to offset part of losses; may not" qualifier
  // in the lead, alt text and caption (compliance) — about +25 words; concept 3 drawn as a "VS" comparison (side labels,
  // longer alt text) — about +20
  ["core concepts", CC, 720],
];

test("word budget: every page stays within its English ceiling, French within 25% more", () => {
  for (const [name, copy, max] of BUDGET) {
    assert.ok(words(copy, "en") <= max, `${name} (en): ${words(copy, "en")} > ${max}`);
    assert.ok(
      words(copy, "fr") <= Math.round(max * 1.25),
      `${name} (fr): ${words(copy, "fr")} > ${Math.round(max * 1.25)}`,
    );
  }
});
