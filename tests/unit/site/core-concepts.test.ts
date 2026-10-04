/**
 * /core-concepts (2026-10-03; was /critical-concepts): the pure models behind the three animations (overlay stack, futures daily
 * settlement, ultra-micro analysis at scale) are deterministic, bounded and true to the concept they teach; the layouts fit every
 * width; the copy is bilingual, short, labelled as an illustration, carries the verbatim futures-exposure disclosure
 * where overlays are described and never states low correlation or a guarantee; the page is in the nav and footer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cycleMs, stepAt, stepStarts } from "../../../src/components/site/concepts/timeline.ts";
import {
  CHART_PERIODS, DEPOSIT_SHARE, EXPOSURE_SHARE, MAX_CONTRIB, chartScale, largestLoss, lossNoteSpot, stackOf, OVERLAY_STEP_MS, overlayStackLayout, periodAt, stackBlocks,
} from "../../../src/components/site/concepts/overlay-stack-model.ts";
import {
  DAYS, DAY_MS, FUTURES_STEP_MS, HIGH_VOL_FROM, HIGH_VOL_TO, LOOP_MS, MARGIN_K, READ_MARGIN, READ_MS_PER_WORD, RULE_FULL_MS, SETTLE_SHARE, futuresLayout,
  futuresLoop, intraday, marginFor, marketU, ruleAlpha, settledThrough, sigmaOf, unsettled,
} from "../../../src/components/site/concepts/futures-model.ts";
import {
  ANALYSTS, CARD_ROWS, COVERAGE_STEP_MS, FOCUS_IN, LIQUID_MIN_MM, PER_ANALYST, TEAM_RANGE, UNIVERSE, analystPos, analystSlot, cellOf, coverageLabelBoxes, coverageLayout,
  focusFrom, focusTracker, gridFit, pmPos, sectorBlocks, sectorFont, sectorLabelBoxes, sectorOf, sectorStart, teamCoverage, universe,
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
  let neg = 0, core = 0;
  for (let n = 0; n < 3000; n++) {
    const p = periodAt(n, 3);
    assert.deepEqual(p, periodAt(n, 3));
    assert.ok(Math.abs(p.core) <= MAX_CONTRIB / 2 && Math.abs(p.overlay) <= MAX_CONTRIB / 2);
    assert.ok(Math.abs(p.combined) <= MAX_CONTRIB);
    assert.equal(p.combined, p.core + p.overlay);
    if (p.overlay < 0) neg++;
    core += p.core;
  }
  // overlay periods lose too (the chart shows losses adding up); the core has no drift
  assert.ok(neg > 300, `${neg}`);
  assert.ok(Math.abs(core / 3000) < 0.05, `${core / 3000}`);
  let diff = 0;
  for (let n = 0; n < 100; n++) if (periodAt(n, 1).overlay !== periodAt(n, 2).overlay) diff++;
  assert.ok(diff > 95);
});

test("overlay: driven by volatility (vega) — small in calm periods, larger in volatile ones (up or down moves), never a promise", () => {
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const all = Array.from({ length: 4000 }, (_, n) => periodAt(n, 0));
  const vol = all.filter((p) => p.volatile), calm = all.filter((p) => !p.volatile);
  assert.ok(mean(vol.map((p) => p.overlay)) > 3 * mean(calm.map((p) => p.overlay)), "volatile mean > 3 × calm mean");
  for (const p of calm) assert.ok(Math.abs(p.overlay) < 0.6, `calm overlay stays small: ${p.overlay}`);
  // volatile periods can lose too (roughly one in five or six)
  const volLoss = vol.filter((p) => p.overlay < 0).length / vol.length;
  assert.ok(volLoss > 0.1 && volLoss < 0.3, `volatile losing share ${volLoss}`);
  // the volatile core is symmetric with a larger spread: big up and big down moves both tend to pay
  assert.ok(Math.abs(mean(vol.map((p) => p.core))) < 0.08 && Math.abs(mean(calm.map((p) => p.core))) < 0.05);
  assert.ok(mean(vol.map((p) => Math.abs(p.core))) > 2.5 * mean(calm.map((p) => Math.abs(p.core))));
  const bigUp = vol.filter((p) => p.core > 0.6), bigDn = vol.filter((p) => p.core < -0.6);
  assert.ok(bigUp.length > 50 && bigDn.length > 50);
  assert.ok(mean(bigUp.map((p) => p.overlay)) > 0.4 && mean(bigDn.map((p) => p.overlay)) > 0.4);
  // default seed: the largest core drawdown comes with a positive overlay
  const w0 = Array.from({ length: CHART_PERIODS }, (_, n) => periodAt(n, 0));
  const worst = [...w0].sort((a, b) => a.core - b.core)[0];
  assert.ok(worst.volatile && worst.overlay > 0, `default seed worst drawdown: ${JSON.stringify(worst)}`);
  // every chart window shows both regimes and a losing calm period; across the 16 loop seeds a volatile period loses too
  let volLosers = 0;
  for (let seed = 0; seed < 16; seed++) {
    const w = Array.from({ length: CHART_PERIODS }, (_, n) => periodAt(n, seed));
    assert.ok(w.some((p) => p.volatile) && w.some((p) => !p.volatile), `seed ${seed}`);
    assert.ok(w.some((p) => p.overlay < 0 && !p.volatile), `seed ${seed}: no losing calm period`);
    volLosers += w.filter((p) => p.volatile && p.overlay < 0).length;
    for (const p of w) assert.equal(p.combined, p.core + p.overlay);
  }
  assert.ok(volLosers >= 1, "at least one losing volatile period across the 16 loops");
});

test("overlay chart: the scale uses the window's tallest stack; the loss note points at the largest loss and covers no bar", () => {
  for (const [Cw, barsH, narrow] of [[332, 170, true], [384, 190, true], [800, 340, false]] as [number, number, boolean][]) {
    for (let seed = 0; seed < 16; seed++) {
      const w = Array.from({ length: CHART_PERIODS }, (_, n) => periodAt(n, seed));
      const top = 40, bottom = top + barsH, mid = (top + bottom) / 2, half = barsH / 2;
      const scale = chartScale(w, half);
      const tallest = Math.max(...w.map((p) => Math.max(stackOf(p).up, stackOf(p).dn)));
      assert.ok(tallest * scale <= half && tallest * scale > half * 0.8, `scale fills the height (${seed})`);
      const li = largestLoss(w);
      assert.ok(li >= 0 && w.every((p) => p.overlay >= w[li].overlay));
      const bw = Cw / (CHART_PERIODS + 1), bwid = Math.max(3, bw * 0.56);
      for (const textW of [26 * 5.6, 31 * 5.6]) { // "Overlay losses add up too" / « Les pertes s’additionnent aussi »
        const s = lossNoteSpot(w, li, { x0: 0, bw, w: bwid, mid, top, bottom, scale, textW: Math.min(textW, Cw * 0.55) });
        assert.ok(s.box.y >= top && s.box.y + s.box.h <= bottom, `note inside the bars area (${seed}, ${narrow})`);
        w.forEach((p, k) => {
          const cx = bw * (k + 0.5), st = stackOf(p);
          const bar = { x: cx - bwid / 2, y: mid - st.up * scale, w: bwid, h: (st.up + st.dn) * scale };
          const hit = s.box.x < bar.x + bar.w && bar.x < s.box.x + s.box.w && s.box.y < bar.y + bar.h && bar.y < s.box.y + s.box.h;
          assert.ok(!hit, `loss note covers bar ${k} (seed ${seed}, width ${Cw})`);
        });
      }
    }
  }
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
    // the bracket spans core + deposit (one capital base); its labels and the deposit's never collide
    assert.equal(B.bracket.x0, B.core.x);
    assert.ok(Math.abs(B.bracket.x1 - (B.deposit.x + B.deposit.w)) < 1e-9);
    const boxes = Object.entries(B.labels);
    for (const [k, b] of boxes) assert.ok(b.y + b.h <= L.stack.y + L.stack.h + 2 && b.y + b.h <= H - 20, `${k} label ${W}: ${JSON.stringify(b)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [ka, a] = boxes[i], [kb, b] = boxes[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!overlap, `${ka} overlaps ${kb} at ${W}`);
    }
    assert.ok(B.labels.depositA.y >= B.core.y + B.core.h && B.labels.depositB.y + 14 <= B.bracketY, `deposit labels between core and bracket ${W}`);
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

test("futures: a tiny bit faster than 5 s, still slower than 1.25 s (Gabriel 2026-10-04) — 3.5–4 s a day, a settlement pause, each message held long enough to read comfortably", () => {
  assert.ok(DAY_MS >= 3500 && DAY_MS <= 4000, `${DAY_MS} ms a day`);
  assert.ok(DAY_MS < 5000 && DAY_MS > 1250 * 2);
  // the settlement pause keeps its proportion of the day (25 %): the price holds ≈ 0.9 s while the cash moves
  assert.equal(SETTLE_SHARE, 0.25);
  assert.ok(SETTLE_SHARE * DAY_MS >= 900);
  assert.equal(marketU(0), 0);
  assert.equal(marketU(SETTLE_SHARE), 0);
  assert.equal(marketU(1), 1);
  for (let u = 0; u < 1; u += 0.01) assert.ok(marketU(u + 0.01) >= marketU(u) && marketU(u + 0.01) - marketU(u) <= 0.01 / (1 - SETTLE_SHARE) + 1e-9, "monotone, no jump");
  // the settlement message: fades in fast, fully shown for most of the day, gone just before the next close
  assert.equal(ruleAlpha(0), 0);
  assert.equal(ruleAlpha(1), 0);
  assert.equal(ruleAlpha(0.5), 1);
  let full = 0;
  for (let u = 0; u <= 1; u += 0.001) if (ruleAlpha(u) >= 1) full += 0.001 * DAY_MS;
  assert.ok(Math.abs(full - RULE_FULL_MS) < 30, `${full} vs ${RULE_FULL_MS}`);
  // long enough to read the longest message (EN or FR) once comfortably (×1.5) at ≈ 300 words a minute
  const words = (x: string) => x.trim().split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
  for (const k of ["en", "fr"] as const) {
    const longest = Math.max(...[CC.futures.canvas.upPays[k], CC.futures.canvas.downPays[k]].map((r) => words(`${CC.futures.canvas.closeDay[k].replace("{n}", "12")} ${r}`)));
    assert.ok(RULE_FULL_MS >= READ_MARGIN * longest * READ_MS_PER_WORD && READ_MARGIN >= 1.5, `${k}: ${longest} words, ${RULE_FULL_MS} ms`);
  }
  // still frame of step 2 (5.22 days) catches the cash in flight: inside the settlement pause
  assert.ok(0.22 < SETTLE_SHARE);
});

test("futures: four focus steps over one loop; layouts fit", () => {
  assert.equal(LOOP_MS, DAYS * DAY_MS);
  assert.equal(cycleMs(FUTURES_STEP_MS), LOOP_MS);
  // the margin-buffer step shows the volatile episode
  const s2 = stepStarts(FUTURES_STEP_MS)[2];
  assert.ok(s2 / DAY_MS <= HIGH_VOL_FROM + 0.5 && (s2 + FUTURES_STEP_MS[2]) / DAY_MS >= HIGH_VOL_TO);
  for (const [W, H0] of SIZES) {
    const H = W < 700 ? 690 : H0;
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

/** coverage canvas sizes: the CSS gives 480–560 px wide, 620 px under 760 px viewports (narrow layout under 700 px) */
const COV_SIZES: [number, number][] = [[300, 620], [320, 620], [328, 620], [360, 620], [412, 620], [500, 620], [699, 620], [700, 480], [740, 620], [900, 480], [1150, 506], [1360, 560]];
/** Rough Poppins advance per character (em) — semibold mixed case, semibold uppercase — to check labels fit without the canvas. */
const EM = { mixed: 0.6, upper: 0.7 };
const fitsAt = (s: string, size: number, maxW: number, em = EM.mixed) => s.length * em * size <= maxW;
/** greedy word wrap at a size (the engine's wrap): the lines, each fitting maxW */
function wrapAt(s: string, size: number, maxW: number, em = EM.mixed): string[] | null {
  const out: string[] = [];
  for (const w of s.split(" ")) {
    const cur = out.length ? `${out[out.length - 1]} ${w}` : w;
    if (out.length && fitsAt(cur, size, maxW, em)) out[out.length - 1] = cur; else out.push(w);
  }
  return out.every((ln) => fitsAt(ln, size, maxW, em)) ? out : null;
}

