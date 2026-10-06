/**
 * Home "diversifying engines" illustration: the generated stream is deterministic per seed and bounded, down
 * months (clear equity falls, below DOWN_CUT) and stress episodes behave as designed, traditional markets move together in down months
 * while every strategy keeps a low down-month correlation with equities, bonds and the other strategies (design
 * objective of the picture), correlation is computed on down months only, the layout fits every width, and the copy
 * is bilingual, short, labelled as an illustration and never states low correlation as a fact.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CORR_WINDOW, DOWN_CUT, ENGINES, LEVEL_BOUND, MARKETS, MAX_MOVE, NM, combinedMove, downsideCorrelation,
  heatColor, isStress, laneRows, level, lit, monthAt, monthCache, monthWidth, overlayLayout,
} from "../../../src/components/site/fx/overlay-model.ts";
import { OVERLAY_COPY, OVERLAY_EXPOSURE } from "../../../src/components/site/fx/overlay.copy.ts";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("months are deterministic for a seed and differ between seeds", () => {
  for (let n = -5; n < 400; n++) assert.deepEqual(monthAt(n, 3), monthAt(n, 3));
  let diff = 0;
  for (let n = 0; n < 200; n++) if (monthAt(n, 1).bond !== monthAt(n, 2).bond && monthAt(n, 1).equity !== monthAt(n, 2).equity) diff++;
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
      for (const v of [m.equity, m.bond, ...m.engines]) assert.ok(Number.isFinite(v) && Math.abs(v) <= MAX_MOVE);
      assert.equal(m.down, m.equity < DOWN_CUT, "down months: a clear fall in equities");
      if (m.stress) assert.ok(m.down, "a stress month is a down month");
      for (let s = -2; s <= ENGINES.length; s++) assert.ok(Math.abs(level(g, n, s)) <= LEVEL_BOUND + 1e-9);
    }
  }
});

test("stress episodes are short clusters; down months are a minority; equities fall deeper than bonds, bonds usually fall too", () => {
  const g = monthCache(0, 8192);
  let stress = 0, down = 0, run = 0, maxRun = 0, sumEq = 0, sumBd = 0, eqDown = 0, bdDown = 0, bdFalls = 0, eqStress = 0;
  const N = 6000;
  for (let n = 0; n < N; n++) {
    const m = g(n);
    if (isStress(n)) { stress++; run++; maxRun = Math.max(maxRun, run); eqStress += m.equity; } else run = 0;
    if (m.down) { down++; eqDown += m.equity; bdDown += m.bond; if (m.bond < 0) bdFalls++; }
    sumEq += m.equity; sumBd += m.bond;
  }
  assert.ok(stress / N > 0.05 && stress / N < 0.16, `${stress / N}`);
  // only clear equity falls are down months (about a quarter of months; tiny negatives are not shaded)
  assert.ok(down / N > 0.2 && down / N < 0.35, `${down / N}`);
  assert.ok(maxRun <= 3);
  assert.ok(Math.abs(sumEq / N) < 0.12 && Math.abs(sumBd / N) < 0.12, `${sumEq / N} ${sumBd / N}`);
  // in down months equities fall clearly deeper than bonds; bonds fall in most of them
  assert.ok(eqDown / down < 1.8 * (bdDown / down), `equity ${eqDown / down} vs bond ${bdDown / down}`);
  assert.ok(bdFalls / down > 0.7, `bonds fall in ${bdFalls / down} of down months`);
  assert.ok(eqStress / stress < -1.5, `stress months: equities ${eqStress / stress}`);
});

test("down months are clear equity falls: DOWN_CUT is about −0.5σ of the monthly equity move", () => {
  const g = monthCache(0, 40000);
  let s = 0, s2 = 0;
  const N = 30000;
  for (let n = 0; n < N; n++) { const e = g(n).equity; s += e; s2 += e * e; }
  const sd = Math.sqrt(s2 / N - (s / N) ** 2);
  assert.ok(DOWN_CUT / sd < -0.45 && DOWN_CUT / sd > -0.55, `${DOWN_CUT / sd}`);
});

test("down-month correlation: symmetric, unit diagonal, in [-1, 1]; order equities, bonds, engines", () => {
  const g = monthCache(0, 8192);
  for (let end = CORR_WINDOW; end < 4000; end += 37) {
    const c = downsideCorrelation(g, end);
    assert.equal(c.length, NM + ENGINES.length);
    for (let i = 0; i < c.length; i++) {
      assert.equal(c[i][i], 1);
      for (let j = 0; j < c.length; j++) { assert.ok(c[i][j] >= -1 && c[i][j] <= 1); assert.equal(c[i][j], c[j][i]); }
    }
  }
  assert.deepEqual(MARKETS.map((m) => m.key), ["equity", "bond"]);
  assert.equal(NM, 2);
});

/** |ρ| ceiling between strategies, and between the non-reacting strategies and the markets (design objective). */
const LOW = 0.25;
/** engine indexes (after NM) that react to stress: hedging and the protective overlay */
const REACTING = [3, 4];
/** pairs held to the LOW ceiling: strategy–strategy, and low volatility / directional / mean reversion vs markets */
const lowPair = (i: number, j: number) => j >= NM || !REACTING.includes(i - NM);

