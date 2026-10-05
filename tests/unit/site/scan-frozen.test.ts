/**
 * Science at scale is frozen (Gabriel, 2026-10-02: "Don't change anything about that"). The AnalysisScan component,
 * its model, engine, copy, panel styles and its home section must stay byte-for-byte what they were when the
 * "diversifying engines" band was added after it. Changing one of them needs Gabriel's sign-off; then update the hash.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const FX = resolve(import.meta.dirname, "../../../src/components/site/fx");
const HOME = resolve(import.meta.dirname, "../../../src/components/site/home/Home.tsx");
const sha = (s: string) => createHash("sha256").update(s.replace(/\r\n/g, "\n")).digest("hex");
const read = (f: string) => readFileSync(join(FX, f), "utf8");

test("science at scale: model, engine and copy are unchanged", () => {
  assert.equal(sha(read("scan-model.ts")), "3b2d10b59b33b3d84bae6383b85d733f3ab8725ed48851feddedcaaed1d6c1e0");
  assert.equal(sha(read("scan-engine.ts")), "2f093e085911dd6d69916abd8eb062eecb35e650ea282dc4190ce189ac57809a");
  // copy changed at Gabriel's request 2026-10-03 (title and third trio card: scientists, engineers and market veterans; FR « développeurs »)
  // 2026-10-04: Gabriel requested the removal of the simulated counters (labels and the caption sentence about them)
  assert.equal(sha(read("scan-copy.ts")), "a7b000cefe69578f607aec8b084800e8803d683e52869d6e5a6783fdefbf3c2e");
});

test("science at scale: the AnalysisScan markup and the panel styles are unchanged", () => {
  const fx = read("fx.tsx");
  const i = fx.indexOf("export function AnalysisScan()");
  assert.ok(i > 0);
  assert.equal(sha(fx.slice(i)), ANALYSIS_SCAN_SHA);
  const css = read("fx.css");
  const a = css.indexOf("/* ---------------------------------------------------------------- analysis scan panel */");
  const b = css.indexOf("@media (prefers-reduced-motion: reduce)", a);
  assert.ok(a > 0 && b > a);
  assert.equal(sha(css.slice(a, b)), SCAN_CSS_SHA);
});

test("science at scale: its home section is unchanged and the new band comes right after it", () => {
  const home = readFileSync(HOME, "utf8");
  const scan = `      <Section glow="tr" labelledBy="scan-t" className="sc">
        <SectionHead eyebrow={pick(S.eyebrow)} title={pick(S.title)} accent={pick(S.accent)} lead={pick(S.lead)} id="scan-t" center />
        <AnalysisScan />
      </Section>
`;
  const at = home.indexOf(scan);
  assert.ok(at > 0, "the science-at-scale section block was edited");
  assert.match(home.slice(at + scan.length), /^\s*<Section[^>]*labelledBy="ov-t"/);
});

// 2026-10-04: start-failure logging + stale-chunk reload (no visual change); then, same day, Gabriel requested the removal
// of the simulated counters strip under the panel (the <dl> and its refs); nothing else in the panel changed
const ANALYSIS_SCAN_SHA = "b68e1b8eb8f957293c9a0e8e53d3a43d78124851158ffdac015037868a4f0a1c";
const SCAN_CSS_SHA = "2b1ab17f6367eae6d6da42f84c342680f3763b2ccb67051eef6a14fefe190f5c";