test("coverage: one large shared graphic (Gabriel 2026-10-04) — the methods column beside it (a strip above it under 700 px), VS between the two methods", () => {
  for (const [W, H] of COV_SIZES) {
    const L = coverageLayout(W, H);
    const { team: A, systems: B, vs, grid: G } = L;
    for (const [k, r] of [["team", A], ["systems", B], ["grid", G]] as const) inside(r, W, H, `${k} ${W}`);
    if (!L.narrow) {
      // a column: team on top, VS, systems below, all left of the graphic
      assert.equal(A.x, B.x);
      assert.ok(A.y + A.h + 2 * vs.r + 8 <= B.y, `VS gap ${W}`);
      assert.ok(vs.y - vs.r > A.y + A.h && vs.y + vs.r < B.y && Math.abs(vs.x - (A.x + A.w / 2)) < 0.01, `badge between the methods ${W}`);
      assert.ok(A.x + A.w + 20 <= G.x - 6, `column left of the graphic ${W}`);
      // the graphic is the large one: well over half of the canvas width (the VS split gave each side under half)
      assert.ok(L.area.w >= 0.6 * W && G.w + L.depthX >= 0.48 * W, `graphic width ${W}: ${G.w}`);
      assert.ok(L.cell >= 7, `cell ${W}: ${L.cell}`);
    } else {
      // a strip: team · VS · systems side by side, above the graphic
      assert.equal(A.y, B.y);
      assert.ok(A.x + A.w + 2 * vs.r + 2 <= B.x, `VS gap ${W}`);
      assert.ok(vs.x - vs.r > A.x + A.w && vs.x + vs.r < B.x && vs.y > A.y && vs.y < A.y + A.h, `badge between ${W}`);
      assert.ok(A.y + A.h + 10 <= L.titleY - 7, `strip above the graphic ${W}`);
      assert.ok(G.w + L.depthX >= 0.8 * W, `graphic width ${W}: ${G.w}`);
      assert.ok(L.cell >= 5.5, `cell ${W}: ${L.cell}`);
    }
    // the rows drawn in each card fit inside it
    const R = L.narrow ? CARD_ROWS.narrow : CARD_ROWS.wide;
    assert.ok(R.team.bottom <= A.h && R.systems.bottom <= B.h, `card rows ${W}: ${A.h}`);
    assert.ok(B.h <= A.h && B.h - R.systems.bottom <= 12, `our systems' card without empty space ${W}: ${B.h}`);
    assert.equal(L.cols, sectorBlocks(L.rows).width);
    assert.ok(sectorBlocks(L.rows).cols.reduce((x, c) => x + c, 0) * L.rows >= UNIVERSE);
    const seen = new Set<string>();
    for (let i = 0; i < UNIVERSE; i++) {
      const c = cellOf(i, L);
      assert.ok(c.x > G.x && c.x < G.x + G.w && c.y > G.y && c.y < G.y + G.h);
      seen.add(`${c.x.toFixed(2)},${c.y.toFixed(2)}`);
    }
    assert.equal(seen.size, UNIVERSE);
  }
  // gridFit picks the rows that give the largest cells
  const f = gridFit(400, 260);
  for (let rows = 16; rows <= 64; rows++) assert.ok(Math.min(400 / sectorBlocks(rows).width, 260 / rows) <= f.cell + 1e-9);
  assert.equal(COVERAGE_STEP_MS.length, 4);
});

