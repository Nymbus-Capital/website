/**
 * Word budget (2026-10-01): "diminish the text as much as possible". Ceilings sit just above today's copy so
 * the pages cannot silently grow back; lower them when the copy is cut further. Legal pages are excluded.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { HOME_COPY } from "../../../src/components/site/home/copy.ts";
import { SCAN_COPY } from "../../../src/components/site/fx/scan-copy.ts";
import { OVERLAY_COPY } from "../../../src/components/site/fx/overlay-copy.ts";
import { AB } from "../../../src/components/site/pages/copy-about.ts";
import { AP } from "../../../src/components/site/pages/copy-approach.ts";
import { CT } from "../../../src/components/site/pages/copy-contact.ts";
import { SU } from "../../../src/components/site/pages/copy-sustainability.ts";
import { SOL_COPY, AUDIENCES } from "../../../src/components/site/pages/solutions-copy.ts";
import { STRAT_COPY } from "../../../src/components/site/pages/strategies-copy.ts";

function words(x: unknown, lang: "en" | "fr"): number {
  if (Array.isArray(x)) return x.reduce((a: number, v) => a + words(v, lang), 0);
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (typeof o.en === "string" && typeof o.fr === "string") return String(o[lang]).trim().split(/\s+/).filter(Boolean).length;
    return Object.entries(o).reduce((a, [k, v]) => (k === "meta" ? a : a + words(v, lang)), 0);
  }
  return 0;
}

const BUDGET: [string, unknown, number][] = [
  ["home", [HOME_COPY, SCAN_COPY], 300],
  // the "diversifying engines" band (2026-10-02) has its own ceiling: home above stays as it was
  ["home engines band", OVERLAY_COPY, 160],
  ["about", AB, 235],
  ["approach", AP, 530],
  ["contact", CT, 295],
  ["sustainability", SU, 350],
  ["solutions", [SOL_COPY, AUDIENCES], 340],
  ["strategies", STRAT_COPY, 140],
];

test("word budget: every page stays within its English ceiling, French within 25% more", () => {
  for (const [name, copy, max] of BUDGET) {
    assert.ok(words(copy, "en") <= max, `${name} (en): ${words(copy, "en")} > ${max}`);
    assert.ok(words(copy, "fr") <= Math.round(max * 1.25), `${name} (fr): ${words(copy, "fr")} > ${Math.round(max * 1.25)}`);
  }
});
