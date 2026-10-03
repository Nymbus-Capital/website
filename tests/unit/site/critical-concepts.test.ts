/**
 * /critical-concepts (2026-10-03): the pure models behind the three animations (overlay stack, futures daily
 * settlement, coverage at scale) are deterministic, bounded and true to the concept they teach; the layouts fit every
 * width; the copy is bilingual, short, labelled as an illustration, carries the verbatim futures-exposure disclosure
 * where overlays are described and never states low correlation or a guarantee; the page is in the nav and footer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cycleMs, stepAt, stepStarts } from "../../../src/components/site/concepts/timeline.ts";
import {
  DEPOSIT_SHARE, EXPOSURE_SHARE, MAX_CONTRIB, OVERLAY_STEP_MS, overlayStackLayout, periodAt, stackBlocks,
} from "../../../src/components/site/concepts/overlay-stack-model.ts";
import {
  DAYS, DAY_MS, FUTURES_STEP_MS, HIGH_VOL_FROM, HIGH_VOL_TO, LOOP_MS, MARGIN_K, futuresLayout, futuresLoop, intraday, marginFor,
  settledThrough, sigmaOf, unsettled,
} from "../../../src/components/site/concepts/futures-model.ts";
import {
  ANALYSTS, COVERAGE_STEP_MS, LIQUID_MIN_MM, PER_ANALYST, TEAM_RANGE, UNIVERSE, cellOf, coverageLayout, gridShape, sectorOf, teamCoverage,
  universe,
} from "../../../src/components/site/concepts/coverage-model.ts";
import { CC, CONCEPTS, OVERLAY_EXPOSURE } from "../../../src/components/site/concepts/concepts-copy.ts";

const ROOT = resolve(import.meta.dirname, "../../..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const leaves = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : []);
type Box = { x: number; y: number; w: number; h: number };
const inside = (b: Box, W: number, H: number, what: string) => {
  assert.ok(b.w > 0 && b.h > 0, `${what}: empty ${JSON.stringify(b)}`);
  assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= W + 0.01 && b.y + b.h <= H + 0.01, `${what} outside ${W}×${H}: ${JSON.stringify(b)}`);
};
/** canvas sizes the CSS gives each scene (narrow under 700 px wide) */
const SIZES: [number, number][] = [[300, 640], [328, 640], [500, 640], [699, 640], [700, 460], [900, 470], [1150, 500], [1360, 520]];

/* ------------------------------------------------------------------ timeline */

test("timeline: steps cover the cycle in order and wrap around", () => {
  const d = [100, 200, 300];
  assert.equal(cycleMs(d), 600);
  assert.deepEqual(stepStarts(d), [0, 100, 300]);
  assert.equal(stepAt(0, d).step, 0);
  assert.equal(stepAt(99, d).step, 0);
  assert.equal(stepAt(100, d).step, 1);
  assert.equal(stepAt(350, d).step, 2);
  assert.equal(stepAt(650, d).step, 0);
  assert.equal(stepAt(650, d).loop, 1);
  for (let t = 0; t < 2000; t += 7) { const s = stepAt(t, d); assert.ok(s.p >= 0 && s.p < 1); }
});

/* ------------------------------------------------------------------ overlay stack */

test("overlay: periods are deterministic, bounded, and combined = core + overlay exactly", () => {
  let neg = 0, pos = 0, sum = 0;
  for (let n = 0; n < 3000; n++) {
    const p = periodAt(n, 3);
    assert.deepEqual(p, periodAt(n, 3));
    assert.ok(Math.abs(p.core) <= MAX_CONTRIB / 2 && Math.abs(p.overlay) <= MAX_CONTRIB / 2);
    assert.ok(Math.abs(p.combined) <= MAX_CONTRIB);
    assert.equal(p.combined, p.core + p.overlay);
    if (p.overlay < 0) neg++; else pos++;
    sum += p.combined;
  }
  // overlay periods lose too (the chart shows losses adding up), and nothing drifts into a "result"
  assert.ok(neg > 1000 && pos > 1000, `${neg} / ${pos}`);
  assert.ok(Math.abs(sum / 3000) < 0.05, `${sum / 3000}`);
  let diff = 0;
  for (let n = 0; n < 100; n++) if (periodAt(n, 1).overlay !== periodAt(n, 2).overlay) diff++;
  assert.ok(diff > 95);
});

