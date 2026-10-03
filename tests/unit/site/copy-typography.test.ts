/**
 * French typography of the site copy (Québec convention): a non-breaking space (U+00A0) before « : », « % » and
 * « $ » and inside « », never a regular space there; no space before « ; », « ? » and « ! ».
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { T, FUND_TEXTS } from "../../../src/components/fund/copy.ts";
import { RK } from "../../../src/components/fund/rankings-copy.ts";
import { HOME_COPY, FUND_COPY, RISK_COPY, CATEGORY_COPY, VEHICLE_COPY } from "../../../src/components/site/home/copy.ts";
import { SCAN_COPY } from "../../../src/components/site/fx/scan-copy.ts";
import { OVERLAY_COPY } from "../../../src/components/site/fx/overlay-copy.ts";
import { NEWS, NEWS_CATEGORY } from "../../../src/components/site/home/news.ts";
import { AB } from "../../../src/components/site/pages/copy-about.ts";
import { AP } from "../../../src/components/site/pages/copy-approach.ts";
import { CT } from "../../../src/components/site/pages/copy-contact.ts";
import { SU } from "../../../src/components/site/pages/copy-sustainability.ts";
import { SOL_COPY, AUDIENCES } from "../../../src/components/site/pages/solutions-copy.ts";
import { STRAT_COPY } from "../../../src/components/site/pages/strategies-copy.ts";
import { DISCLAIMERS, FUND_INCEPTION } from "../../../src/content/disclaimers.ts";
import { complaintsPolicy, codeOfEthics } from "../../../src/components/site/legal/complaints.ts";
import { privacyPolicy } from "../../../src/components/site/legal/privacy.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import { team } from "../../../src/data/team.ts";
import { fr } from "../../../src/lib/i18n/fr.ts";

/** Every French string of a value: `fr` of { en, fr } pairs, fields named `*Fr`, or everything under a French root. */
function frStrings(x: unknown, where: string, inFr: boolean, out: [string, string][] = []): [string, string][] {
  if (typeof x === "string") {
    if (inFr) out.push([where, x]);
  } else if (Array.isArray(x)) {
    x.forEach((v, i) => frStrings(v, `${where}[${i}]`, inFr, out));
  } else if (x && typeof x === "object") {
    for (const [k, v] of Object.entries(x)) frStrings(v, `${where}.${k}`, inFr || k === "fr" || k.endsWith("Fr"), out);
  }
  return out;
}

const SOURCES: [string, unknown, boolean][] = [
  ["fund/copy T", T, false], ["fund/copy FUND_TEXTS", FUND_TEXTS, false], ["fund/rankings-copy RK", RK, false],
  ["home HOME_COPY", HOME_COPY, false], ["fx SCAN_COPY", SCAN_COPY, false], ["fx OVERLAY_COPY", OVERLAY_COPY, false], ["home FUND_COPY", FUND_COPY, false], ["home RISK_COPY", RISK_COPY, false],
  ["home CATEGORY_COPY", CATEGORY_COPY, false], ["home VEHICLE_COPY", VEHICLE_COPY, false],
  ["news NEWS", NEWS, false], ["news NEWS_CATEGORY", NEWS_CATEGORY, false],
  ["about AB", AB, false], ["approach AP", AP, false], ["contact CT", CT, false], ["sustainability SU", SU, false],
  ["solutions SOL_COPY", SOL_COPY, false], ["solutions AUDIENCES", AUDIENCES, false], ["strategies STRAT_COPY", STRAT_COPY, false],
  ["disclaimers", DISCLAIMERS.map((d) => d.text), false], ["FUND_INCEPTION", FUND_INCEPTION, false],
  ["funds.ts", FUNDS, false], ["team.ts", team, false],
  ["complaints (fr)", complaintsPolicy("fr"), true], ["ethics (fr)", codeOfEthics("fr"), true], ["privacy (fr)", privacyPolicy("fr"), true],
  ["i18n fr", fr, true],
];

const RULES: [RegExp, string][] = [
  [/ [:%]/, "regular space before « : » or « % » (use U+00A0)"],
  [/\d \$/, "regular space before « $ » (use U+00A0)"],
  [/« /, "regular space after « (use U+00A0)"],
  [/ »/, "regular space before » (use U+00A0)"],
  [/[   ][;?!]/, "space before « ; », « ? » or « ! » (Québec convention: none)"],
];

test("copy typography: the French strings were collected from every copy module", () => {
  for (const [name, value, inFr] of SOURCES) assert.ok(frStrings(value, name, inFr).length > 0, name);
});

test("copy typography: French strings use non-breaking spaces before : % $ and inside « » (Québec convention)", () => {
  const bad: string[] = [];
  for (const [name, value, inFr] of SOURCES) {
    for (const [where, s] of frStrings(value, name, inFr)) {
      for (const [re, why] of RULES) {
        const m = re.exec(s);
        if (m) bad.push(`${where}: ${why}: …${s.slice(Math.max(0, m.index - 20), m.index + 20)}…`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test("copy typography: the check catches a regular space (self-test)", () => {
  const found = frStrings({ a: { en: "x", fr: "Source : texte, 5 % et « mot »" } }, "t", false);
  assert.equal(found.length, 1);
  assert.ok(RULES.filter(([re]) => re.test(found[0][1])).length >= 3);
});
