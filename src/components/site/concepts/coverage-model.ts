/**
 * coverage-model.ts — pure model of the "ultra-micro analysis, at scale" animation (/core-concepts), drawn as a
 * comparison (Gabriel 2026-10-03: "it's a VS"): two panels side by side (stacked on narrow screens) show the same
 * ≈2,000 dots of the Canadian investment-grade index, in six sector clusters. Left, a conventional fundamental team (one
 * portfolio manager, six sector analysts — financials, technology & communications, consumer, utilities & infrastructure,
 * energy, industrials — each covering about 30 securities a year in depth) lights 180 of them; right, our systems scan
 * every liquid bond (at least $200 MM outstanding) and keep the whole history in memory; a "VS" badge sits between.
 * The figures are Gabriel's illustrative estimates; the dots, sectors and amounts are generated. Dependency-free.
 */
import { hash01 } from "./timeline.ts";

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
/** Steps: the universe (both panels) · conventional team (left) · our systems: scan then memory (right) · side by side. */
export const COVERAGE_STEP_MS = [3600, 7000, 8000, 6000] as const;

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
export const SECTOR_GAP = 0.9;

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

/** One side of the comparison: its frame, title row, crew row (team or systems), dot grid with history room, result row. */
export interface Side {
  panel: Rect;
  inner: Rect;
  titleY: number;
  crew: Rect;
  grid: Rect;
  cell: number;
  rows: number;
  cols: number;
  depthX: number;
  depthY: number;
  result: Rect;
}

/** Height of the crew row: nodes, names under them, a third line (year progress / legend). */
export const CREW_H = 46;

function side(panel: Rect, narrow: boolean): Side {
  const ip = narrow ? 8 : 12;
  const inner: Rect = { x: panel.x + ip, y: panel.y + 8, w: panel.w - 2 * ip, h: panel.h - 16 };
  const titleY = inner.y + 7;
  const crew: Rect = { x: inner.x, y: inner.y + 18, w: inner.w, h: CREW_H };
  const resultH = narrow ? 34 : 38;
  // room right of / above the grid for the history sheets (memory step, right panel; the left grid sits identically)
  const depthX = Math.round(Math.max(14, Math.min(56, inner.w * 0.1))), depthY = narrow ? 14 : 22;
  const gTop = crew.y + crew.h + 8 + depthY;
  const gH = inner.y + inner.h - resultH - 8 - gTop;
  const fit = gridFit(inner.w - depthX, gH);
  const gw = fit.cell * fit.cols, gh = fit.cell * fit.rows;
  const grid: Rect = { x: inner.x + (inner.w - depthX - gw) / 2, y: gTop + (gH - gh) / 2, w: gw, h: gh };
  const result: Rect = { x: inner.x, y: grid.y + gh + 8, w: inner.w, h: resultH };
  return { panel, inner, titleY, crew, grid, cell: fit.cell, rows: fit.rows, cols: fit.cols, depthX, depthY, result };
}

/**
 * Layout: a title row across the canvas (universe · each dot), then the two sides — side by side with the VS badge in the
 * gutter (wide), or stacked with the badge between them (narrow, under 700 px) — and the watermark row.
 */
export function coverageLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 14 : 24;
  const foot = 26;
  const titleY = narrow ? 14 : 16;
  const top = titleY + 14;
  const bottom = H - foot - 4;
  let left: Rect, right: Rect, vs: { x: number; y: number; r: number };
  if (!narrow) {
    const gut = 64;
    const pw = (W - 2 * pad - gut) / 2;
    left = { x: pad, y: top, w: pw, h: bottom - top };
    right = { x: pad + pw + gut, y: top, w: pw, h: bottom - top };
    vs = { x: W / 2, y: 0, r: 22 };
  } else {
    const gut = 40;
    const ph = (bottom - top - gut) / 2;
    left = { x: pad, y: top, w: W - 2 * pad, h: ph };
    right = { x: pad, y: top + ph + gut, w: W - 2 * pad, h: ph };
    vs = { x: W / 2, y: top + ph + gut / 2, r: 17 };
  }
  const L = side(left, narrow), R = side(right, narrow);
  if (!narrow) vs.y = L.grid.y + L.grid.h / 2;
  return { narrow, pad, foot, titleY, left: L, right: R, vs };
}

/** Boxes of the texts and shapes around the grids (unit-tested apart: they never overlap). */
export function coverageLabelBoxes(W: number, H: number): Record<string, Rect> {
  const L = coverageLayout(W, H);
  const boxes: Record<string, Rect> = {
    title: { x: L.pad, y: L.titleY - 7, w: W - 2 * L.pad, h: 14 },
    vs: { x: L.vs.x - L.vs.r - 6, y: L.vs.y - L.vs.r - 6, w: 2 * L.vs.r + 12, h: 2 * L.vs.r + 12 },
    watermark: { x: L.pad, y: H - 20, w: Math.min(W - 2 * L.pad, 190), h: 14 },
  };
  for (const [k, S] of [["left", L.left], ["right", L.right]] as const) {
    boxes[`${k}Title`] = { x: S.inner.x, y: S.titleY - 7, w: S.inner.w, h: 14 };
    boxes[`${k}Crew`] = S.crew;
    // the grid and its history sheets (drawn 6 px around the grid, up to depthX right and depthY up)
    boxes[`${k}Grid`] = { x: S.grid.x - 6, y: S.grid.y - S.depthY - 6, w: S.grid.w + S.depthX + 12, h: S.grid.h + S.depthY + 12 };
    boxes[`${k}Result`] = S.result;
  }
  return boxes;
}

/** Cell centre of universe position i in a side's grid: column-major inside its sector's cluster. */
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

/** Left side: the portfolio manager's node at the start of the crew row. */
export const pmPos = (S: { crew: Rect }): { x: number; y: number } => ({ x: S.crew.x + 10, y: S.crew.y + 9 });

/** Left side: the slot width of each analyst in the crew row (after the portfolio manager). */
export const analystSlot = (S: { crew: Rect }): number => (S.crew.w - 28) / ANALYSTS;

/** Left side: analyst a's node in the crew row; the sector name sits under it (y + 15). */
export function analystPos(S: { crew: Rect }, a: number): { x: number; y: number } {
  return { x: S.crew.x + 28 + analystSlot(S) * (a + 0.5), y: S.crew.y + 9 };
}
