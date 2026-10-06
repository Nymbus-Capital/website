/**
 * class-fit.ts — robust spread of one share class to its fund, for the cross-class check (class-returns.ts).
 *
 * r_c ≈ a_c + b⁺_c · max(m, 0) + b⁻_c · min(m, 0), m = the fund's common return: up and down months have their own slope
 * because a performance fee is charged in up months only. Pure, dependency-free (Node type stripping).
 */

/**
 * How one side (up: m > 0, down: m ≤ 0) of a fit is set: "fit" = its own Theil–Sen slope; "unit" = slope 1 (too few
 * months on that side, the other side's slope within `fitUnitSlopeTolerance` of 1); "uncheckable" = too few months and
 * the other side's slope is not ≈ 1, so the spread on that side cannot be confirmed (its months are withheld).
 */
export type SideKind = "fit" | "unit" | "uncheckable";

/** a class's spread to the fund; `fallback`: no fit (a = 0, slope 1) */
export interface ClassFit { a: number; bUp: number; bDown: number; n: number; fallback: boolean; up: SideKind; down: SideKind }

export interface FitCfg {
  fitMinMonths: number;
  fitSideMinMonths: number;
  fitUnitSlopeTolerance: number;
  fitSlopeMin: number;
  fitSlopeMax: number;
  fitInterceptMax: number;
  fitTolerance: number;
  fitToleranceRange: number;
  fitMaxRounds: number;
  fitDamping: number;
  fitDampingDecayRounds: number;
}

export type FitPoint = { m: number; r: number };

/** no fit: the class is expected to earn the fund's return (a = 0, slope 1 both sides) */
export const IDENTITY: ClassFit = { a: 0, bUp: 1, bDown: 1, n: 0, fallback: true, up: "unit", down: "unit" };

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const clip = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

/** Theil–Sen slope (median of the pairwise slopes; 1 without a pair of distinct m), clipped to [fitSlopeMin, fitSlopeMax] */
function theilSenSlope(pts: FitPoint[], cfg: FitCfg): number {
  const slopes: number[] = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const dm = pts[j].m - pts[i].m;
    if (Math.abs(dm) > 1e-9) slopes.push((pts[j].r - pts[i].r) / dm);
  }
  return clip(slopes.length ? median(slopes) : 1, cfg.fitSlopeMin, cfg.fitSlopeMax);
}

/** the side of the fit that applies at the fund's return `m` */
export function sideOf(f: ClassFit, m: number): SideKind {
  return m > 0 ? f.up : f.down;
}

/** expected return of a class at the fund's return `m` */
export function expectedReturn(f: ClassFit, m: number): number {
  return f.a + f.bUp * Math.max(m, 0) + f.bDown * Math.min(m, 0);
}

/** the fund's return at which a class's fit expects `r` (inverse of expectedReturn); null on an uncheckable side */
export function referenceOf(f: ClassFit, r: number): number | null {
  const x = r - f.a;
  const m = x > 0 ? x / f.bUp : x / f.bDown;
  return sideOf(f, m) === "uncheckable" ? null : m;
}

/**
 * Robust fit of one class: b⁺ by Theil–Sen over its up months, b⁻ over its down months, a = median residual (clipped to
 * ±fitInterceptMax) over the months of its checkable sides. A side with fewer than fitSideMinMonths months is "unit" or
 * "uncheckable" (SideKind), never a line pooled with the other side. Fewer than fitMinMonths months → `fallback`.
 * `fixed`: the side kinds decided on the class's full sample, kept as they are (leave-one-out fits).
 */
export function fitClass(pts: FitPoint[], cfg: FitCfg, fixed?: Pick<ClassFit, "up" | "down">): ClassFit {
  if (!fixed && pts.length < cfg.fitMinMonths) return { ...IDENTITY, n: pts.length };
  const up = pts.filter((p) => p.m > 0);
  const down = pts.filter((p) => p.m <= 0);
  const own = (kind: SideKind | undefined, n: number): boolean => (kind ? kind === "fit" : n >= cfg.fitSideMinMonths);
  const bUpFit = own(fixed?.up, up.length) ? theilSenSlope(up, cfg) : null;
  const bDownFit = own(fixed?.down, down.length) ? theilSenSlope(down, cfg) : null;
  const short = (other: number | null): SideKind => (other !== null && Math.abs(other - 1) <= cfg.fitUnitSlopeTolerance ? "unit" : "uncheckable");
  const upKind: SideKind = bUpFit !== null ? "fit" : fixed?.up ?? short(bDownFit);
  const downKind: SideKind = bDownFit !== null ? "fit" : fixed?.down ?? short(bUpFit);
  const bUp = bUpFit ?? 1;
  const bDown = bDownFit ?? 1;
  const usable = pts.filter((p) => (p.m > 0 ? upKind : downKind) !== "uncheckable");
  const a = usable.length ? clip(median(usable.map((p) => p.r - bUp * Math.max(p.m, 0) - bDown * Math.min(p.m, 0))), -cfg.fitInterceptMax, cfg.fitInterceptMax) : 0;
  return { a, bUp, bDown, n: pts.length, fallback: false, up: upKind, down: downKind };
}

