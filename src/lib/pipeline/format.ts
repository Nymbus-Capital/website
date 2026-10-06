// format.ts — figures as written in pipeline issue messages and provenance (dependency-free).

/** Decimal fraction as a percentage for issue texts: 0.01234 → "1.23%". */
export const pct = (x: number, decimals = 2): string => `${(x * 100).toFixed(decimals)}%`;
