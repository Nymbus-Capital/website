/**
 * Firm AUM label: one source (the admin-editable default), C$1.9 billion; a stored copy of the previous
 * default follows it while a hand-edited value is kept.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_CONTENT, mergeContent } from "../../../src/lib/data/defaults.ts";
import type { SiteContent } from "../../../src/lib/data/types.ts";

const stored = (aumLabel?: { en: string; fr: string }) => ({ ...DEFAULT_CONTENT, version: 3, firm: { aumLabel, announcement: null } }) as SiteContent;

test("default AUM label is C$1.9 billion in both languages", () => {
  assert.deepEqual(DEFAULT_CONTENT.firm.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
  assert.deepEqual(mergeContent(null).firm.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
});

test("a stored copy of the previous default follows the new default; an edited value is kept", () => {
  assert.deepEqual(mergeContent(stored({ en: "$1.8B+", fr: "1,8 G$+" })).firm.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
  assert.deepEqual(mergeContent(stored({ en: "$2.0B", fr: "2,0 G$" })).firm.aumLabel, { en: "$2.0B", fr: "2,0 G$" });
  assert.deepEqual(mergeContent(stored(undefined)).firm.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
});

test("no source file mentions the previous AUM figure", () => {
  const hits: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx|json)$/.test(f) && p !== join("src", "lib", "data", "defaults.ts") && /1\.8\s?B|1,8\s?G\$/.test(readFileSync(p, "utf8"))) hits.push(p);
    }
  };
  walk("src");
  assert.deepEqual(hits, []);
});