test("overlay: the deposit is drawn to scale (about 10% of the full exposure) and the overlay spans the whole core", () => {
  assert.equal(DEPOSIT_SHARE, 0.1);
  assert.equal(EXPOSURE_SHARE, 1);
  for (const [W, H] of SIZES) {
    const L = overlayStackLayout(W, H);
    inside(L.stack, W, H, "stack"); inside(L.chart, W, H, "chart");
    const B = stackBlocks(L.stack, L.narrow);
    assert.ok(Math.abs(B.deposit.w - B.core.w * DEPOSIT_SHARE) < 1e-9);
    assert.ok(Math.abs(B.overlay.w - B.core.w) < 1e-9);
    for (const [k, b] of [["core", B.core], ["deposit", B.deposit], ["overlay", B.overlay]] as const) inside(b, W, H, `${k} ${W}`);
    assert.ok(B.overlay.y + B.overlay.h <= B.core.y, "overlay stacked on top of the core");
    assert.ok(B.deposit.x >= B.core.x + B.core.w, "deposit beside the core");
    assert.ok(B.bracketY + 26 <= H, `bracket ${W}`);
    // nothing overlaps between the stack and the chart
    if (L.narrow) assert.ok(L.stack.y + L.stack.h <= L.chart.y); else assert.ok(L.stack.x + L.stack.w <= L.chart.x);
  }
  assert.equal(OVERLAY_STEP_MS.length, 4);
});

/* ------------------------------------------------------------------ futures */

test("futures: each close is the next open; long and short settlements are opposite every day", () => {
  for (const loop of [0, 1, 5]) {
    const days = futuresLoop(loop);
    assert.equal(days.length, DAYS);
    assert.deepEqual(days, futuresLoop(loop));
    for (let d = 0; d < DAYS; d++) {
      const x = days[d];
      assert.ok(Math.abs(x.close - x.open - x.move) < 1e-12);
      assert.equal(x.long + x.short, 0);
      assert.equal(x.long, x.move, "index up: the long receives; down: the long pays");
      assert.ok(Math.abs(x.move) > 0, "every day moves");
      if (d > 0) assert.equal(x.open, days[d - 1].close);
    }
  }
});

test("futures: the daily settlements add up to the cumulative gain or loss", () => {
  for (const loop of [0, 2, 7, 11]) {
    const days = futuresLoop(loop);
    for (let k = 0; k <= DAYS; k++) {
      const expect = k === 0 ? 0 : days[k - 1].close - days[0].open;
      assert.ok(Math.abs(settledThrough(days, k) - expect) < 1e-9, `loop ${loop} k ${k}`);
    }
    // the short's settlements are the mirror image
    const shortSum = days.reduce((a, x) => a + x.short, 0);
    assert.ok(Math.abs(shortSum + settledThrough(days, DAYS)) < 1e-9);
  }
});

