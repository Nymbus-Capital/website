/** Official brand asset slots (validation, resolution), admin issues, new copy. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  brandHeaders, deleteBrandAsset, resolveBrandAssets, saveBrandAsset, staticBrandAssets, svgProblem, uploadedBrandFile, validateBrandImage,
} from "../../../src/lib/data/brand-assets.ts";
import { MORNINGSTAR_ASSETS_MISSING, missingMorningstarAssets, rankingIssues } from "../../../src/lib/rankings/issues.ts";
import { mergeContent } from "../../../src/lib/data/defaults.ts";
import { RK } from "../../../src/components/fund/rankings-copy.ts";

const NOW = new Date("2026-10-02T12:00:00Z");
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const enc = (s: string) => new TextEncoder().encode(s);

test("validateBrandImage: PNG / WebP / plain SVG only, size-capped; SVG with active or external content refused", () => {
  assert.deepEqual(validateBrandImage(PNG), { ok: true, type: "image/png" });
  assert.deepEqual(validateBrandImage(enc("RIFF\0\0\0\0WEBPVP8 ")), { ok: true, type: "image/webp" });
  assert.deepEqual(validateBrandImage(enc('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient id="g"/></defs><rect fill="url(#g)"/><use href="#g"/></svg>')), { ok: true, type: "image/svg+xml" });
  assert.equal(validateBrandImage(new Uint8Array(0)).ok, false);
  assert.equal((validateBrandImage(new Uint8Array(600 * 1024)) as { status: number }).status, 413);
  assert.equal((validateBrandImage(enc("<html><body>hi</body></html>")) as { status: number }).status, 415);
  for (const bad of [
    "<svg><script>alert(1)</script></svg>", '<svg onload="x()"></svg>', '<svg><a href="javascript:x"/></svg>', "<svg><foreignObject/></svg>",
    '<svg><image href="https://evil.example/x.png"/></svg>', '<svg><style>@import url(x.css)</style></svg>', '<!DOCTYPE svg [<!ENTITY x "y">]><svg/>',
    '<svg><rect style="fill:url(https://x/y)"/></svg>', '<svg><use xlink:href="other.svg#a"/></svg>',
    '<svg><animate attributeName="href" to="javascript:x"/></svg>', '<svg><set attributeName="fill" to="red"/></svg>', '<svg><animateMotion/></svg>',
    '<!DOCTYPE svg><svg/>', '<svg><style>a{fill:\\75rl(x)}</style></svg>', '<svg><rect style="fill:\\75rl(x)"/></svg>',
    '<svg><style>a{background:image-set("x.png" 1x)}</style></svg>', '<svg><image href="#a"/></svg>', '<svg><a href="#x"><rect/></a></svg>',
    '<svg><rect xml:base="https://x/"/></svg>', '<svg><![CDATA[x]]></svg>', '<svg><rect onclick = "x"/></svg>', '<svg><rect/></svg><script/>',
  ]) assert.ok(svgProblem(bad), bad);
  // a typical exported logo passes the allow-list
  assert.equal(svgProblem('<?xml version="1.0" encoding="UTF-8"?>\n<!-- logo -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>Logo</title><style>.a{fill:#c00}</style><g class="a"><path d="M0 0h10v10z" fill-rule="evenodd"/></g></svg>'), null);
  const h = brandHeaders("image/svg+xml", "abc");
  assert.equal(h["Content-Type"], "image/svg+xml");
  assert.equal(h["X-Content-Type-Options"], "nosniff");
  assert.match(h["Content-Security-Policy"], /sandbox/);
});

test("brand assets: shipped files in public/brand/third-party, uploads on the volume win; nothing → no slot", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "brand-"));
  const prev = process.env.SITE_DATA_DIR;
  process.env.SITE_DATA_DIR = path.join(dir, "data");
  try {
    const pub = path.join(dir, "public");
    mkdirSync(pub, { recursive: true });
    writeFileSync(path.join(pub, "morningstar-logo.svg"), "<svg/>");
    writeFileSync(path.join(pub, "morningstar-stars-5.png"), PNG);
    writeFileSync(path.join(pub, "not-a-slot.svg"), "<svg/>");
    assert.deepEqual(staticBrandAssets(pub), { "morningstar-logo": "/brand/third-party/morningstar-logo.svg", "morningstar-stars-5": "/brand/third-party/morningstar-stars-5.png" });
    assert.deepEqual(staticBrandAssets(path.join(dir, "missing")), {});
    const meta = await saveBrandAsset("rbc-logo", PNG, "image/png", "alice@nymbus.ca");
    assert.equal(meta.size, PNG.length);
    const r = await resolveBrandAssets();
    assert.match(r["rbc-logo"] ?? "", /^\/api\/brand\/rbc-logo\?v=[0-9a-f]{12}$/);
    assert.equal((await uploadedBrandFile("rbc-logo"))?.meta.type, "image/png");
    // replacing with another type removes the old file
    await saveBrandAsset("rbc-logo", enc("<svg/>"), "image/svg+xml", "alice@nymbus.ca");
    assert.equal((await uploadedBrandFile("rbc-logo"))?.meta.type, "image/svg+xml");
    assert.ok(await deleteBrandAsset("rbc-logo"));
    assert.equal(await uploadedBrandFile("rbc-logo"), null);
    assert.equal(await deleteBrandAsset("rbc-logo"), null);
  } finally {
    if (prev === undefined) delete process.env.SITE_DATA_DIR; else process.env.SITE_DATA_DIR = prev;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("admin issues: Morningstar assets missing, drafts, stale entries; network state only adds issues", () => {
  const content = mergeContent(null);
  const missing = missingMorningstarAssets(content, {});
  assert.deepEqual(missing, ["morningstar-logo", "morningstar-stars-5"]);
  assert.deepEqual(missingMorningstarAssets(content, { "morningstar-logo": "/a", "morningstar-stars-5": "/b" }), []);
  const issues = rankingIssues(content, { now: NOW, months: 6, brand: {}, rbc: null });
  assert.ok(issues.some((i) => i.key === "rankings.morningstar.assets" && i.message.startsWith(MORNINGSTAR_ASSETS_MISSING)));
  assert.ok(!issues.some((i) => i.key.startsWith("rankings.monthly-income.tp.")), "seeded RBC entry confirmed and current");
  assert.ok(issues.some((i) => i.key === "rankings.rbc.never"));
  const late = rankingIssues(content, { now: new Date("2027-06-01T00:00:00Z"), months: 6, brand: {}, rbc: null });
  assert.ok(late.some((i) => i.key === "rankings.sustainable-enhanced-bonds.morningstar.stale"));
  assert.ok(late.some((i) => i.key === "rankings.multi-strategy.fundlibrary.0.stale"));
});

test("rankings copy: EN and FR for every string, same placeholders, Québec typography", () => {
  const walk = (o: unknown, where: string): [string, { en: string; fr: string }][] =>
    o && typeof o === "object" && "en" in (o as object) && "fr" in (o as object) ? [[where, o as { en: string; fr: string }]]
      : Object.entries(o as object).flatMap(([k, v]) => walk(v, `${where}.${k}`));
  const all = walk(RK, "RK");
  assert.ok(all.length > 30);
  for (const [k, v] of all) {
    assert.ok(v.en.trim() && v.fr.trim(), `${k}: EN and FR`);
    for (const ph of ["{n}", "{x}", "{c}", "{date}", "{year}", "{ord}", "{rank}", "{of}", "{q}"]) assert.equal(v.en.includes(ph), v.fr.includes(ph), `${k}: ${ph}`);
    assert.ok(!/ [:%$]/.test(v.fr), `${k}: regular space before : % $`);
    assert.ok(!/\s[;?!]/.test(v.fr), `${k}: space before ; ? !`);
  }
  assert.match(RK.ms.attribution.en, /© \{year\} Morningstar/);
  assert.match(RK.ms.methodology.en, /Past performance/);
});
