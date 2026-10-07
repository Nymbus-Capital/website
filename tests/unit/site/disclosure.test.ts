import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DISCLOSURE_MIN_CHARS,
  discState,
  enLength,
  hashId,
  hashOpens,
  isCollapsible,
  textLength,
  toggleLabel,
} from "../../../src/components/site/disclosure-logic.ts";
import { DISC, footerDisclaimers } from "../../../src/content/disclaimers.ts";

const SRC = resolve(import.meta.dirname, "../../../src");
const read = (p: string) => readFileSync(join(SRC, p), "utf8");
// a React element as React builds it: { type, props: { children } }
const el = (children: unknown) => ({ type: "p", props: { children } });

test("textLength: strings, numbers and nested elements; nothing for booleans / null", () => {
  assert.equal(textLength("a  b\n c"), 5);
  assert.equal(textLength(42), 2);
  assert.equal(textLength([null, false, true, undefined, "ab"]), 2);
  assert.equal(textLength(el([el("abc"), " ", el(el("de"))])), 5); // a lone " " trims to nothing
  assert.equal(textLength({ type: "br", props: {} }), 0);
});

test("collapse threshold on the English text: the fund boilerplate / footer collapse, the qualifiers never would", () => {
  assert.equal(DISCLOSURE_MIN_CHARS, 600);
  assert.equal(isCollapsible(DISCLOSURE_MIN_CHARS), true);
  assert.equal(isCollapsible(DISCLOSURE_MIN_CHARS - 1), false);
  assert.equal(enLength(["abc", null, false, undefined, " de "]), 5);
  // footer: far above the threshold
  assert.ok(enLength(footerDisclaimers().map((t) => t.en)) > 3000);
  // fund boilerplate, smallest case (GMV: a strategy without benchmark → firm text + provenance line): over the threshold,
  // and too tall for the 9 rem (144 px) collapsed height even in the widest column — paragraphs ≤ 920 px at 13.5 px
  // (≤ ≈ 135 characters a line, 23.6 px a line, 12 px apart) + the provenance row (20 + 16 px rule + one 21 px line) —
  // so no marginal "fits" box exists today
  assert.ok(enLength([DISC.firm.en, DISC.provenance.en]) >= DISCLOSURE_MIN_CHARS);
  const est = Math.ceil(enLength([DISC.firm.en]) / 135) * 23.6 + 12 + 20 + 16 + 21;
  assert.ok(est > 144 + 20, `estimated ${est} px`);
  assert.ok(enLength([DISC.fundStandard.en, DISC.benchmark.en, DISC.firm.en, DISC.ftse.en, DISC.provenance.en]) > 2000);
  // the gross / net summary shown under the tiles stays a plain note
  assert.equal(isCollapsible(textLength(el(`${DISC.summaryNet.en} ${DISC.summaryGross.en}`))), false);
});

test("state: plain / collapsed / fits / expanded", () => {
  assert.equal(discState(false, true, true), "plain");
  assert.equal(discState(true, false, true), "collapsed");
  assert.equal(discState(true, false, false), "fits");
  assert.equal(discState(true, true, false), "expanded");
});

test("toggle labels EN / FR", () => {
  assert.equal(toggleLabel("en", false), "Show full text");
  assert.equal(toggleLabel("en", true), "Show less");
  assert.equal(toggleLabel("fr", false), "Afficher le texte complet");
  assert.equal(toggleLabel("fr", true), "Réduire");
});

test("hash: only the box's own anchors open it", () => {
  assert.equal(hashId("#disclosure"), "disclosure");
  assert.equal(hashId("#"), null);
  assert.equal(hashId(""), null);
  assert.equal(hashId("#a%20b"), "a b");
  assert.equal(hashId("#%E0%A4%A"), "%E0%A4%A"); // malformed escape: kept raw, no throw
  assert.equal(hashOpens("#disclosure", ["disclosure"]), true);
  assert.equal(hashOpens("#performance", ["disclosure"]), false);
  assert.equal(hashOpens(null, ["disclosure"]), false);
});

test("only the boilerplate is collapsed: performance qualifiers stay outside the box", () => {
  const closing = read("components/fund/Closing.tsx");
  const open = closing.indexOf("<Disclosure");
  assert.match(
    closing,
    /<Disclosure\s+lang=\{lang\}\s+anchors=\{\["disclosure"\]\}\s+testId="fund-disclosure"\s+en=\{\[/,
  );
  for (const q of [
    'className="fxd-sample"',
    'data-testid="perf-note"',
    'data-testid="perf-class"',
    "T.disclosure.gross, lang) : tr(T.disclosure.net",
  ]) {
    assert.ok(closing.indexOf(q) > 0 && closing.indexOf(q) < open, `${q} before the box`);
  }
  for (const b of [
    "T.disclosure.standard, lang",
    'data-testid="firm-disclaimer"',
    'data-testid="ftse-notice"',
    'data-testid="provenance"',
  ]) {
    assert.ok(
      closing.indexOf(b) > open && closing.indexOf(b) < closing.indexOf("</Disclosure>"),
      `${b} inside the box`,
    );
  }
  const footer = read("components/site/Footer.tsx");
  assert.match(
    footer,
    /<Disclosure\s+anchors=\{\["disclaimers"\]\}\s+className="footer-disc-body"\s+testId="footer-disclosure"\s+en=\{texts\.map/,
  );
  // qualifiers next to figures are never wrapped (performance notes, rankings notes, tile / table summaries)
  for (const f of [
    "components/fund/Performance.tsx",
    "components/fund/Awards.tsx",
    "components/site/pages/StrategiesIndex.tsx",
    "components/site/pages/Solutions.tsx",
    "components/site/home/Sections.tsx",
  ]) {
    assert.doesNotMatch(read(f), /<Disclosure/, f);
  }
});

test("CSS contract: clipped not hidden, collapsed only with JS, open in print", () => {
  const css = read("components/site/kit.css");
  const block = css.slice(css.indexOf("collapsible disclosures"));
  // the text is clipped (max-height + overflow), never display:none / visibility:hidden
  assert.doesNotMatch(
    block.replace(/\.disc-toggle[^{]*\{[^}]*\}/g, "").replace(/\.disc\[data-disc="plain"\] \{[^}]*\}/, ""),
    /display:\s*none|visibility:\s*hidden/,
  );
  assert.match(block, /\.js \.disc\[data-disc="fits"\] \{\s*border-color: transparent;\s*background: none;\s*\}/);
  assert.match(
    block,
    /\.js \.disc:is\(\[data-disc="collapsed"\], \[data-disc="fits"\]\) > \.disc-clip \{\s*max-height: var\(--disc-max\);\s*\}/,
  );
  assert.match(
    block,
    /@media print \{[\s\S]*max-height: none !important[\s\S]*\.disc-toggle,\s*\.js \.disc-toggle \{\s*display: none !important;\s*\}/,
  );
  assert.match(
    block,
    /@media \(prefers-reduced-motion: reduce\) \{\s*\.disc-clip,\s*\.disc-toggle svg \{\s*transition: none;\s*\}\s*\}/,
  );
  const comp = read("components/site/Disclosure.tsx");
  assert.doesNotMatch(comp, /aria-hidden=\{|aria-hidden="true"[^>]*disc-clip/);
  assert.match(comp, /aria-expanded=\{expanded\}\s+aria-controls=\{bodyId\}/);
});