test("coverage: a two-act sequence — the method on the graphic is highlighted, the other faded (≈ 50 %); both in the compare step", () => {
  const starts = stepStarts(COVERAGE_STEP_MS);
  // at rest in each step (after the ease), whatever came before
  for (const from of [[0.6, 0.6], [1, 0.5], [0.5, 1], [1, 1], [0.73, 0.81]] as const) {
    for (const p of [FOCUS_IN + 0.001, 0.5, 0.99]) {
      const [t1, s1] = focusFrom(from, 1, p), [t2, s2] = focusFrom(from, 2, p), [t3, s3] = focusFrom(from, 3, p);
      assert.equal(t1, 1); assert.ok(s1 >= 0.45 && s1 <= 0.55, `${s1}`);
      assert.equal(s2, 1); assert.ok(t2 >= 0.45 && t2 <= 0.55, `${t2}`);
      assert.equal(t3, 1); assert.equal(s3, 1);
    }
  }
  // the tracker eases from what was last drawn — played through or jumped to mid-transition — never a jump
  const frame = 1000 / 30;
  const sim = (jumps: Map<number, number>) => {
    const f = focusTracker();
    let t = 0, prev: [number, number] | null = null, maxStep = 0;
    for (let n = 0; n < (cycleMs(COVERAGE_STEP_MS) * 1.2) / frame; n++) {
      t = jumps.get(n) ?? t + frame;
      const { step, p } = stepAt(t, COVERAGE_STEP_MS);
      const cur = f(step, p);
      if (prev) maxStep = Math.max(maxStep, Math.abs(cur[0] - prev[0]), Math.abs(cur[1] - prev[1]));
      prev = cur;
    }
    return maxStep;
  };
  // the largest ease (0.5 of opacity over FOCUS_IN of the shortest step) moves at most ≈ 0.5 × 1.5 / frames-in-the-ease per frame
  const easeFrames = (FOCUS_IN * Math.min(...COVERAGE_STEP_MS)) / frame;
  const bound = (0.6 * 1.5) / easeFrames + 1e-9;
  assert.ok(sim(new Map()) <= bound, "played through");
  // jumps: into act 2 during act 1's ease, then to compare mid-ease, then back to the universe
  const j = new Map([[3, starts[1] + 5], [110 + 4, starts[2] + 5], [116, starts[3]], [200, 0]]);
  j.set(4, starts[2] + 2);
  assert.ok(sim(j) <= bound, `jumps: ${sim(j)} > ${bound}`);
  // first frame after a jump equals the last frame drawn before it
  const f = focusTracker();
  f(1, 0); const mid = f(1, FOCUS_IN / 2);
  assert.deepEqual(f(3, 0), mid);
  assert.ok(mid[1] > 0.5 && mid[1] < 0.6, "caught mid-transition");
  assert.ok(COVERAGE_STEP_MS[1] >= 6000 && COVERAGE_STEP_MS[2] >= 6000, "each act has time to be read");
});