test("traditional markets move together in down months; strategies have low correlation with each other", () => {
  for (const seed of [0, 1, 7]) {
    const g = monthCache(seed, 20000);
    // long-run down-month correlation (≈ 3,000 clear down months): the design itself
    const full = downsideCorrelation(g, 12000, 12000);
    assert.ok(full[0][1] > 0.6, `seed ${seed}: equity–bond ${full[0][1]}`);
    for (let i = NM; i < full.length; i++) for (let j = 0; j < i; j++) {
      if (lowPair(i, j)) assert.ok(Math.abs(full[i][j]) < LOW, `seed ${seed}: |ρ(${i}, ${j})| = ${Math.abs(full[i][j])}`);
    }
    // what the heatmap shows (rolling CORR_WINDOW): equity–bond always clearly positive, strategies low on average
    let eb = 0, ebMin = 1, sumAbs = 0, cnt = 0, w = 0;
    for (let end = 300; end < 6000; end += 11) {
      const c = downsideCorrelation(g, end);
      eb += c[0][1]; ebMin = Math.min(ebMin, c[0][1]); w++;
      for (let i = NM; i < c.length; i++) for (let j = 0; j < i; j++) if (lowPair(i, j)) { sumAbs += Math.abs(c[i][j]); cnt++; }
    }
    assert.ok(eb / w > 0.6, `seed ${seed}: mean equity–bond ${eb / w}`);
    assert.ok(ebMin > 0.45, `seed ${seed}: min equity–bond ${ebMin}`);
    assert.ok(sumAbs / cnt < 0.12, `seed ${seed}: mean |strategy ρ| ${sumAbs / cnt}`);
  }
});

test("hedging and the protective overlay: designed to offset part of the falls (negative down-month ρ vs equities and bonds)", () => {
  for (const seed of [0, 1, 7]) {
    const full = downsideCorrelation(monthCache(seed, 20000), 12000, 12000);
    for (const e of REACTING) for (const mk of [0, 1]) {
      const r = full[NM + e][mk];
      assert.ok(r < -0.15 && r > -0.5, `seed ${seed}: ${ENGINES[e].key} vs ${MARKETS[mk].key} ${r}`);
    }
    // still low against the other strategies (and each other)
    for (const e of REACTING) for (let j = NM; j < full.length; j++) if (j !== NM + e) assert.ok(Math.abs(full[NM + e][j]) < LOW);
  }
});

test("the heatmap as shown (production seed 0, months 300–1500): no window shows a strong strategy correlation", () => {
  const g = monthCache(0, 4096);
  let max = 0;
  for (let end = 300; end <= 1500; end++) {
    const c = downsideCorrelation(g, end);
    for (let i = NM; i < c.length; i++) for (let j = 0; j < i; j++) if (lowPair(i, j)) max = Math.max(max, Math.abs(c[i][j]));
  }
  assert.ok(max < 0.4, `max |ρ| ${max}`);
});

test("down-month correlation only uses down months", () => {
  // a stream whose up months are perfectly correlated must not leak into the downside figure
  const fake = (n: number) => {
    const down = n % 2 === 0;
    const e = down ? [Math.sin(n), Math.cos(n * 1.7), Math.sin(n * 2.3), Math.cos(n * 3.1), Math.sin(n * 5.3)] : [n, n, n, n, n];
    return { n, equity: down ? -1 - (n % 7) / 10 : n, bond: down ? -1 - (n % 5) / 10 : n, engines: e, down, stress: false };
  };
  const c = downsideCorrelation(fake, 200, 120);
  for (let i = NM; i < c.length; i++) for (let j = NM; j < i; j++) assert.ok(Math.abs(c[i][j]) < 0.99);
});

