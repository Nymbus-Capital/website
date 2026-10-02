import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { BOND_CHARACTERISTICS, ESG_METRICS, MULTISTRAT_CHARACTERISTICS } from "../../../src/lib/pipeline/parse.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import { FUND_TEXTS } from "../../../src/components/fund/copy.ts";

const ROOT = resolve(import.meta.dirname, "../../..");
const SRC = join(ROOT, "src");

function walk(dir: string, re: RegExp, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, re, out);
    else if (re.test(name)) out.push(p);
  }
  return out;
}

/* ------------------------------------------------------------------ fonts: Poppins only */

const GENERIC = new Set(["sans-serif", "system-ui", "ui-sans-serif", "inherit", "initial", "unset", "revert", "-apple-system"]);

/** First family of a `font-family` value or of a `font` shorthand (after size / line-height). */
function firstFamily(value: string): string | null {
  const v = value.trim().replace(/!important$/, "").trim();
  if (/^(inherit|initial|unset|revert)$/i.test(v)) return "inherit";
  return v.split(",")[0].trim().replace(/^["']|["']$/g, "");
}

test("every font-family declaration of CSS, TSX and the standalone pages starts with Poppins (or inherits)", () => {
  const files = [...walk(SRC, /\.(css|ts|tsx)$/)];
  const bad: string[] = [];
  for (const f of files) {
    if (f.endsWith("sample-site-data.json")) continue;
    const code = readFileSync(f, "utf8");
    // font-family: ... ;  (CSS, inline <style> strings, JS style objects use fontFamily: "...")
    for (const m of code.matchAll(/font-family\s*:\s*([^;}"`]+)/g)) {
      const fam = firstFamily(m[1]);
      if (fam && fam !== "inherit" && fam !== "Poppins") bad.push(`${f.replace(ROOT, "")}: font-family ${m[1].trim()}`);
    }
    for (const m of code.matchAll(/fontFamily\s*:\s*["'`]([^"'`]+)["'`]/g)) {
      const fam = firstFamily(m[1]);
      if (fam && fam !== "inherit" && fam !== "Poppins") bad.push(`${f.replace(ROOT, "")}: fontFamily ${m[1].trim()}`);
    }
    // font shorthand in CSS: `font: 500 13px/1 "Poppins", sans-serif`
    if (f.endsWith(".css") || /<style>/.test(code)) {
      for (const m of code.matchAll(/(?:^|[;{\s])font\s*:\s*([^;}]+)/g)) {
        const v = m[1].trim();
        if (/^(inherit|initial|unset|revert)\b/i.test(v)) continue;
        const fams = v.replace(/^.*?\d+(?:\.\d+)?(?:px|rem|em|pt|%)(?:\s*\/\s*[\d.]+(?:px|rem|em|%)?)?\s+/, "");
        const fam = firstFamily(fams);
        if (fam && fam !== "Poppins") bad.push(`${f.replace(ROOT, "")}: font ${v}`);
      }
    }
    // canvas text
    for (const m of code.matchAll(/\.font\s*=\s*[`"']([^`"']+)[`"']/g)) {
      // a ${CONST} family is resolved to its definition in the same file
      const expanded = m[1].replace(/\$\{(\w+)\}/g, (_, n: string) => code.match(new RegExp(`const ${n}\\s*=\\s*([^;\\n]+)`))?.[1] ?? "");
      if (!/Poppins/.test(expanded)) bad.push(`${f.replace(ROOT, "")}: canvas font ${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
  for (const g of GENERIC) assert.ok(g); // generic fallbacks after Poppins are allowed
});

test("globals.css makes controls, code and SVG text inherit the Poppins body font", () => {
  const css = readFileSync(join(SRC, "app/globals.css"), "utf8");
  assert.match(css, /button, input, select, textarea[^{]*\{\s*font-family:\s*inherit/);
  assert.match(css, /svg text/);
  assert.match(css, /body\s*\{[^}]*font-family:\s*"Poppins"/);
});

test("Poppins is the only family loaded (self-hosted @font-face in the root layout)", () => {
  const layout = readFileSync(join(SRC, "app/layout.tsx"), "utf8");
  const families = [...layout.matchAll(/font-family:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(families)], ["Poppins"]);
  assert.ok(!/next\/font\/google|fonts\.googleapis/.test(layout));
});

/* ------------------------------------------------------------------ no leverage metric, no liquidity score */

const FORBIDDEN = /leverag|effet de levier|à effet de levier|levier de crédit|liquidity score|cote de liquidit/i;

test("no characteristic parsed from the factsheets is a leverage metric or a liquidity score", () => {
  for (const spec of [...BOND_CHARACTERISTICS, ...ESG_METRICS, ...MULTISTRAT_CHARACTERISTICS]) {
    assert.ok(!FORBIDDEN.test(`${spec.id} ${spec.source} ${spec.label.en} ${spec.label.fr}`), `${spec.id} is a forbidden metric`);
  }
});

test("no visitor-facing text of the funds mentions leverage or a liquidity score (EN or FR)", () => {
  const texts: string[] = [];
  for (const f of FUNDS) texts.push(f.defaults.description.en, f.defaults.description.fr, f.defaults.tagline.en, f.defaults.tagline.fr);
  // every string of the fund texts (summary, approach, note, feature cards, whatever the copy keeps)
  const leaves = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : []);
  for (const t of Object.values(FUND_TEXTS)) texts.push(...leaves(t));
  for (const s of texts) assert.ok(!FORBIDDEN.test(s), `forbidden wording in: ${s.slice(0, 80)}`);
});

test("no source file of the public site carries leverage / liquidity-score wording (copy, pipeline, admin, content)", () => {
  const bad: string[] = [];
  for (const f of walk(SRC, /\.(ts|tsx)$/)) {
    const code = readFileSync(f, "utf8");
    const hit = code.match(FORBIDDEN);
    if (hit) bad.push(`${f.replace(ROOT, "")}: ${hit[0]}`);
  }
  assert.deepEqual(bad, []);
});

test("the sample dataset has no leverage / liquidity-score characteristic", () => {
  const raw = readFileSync(join(SRC, "lib/data/sample-site-data.json"), "utf8");
  assert.ok(!FORBIDDEN.test(raw));
  assert.ok(!/liquidityScore|netCreditLeverage/.test(raw));
});