test("coverage: steps read as a comparison of two methods — universe, conventional team, our systems, compare", () => {
  assert.deepEqual(CC.coverage.steps.map((s) => s.en), ["The universe", "Conventional team", "Our systems", "Compare"]);
  assert.deepEqual(CC.coverage.steps.map((s) => s.fr), ["L’univers", "Équipe conventionnelle", "Nos systèmes", "Comparaison"]);
  assert.equal(CC.coverage.canvas.team.en, "Conventional fundamental team");
  assert.equal(CC.coverage.canvas.team.fr, "Équipe fondamentale conventionnelle");
  assert.equal(CC.coverage.canvas.systems.en, "Our systems");
  assert.equal(CC.coverage.canvas.systems.fr, "Nos systèmes");
  assert.equal(CC.coverage.canvas.vs.en, "VS");
  assert.equal(CC.coverage.canvas.vs.fr, "VS");
  assert.match(CC.coverage.canvas.teamLegend.en, /≈180$/);
  assert.match(CC.coverage.canvas.systemsLegend.en, /every liquid bond$/);
  assert.match(CC.coverage.alt.en, /comparing two methods/);
  assert.match(CC.coverage.alt.fr, /compare deux méthodes/);
  assert.match(CC.coverage.lead.en, /^A conventional team/);
  for (const s of CC.coverage.steps) assert.ok(!/150|180/.test(s.en + s.fr));
});

