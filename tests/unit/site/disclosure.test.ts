import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DISCLOSURE_MIN_CHARS, discState, hashId, hashOpens, isCollapsible, textLength, toggleLabel,
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

test("collapse threshold: the fund / footer walls collapse, a one-line note does not", () => {
  assert.equal(isCollapsible(DISCLOSURE_MIN_CHARS), true);
  assert.equal(isCollapsible(DISCLOSURE_MIN_CHARS - 1), false);
  const footer = footerDisclaimers().map((t) => el(t.en));
  assert.ok(isCollapsible(textLength(footer)));
  assert.ok(isCollapsible(textLength([el(DISC.returnsNet.en), el(DISC.firm.en)])));
  // the short gross / net summary shown under the home and strategies tiles stays a plain note
  assert.equal(isCollapsible(textLength(el(`${DISC.summaryNet.en} ${DISC.summaryGross.en}`))), false);
  assert.equal(isCollapsible(textLength(el(DISC.basisGross.en))), false);
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

test("every disclosure wall of the site goes through <Disclosure>", () => {
  const uses: [string, RegExp][] = [
    ["components/fund/Closing.tsx", /<Disclosure lang=\{lang\} anchors=\{\["disclosure"\]\}/],
    ["components/site/Footer.tsx", /<Disclosure anchors=\{\["disclaimers"\]\}/],
    ["components/fund/Performance.tsx", /<Disclosure lang=\{lang\} testId="perf-notes-text">/],
    ["components/fund/Awards.tsx", /<Disclosure lang=\{lang\} testId="awards-notes">/],
    ["components/site/pages/StrategiesIndex.tsx", /<Disclosure testId="strategies-notes">/],
    ["components/site/pages/Solutions.tsx", /<Disclosure testId="solutions-notes">/],
    ["components/site/pages/Approach.tsx", /<Disclosure testId="approach-overlay-notes">/],
  ];
  for (const [f, re] of uses) assert.match(read(f), re, f);
  // the regulatory texts are rendered inside the box (fund page and footer)
  const closing = read("components/fund/Closing.tsx");
  assert.ok(closing.indexOf("<Disclosure") < closing.indexOf('data-testid="firm-disclaimer"'));
  assert.ok(closing.indexOf('data-testid="provenance"') < closing.indexOf("</Disclosure>"));
  const footer = read("components/site/Footer.tsx");
  assert.ok(footer.indexOf("<Disclosure") < footer.indexOf("footerDisclaimers(") && footer.indexOf("footerDisclaimers(") < footer.indexOf("</Disclosure>"));
});

test("CSS contract: clipped not hidden, collapsed only with JS, open in print", () => {
  const css = read("components/site/kit.css");
  const block = css.slice(css.indexOf("collapsible disclosures"));
  // the text is clipped (max-height + overflow), never display:none / visibility:hidden
  assert.doesNotMatch(block.replace(/\.disc-toggle[^{]*\{[^}]*\}/g, "").replace(/\.disc\[data-disc="plain"\] \{[^}]*\}/, ""), /display:\s*none|visibility:\s*hidden/);
  assert.match(block, /\.js \.disc:is\(\[data-disc="collapsed"\], \[data-disc="fits"\]\) > \.disc-clip \{ max-height: var\(--disc-max\); \}/);
  assert.match(block, /@media print \{[\s\S]*max-height: none !important[\s\S]*\.disc-toggle, \.js \.disc-toggle \{ display: none !important; \}/);
  assert.match(block, /@media \(prefers-reduced-motion: reduce\) \{ \.disc-clip, \.disc-toggle svg \{ transition: none; \} \}/);
  const comp = read("components/site/Disclosure.tsx");
  assert.doesNotMatch(comp, /aria-hidden=\{|aria-hidden="true"[^>]*disc-clip/);
  assert.match(comp, /aria-expanded=\{expanded\} aria-controls=\{bodyId\}/);
});
