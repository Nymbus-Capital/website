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

/** the side kinds of a class, decided once on its full sample */
export type Sides = { up: SideKind; down: SideKind };

/** a class's spread to the fund; `fallback`: no fit (a = 0, slope 1) */
export interface ClassFit extends Sides { a: number; bUp: number; bDown: number; n: number; fallback: boolean }

export interface FitCfg {
  fitMinMonths: number;
  fitSideMinMonths: number;
  fitUnitSlopeTolerance: number;
  fitSlopeMin: number;
  fitSlopeMax: number;
  fitInterceptMax: number;
  fitTolerance: number;
  fitMaxRounds: number;
  fitDamping: number;
}

export type FitPoint = { m: number; r: number };

/** the iteration's step is divided by 2, 3, … after every this many rounds (Theil–Sen medians can make it cycle) */
const DAMPING_DECAY_ROUNDS = 20;
/** a round's step is measured on the expected return of a fund month within ± this */
const TOLERANCE_RANGE = 0.1;

/** no fit: the class is expected to earn the fund's return (a = 0, slope 1 both sides) */
export const IDENTITY: ClassFit = { a: 0, bUp: 1, bDown: 1, n: 0, fallback: true, up: "unit", down: "unit" };

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const clip = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));
const upMonths = (pts: FitPoint[]): FitPoint[] => pts.filter((p) => p.m > 0);
const downMonths = (pts: FitPoint[]): FitPoint[] => pts.filter((p) => p.m <= 0);

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

/** side kinds from a class's full sample: "fit" with ≥ fitSideMinMonths months, else "unit" or "uncheckable" (SideKind) */
export function decideSides(pts: FitPoint[], cfg: FitCfg): Sides {
  const up = upMonths(pts);
  const down = downMonths(pts);
  const own = (side: FitPoint[]): boolean => side.length >= cfg.fitSideMinMonths;
  const short = (other: FitPoint[]): SideKind => (own(other) && Math.abs(theilSenSlope(other, cfg) - 1) <= cfg.fitUnitSlopeTolerance ? "unit" : "uncheckable");
  return { up: own(up) ? "fit" : short(down), down: own(down) ? "fit" : short(up) };
}

/**
 * Fit of a class on given side kinds: its own Theil–Sen slope on a "fit" side, slope 1 elsewhere; a = median residual
 * (clipped to ±fitInterceptMax) over the months of its checkable sides.
 */
export function fitWithSides(pts: FitPoint[], sides: Sides, cfg: FitCfg): ClassFit {
  const bUp = sides.up === "fit" ? theilSenSlope(upMonths(pts), cfg) : 1;
  const bDown = sides.down === "fit" ? theilSenSlope(downMonths(pts), cfg) : 1;
  const usable = pts.filter((p) => (p.m > 0 ? sides.up : sides.down) !== "uncheckable");
  const a = usable.length ? clip(median(usable.map((p) => p.r - bUp * Math.max(p.m, 0) - bDown * Math.min(p.m, 0))), -cfg.fitInterceptMax, cfg.fitInterceptMax) : 0;
  return { a, bUp, bDown, n: pts.length, fallback: false, up: sides.up, down: sides.down };
}