/**
 * Pins the common return's level and scale (the fits only define them relative to each other): the median a of the fitted
 * classes → 0, the median own up slope → 1, the median own down slope → 1. Without it the fixed point drifts.
 */
export function normaliseFits(fits: Record<string, ClassFit>): Record<string, ClassFit> {
  const fitted = Object.values(fits).filter((f) => !f.fallback);
  if (!fitted.length) return fits;
  const a0 = median(fitted.map((f) => f.a));
  const ups = fitted.filter((f) => f.up === "fit").map((f) => f.bUp);
  const downs = fitted.filter((f) => f.down === "fit").map((f) => f.bDown);
  const sUp = ups.length ? median(ups) : 1;
  const sDown = downs.length ? median(downs) : 1;
  return Object.fromEntries(Object.entries(fits).map(([c, f]) => [c, f.fallback ? f : {
    ...f, a: f.a - a0, bUp: f.up === "fit" ? f.bUp / sUp : f.bUp, bDown: f.down === "fit" ? f.bDown / sDown : f.bDown,
  }]));
}

/** each round moves `damping` of the way from the previous fits to the new ones (a side kind change is taken whole) */
function blend(prev: Record<string, ClassFit>, next: Record<string, ClassFit>, damping: number): Record<string, ClassFit> {
  const mix = (x: number, y: number): number => x + damping * (y - x);
  return Object.fromEntries(Object.entries(next).map(([c, f]) => {
    const g = prev[c];
    if (!g || g.fallback || f.fallback || g.up !== f.up || g.down !== f.down) return [c, f];
    return [c, { ...f, a: mix(g.a, f.a), bUp: mix(g.bUp, f.bUp), bDown: mix(g.bDown, f.bDown) }];
  }));
}

/**
 * largest change of a class's expected return, for a fund month within ±`range`, between two sets of fits (Infinity when
 * a side kind or a fallback changed)
 */
function fitChange(x: Record<string, ClassFit>, y: Record<string, ClassFit>, range: number): number {
  let d = 0;
  for (const [c, f] of Object.entries(y)) {
    const g = x[c];
    if (!g || g.fallback !== f.fallback || g.up !== f.up || g.down !== f.down) return Infinity;
    d = Math.max(d, Math.abs(f.a - g.a) + range * Math.max(Math.abs(f.bUp - g.bUp), Math.abs(f.bDown - g.bDown)));
  }
  return d;
}

/**
 * The fits and the references they are fitted on depend on each other: iterate from a = 0, slope 1 (damped — two classes
 * that are each other's reference would otherwise swap their spreads every round — and normalised) until no class's
 * expected return moves by more than fitTolerance (for a fund month within ±fitToleranceRange), at most fitMaxRounds
 * rounds. `pointsOf(c, fits)`: class c's (month, reference m, return r) points under `fits`. Returns the fits, the points
 * under them and whether they settled.
 */
export function solveFits<P extends FitPoint>(
  classes: string[], fittable: Set<string>, pointsOf: (c: string, fits: Record<string, ClassFit>) => P[], cfg: FitCfg,
): { fits: Record<string, ClassFit>; points: Record<string, P[]>; converged: boolean; rounds: number } {
  const pointsUnder = (fs: Record<string, ClassFit>): Record<string, P[]> => Object.fromEntries(classes.map((c) => [c, fittable.has(c) ? pointsOf(c, fs) : []]));
  let fits: Record<string, ClassFit> = Object.fromEntries(classes.map((c) => [c, { ...IDENTITY, fallback: !fittable.has(c) }]));
  for (let round = 1; round <= cfg.fitMaxRounds; round++) {
    const points = pointsUnder(fits);
    // Theil–Sen medians jump between neighbouring pair slopes, so the map can cycle near its fixed point: the step shrinks
    // every fitDampingDecayRounds rounds until the cycle is within the tolerance
    const damping = cfg.fitDamping / Math.ceil(round / cfg.fitDampingDecayRounds);
    const next = normaliseFits(blend(fits, Object.fromEntries(classes.map((c) => [c, fittable.has(c) ? fitClass(points[c], cfg) : IDENTITY])), damping));
    const change = fitChange(fits, next, cfg.fitToleranceRange);
    fits = next;
    if (change <= cfg.fitTolerance) return { fits, points: pointsUnder(fits), converged: true, rounds: round };
  }
  return { fits, points: pointsUnder(fits), converged: false, rounds: cfg.fitMaxRounds };
}
