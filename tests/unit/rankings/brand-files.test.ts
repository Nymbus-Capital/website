/** Every file shipped in public/brand/third-party is an official slot image that passes the validator; served sandboxed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { BRAND_SLOTS, validateBrandImage } from "../../../src/lib/data/brand-assets.ts";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const DIR = path.join(ROOT, "public", "brand", "third-party");
const TYPE: Record<string, string> = { svg: "image/svg+xml", png: "image/png", webp: "image/webp" };

test("shipped brand files: slot names only, valid PNG / WebP / allow-listed SVG matching their extension", () => {
  if (!existsSync(DIR)) return; // nothing shipped yet: the pages render text
  for (const name of readdirSync(DIR)) {
    const full = path.join(DIR, name);
    if (statSync(full).isDirectory()) assert.fail(`${name}: no sub-directories`);
    if (name === "README.md" || name === ".gitkeep") continue;
    const m = /^([a-z0-9-]+)\.(svg|png|webp)$/.exec(name);
    assert.ok(m, `${name}: expected <slot>.svg|png|webp`);
    assert.ok((BRAND_SLOTS as readonly string[]).includes(m![1]), `${name}: unknown slot`);
    const r = validateBrandImage(new Uint8Array(readFileSync(full)));
    assert.ok(r.ok, `${name}: ${r.ok ? "" : r.message}`);
    assert.equal(r.ok && r.type, TYPE[m![2]], `${name}: content matches the extension`);
  }
});

test("next.config.ts serves /brand/third-party/* with a sandboxing CSP and nosniff", () => {
  const cfg = readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  const i = cfg.indexOf('source: "/brand/third-party/:path*"');
  assert.ok(i > 0, "header rule present");
  const block = cfg.slice(i, i + 600);
  assert.match(block, /Content-Security-Policy[^\n]*default-src 'none'[^\n]*sandbox/);
  assert.match(block, /X-Content-Type-Options[^\n]*nosniff/);
});

test("official provider logos shipped (Fundata, RBC Investor Services) beside the Morningstar files", () => {
  for (const name of ["morningstar-logo.png", "morningstar-stars-5.png", "fundata-logo.png", "rbc-logo.png"]) {
    assert.ok(existsSync(path.join(DIR, name)), `${name} shipped`);
  }
  assert.ok(!existsSync(path.join(DIR, "fundlibrary-logo.png")) && !existsSync(path.join(DIR, "fundlibrary-logo.svg")), "former slot name not shipped");
});
