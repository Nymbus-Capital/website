/**
 * coverage-model.ts — pure model of the "ultra-micro analysis, at scale" animation (/core-concepts): one large shared
 * graphic (≈2,000 dots of the Canadian investment-grade index, in six sector clusters) shown as a two-act comparison
 * (Gabriel 2026-10-04: the earlier bigger shared graphic, "starts with conventional then turns to Nymbus systems").
 * Act 1, a conventional fundamental team (one portfolio manager, six sector analysts — financials, technology &
 * communications, consumer, utilities & infrastructure, energy, industrials — each covering about 30 securities a year in
 * depth) lights 180 of them; act 2, our systems scan every liquid bond (at least $200 MM outstanding) and keep the whole
 * history in memory; a last beat compares both. A methods column on the left (a strip on top on narrow screens) stacks
 * the two methods with a "VS" badge between them: the method on the graphic is highlighted, the other faded.
 * The figures are Gabriel's illustrative estimates; the dots, sectors and amounts are generated. Dependency-free.
 */
import { ease, hash01, span } from "./timeline.ts";

/** About 2,000 bonds in the Canadian investment-grade index (illustrative estimate). */
export const UNIVERSE = 2000;
/** Securities a very good analyst can cover in depth in a year (illustrative estimate). */
export const PER_ANALYST = 30;
/** Analysts in the illustrated team (5 to 6 in a typical fund team), one portfolio manager above them. */
export const ANALYSTS = 6;
export const TEAM_RANGE = [150, 180] as const;
/** Liquidity filter: only bonds with at least this amount outstanding are reviewed ($ millions). */
export const LIQUID_MIN_MM = 200;
/** History layers drawn behind the grid for the memory step. */
export const LAYERS = 6;
/** Steps: the universe · act 1, conventional team · act 2, our systems (scan, then memory) · compare. */
export const COVERAGE_STEP_MS = [3600, 7000, 8000, 6500] as const;

export interface Bond {
  i: number;
  /** generated sector band 0..ANALYSTS-1 (the band an analyst covers) */
  sector: number;
  /** generated amount outstanding, $ millions */
  outstanding: number;
  liquid: boolean;
}

/** Sector of universe position i: equal contiguous ranges (each drawn as its own cluster of columns). */
export const sectorOf = (i: number): number => Math.min(ANALYSTS - 1, Math.floor((i * ANALYSTS) / UNIVERSE));

/** The generated universe for `seed`: UNIVERSE bonds, deterministic. */
export function universe(seed = 0): Bond[] {
  return Array.from({ length: UNIVERSE }, (_, i) => {
    const u = hash01(i, 41, seed);
    // most issues are large; a minority sits under the liquidity filter
    const outstanding = Math.round(60 + 1400 * Math.pow(u, 1.6));
    return { i, sector: sectorOf(i), outstanding, liquid: outstanding >= LIQUID_MIN_MM };
  });
}

/**
 * Bonds the fundamental team covers in depth: for each analyst, PER_ANALYST liquid bonds of their own sector band,
 * in the order the analyst reaches them during the year. Returns [analyst][k] universe indexes.
 */
export function teamCoverage(bonds: Bond[], seed = 0): number[][] {
  return Array.from({ length: ANALYSTS }, (_, a) =>
    bonds
      .filter((b) => b.sector === a && b.liquid)
      .map((b) => ({ i: b.i, r: hash01(b.i, 77, seed) }))
      .sort((x, y) => x.r - y.r)
      .slice(0, PER_ANALYST)
      .map((x) => x.i),
  );
}

/** Gap between two sector clusters, in cells. */
const SECTOR_GAP = 0.9;

/** First universe index of sector s. */
export const sectorStart = (s: number): number => Math.ceil((s * UNIVERSE) / ANALYSTS);

/**
 * Sector clusters for `rows` rows: each sector fills its own block of columns (column by column), blocks separated by
 * SECTOR_GAP cells. Returns each block's first column (in cells, gaps included), its column count, and the total width.
 */
export function sectorBlocks(rows: number): { start: number[]; cols: number[]; width: number } {
  const start: number[] = [], cols: number[] = [];
  let x = 0;
  for (let s = 0; s < ANALYSTS; s++) {
    const size = sectorStart(s + 1) - sectorStart(s);
    start.push(x);
    cols.push(Math.ceil(size / rows));
    x += cols[s] + (s < ANALYSTS - 1 ? SECTOR_GAP : 0);
  }
  return { start, cols, width: x };
}