test("futures: only one day is ever unsettled, and the margin buffer covers it and scales with volatility", () => {
  for (const loop of [0, 3, 9]) {
    for (const day of futuresLoop(loop)) {
      assert.ok(Math.abs(unsettled(day, 0)) < 1e-12, "nothing open at the open: yesterday is settled");
      assert.ok(Math.abs(unsettled(day, 1) - day.long) < 1e-9, "at the close the open P&L is exactly the day's settlement");
      assert.ok(Math.abs(intraday(day, 1) - day.close) < 1e-9);
      for (let u = 0; u <= 1; u += 0.02) assert.ok(Math.abs(unsettled(day, u)) <= day.margin, `day ${day.d} u ${u}`);
      assert.ok(Math.abs(day.move) <= day.margin);
      assert.equal(day.margin, marginFor(day.sigma));
    }
  }
  // margin is proportional to volatility, larger in the volatile episode
  assert.equal(marginFor(1), MARGIN_K);
  for (let s = 0.1; s < 3; s += 0.1) assert.ok(marginFor(s + 0.1) > marginFor(s));
  assert.ok(sigmaOf(HIGH_VOL_FROM) > sigmaOf(0) && sigmaOf(HIGH_VOL_TO) > sigmaOf(DAYS - 1));
  const days = futuresLoop(0);
  assert.ok(days[HIGH_VOL_FROM].margin > days[0].margin * 2);
});

test("futures: four focus steps over one loop; layouts fit", () => {
  assert.equal(LOOP_MS, DAYS * DAY_MS);
  assert.equal(cycleMs(FUTURES_STEP_MS), LOOP_MS);
  // the margin-buffer step shows the volatile episode
  const s2 = stepStarts(FUTURES_STEP_MS)[2];
  assert.ok(s2 / DAY_MS <= HIGH_VOL_FROM + 0.5 && (s2 + FUTURES_STEP_MS[2]) / DAY_MS >= HIGH_VOL_TO);
  for (const [W, H0] of SIZES) {
    const H = W < 700 ? 720 : H0;
    const L = futuresLayout(W, H);
    for (const [k, b] of [["price", L.price], ["settle", L.settle], ["parties", L.parties]] as const) inside(b, W, H, `${k} ${W}`);
    assert.ok(L.price.y + L.price.h <= L.settle.y);
    assert.ok(L.parties.h >= (L.narrow ? 230 : 300), `parties height ${W}: ${L.parties.h}`);
  }
});

/* ------------------------------------------------------------------ coverage */

test("coverage: about 2,000 bonds; the liquidity filter is ≥ $200 MM outstanding", () => {
  const u = universe(0);
  assert.equal(UNIVERSE, 2000);
  assert.equal(u.length, UNIVERSE);
  assert.deepEqual(u, universe(0));
  assert.equal(LIQUID_MIN_MM, 200);
  for (const b of u) {
    assert.equal(b.liquid, b.outstanding >= 200);
    assert.equal(b.sector, sectorOf(b.i));
    assert.ok(b.sector >= 0 && b.sector < ANALYSTS);
  }
  const liquid = u.filter((b) => b.liquid).length;
  assert.ok(liquid > UNIVERSE * 0.6 && liquid < UNIVERSE, `${liquid}`);
});

test("coverage: a team of six analysts × ~30 securities covers 180 bonds — a small fraction of the universe", () => {
  const u = universe(0);
  const team = teamCoverage(u);
  assert.equal(team.length, ANALYSTS);
  const all = team.flat();
  assert.equal(all.length, ANALYSTS * PER_ANALYST);
  assert.equal(new Set(all).size, all.length, "no bond covered twice");
  assert.ok(all.length >= TEAM_RANGE[0] && all.length <= TEAM_RANGE[1]);
  assert.equal(TEAM_RANGE[0], 5 * PER_ANALYST);
  assert.equal(TEAM_RANGE[1], 6 * PER_ANALYST);
  team.forEach((list, a) => {
    assert.equal(list.length, PER_ANALYST);
    for (const i of list) { assert.equal(u[i].sector, a, "each analyst stays in their sector"); assert.ok(u[i].liquid); }
  });
  assert.ok(all.length / UNIVERSE < 0.1, "under one bond in ten");
});

