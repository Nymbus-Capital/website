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
  assert.equal(sha(read("scan-copy.ts")), "95fb90d957206852c698ec6c7f62623b891b3a344553982b6d11be94e3e6c165");
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

const ANALYSIS_SCAN_SHA = "0e20c3d971f60cf7ebab230253086414e4842bf3c9143ec22bccb64148c49f17"; // 2026-10-04: start-failure logging + stale-chunk reload only, no visual change
const SCAN_CSS_SHA = "2b1ab17f6367eae6d6da42f84c342680f3763b2ccb67051eef6a14fefe190f5c";
