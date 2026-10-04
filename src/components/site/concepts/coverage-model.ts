/**
 * coverage-model.ts — pure model of the "ultra-micro analysis, at scale" animation (/critical-concepts). About 2,000
 * dots stand for the bonds of the Canadian investment-grade index, grouped in six sector clusters; a fundamental team
 * (one portfolio manager, six sector analysts — financials, technology & communications, consumer, utilities & infrastructure,
 * energy, industrials — each covering about 30 securities a year in depth) lights 180 of them; a systematic scan then
 * reviews every liquid bond (at least $200 MM outstanding) and keeps the whole history in memory.
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
/** Steps: universe · one team · systematic scan · memory across history. */
export const COVERAGE_STEP_MS = [3200, 6400, 4600, 5600] as const;

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

/** Grid shape for a canvas width: wide 40 rows, narrow 50 rows; `cols` is the width in cells, sector gaps included. */
export function gridShape(W: number): { cols: number; rows: number } {
  const rows = W < 700 ? 50 : 40;
  return { cols: sectorBlocks(rows).width, rows };
}

export interface Rect { x: number; y: number; w: number; h: number }

/** Boxes of the texts drawn around the grid (team line or panel, grid title, legend, watermark): unit-tested apart. */
export function coverageLabelBoxes(W: number, H: number): Record<string, Rect> {
  const L = coverageLayout(W, H);
  const boxes: Record<string, Rect> = {
    title: { x: L.grid.x, y: L.titleY - 7, w: L.grid.w, h: 14 },
    grid: { x: L.grid.x - 6, y: L.grid.y - L.depthY - 6, w: L.grid.w + L.depthX + 12, h: L.grid.h + L.depthY + 12 },
    legend: { x: L.grid.x, y: L.legendY - 7, w: L.grid.w, h: 14 },
    watermark: { x: L.pad, y: H - 20, w: Math.min(W - 2 * L.pad, 190), h: 14 },
  };
  if (L.narrow) boxes.team = { x: L.team.x, y: L.team.y, w: L.team.w, h: L.team.h };
  return boxes;
}

/** Layout: team panel on the left (a row on top on narrow screens), the dot grid beside (below). */
export function coverageLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 14 : 24;
  const foot = 26;
  const { cols, rows } = gridShape(W);
  let team: Rect, area: Rect;
  if (!narrow) {
    const tw = Math.round(Math.max(170, Math.min(250, W * 0.22)));
    team = { x: pad, y: 18, w: tw, h: H - foot - 18 - 8 };
    area = { x: pad + tw + 28, y: 14, w: W - pad - (pad + tw + 28), h: H - foot - 14 - 28 };
  } else {
    team = { x: pad, y: 12, w: W - 2 * pad, h: 92 };
    area = { x: pad, y: 12 + 92 + 12, w: W - 2 * pad, h: H - foot - (12 + 92 + 12) - 28 };
  }
  // the grid title row is anchored to the top of the grid area; the grid (and its history sheets) start below it
  const titleY = area.y + 4;
  // narrow: an extra row for the sector names above the grid (wide: they sit in the history sheets' room)
  const top = narrow ? 30 : 18;
  const gArea: Rect = { x: area.x, y: area.y + top, w: area.w, h: area.h - top };
  // room to the right of (and above) the grid for the history layers of the memory step: sheets stacked in depth
  const depthX = narrow ? 22 : 96, depthY = narrow ? 10 : 30;
  const cell = Math.max(3, Math.min((gArea.w - depthX) / cols, (gArea.h - depthY) / rows));
  const gw = cell * cols, gh = cell * rows;
  const grid: Rect = { x: gArea.x + (gArea.w - depthX - gw) / 2, y: gArea.y + depthY + (gArea.h - depthY - gh) / 2, w: gw, h: gh };
  // filter legend under the grid, never in the watermark row
  const legendY = Math.min(grid.y + gh + 15, H - foot - 12);
  return { narrow, pad, foot, team, area, grid, cell, cols, rows, depthX, depthY, titleY, legendY };
}

/** Cell centre of universe position i: column-major inside its sector's cluster. */
export function cellOf(i: number, g: { grid: Rect; cell: number; rows: number }): { x: number; y: number } {
  const s = sectorOf(i), j = i - sectorStart(s);
  const c = sectorBlocks(g.rows).start[s] + Math.floor(j / g.rows), r = j % g.rows;
  return { x: g.grid.x + (c + 0.5) * g.cell, y: g.grid.y + (r + 0.5) * g.cell };
}

/** Sector name boxes above each cluster (centre x, width of the cluster), on the row just above the grid. */
export function sectorLabelBoxes(g: { grid: Rect; cell: number; rows: number }): Rect[] {
  const B = sectorBlocks(g.rows);
  return B.start.map((c, s) => ({ x: g.grid.x + c * g.cell, y: g.grid.y - 16, w: B.cols[s] * g.cell, h: 13 }));
}

/** Position of analyst a's node in the team panel (a row on narrow screens, a column on wide ones). */
export function analystPos(L: { narrow: boolean; team: Rect }, a: number): { x: number; y: number } {
  const T = L.team;
  if (L.narrow) {
    const x0 = T.x + 44, w = T.w - 44;
    return { x: x0 + (w / ANALYSTS) * (a + 0.5), y: T.y + 40 };
  }
  const top = T.y + 92, gap = Math.min(30, (T.h * 0.42) / ANALYSTS);
  return { x: T.x + 20, y: top + a * gap };
}

/** Narrow screens: the slot width of each analyst's short sector label under its node. */
export const analystSlot = (L: { team: Rect }): number => (L.team.w - 44) / ANALYSTS;
