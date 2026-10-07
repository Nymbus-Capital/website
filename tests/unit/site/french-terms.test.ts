/**
 * Terminology (review of 2026-10-03): French "downside volatility" is « volatilité à la baisse », never « baissière »;
 * the dealer network is written "Fundserv" in visitor-facing copy; the site never calls its people « ingénieurs »
 * (protected title in Québec) in the page copy it owns.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { T, FUND_TEXTS } from "../../../src/components/fund/fund.copy.ts";
import { HOME_COPY, FUND_COPY, VEHICLE_COPY } from "../../../src/components/site/home/home.copy.ts";
import { AB } from "../../../src/components/site/pages/about.copy.ts";
import { AP } from "../../../src/components/site/pages/approach.copy.ts";
import { SCAN_COPY } from "../../../src/components/site/fx/scan-copy.ts";
import { SOL_COPY, AUDIENCES } from "../../../src/components/site/pages/solutions.copy.ts";
import { FUNDS } from "../../../src/config/funds.ts";

const SRC = resolve(import.meta.dirname, "../../../src");
function walk(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|json)$/.test(n)) out.push(p);
  }
  return out;
}
const leaves = (v: unknown): string[] =>
  typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : [];

test("French: « volatilité à la baisse », never « baissière », anywhere in the source", () => {
  const bad = walk(SRC).filter((f) => /baissi[eè]re/i.test(readFileSync(f, "utf8")));
  assert.deepEqual(bad, []);
});

test("visitor copy writes Fundserv (not FundServ)", () => {
  const all = leaves([
    T,
    FUND_TEXTS,
    HOME_COPY,
    FUND_COPY,
    VEHICLE_COPY,
    SOL_COPY,
    AUDIENCES,
    FUNDS.map((f) => f.defaults),
  ]);
  assert.deepEqual(
    all.filter((s) => /FundServ/.test(s)),
    [],
  );
});

// EN "engineers" is fine (Gabriel, 2026-10-03: "scientists, engineers and market veterans"); FR uses « développeurs »
test("about, approach, home and science-at-scale copy never call the team « ingénieurs » (FR)", () => {
  const fr = leaves([AB, AP, HOME_COPY, SCAN_COPY]).filter((s) => /ingénieur/i.test(s));
  assert.deepEqual(fr, []);
});