test("coverage: card labels fit (EN and FR) at every width — titles, scan claim, legends", () => {
  for (const [W, H] of COV_SIZES) {
    const L = coverageLayout(W, H);
    const ip = L.narrow ? 8 : 14;
    const w = L.team.w - 2 * ip;
    for (const k of ["en", "fr"] as const) {
      const c = CC.coverage.canvas;
      if (L.narrow) {
        for (const t of [c.team[k], c.systems[k]]) {
          const lines = wrapAt(t, 8.5, w);
          assert.ok(lines && lines.length <= 2, `${k} title "${t}" at ${W}: ${JSON.stringify(lines)}`);
        }
        const sc = wrapAt(c.scanned[k], 9, w);
        assert.ok(sc && sc.length <= 3, `${k} scanned at ${W}`);
        assert.ok(fitsAt(c.covered[k], 8, w), `${k} covered at ${W}`);
      } else {
        for (const t of [c.team[k].toUpperCase(), c.systems[k].toUpperCase()]) {
          const lines = wrapAt(t, 9, w * 0.78, EM.upper);
          assert.ok(lines && lines.length <= 2, `${k} title "${t}" at ${W}`);
        }
        const sc = wrapAt(c.scanned[k], 10.5, w);
        assert.ok(sc && sc.length <= 2, `${k} scanned at ${W}`);
        const m = wrapAt(c.memory[k], 9, w);
        assert.ok(m && m.length <= 2, `${k} memory at ${W}`);
      }
      // compare legend: two items, each fits the legend row on its own line
      const maxW = L.grid.w + L.depthX - 12;
      for (const s of [c.teamLegend[k], c.systemsLegend[k], c.below[k], c.liquid[k]]) assert.ok(fitsAt(s, L.narrow ? 10 : 11, maxW, 0.56), `${k} legend "${s}" at ${W}`);
    }
  }
});

