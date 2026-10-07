// helpers.ts — small shared checks of the validation (age in days, finite numbers, ISO dates)

/** Whole and fractional days from the date `a` to `b`. */
export const days = (a: string, b: Date): number =>
  (b.getTime() - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86_400_000;

/** paths of non-finite numbers inside a value */
export function nonFinitePaths(v: unknown, path: string, out: string[] = []): string[] {
  if (typeof v === "number") {
    if (!Number.isFinite(v)) out.push(path);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => nonFinitePaths(x, `${path}[${i}]`, out));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) nonFinitePaths(x, `${path}.${k}`, out);
  }
  return out;
}

/** A finite number. */
export const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
export const ISO = /^\d{4}-\d{2}-\d{2}$/;