test("coverage: the grid has exactly one cell per bond and fits the canvas at every width", () => {
  for (const [W, H0] of SIZES) {
    const H = W < 700 ? 560 : H0;
    const { cols, rows } = gridShape(W);
    assert.equal(cols * rows, UNIVERSE);
    const L = coverageLayout(W, H);
    inside(L.grid, W, H, `grid ${W}`);
    inside(L.team, W, H, `team ${W}`);
    assert.ok(L.cell >= 3, `cell ${W}: ${L.cell}`);
    // history layers (memory step) stay on the canvas
    assert.ok(L.grid.y - L.depthY - 20 >= 0 && L.grid.x + L.grid.w + L.depthX + 6 <= W, `depth ${W}`);
    const seen = new Set<string>();
    for (let i = 0; i < UNIVERSE; i++) {
      const c = cellOf(i, L);
      assert.ok(c.x > L.grid.x && c.x < L.grid.x + L.grid.w && c.y > L.grid.y && c.y < L.grid.y + L.grid.h);
      seen.add(`${c.x.toFixed(2)},${c.y.toFixed(2)}`);
    }
    assert.equal(seen.size, UNIVERSE);
    if (!L.narrow) assert.ok(L.team.x + L.team.w <= L.grid.x); else assert.ok(L.team.y + L.team.h <= L.grid.y);
  }
  assert.equal(COVERAGE_STEP_MS.length, 4);
});

/* ------------------------------------------------------------------ copy */

test("copy: every string exists in English and French; three concepts with four steps each", () => {
  const pairs: [string, string][] = [];
  const walk = (v: unknown) => {
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.en === "string" && typeof o.fr === "string") { pairs.push([o.en, o.fr]); return; }
      Object.values(o).forEach(walk);
    }
  };
  walk(CC);
  assert.ok(pairs.length > 80);
  for (const [en, fr] of pairs) assert.ok(en.trim() && fr.trim(), `missing translation: ${en} / ${fr}`);
  assert.deepEqual(CONCEPTS.map((c) => c.id), ["overlay", "futures", "coverage"]);
  for (const c of CONCEPTS) { assert.equal(c.copy.steps.length, 4); assert.ok(c.copy.alt.en.startsWith("Animated illustration")); }
  assert.equal(CC.watermark.en, "ILLUSTRATION · generated values");
  assert.equal(CC.watermark.fr, "ILLUSTRATION · valeurs générées");
});

test("copy: the overlay caption ends with the verbatim futures-exposure disclosure; futures say losses can exceed the deposit", () => {
  assert.ok(CC.overlay.caption.en.endsWith(OVERLAY_EXPOSURE.en));
  assert.ok(CC.overlay.caption.fr.endsWith(OVERLAY_EXPOSURE.fr));
  assert.equal(OVERLAY_EXPOSURE.en, "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.");
  assert.match(CC.overlay.caption.en, /generated values, not actual positions or results/);
  assert.match(CC.overlay.caption.en, /Overlays can lose money/);
  assert.match(CC.futures.caption.en, /losses can exceed the margin deposited/);
  assert.match(CC.futures.caption.fr, /les pertes peuvent dépasser le dépôt/);
  assert.match(CC.futures.canvas.realized.en, /not a tax statement/);
  assert.match(CC.futures.canvas.formula.en, /^futures return ≈ underlying return − overnight rate$/);
});

test("copy: no guarantee, no 'uncorrelated' as a fact, no leverage wording, no performance figure", () => {
  const all = leaves(CC);
  for (const s of all) {
    assert.ok(!/\buncorrelated\b|non[- ]corrélé|décorrélé/i.test(s), s);
    // « dépôt de garantie » is the French term for margin, not a guarantee
    assert.ok(!/guarant|garanti/i.test(s.replace(/dépôts? de garantie/gi, "")), `guarantee wording: ${s}`);
    assert.ok(!/leverag|levier/i.test(s), s);
    assert.ok(!/baissi[eè]re|ingénieur|\bengineers?\b/i.test(s), s);
    // percentages only for the overlay's illustrative allocation (100%, ≈10%)
    for (const m of s.matchAll(/(\d+(?:[.,]\d+)?)\s?%/g)) assert.ok(["100", "10"].includes(m[1]), `unexpected percentage in: ${s}`);
  }
});