test("lit engines: a strategy moving up in a down month for equities", () => {
  const g = monthCache(5);
  let litMoves = 0;
  for (let n = 0; n < 500; n++) {
    const m = g(n);
    for (let i = 0; i < ENGINES.length; i++) { assert.equal(lit(m, i), m.down && m.engines[i] > 0); if (lit(m, i)) litMoves++; }
    assert.ok(Math.abs(combinedMove(m)) <= MAX_MOVE);
  }
  assert.ok(litMoves > 100);
});

test("layout fits every width: two groups, rows and heatmap inside the canvas, never overlapping", () => {
  // phone heights: 760 (CSS under 760 px); desktop: clamp(460, 46vw, 600)
  // 700–760: the wide layout (narrow is W < 700) with the phone CSS height (max-width: 760px)
  for (const [W, H] of [[300, 760], [336, 760], [600, 760], [699, 760], [700, 460], [720, 760], [760, 760], [1024, 471], [1400, 600]]) {
    const L = overlayLayout(W, H);
    assert.ok(L.x0 > L.pad && L.x1 > L.x0 + 100 && L.x1 <= W - L.pad, `${W}`);
    assert.ok(L.trad.y >= 0 && L.lanes.y > L.trad.y + L.trad.h && L.lanes.y + L.lanes.h <= H - L.foot, `${W}`);
    assert.ok(L.heat.x >= 0 && L.heat.x + L.heat.w <= W && L.heat.y + L.heat.h <= H - L.foot && L.heat.h > 180, `${W}: heat ${L.heat.h}`);
    if (L.narrow) assert.ok(L.heat.y > L.lanes.y + L.lanes.h); else assert.ok(L.heat.x > L.x1);
    assert.ok(monthWidth(L.x1 - L.x0) >= 7);
    // rows: equities above bonds, all under the traditional-markets header; strategies, then the blended line
    const R = laneRows(L);
    const rows = [...R.markets, ...R.engines, R.combined];
    for (let k = 1; k < rows.length; k++) assert.ok(rows[k].y - rows[k].h / 2 >= rows[k - 1].y + rows[k - 1].h / 2 - 1e-6, `${W}: row ${k}`);
    assert.ok(R.markets[0].y - R.markets[0].h / 2 >= L.trad.y + L.head - 1e-6);
    assert.ok(R.markets[1].y + R.markets[1].h / 2 <= L.trad.y + L.trad.h + 1e-6);
    assert.ok(R.engines[0].y - R.engines[0].h / 2 >= L.lanes.y + L.head - 1e-6);
    assert.ok(R.combined.y + R.combined.h / 2 <= L.lanes.y + L.lanes.h + 1e-6);
    // readable: a two-line label (≈ 26 px) fits every market row, a one-line label every strategy row
    assert.ok(R.markets[0].h >= 30 && R.engines[0].h >= 24, `${W}: market ${R.markets[0].h}, strategy ${R.engines[0].h}`);
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
  MARKETS.forEach((m, i) => { walk(m.label, `MARKETS[${i}].label`); walk(m.short, `MARKETS[${i}].short`); });
  const words = (s: string) => s.trim().split(/\s+/).length;
  for (const [p, v] of all) {
    assert.ok(v.en.trim() && v.fr.trim(), p);
    if (p.endsWith(".alt")) continue; // accessible name, not shown
    if (p.endsWith(".lead")) { for (const lang of ["en", "fr"] as const) assert.ok(words(v[lang]) <= 18, `${p} (${lang})`); continue; } // one sentence
    // every visible sentence is 12 words or fewer
    // every visible sentence is 12 words or fewer (the verbatim regulatory disclosure excepted)
    for (const lang of ["en", "fr"] as const) for (const s of v[lang].split(/(?<=\.)\s+/)) if (s !== OVERLAY_EXPOSURE[lang]) assert.ok(words(s) <= 12, `${p} (${lang}): ${s}`);
  }
  assert.equal(OVERLAY_COPY.watermark.en, "ILLUSTRATION · generated values");
  assert.equal(OVERLAY_COPY.watermark.fr, "ILLUSTRATION · valeurs générées");
  // Gabriel 2026-10-04: the simulated counters confused investors; removed (no copy refers to them)
  assert.equal("counters" in OVERLAY_COPY, false);
  assert.doesNotMatch(all.map(([, v]) => `${v.en} ${v.fr}`).join(" "), /Simulated|simulés|counter|compteur/i);
  // "generated" on the market group header itself: a crop of the top of the canvas never reads as real market data
  assert.match(OVERLAY_COPY.canvas.trad.en, /^Traditional markets · generated$/);
  assert.match(OVERLAY_COPY.canvas.trad.fr, /^Marchés traditionnels · générés$/);
  assert.match(OVERLAY_COPY.alt.en, /designed to have low down-month correlation/);
  assert.match(OVERLAY_COPY.alt.en, /drawn moving independently/);
  assert.match(OVERLAY_COPY.alt.en, /heatmap/);
  assert.match(OVERLAY_COPY.alt.fr, /conçues pour une faible corrélation/);
  assert.match(OVERLAY_COPY.alt.fr, /carte de chaleur/);
  assert.equal(OVERLAY_COPY.canvas.strategies.en, "Our strategies");
  assert.match(OVERLAY_COPY.caption.en, /Market lines are not an index/);
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
  const approach = readFileSync(resolve(import.meta.dirname, "../../../src/components/site/pages/approach.copy.ts"), "utf8");
  const fund = readFileSync(resolve(import.meta.dirname, "../../../src/components/fund/fund.copy.ts"), "utf8");
  for (const src of [approach, fund]) { assert.ok(src.includes(OVERLAY_EXPOSURE.en)); assert.ok(src.includes(OVERLAY_EXPOSURE.fr)); }
  // never stated as a fact
  const text = all.map(([, v]) => `${v.en} ${v.fr}`).join(" ");
  assert.doesNotMatch(text, /\buncorrelated\b|non corrél|décorrél|\bguaranteed\b|\bprotects?\b|\bprotège/i);
  // the lead: one sentence; key phrases only
  for (const k of ["designed to have low correlation in down months", "traditional markets", "each other"]) assert.ok(OVERLAY_COPY.lead.en.includes(k), k);
  for (const k of ["conçues pour une faible corrélation en mois de baisse", "marchés traditionnels", "entre elles"]) assert.ok(OVERLAY_COPY.lead.fr.includes(k), k);
  for (const lang of ["en", "fr"] as const) assert.equal(OVERLAY_COPY.lead[lang].split(/(?<=\.)\s+/).length, 1, lang);
  assert.match(OVERLAY_COPY.canvas.heat.en, /concept/i);
});

test("lanes: the Multi-Strategy Fund's four strategies as named on /approach, plus the overlay on its own lane", () => {
  const approach = readFileSync(resolve(import.meta.dirname, "../../../src/components/site/pages/approach.copy.ts"), "utf8");
  const four = ENGINES.filter((e) => e.blend);
  assert.deepEqual(four.map((e) => e.label.en), ["Low volatility", "Directional", "Mean reversion", "Hedging"]);
  for (const e of four) assert.ok(approach.includes(`l("${e.label.en}", "${e.label.fr}")`), e.label.en);
  const rest = ENGINES.filter((e) => !e.blend);
  assert.deepEqual(rest.map((e) => e.key), ["overlay"]);
  // the overlay never enters the blended line
  const m = { n: 0, equity: -2, bond: -1, engines: [0, 0, 0, 0, 3], down: true, stress: true };
  assert.equal(combinedMove(m), 0);
});

test("zero drift: no lane, blend or market trends over time (nothing reads as performance)", () => {
  for (const seed of [0, 1, 7]) {
    const g = monthCache(seed, 40000);
    const N = 30000;
    let q = 0, b = 0, c = 0;
    const e = new Array<number>(ENGINES.length).fill(0);
    for (let n = 0; n < N; n++) { const m = g(n); q += m.equity; b += m.bond; c += combinedMove(m); m.engines.forEach((v, i) => (e[i] += v)); }
    assert.ok(Math.abs(q / N) < 0.02, `equity ${q / N}`);
    assert.ok(Math.abs(b / N) < 0.02, `bond ${b / N}`);
    assert.ok(Math.abs(c / N) < 0.02, `combined ${c / N}`);
    e.forEach((v, i) => assert.ok(Math.abs(v / N) < 0.02, `${ENGINES[i].key} ${v / N}`));
  }
});
