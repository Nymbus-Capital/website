/**
 * Home "diversifying engines" illustration: the generated stream is deterministic per seed and bounded, down
 * months and stress episodes behave as designed, the down-month correlation stays low between engines (design
 * objective of the picture) and is computed on down months only, the layout fits every width, and the copy is
 * bilingual, short, labelled as an illustration and never states low correlation as a fact.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOND, CORR_WINDOW, COUNTER_CYCLE, ENGINES, LEVEL_BOUND, MAX_MOVE, combinedMove, countersBetween, downsideCorrelation,
  heatColor, isStress, level, lit, monthAt, monthCache, monthWidth, overlayLayout,
} from "../../../src/components/site/fx/overlay-model.ts";
import { OVERLAY_COPY, OVERLAY_EXPOSURE } from "../../../src/components/site/fx/overlay-copy.ts";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("months are deterministic for a seed and differ between seeds", () => {
  for (let n = -5; n < 400; n++) assert.deepEqual(monthAt(n, 3), monthAt(n, 3));
  let diff = 0;
  for (let n = 0; n < 200; n++) if (monthAt(n, 1).bond !== monthAt(n, 2).bond) diff++;
  assert.ok(diff > 190);
  const g = monthCache(3);
  for (let n = 0; n < 300; n++) assert.deepEqual(g(n), monthAt(n, 3));
});

test("every generated value is bounded; smoothed paths stay within their bound", () => {
  for (const seed of [0, 1, 9]) {
    const g = monthCache(seed, 4096);
    for (let n = 0; n < 2000; n++) {
      const m = g(n);
      assert.equal(m.engines.length, ENGINES.length);
      for (const v of [m.bond, ...m.engines]) assert.ok(Number.isFinite(v) && Math.abs(v) <= MAX_MOVE);
      assert.equal(m.down, m.bond < 0);
      if (m.stress) assert.ok(m.down, "a stress month is a down month");
      for (let s = -1; s <= ENGINES.length; s++) assert.ok(Math.abs(level(g, n, s)) <= LEVEL_BOUND + 1e-9);
    }
  }
});

test("stress episodes are short clusters; down months are a minority; the reference has no long-run trend", () => {
  const g = monthCache(0, 8192);
  let stress = 0, down = 0, run = 0, maxRun = 0, sum = 0;
  const N = 6000;
  for (let n = 0; n < N; n++) {
    const m = g(n);
    if (isStress(n)) { stress++; run++; maxRun = Math.max(maxRun, run); } else run = 0;
    if (m.down) down++;
    sum += m.bond;
  }
  assert.ok(stress / N > 0.05 && stress / N < 0.16, `${stress / N}`);
  assert.ok(down / N > 0.3 && down / N < 0.55, `${down / N}`);
  assert.ok(maxRun <= 3);
  assert.ok(Math.abs(sum / N) < 0.12, `${sum / N}`);
});

test("down-month correlation: symmetric, unit diagonal, in [-1, 1], low between engines on average", () => {
  const g = monthCache(0, 8192);
  let sumAbs = 0, cnt = 0, bondVol = 0, windows = 0;
  for (let end = CORR_WINDOW; end < 4000; end += 13) {
    const c = downsideCorrelation(g, end);
    assert.equal(c.length, ENGINES.length + 1);
    for (let i = 0; i < c.length; i++) {
      assert.equal(c[i][i], 1);
      for (let j = 0; j < c.length; j++) { assert.ok(c[i][j] >= -1 && c[i][j] <= 1); assert.equal(c[i][j], c[j][i]); }
    }
    for (let i = 1; i < c.length; i++) for (let j = 1; j < i; j++) { sumAbs += Math.abs(c[i][j]); cnt++; }
    bondVol += c[0][1 + ENGINES.findIndex((e) => e.key === "hedging")];
    windows++;
  }
  assert.ok(sumAbs / cnt < 0.15, `mean |engine-engine| ${sumAbs / cnt}`);
  // hedging is built to react when stress rises: it tends to move against the reference in down months
  assert.ok(bondVol / windows < -0.2, `${bondVol / windows}`);
});

test("down-month correlation only uses down months", () => {
  // a stream whose up months are perfectly correlated must not leak into the downside figure
  const fake = (n: number) => {
    const down = n % 2 === 0;
    const e = down ? [Math.sin(n), Math.cos(n * 1.7), Math.sin(n * 2.3), Math.cos(n * 3.1), Math.sin(n * 5.3)] : [n, n, n, n, n];
    return { n, bond: down ? -1 - (n % 5) / 10 : n, engines: e, down, stress: false };
  };
  const c = downsideCorrelation(fake, 200, 120);
  for (let i = 1; i < c.length; i++) for (let j = 1; j < i; j++) assert.ok(Math.abs(c[i][j]) < 0.99);
});

test("lit engines and counters", () => {
  const g = monthCache(5);
  for (let n = 0; n < 500; n++) {
    const m = g(n);
    for (let i = 0; i < ENGINES.length; i++) assert.equal(lit(m, i), m.down && m.engines[i] > 0);
    assert.ok(Math.abs(combinedMove(m)) <= MAX_MOVE);
  }
  assert.deepEqual(countersBetween(g, 10, 10), { months: 0, down: 0, litMoves: 0 });
  const c = countersBetween(g, 0, COUNTER_CYCLE);
  assert.equal(c.months, COUNTER_CYCLE);
  assert.ok(c.down > 0 && c.down < COUNTER_CYCLE);
  assert.ok(c.litMoves > 0 && c.litMoves <= c.down * ENGINES.length);
});

test("layout fits every width: chart, lanes and heatmap inside the canvas, never overlapping", () => {
  for (const [W, H] of [[300, 600], [336, 600], [600, 600], [700, 420], [1024, 430], [1400, 540]]) {
    const L = overlayLayout(W, H);
    assert.ok(L.x0 > L.pad && L.x1 > L.x0 + 100 && L.x1 <= W - L.pad, `${W}`);
    assert.ok(L.band.y >= 0 && L.lanes.y > L.band.y + L.band.h - 1 && L.lanes.y + L.lanes.h <= H - L.foot, `${W}`);
    assert.ok(L.heat.x >= 0 && L.heat.x + L.heat.w <= W && L.heat.y + L.heat.h <= H - L.foot && L.heat.h > 80, `${W}`);
    if (L.narrow) assert.ok(L.heat.y > L.lanes.y + L.lanes.h); else assert.ok(L.heat.x > L.x1);
    assert.ok(monthWidth(L.x1 - L.x0) >= 7);
  }
});

test("heat colours: pale near zero, stronger when far from it", () => {
  const alpha = (s: string) => Number(s.match(/,([\d.]+)\)$/)![1]);
  assert.ok(alpha(heatColor(0)) < 0.1);
  assert.ok(alpha(heatColor(0.9)) > alpha(heatColor(0.3)));
  assert.ok(alpha(heatColor(-0.9)) > 0.7);
  assert.notEqual(heatColor(0.5), heatColor(-0.5));
});

test("copy: EN and FR, short lines, labelled as an illustration, low correlation as an objective only", () => {
  const all: [string, { en: string; fr: string }][] = [];
  const walk = (x: unknown, path: string) => {
    if (x && typeof x === "object" && "en" in x && "fr" in x) all.push([path, x as { en: string; fr: string }]);
    else if (Array.isArray(x)) x.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) walk(v, `${path}.${k}`);
  };
  walk(OVERLAY_COPY, "OVERLAY_COPY");
  walk(ENGINES.map((e) => e.label), "ENGINES");
  walk(BOND.label, "BOND");
  const words = (s: string) => s.trim().split(/\s+/).length;
  for (const [p, v] of all) {
    assert.ok(v.en.trim() && v.fr.trim(), p);
    if (p.endsWith(".alt")) continue; // accessible name, not shown
    // every visible sentence is 12 words or fewer
    // every visible sentence is 12 words or fewer (the verbatim regulatory disclosure excepted)
    for (const lang of ["en", "fr"] as const) for (const s of v[lang].split(/(?<=\.)\s+/)) if (s !== OVERLAY_EXPOSURE[lang]) assert.ok(words(s) <= 12, `${p} (${lang}): ${s}`);
  }
  assert.equal(OVERLAY_COPY.watermark.en, "ILLUSTRATION · generated values");
  assert.equal(OVERLAY_COPY.watermark.fr, "ILLUSTRATION · valeurs générées");
  for (const v of Object.values(OVERLAY_COPY.counters)) { assert.match(v.en, /^Simulated /); assert.match(v.fr, /simulés$/); }
  assert.match(OVERLAY_COPY.canvas.lit.en, /^Highlighted: moves independently$/);
  assert.match(OVERLAY_COPY.canvas.lit.fr, /^En surbrillance\u00a0: évolue indépendamment$/);
  assert.doesNotMatch(all.map(([, v]) => `${v.en} ${v.fr}`).join(" "), /\bLit\b|Allumé|Multi-?strat/i);
  assert.match(OVERLAY_COPY.caption.en, /generated values, not actual positions or results/);
  assert.match(OVERLAY_COPY.caption.fr, /valeurs générées, ni positions ni résultats réels/);
  assert.match(OVERLAY_COPY.caption.en, /design objective, not a guarantee/);
  assert.match(OVERLAY_COPY.caption.fr, /un objectif, pas une garantie/);
  assert.match(OVERLAY_COPY.caption.en, /can lose money/);
  // the futures-exposure disclosure, word for word as on /approach (and /solutions), in both languages
  assert.ok(OVERLAY_COPY.caption.en.endsWith(OVERLAY_EXPOSURE.en));
  assert.ok(OVERLAY_COPY.caption.fr.endsWith(OVERLAY_EXPOSURE.fr));
  const approach = readFileSync(resolve(import.meta.dirname, "../../../src/components/site/pages/copy-approach.ts"), "utf8");
  const fund = readFileSync(resolve(import.meta.dirname, "../../../src/components/fund/copy.ts"), "utf8");
  for (const src of [approach, fund]) { assert.ok(src.includes(OVERLAY_EXPOSURE.en)); assert.ok(src.includes(OVERLAY_EXPOSURE.fr)); }
  // never stated as a fact
  const text = all.map(([, v]) => `${v.en} ${v.fr}`).join(" ");
  assert.doesNotMatch(text, /\buncorrelated\b|non corrél|décorrél|\bguaranteed\b|\bprotects?\b|\bprotège/i);
  assert.match(OVERLAY_COPY.lead.en, /designed to/);
  assert.match(OVERLAY_COPY.lead.fr, /conçues/);
  assert.match(OVERLAY_COPY.canvas.heat.en, /concept/i);
});

test("lanes: the Multi-Strategy Fund's four strategies as named on /approach, plus the overlay on its own lane", () => {
  const approach = readFileSync(resolve(import.meta.dirname, "../../../src/components/site/pages/copy-approach.ts"), "utf8");
  const four = ENGINES.filter((e) => e.blend);
  assert.deepEqual(four.map((e) => e.label.en), ["Low volatility", "Directional", "Mean reversion", "Hedging"]);
  for (const e of four) assert.ok(approach.includes(`l("${e.label.en}", "${e.label.fr}")`), e.label.en);
  const rest = ENGINES.filter((e) => !e.blend);
  assert.deepEqual(rest.map((e) => e.key), ["overlay"]);
  // the overlay never enters the blended line
  const m = { n: 0, bond: -1, engines: [0, 0, 0, 0, 3], down: true, stress: true };
  assert.equal(combinedMove(m), 0);
});

test("zero drift: no lane, blend or reference trends over time (nothing reads as performance)", () => {
  for (const seed of [0, 1, 7]) {
    const g = monthCache(seed, 40000);
    const N = 30000;
    let b = 0, c = 0;
    const e = new Array<number>(ENGINES.length).fill(0);
    for (let n = 0; n < N; n++) { const m = g(n); b += m.bond; c += combinedMove(m); m.engines.forEach((v, i) => (e[i] += v)); }
    assert.ok(Math.abs(b / N) < 0.02, `bond ${b / N}`);
    assert.ok(Math.abs(c / N) < 0.02, `combined ${c / N}`);
    e.forEach((v, i) => assert.ok(Math.abs(v / N) < 0.02, `${ENGINES[i].key} ${v / N}`));
  }
});