/** Rows that give the largest cells for a grid area of w × h (sector gaps included in the width). */
export function gridFit(w: number, h: number): { rows: number; cols: number; cell: number } {
  let best = { rows: 40, cols: sectorBlocks(40).width, cell: 0 };
  for (let rows = 16; rows <= 64; rows++) {
    const cols = sectorBlocks(rows).width;
    const cell = Math.min(w / cols, h / rows);
    if (cell > best.cell + 1e-9) best = { rows, cols, cell };
  }
  return best;
}

export interface Rect { x: number; y: number; w: number; h: number }

/**
 * Opacity of each method in the methods column, per step: [conventional team, our systems]. The universe step shows
 * both softly; each act highlights its method and fades the other (half strength); the compare step shows both fully.
 */
const FOCUS: readonly (readonly [number, number])[] = [[0.6, 0.6], [1, 0.5], [0.5, 1], [1, 1]];
/** Share of a step over which the column's focus eases to that step's. */
export const FOCUS_IN = 0.08;

/** Opacity of [team, systems] at progress p of `step`, eased from `from` (the opacities last drawn). */
export function focusFrom(from: readonly [number, number], step: number, p: number): [number, number] {
  const to = FOCUS[step], k = ease(span(p, 0, FOCUS_IN));
  return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
}

/**
 * A focus tracker for one scene: called once per drawn frame with (step, p); when the step changes (played through or
 * jumped to with the step buttons, or restarted) it eases from whatever was last drawn, so the column never jumps.
 */
export function focusTracker(): (step: number, p: number) => [number, number] {
  let step = -1, lastP = 0, from: readonly [number, number] = FOCUS[0], last: [number, number] = [FOCUS[0][0], FOCUS[0][1]];
  return (s, p) => {
    // a new step, or the same step restarted (time went back): ease from what is on screen
    if (s !== step || p < lastP - 1e-9) { from = last; step = s; }
    lastP = p;
    last = focusFrom(from, s, p);
    return last;
  };
}

/** Rows inside a method card (offsets from its top); the engine draws on them and the tests check they fit. */
export const CARD_ROWS = {
  wide: {
    team: { title: 14, title2: 28, pm: 50, analysts: [74, 90, 106], perYear: 128, bar: 138, result: 166, bottom: 184 },
    systems: { title: 14, title2: 28, scan: 50, bar: 66, scanned: 92, scanned2: 110, memory: 128, memory2: 142, bottom: 150 },
  },
  narrow: {
    team: { title: 13, title2: 26, crew: 45, result: 72, result2: 91, bottom: 100 },
    systems: { title: 13, title2: 26, crew: 45, result: 72, result2: 87, result3a: 64, result3b: 78, result3c: 92, bottom: 100 },
  },
} as const;

/**
 * Layout. Wide (≥ 700 px): the methods column on the left — the conventional team's card on top, the VS badge, our
 * systems' card below — and the large shared graphic beside it. Narrow: the same two cards side by side in a strip on
 * top with the badge between them, the graphic below. The graphic: a title row, the sector names, room above and right
 * of the grid for the history sheets (memory), the dot grid, a two-line legend, then the watermark row.
 */
export function coverageLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 14 : 24;
  const foot = 26;
  let team: Rect, systems: Rect, vs: { x: number; y: number; r: number }, area: Rect, column: Rect;
  if (!narrow) {
    const tw = Math.round(Math.max(196, Math.min(272, W * 0.23)));
    const top = 14, bottom = H - foot - 8;
    column = { x: pad, y: top, w: tw, h: bottom - top };
    const gap = 54;
    const ch = Math.min(CARD_ROWS.wide.team.bottom + 18, column.h - gap - CARD_ROWS.wide.systems.bottom - 8);
    // our systems' card is as tall as its rows (no empty space); the VS badge sits in the gap, the pair centred in the column
    const sh = CARD_ROWS.wide.systems.bottom + 8;
    const y0 = top + Math.max(0, (column.h - (ch + gap + sh)) / 2);
    team = { x: pad, y: y0, w: tw, h: ch };
    systems = { x: pad, y: y0 + ch + gap, w: tw, h: sh };
    vs = { x: pad + tw / 2, y: y0 + ch + gap / 2, r: 19 };
    area = { x: pad + tw + 32, y: 14, w: W - pad - (pad + tw + 32), h: H - foot - 14 - 6 };
  } else {
    const gut = 38, top = 12, ch = CARD_ROWS.narrow.team.bottom + 6;
    const cw = (W - 2 * pad - gut) / 2;
    team = { x: pad, y: top, w: cw, h: ch };
    systems = { x: pad + cw + gut, y: top, w: cw, h: ch };
    vs = { x: W / 2, y: top + ch / 2, r: 15 };
    column = { x: pad, y: top, w: W - 2 * pad, h: ch };
    const ay = top + ch + 14;
    area = { x: pad, y: ay, w: W - 2 * pad, h: H - foot - ay - 6 };
  }
  // graphic: title row, sector-name row (inside the history room on wide screens), history room, grid, legend (two lines)
  const titleY = area.y + 4;
  const legendH = 32;
  const top = narrow ? 30 : 18;
  const depthX = narrow ? 22 : Math.round(Math.max(40, Math.min(96, area.w * 0.1))), depthY = narrow ? 10 : 30;
  const gArea: Rect = { x: area.x, y: area.y + top, w: area.w, h: area.h - top - legendH };
  const fit = gridFit(gArea.w - depthX, gArea.h - depthY);
  const cell = fit.cell, rows = fit.rows, cols = fit.cols;
  const gw = cell * cols, gh = cell * rows;
  const grid: Rect = { x: gArea.x + (gArea.w - depthX - gw) / 2, y: gArea.y + depthY + (gArea.h - depthY - gh) / 2, w: gw, h: gh };
  const legendY = grid.y + gh + 15;
  return { narrow, pad, foot, column, team, systems, vs, area, grid, cell, cols, rows, depthX, depthY, titleY, legendY, legendH };
}