test("copy: the coverage figures are Gabriel's illustrative estimates and match the model", () => {
  const v = CC.coverage.stats.map((s) => s.value.en);
  assert.deepEqual(v, ["≈30", "150–180", "≈2,000", "≥ $200 MM"]);
  assert.deepEqual(CC.coverage.stats.map((s) => s.value.fr), ["≈ 30", "150–180", "≈ 2 000", "≥ 200 M$"]);
  assert.equal(CC.coverage.chip.en, "Illustrative estimates");
  assert.match(CC.coverage.caption.en, /^Illustrative estimates/);
  assert.match(CC.coverage.note.en, /over the counter/);
  assert.equal(PER_ANALYST, 30);
  assert.equal(UNIVERSE, 2000);
});

test("copy: very little visible prose (titles, takeaways, steps, note)", () => {
  const words = (s: string) => s.trim().split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
  for (const lang of ["en", "fr"] as const) {
    let n = words(CC.hero.title[lang]) + words(CC.hero.accent[lang]) + words(CC.hero.lead[lang]) + words(CC.coverage.note[lang]);
    for (const c of CONCEPTS) {
      n += words(c.copy.title[lang]) + words(c.copy.accent[lang]) + words(c.copy.lead[lang]);
      n += c.copy.steps.reduce((a, s) => a + words(s[lang]), 0);
      assert.ok(words(c.copy.lead[lang]) <= 22, `${c.id} lead (${lang})`);
      for (const s of c.copy.steps) assert.ok(words(s[lang]) <= 5, `${c.id} step (${lang}): ${s[lang]}`);
    }
    assert.ok(n <= (lang === "en" ? 130 : 160), `${lang}: ${n} words`);
  }
});

/* ------------------------------------------------------------------ wiring */

test("nav and footer link the page; route and labels exist in both languages", () => {
  assert.match(read("src/components/site/links.ts"), /\{ href: "\/critical-concepts", key: "nav\.concepts" \}/);
  assert.match(read("src/components/site/Footer.tsx"), /href="\/critical-concepts"/);
  assert.match(read("src/lib/i18n/en.ts"), /"nav\.concepts": "Critical concepts"/);
  assert.match(read("src/lib/i18n/fr.ts"), /"nav\.concepts": "Concepts clés"/);
  const page = read("src/app/(site)/critical-concepts/page.tsx");
  assert.match(page, /canonical: "\/critical-concepts"/);
  assert.match(page, /generateMetadata/);
});

test("engines keep the motion contract: DPR cap, fps cap, still frames, pause off screen and in hidden tabs, test hooks", () => {
  const runner = read("src/components/site/concepts/runner.ts");
  assert.match(runner, /Math\.min\(1\.5, window\.devicePixelRatio/);
  assert.match(runner, /maxFps \?\? 30/);
  assert.match(runner, /IntersectionObserver/);
  assert.match(runner, /visibilitychange/);
  for (const hook of ["data-frames", "data-running", "data-step"]) assert.ok(runner.includes(hook), hook);
  const panel = read("src/components/site/concepts/ConceptPanel.tsx");
  assert.match(panel, /prefers-reduced-motion: reduce/);
  assert.match(panel, /saveData/);
  assert.match(panel, /pointer: coarse/);
  assert.match(panel, /rootMargin: "300px"/);
  for (const f of ["overlay-stack-engine.ts", "futures-engine.ts", "coverage-engine.ts"]) {
    const code = read(`src/components/site/concepts/${f}`);
    assert.ok(!/\.font\s*=/.test(code), `${f} sets fonts through draw-kit (Poppins)`);
    assert.ok(!/shadowBlur/.test(code), `${f}: no shadowBlur`);
    assert.match(code, /watermark/);
  }
});
