/**
 * coverage-model.ts — pure model of the "coverage at scale" animation (/critical-concepts). About 2,000 dots stand
 * for the bonds of the Canadian investment-grade index; a fundamental team (one portfolio manager, six sector analysts
 * each covering about 30 securities a year in depth) lights 180 of them; a systematic scan then reviews every liquid
 * bond (at least $200 MM outstanding) and keeps the whole history in memory.
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

/** Sector of universe position i: equal contiguous bands (drawn as vertical bands of the grid). */
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

/** Grid shape for a canvas width: wide 50 × 40, narrow 40 × 50 (always UNIVERSE cells), filled column by column. */
export function gridShape(W: number): { cols: number; rows: number } {
  return W < 700 ? { cols: 40, rows: 50 } : { cols: 50, rows: 40 };
}

export interface Rect { x: number; y: number; w: number; h: number }

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
    area = { x: pad + tw + 28, y: 30, w: W - pad - (pad + tw + 28), h: H - foot - 30 - 12 };
  } else {
    team = { x: pad, y: 12, w: W - 2 * pad, h: 78 };
    area = { x: pad, y: 12 + 78 + 16, w: W - 2 * pad, h: H - foot - (12 + 78 + 16) - 10 };
  }
  // room above / right of the grid for the history layers of the memory step
  const depth = narrow ? 14 : 26;
  const cell = Math.max(3, Math.min((area.w - depth) / cols, (area.h - depth) / rows));
  const gw = cell * cols, gh = cell * rows;
  const grid: Rect = { x: area.x + (area.w - depth - gw) / 2, y: area.y + depth + (area.h - depth - gh) / 2, w: gw, h: gh };
  return { narrow, pad, foot, team, area, grid, cell, cols, rows, depth };
}

/** Cell centre of universe position i in a grid (column-major, so sector bands are vertical). */
export function cellOf(i: number, g: { grid: Rect; cell: number; rows: number }): { x: number; y: number } {
  const c = Math.floor(i / g.rows), r = i % g.rows;
  return { x: g.grid.x + (c + 0.5) * g.cell, y: g.grid.y + (r + 0.5) * g.cell };
}
