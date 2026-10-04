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
  DAYS, DAY_MS, FUTURES_STEP_MS, HIGH_VOL_FROM, HIGH_VOL_TO, LOOP_MS, MARGIN_K, READ_MS_PER_WORD, RULE_FULL_MS, SETTLE_SHARE, futuresLayout,
  futuresLoop, intraday, marginFor, marketU, ruleAlpha, settledThrough, sigmaOf, unsettled,
} from "../../../src/components/site/concepts/futures-model.ts";
import {
  ANALYSTS, COVERAGE_STEP_MS, LIQUID_MIN_MM, PER_ANALYST, TEAM_RANGE, UNIVERSE, analystPos, analystSlot, cellOf, coverageLabelBoxes, coverageLayout,
  gridFit, pmPos, sectorBlocks, sectorFont, sectorLabelBoxes, sectorOf, sectorStart, teamCoverage, universe,
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

test("futures: slow enough to read (Gabriel 2026-10-03) — ≥ 3 s a day (5 s), a settlement pause, each message held long enough to read twice", () => {
  assert.ok(DAY_MS >= 3000, `${DAY_MS} ms a day`);
  // the settlement pause: the price holds at the last close for ≥ 1 s while the cash moves, then trades smoothly to the close
  assert.ok(SETTLE_SHARE * DAY_MS >= 1000);
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
  // long enough to read the longest message (EN or FR) twice at ≈ 300 words a minute
  const words = (x: string) => x.trim().split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
  for (const k of ["en", "fr"] as const) {
    const longest = Math.max(...[CC.futures.canvas.upPays[k], CC.futures.canvas.downPays[k]].map((r) => words(`${CC.futures.canvas.closeDay[k].replace("{n}", "12")} ${r}`)));
    assert.ok(RULE_FULL_MS >= 2 * longest * READ_MS_PER_WORD, `${k}: ${longest} words, ${RULE_FULL_MS} ms`);
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

/** coverage canvas sizes: the CSS gives 480–560 px wide, 760 px under 760 px viewports (narrow layout under 700 px) */
const COV_SIZES: [number, number][] = [[300, 760], [320, 760], [328, 760], [360, 760], [412, 760], [500, 760], [699, 760], [700, 480], [740, 760], [900, 480], [1150, 506], [1360, 560]];

test("coverage: a VS comparison — two sides (side by side, stacked under 700 px) with the VS badge between, same grid on each side", () => {
  for (const [W, H] of COV_SIZES) {
    const L = coverageLayout(W, H);
    const { left: A, right: B, vs } = L;
    inside(A.panel, W, H, `left ${W}`);
    inside(B.panel, W, H, `right ${W}`);
    if (!L.narrow) {
      assert.ok(A.panel.x + A.panel.w + 2 * vs.r + 12 <= B.panel.x, `gutter ${W}`);
      assert.ok(vs.x - vs.r > A.panel.x + A.panel.w && vs.x + vs.r < B.panel.x, `badge in the gutter ${W}`);
      assert.ok(vs.y > A.panel.y && vs.y < A.panel.y + A.panel.h);
      assert.equal(A.panel.y, B.panel.y);
    } else {
      assert.ok(A.panel.y + A.panel.h + 2 * vs.r + 4 <= B.panel.y, `gap ${W}`);
      assert.ok(vs.y - vs.r > A.panel.y + A.panel.h && vs.y + vs.r < B.panel.y, `badge between ${W}`);
    }
    // the same universe, the same grid, on both sides (a fair comparison)
    assert.equal(A.rows, B.rows);
    assert.ok(Math.abs(A.cell - B.cell) < 1e-9 && Math.abs(A.grid.w - B.grid.w) < 1e-9 && Math.abs(A.grid.h - B.grid.h) < 1e-9);
    for (const [k, S] of [["left", A], ["right", B]] as const) {
      const box = (r: { x: number; y: number; w: number; h: number }) => r.x >= S.panel.x - 0.01 && r.y >= S.panel.y - 0.01 && r.x + r.w <= S.panel.x + S.panel.w + 0.01 && r.y + r.h <= S.panel.y + S.panel.h + 0.01;
      assert.ok(S.cell >= 3, `${k} cell ${W}: ${S.cell}`);
      assert.equal(S.cols, sectorBlocks(S.rows).width);
      assert.ok(sectorBlocks(S.rows).cols.reduce((a, c) => a + c, 0) * S.rows >= UNIVERSE);
      for (const [n, r] of [["crew", S.crew], ["grid", S.grid], ["result", S.result]] as const) assert.ok(box(r), `${k} ${n} outside its panel at ${W}×${H}: ${JSON.stringify(r)}`);
      // history sheets (right side's memory step) stay inside the panel
      assert.ok(box({ x: S.grid.x - 6, y: S.grid.y - S.depthY - 6, w: S.grid.w + S.depthX + 12, h: S.grid.h + S.depthY + 12 }), `${k} sheets ${W}`);
      assert.ok(S.crew.y + S.crew.h <= S.grid.y - S.depthY - 6 + 0.01 && S.grid.y + S.grid.h <= S.result.y);
      const seen = new Set<string>();
      for (let i = 0; i < UNIVERSE; i++) {
        const c = cellOf(i, S);
        assert.ok(c.x > S.grid.x && c.x < S.grid.x + S.grid.w && c.y > S.grid.y && c.y < S.grid.y + S.grid.h);
        seen.add(`${c.x.toFixed(2)},${c.y.toFixed(2)}`);
      }
      assert.equal(seen.size, UNIVERSE);
    }
  }
  // gridFit picks the rows that give the largest cells
  const f = gridFit(400, 260);
  for (let rows = 16; rows <= 64; rows++) assert.ok(Math.min(400 / sectorBlocks(rows).width, 260 / rows) <= f.cell + 1e-9);
  assert.equal(COVERAGE_STEP_MS.length, 4);
});

test("coverage: steps read as a comparison — universe, conventional team, our systems, side by side", () => {
  assert.deepEqual(CC.coverage.steps.map((s) => s.en), ["The universe", "Conventional team", "Our systems", "Side by side"]);
  assert.deepEqual(CC.coverage.steps.map((s) => s.fr), ["L’univers", "Équipe conventionnelle", "Nos systèmes", "Côte à côte"]);
  assert.equal(CC.coverage.canvas.team.en, "Conventional fundamental team");
  assert.equal(CC.coverage.canvas.systems.en, "Our systems");
  assert.equal(CC.coverage.canvas.vs.en, "VS");
  assert.match(CC.coverage.alt.en, /side-by-side comparison/);
  assert.match(CC.coverage.lead.en, /^A conventional team/);
  // no more "one team: 150–180" as a step (Gabriel: confusing)
  for (const s of CC.coverage.steps) assert.ok(!/150|180/.test(s.en + s.fr));
  // each side keeps its moment: the team's year runs in step 2, the scan in step 3
  const starts = stepStarts(COVERAGE_STEP_MS);
  assert.equal(stepAt(starts[1] + 10, COVERAGE_STEP_MS).step, 1);
  assert.equal(stepAt(starts[2] + 10, COVERAGE_STEP_MS).step, 2);
  assert.ok(COVERAGE_STEP_MS[1] >= 6000 && COVERAGE_STEP_MS[2] >= 6000, "each side has time to be read");
});

test("coverage: six named sector clusters on each side — each analyst's bonds sit in their sector's cluster; names fit at every width", () => {
  assert.equal(CC.coverage.sectors.length, ANALYSTS);
  assert.deepEqual(CC.coverage.sectors.map((s) => s.long.en), [
    "Financials", "Technology & communications", "Consumer (discr. & staples)", "Utilities & infrastructure", "Energy", "Industrials",
  ]);
  for (const s of CC.coverage.sectors) {
    for (const k of ["long", "short", "abbr"] as const) assert.ok(s[k].en.trim() && s[k].fr.trim());
    assert.ok(s.abbr.en.length <= 6 && s.abbr.fr.length <= 8, `abbreviation too long: ${s.abbr.en} / ${s.abbr.fr}`);
  }
  // sectors are contiguous index ranges of about 333 bonds
  assert.equal(sectorStart(0), 0);
  assert.equal(sectorStart(ANALYSTS), UNIVERSE);
  for (let i = 0; i < UNIVERSE; i++) assert.ok(i >= sectorStart(sectorOf(i)) && i < sectorStart(sectorOf(i) + 1));
  const u = universe(0);
  const team = teamCoverage(u);
  const longest = Math.max(...CC.coverage.sectors.flatMap((s) => [s.abbr.en.length, s.abbr.fr.length]));
  for (const [W, H] of COV_SIZES) {
    const L = coverageLayout(W, H);
    for (const S of [L.left, L.right]) {
      const bands = sectorLabelBoxes(S);
      for (let i = 0; i < UNIVERSE; i++) {
        const c = cellOf(i, S), b = bands[sectorOf(i)];
        assert.ok(c.x > b.x && c.x < b.x + b.w, `bond ${i} outside its sector at ${W}`);
      }
      for (let s = 1; s < ANALYSTS; s++) assert.ok(bands[s].x - (bands[s - 1].x + bands[s - 1].w) >= S.cell * 0.8, `gap ${s} at ${W}`);
      // sector names: below the crew row, above the grid, wide enough for the abbreviation (≈5.6 px/char at 10 px, ≈4.8 at 9 px semibold)
      const perChar = sectorFont(S) === 10 ? 5.6 : 4.8;
      for (const [s, b] of bands.entries()) {
        inside(b, W, H, `sector ${s} ${W}`);
        assert.ok(b.y >= S.crew.y + S.crew.h, `sector label under the crew row at ${W}`);
        assert.ok(b.y + b.h <= S.grid.y, `sector label above the grid at ${W}`);
        assert.ok(b.w + 4 >= longest * perChar, `sector ${s} cluster too narrow at ${W}: ${b.w}`);
      }
    }
    // the left side's 180 lit bonds sit in their analysts' clusters
    const bands = sectorLabelBoxes(L.left);
    team.forEach((list, a) => { for (const i of list) { const c = cellOf(i, L.left); assert.ok(c.x > bands[a].x && c.x < bands[a].x + bands[a].w); } });
    // crew row: the portfolio manager then six analysts inside it, each slot wide enough for the abbreviation (9 px)
    const C = L.left.crew;
    const pm = pmPos(L.left);
    assert.ok(pm.x > C.x && pm.y > C.y && pm.y < C.y + C.h);
    for (let a = 0; a < ANALYSTS; a++) {
      const q = analystPos(L.left, a);
      assert.ok(q.x > pm.x + 10 && q.x < C.x + C.w && q.y > C.y && q.y + 15 + 6 < C.y + C.h - 7 + 6, `analyst ${a} at ${W}`);
    }
    assert.ok(analystSlot(L.left) - 4 >= longest * 4.8, `analyst slot ${analystSlot(L.left)} at ${W}`);
  }
});

test("coverage: texts and shapes never overlap (title, side titles, crew rows, grids and history sheets, results, VS badge, watermark)", () => {
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