test("coverage: six named sector clusters — each analyst's bonds sit in their sector's cluster; names fit at every width", () => {
  assert.equal(CC.coverage.sectors.length, ANALYSTS);
  assert.deepEqual(CC.coverage.sectors.map((s) => s.long.en), [
    "Financials", "Technology & communications", "Consumer (discr. & staples)", "Utilities & infrastructure", "Energy", "Industrials",
  ]);
  for (const s of CC.coverage.sectors) {
    for (const k of ["long", "short", "abbr"] as const) assert.ok(s[k].en.trim() && s[k].fr.trim());
    assert.ok(s.abbr.en.length <= 6 && s.abbr.fr.length <= 8, `abbreviation too long: ${s.abbr.en} / ${s.abbr.fr}`);
  }
  assert.equal(sectorStart(0), 0);
  assert.equal(sectorStart(ANALYSTS), UNIVERSE);
  for (let i = 0; i < UNIVERSE; i++) assert.ok(i >= sectorStart(sectorOf(i)) && i < sectorStart(sectorOf(i) + 1));
  const u = universe(0);
  const team = teamCoverage(u);
  const longest = Math.max(...CC.coverage.sectors.flatMap((s) => [s.abbr.en.length, s.abbr.fr.length]));
  for (const [W, H] of COV_SIZES) {
    const L = coverageLayout(W, H);
    const bands = sectorLabelBoxes(L);
    for (let i = 0; i < UNIVERSE; i++) {
      const c = cellOf(i, L), b = bands[sectorOf(i)];
      assert.ok(c.x > b.x && c.x < b.x + b.w, `bond ${i} outside its sector at ${W}`);
    }
    for (let s = 1; s < ANALYSTS; s++) assert.ok(bands[s].x - (bands[s - 1].x + bands[s - 1].w) >= L.cell * 0.8, `gap ${s} at ${W}`);
    const perChar = sectorFont(L) === 10 ? 5.6 : 4.8;
    for (const [s, b] of bands.entries()) {
      inside(b, W, H, `sector ${s} ${W}`);
      assert.ok(b.y >= L.titleY + 7, `sector label under the title row at ${W}`);
      assert.ok(b.y + b.h <= L.grid.y, `sector label above the grid at ${W}`);
      assert.ok(b.w + 4 >= longest * perChar, `sector ${s} cluster too narrow at ${W}: ${b.w}`);
    }
    // the team's 180 lit bonds sit in their analysts' clusters
    team.forEach((list, a) => { for (const i of list) { const c = cellOf(i, L); assert.ok(c.x > bands[a].x && c.x < bands[a].x + bands[a].w); } });
    // the portfolio manager and the six analysts sit inside the team card, under its title, apart from each other
    const T = L.team, pm = pmPos(L);
    const inCard = (q: { x: number; y: number }, r: number) => q.x - r >= T.x && q.x + r <= T.x + T.w && q.y - r >= T.y + (L.narrow ? CARD_ROWS.narrow.team.title2 + 6 : CARD_ROWS.wide.team.title2 + 6) && q.y + r <= T.y + T.h;
    assert.ok(inCard(pm, L.narrow ? 6.5 : 9), `pm at ${W}`);
    const nodes = Array.from({ length: ANALYSTS }, (_, a) => analystPos(L, a));
    nodes.forEach((q, a) => assert.ok(inCard(q, 4), `analyst ${a} at ${W}`));
    for (let a = 0; a < ANALYSTS; a++) for (let b2 = a + 1; b2 < ANALYSTS; b2++) assert.ok(Math.hypot(nodes[a].x - nodes[b2].x, nodes[a].y - nodes[b2].y) >= (L.narrow ? 9 : 14), `analysts ${a}/${b2} at ${W}`);
    if (L.narrow) assert.ok(nodes[0].x - 4 > pm.x + 6.5, `pm clear of the analysts at ${W}`);
    else assert.ok(analystSlot(L) - 16 >= longest * 5.6, `analyst names at ${W}`);
  }
});

