import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { FUNDS } from "../../../src/config/funds.ts";
import { PUBLIC_FUNDS, hiddenFundKeys, visibleFunds } from "../../../src/config/funds-public.ts";
import { FUND_SOURCES } from "../../../src/lib/pipeline/fund-sources.ts";

const ROOT = resolve(import.meta.dirname, "../../..");
const SRC = join(ROOT, "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const isClient = (code: string) => /^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*\s*["']use client["']/.test(code);

/** Runtime (non type-only) module specifiers of a file: imports, re-exports, dynamic imports. */
function runtimeImports(code: string): string[] {
  const out: string[] = [];
  const re =
    /(?:^|\n)\s*(import|export)\s+(type\s+)?([^'";]*?)\s*from\s*["']([^"']+)["']|(?:^|\n)\s*import\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of code.matchAll(re)) {
    if (m[4]) {
      if (m[2]) continue; // import type / export type
      // `import { type A, type B } from` is erased too
      const names = m[3]
        .replace(/[{}]/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (names.length && names.every((n) => n.startsWith("type "))) continue;
      out.push(m[4]);
    } else if (m[5]) out.push(m[5]);
    else if (m[6]) out.push(m[6]);
  }
  return out;
}

function resolveSpec(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null; // package
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

const FILES = walk(SRC);
const CLIENT = FILES.filter((f) => isClient(readFileSync(f, "utf8")));
const FORBIDDEN = [join(SRC, "lib/pipeline/fund-sources.ts")];

test("client components exist (sanity) and the scanner sees Nav, Footer, Contact", () => {
  const rel = CLIENT.map((f) => relative(SRC, f));
  for (const f of ["components/site/Nav.tsx", "components/site/Footer.tsx", "components/site/pages/Contact.tsx"])
    assert.ok(rel.includes(f), f);
});

test("no client component imports the full fund registry (@/config/funds) directly", () => {
  const bad = CLIENT.filter((f) =>
    runtimeImports(readFileSync(f, "utf8")).some(
      (s) => s === "@/config/funds" || /(^|\/)config\/funds(\.ts)?$/.test(s),
    ),
  );
  assert.deepEqual(
    bad.map((f) => relative(SRC, f)),
    [],
  );
});

test("no client component reaches the internal fund sources or the pipeline, even transitively", () => {
  const offenders: string[] = [];
  for (const entry of CLIENT) {
    const seen = new Set<string>();
    const stack: [string, string[]][] = [[entry, [relative(SRC, entry)]]];
    while (stack.length) {
      const [file, chain] = stack.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      if (FORBIDDEN.includes(file) || file.startsWith(join(SRC, "lib/pipeline") + "/")) {
        offenders.push(chain.join(" → "));
        continue;
      }
      for (const spec of runtimeImports(readFileSync(file, "utf8"))) {
        const next = resolveSpec(file, spec);
        if (next && !seen.has(next)) stack.push([next, [...chain, relative(SRC, next)]]);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test("the scanner flags a client file importing the registry (self-check)", () => {
  assert.deepEqual(
    runtimeImports(
      `"use client";\nimport { FUNDS } from "@/config/funds";\nimport type { X } from "./x";\nimport { type Y } from "./y";`,
    ),
    ["@/config/funds"],
  );
  assert.ok(isClient(`/* banner */\n"use client";\nexport const a = 1;`));
  assert.ok(!isClient(`import "server-only";\n"use client";`));
});

test("the public fund modules carry no internal source name or key", () => {
  const json = JSON.stringify({ PUBLIC_FUNDS, FUNDS });
  for (const [key, s] of Object.entries(FUND_SOURCES)) {
    for (const secret of [s.dataplatform, s.ftseIndex, s.analytics, s.factsheet?.key, s.factsheet?.file]) {
      if (secret) assert.equal(json.includes(`"${secret}"`), false, `${key} leaks ${secret}`);
    }
  }
  for (const f of PUBLIC_FUNDS) {
    assert.deepEqual(Object.keys(f).sort(), [
      "assetClass",
      "benchmark",
      "color",
      "key",
      "name",
      "short",
      "tagline",
      "vehicle",
    ]);
  }
  for (const f of FUNDS) assert.deepEqual(Object.keys(f.sources), ["basis"]);
  // every registry fund has its sources entry
  assert.deepEqual(Object.keys(FUND_SOURCES).sort(), FUNDS.map((f) => f.key).sort());
});

test("hidden funds: keys from the admin content, filtered out of lists", () => {
  const hidden = hiddenFundKeys({
    funds: {
      "multi-strategy": { hidden: true },
      "monthly-income": { hidden: false },
      "global-minimum-volatility": undefined,
    },
  });
  assert.deepEqual(hidden, ["multi-strategy"]);
  assert.deepEqual(
    visibleFunds(PUBLIC_FUNDS, hidden).map((f) => f.key),
    ["monthly-income", "sustainable-enhanced-bonds", "global-minimum-volatility"],
  );
  assert.equal(visibleFunds(PUBLIC_FUNDS, null).length, PUBLIC_FUNDS.length);
  assert.deepEqual(hiddenFundKeys(null), []);
});
