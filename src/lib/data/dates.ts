// dates.ts — month keys shared by the pipeline and the pages (dependency-free, runs under plain Node).

/** Month key (`YYYY-MM`) of a date or month-end (`YYYY-MM-DD`, or already a month key). */
export const ym = (date: string): string => date.slice(0, 7);

/** Number of months from a to b inclusive (both month keys or month-ends). */
export function monthsBetween(a: string, b: string): number {
  return (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + (Number(b.slice(5, 7)) - Number(a.slice(5, 7))) + 1;
}