test("coverage: texts and shapes never overlap (methods, VS badge, title row, grid and history sheets, legend, watermark)", () => {
  for (const [W, H] of COV_SIZES) {
    const boxes = Object.entries(coverageLabelBoxes(W, H));
    for (const [k, b] of boxes) inside(b, W, H, `${k} ${W}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [ka, a] = boxes[i], [kb, b] = boxes[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!overlap, `${ka} overlaps ${kb} at ${W}×${H}: ${JSON.stringify(a)} ${JSON.stringify(b)}`);
    }
  }
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
  assert.deepEqual(CONCEPTS.map((c) => c.anchor), ["overlay", "futures", "ultra-micro-analysis"]);
  assert.deepEqual(CONCEPTS.find((c) => c.id === "coverage")!.aliases, ["coverage"], "the old #coverage anchor still lands on the concept");
  for (const c of CONCEPTS) { assert.equal(c.copy.steps.length, 4); assert.ok(c.copy.alt.en.startsWith("Animated illustration")); }
  assert.equal(CC.watermark.en, "ILLUSTRATION · generated values");
  assert.equal(CC.watermark.fr, "ILLUSTRATION · valeurs générées");
});

test("copy: the overlay caption ends with the verbatim futures-exposure disclosure; futures say losses can exceed the deposit", () => {
  assert.ok(CC.overlay.caption.en.endsWith(OVERLAY_EXPOSURE.en));
  assert.ok(CC.overlay.caption.fr.endsWith(OVERLAY_EXPOSURE.fr));
  assert.equal(OVERLAY_EXPOSURE.en, "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.");
  assert.match(CC.overlay.caption.en, /generated values, not actual positions or results/);
  assert.match(CC.overlay.caption.en, /Protective overlays are designed to offset part of losses; they may not do so and can lose money\./);
  assert.match(CC.overlay.caption.fr, /Les superpositions protectrices sont conçues pour compenser une partie des pertes; elles peuvent ne pas y parvenir/);
  assert.match(CC.overlay.caption.en, /Illustration of the overlay strategy’s sensitivity to volatility \(vega\); it may not behave this way\./);
  assert.match(CC.overlay.caption.fr, /sensibilité de la stratégie de superposition à la volatilité \(vega\); elle pourrait ne pas se comporter ainsi\./);
  assert.match(CC.overlay.canvas.volNote.en, /historically tended to/);
  assert.match(CC.overlay.canvas.loss.en, /^Overlay losses add up too$/);
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

test("copy: concept 1 is \"protective overlays\" (Gabriel 2026-10-03), always with the qualifier next to the name", () => {
  assert.equal(CC.overlay.eyebrow.en, "Concept 1 · Protective overlays");
  assert.equal(CC.overlay.eyebrow.fr, "Concept 1 · Superpositions protectrices");
  assert.equal(`${CC.overlay.title.en} ${CC.overlay.accent.en}`, "What is a protective overlay?");
  assert.equal(`${CC.overlay.title.fr} ${CC.overlay.accent.fr}`, "Qu’est-ce qu’une superposition protectrice?");
  // the lead under the heading and the caption under the panel both carry "designed to offset part of … losses; may not"
  assert.match(CC.overlay.lead.en, /designed to offset part of bond losses; they may not do so\.$/);
  assert.match(CC.overlay.lead.fr, /conçus pour compenser une partie des pertes obligataires; ils peuvent ne pas y parvenir\.$/);
  for (const k of ["en", "fr"] as const) {
    assert.match(CC.overlay.caption[k], /(designed to offset part of losses; they may not|conçues pour compenser une partie des pertes; elles peuvent ne pas)/);
    assert.match(CC.overlay.alt[k], /(designed to offset part of losses \(it may not\)|conçue pour compenser une partie des pertes \(elle peut ne pas y parvenir\))/);
  }
  // "protective" never stands as a promise: no "protects", "protection" or "protège" on the page
  for (const s of leaves(CC)) assert.ok(!/\bprotects?\b|\bprotection\b|protège/i.test(s), `promise wording: ${s}`);
});

test("copy: concept 3 is named \"Ultra-micro analysis, at scale\" (Gabriel's phrase), heading \"Why machines see more\"", () => {
  assert.equal(CC.coverage.eyebrow.en, "Concept 3 · Ultra-micro analysis, at scale");
  assert.equal(CC.coverage.eyebrow.fr, "Concept 3 · Analyse ultra-micro, à grande échelle");
  assert.equal(`${CC.coverage.title.en} ${CC.coverage.accent.en}`, "Why machines see more");
  for (const s of leaves(CC)) assert.ok(!/coverage at scale|suivi à grande échelle/i.test(s), `old name: ${s}`);
});

test("copy: the coverage figures are Gabriel's illustrative estimates and match the model", () => {
  const v = CC.coverage.stats.map((s) => s.value.en);
  assert.deepEqual(v, ["≈30", "≈180", "≈2,000", "≥ $200 MM"]);
  assert.deepEqual(CC.coverage.stats.map((s) => s.value.fr), ["≈ 30", "≈ 180", "≈ 2 000", "≥ 200 M$"]);
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
    // +10 (2026-10-03): the protective-overlay qualifier in the concept 1 lead
    assert.ok(n <= (lang === "en" ? 140 : 170), `${lang}: ${n} words`);
  }
});

/* ------------------------------------------------------------------ wiring */

test("nav and footer link the page as \"Core concepts\"; route and labels exist in both languages; the old URL redirects", () => {
  assert.match(read("src/components/site/links.ts"), /\{ href: "\/core-concepts", key: "nav\.concepts" \}/);
  assert.match(read("src/components/site/Footer.tsx"), /href="\/core-concepts"/);
  assert.match(read("src/lib/i18n/en.ts"), /"nav\.concepts": "Core concepts"/);
  assert.match(read("src/lib/i18n/fr.ts"), /"nav\.concepts": "Concepts de base"/);
  const page = read("src/app/(site)/core-concepts/page.tsx");
  assert.match(page, /canonical: "\/core-concepts"/);
  assert.match(page, /generateMetadata/);
  assert.equal(CC.meta.title.en, "Core concepts");
  assert.equal(CC.meta.title.fr, "Concepts de base");
  assert.equal(CC.hero.eyebrow.en, "Core concepts");
  assert.equal(CC.hero.eyebrow.fr, "Concepts de base");
  for (const s of leaves(CC)) assert.ok(!/critical concepts|concepts clés/i.test(s), `old name: ${s}`);
  // /critical-concepts is a permanent redirect (next.config.ts legacy list → permanent: true)
  assert.match(read("next.config.ts"), /\["\/critical-concepts", "\/core-concepts"\]/);
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