/** Boxes of the texts and shapes of the scene (unit-tested apart: they never overlap). */
export function coverageLabelBoxes(W: number, H: number): Record<string, Rect> {
  const L = coverageLayout(W, H);
  return {
    team: L.team,
    systems: L.systems,
    vs: { x: L.vs.x - L.vs.r - 4, y: L.vs.y - L.vs.r - 4, w: 2 * L.vs.r + 8, h: 2 * L.vs.r + 8 },
    title: { x: L.grid.x, y: L.titleY - 7, w: L.grid.w, h: 14 },
    // the grid and its history sheets (drawn 6 px around the grid, up to depthX right and depthY up)
    grid: { x: L.grid.x - 6, y: L.grid.y - L.depthY - 6, w: L.grid.w + L.depthX + 12, h: L.grid.h + L.depthY + 12 },
    legend: { x: L.grid.x, y: L.legendY - 7, w: L.grid.w + L.depthX, h: 28 },
    watermark: { x: L.pad, y: H - 20, w: Math.min(W - 2 * L.pad, 190), h: 14 },
  };
}

/** Cell centre of universe position i: column-major inside its sector's cluster. */
export function cellOf(i: number, g: { grid: Rect; cell: number; rows: number }): { x: number; y: number } {
  const s = sectorOf(i), j = i - sectorStart(s);
  const c = sectorBlocks(g.rows).start[s] + Math.floor(j / g.rows), r = j % g.rows;
  return { x: g.grid.x + (c + 0.5) * g.cell, y: g.grid.y + (r + 0.5) * g.cell };
}

/** Sector name boxes above each cluster (x and width of the cluster), on the row just above the grid. */
export function sectorLabelBoxes(g: { grid: Rect; cell: number; rows: number }): Rect[] {
  const B = sectorBlocks(g.rows);
  return B.start.map((c, s) => ({ x: g.grid.x + c * g.cell, y: g.grid.y - 16, w: B.cols[s] * g.cell, h: 13 }));
}

/** Font size of the sector names above the clusters: 10 px when the narrowest cluster has room, else 9 px. */
export const sectorFont = (g: { cell: number; rows: number }): number => (Math.min(...sectorBlocks(g.rows).cols) * g.cell >= 44 ? 10 : 9);

/** The portfolio manager's node in the team card (wide: its own row with the title; narrow: start of the crew row). */
export function pmPos(L: { narrow: boolean; team: Rect }): { x: number; y: number } {
  const T = L.team;
  return L.narrow ? { x: T.x + 16, y: T.y + CARD_ROWS.narrow.team.crew } : { x: T.x + 22, y: T.y + CARD_ROWS.wide.team.pm };
}

/** Width of one analyst's slot: wide, a column of the 2 × 3 analyst list; narrow, a dot of the crew row. */
export function analystSlot(L: { narrow: boolean; team: Rect }): number {
  return L.narrow ? (L.team.w - 34) / ANALYSTS : (L.team.w - 24) / 2;
}

/** Analyst a's node: wide, in a 2 × 3 list (dot, then the sector name to its right); narrow, a dot in the crew row. */
export function analystPos(L: { narrow: boolean; team: Rect }, a: number): { x: number; y: number } {
  const T = L.team;
  if (L.narrow) return { x: T.x + 30 + analystSlot(L) * (a + 0.5), y: T.y + CARD_ROWS.narrow.team.crew };
  const col = a % 2, row = Math.floor(a / 2);
  return { x: T.x + 18 + col * analystSlot(L), y: T.y + CARD_ROWS.wide.team.analysts[row] };
}