/** full-sample fit of a class: sides decided on its months, then fitted; fewer than fitMinMonths months → `fallback` */
export function fitClass(pts: FitPoint[], cfg: FitCfg): ClassFit {
  if (pts.length < cfg.fitMinMonths) return { ...IDENTITY, n: pts.length };
  return fitWithSides(pts, decideSides(pts, cfg), cfg);
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

/** a round's step: the largest change of a class's expected return within ±TOLERANCE_RANGE (Infinity on a kind change) */
function stepSize(x: Record<string, ClassFit>, y: Record<string, ClassFit>): number {
  let d = 0;
  for (const [c, f] of Object.entries(y)) {
    const g = x[c];
    if (!g || g.fallback !== f.fallback || g.up !== f.up || g.down !== f.down) return Infinity;
    d = Math.max(d, Math.abs(f.a - g.a) + TOLERANCE_RANGE * Math.max(Math.abs(f.bUp - g.bUp), Math.abs(f.bDown - g.bDown)));
  }
  return d;
}

/**
 * The fits and the references they are fitted on depend on each other: iterate from a = 0, slope 1 — damped (two classes
 * that are each other's reference would otherwise swap their spreads every round), the step shrinking every
 * DAMPING_DECAY_ROUNDS rounds, normalised — until a round's step is at most fitTolerance (a step size, not a distance to
 * the exact fixed point), at most fitMaxRounds rounds. `pointsOf(c, fits)`: class c's (month, reference m, return r)
 * points under `fits`. Returns the fits, the points under them and whether they settled.
 */
export function solveFits<P extends FitPoint>(
  classes: string[], fittable: Set<string>, pointsOf: (c: string, fits: Record<string, ClassFit>) => P[], cfg: FitCfg,
): { fits: Record<string, ClassFit>; points: Record<string, P[]>; converged: boolean; rounds: number } {
  const pointsUnder = (fs: Record<string, ClassFit>): Record<string, P[]> => Object.fromEntries(classes.map((c) => [c, fittable.has(c) ? pointsOf(c, fs) : []]));
  let fits: Record<string, ClassFit> = Object.fromEntries(classes.map((c) => [c, { ...IDENTITY, fallback: !fittable.has(c) }]));
  for (let round = 1; round <= cfg.fitMaxRounds; round++) {
    const points = pointsUnder(fits);
    const damping = cfg.fitDamping / Math.ceil(round / DAMPING_DECAY_ROUNDS);
    const next = normaliseFits(blend(fits, Object.fromEntries(classes.map((c) => [c, fittable.has(c) ? fitClass(points[c], cfg) : IDENTITY])), damping));
    const step = stepSize(fits, next);
    fits = next;
    if (step <= cfg.fitTolerance) return { fits, points: pointsUnder(fits), converged: true, rounds: round };
  }
  return { fits, points: pointsUnder(fits), converged: false, rounds: cfg.fitMaxRounds };
}

/** one class's residual in one month; `m`: the fund's reference return that month (its sign gives the side) */
export interface Residual { fsv: string; m: number; e: number }

/**
 * Residuals of every class-month, robust to a class's own wrong months: pass 1 tests each month against a fit without it,
 * pass 2 also without the class's other pass-1 breaches (when `canLeaveOut` allows). Stability rule: a class keeps its
 * pass-2 verdicts only if pass 2 flags no month pass 1 did not, and a pass-1 breach that pass 2 clears stands unless
 * pass 2 confirms another breach of that class on the same (up / down) side.
 */
export function robustResiduals<R extends Residual>(
  months: string[],
  assess: (month: string, leaveOut: (fsv: string) => Set<string>) => R[],
  canLeaveOut: (fsv: string, months: Set<string>) => boolean,
  breaches: (e: number) => boolean,
): Map<string, R[]> {
  const run = (leaveOut: (fsv: string) => Set<string>): Map<string, R[]> => new Map(months.map((m): [string, R[]] => [m, assess(m, leaveOut)]));
  // class → its breaching months → whether each is an up month
  const flagged = (pass: Map<string, R[]>): Map<string, Map<string, boolean>> => {
    const out = new Map<string, Map<string, boolean>>();
    for (const [month, res] of pass) for (const x of res) if (breaches(x.e)) out.set(x.fsv, (out.get(x.fsv) ?? new Map()).set(month, x.m > 0));
    return out;
  };
  const first = run(() => new Set());
  const suspects = flagged(first);
  const second = run((c) => {
    const s = new Set(suspects.get(c)?.keys() ?? []);
    return s.size && canLeaveOut(c, s) ? s : new Set();
  });
  const confirmed = flagged(second);
  const unstable = (c: string): boolean => [...(confirmed.get(c)?.keys() ?? [])].some((m) => !suspects.get(c)?.has(m));
  return new Map(months.map((month): [string, R[]] => [month, second.get(month)!.map((x) => {
    const p1 = first.get(month)!.find((y) => y.fsv === x.fsv)!;
    if (unstable(x.fsv)) return p1;
    const explained = [...(confirmed.get(x.fsv) ?? [])].some(([m, up]) => m !== month && up === x.m > 0);
    return breaches(p1.e) && !breaches(x.e) && !explained ? p1 : x;
  })]));
}
