/**
 * Freshness rule of the daily portfolio book, shared by the pipeline (selection and validation gates) and the pages
 * (render-time gate, so a rollback or a pin to an old snapshot never shows a stale book labelled "daily").
 * Dependency-free (runs under Node type stripping; safe in client bundles).
 */
import type { PortfolioData } from "./types.ts";

/** A book older than this many calendar days is not "daily" any more: the month-end factsheet figures are shown. */
export const PORTFOLIO_MAX_AGE_DAYS = 7;

const DAY = 86_400_000;

/** Whole calendar days from the book date (UTC midnight) to `now`; negative for a book dated after `now`; NaN when invalid. */
export function bookAgeDays(asOf: string, now: Date): number {
  if (typeof asOf !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) return Number.NaN;
  return Math.floor((now.getTime() - Date.parse(`${asOf}T00:00:00Z`)) / DAY);
}

/** Why a book date is not usable as "daily" at `now` (too old, in the future, invalid), or null when it is. */
export function bookAgeProblem(asOf: string, now: Date): string | null {
  const age = bookAgeDays(asOf, now);
  if (!Number.isFinite(age)) return `invalid book date ${asOf}`;
  if (age > PORTFOLIO_MAX_AGE_DAYS) return `book ${asOf} is ${age} days old (more than ${PORTFOLIO_MAX_AGE_DAYS})`;
  // one day of slack: the book is dated in the fund's time zone, `now` is UTC
  if (age < -1) return `book ${asOf} is dated in the future`;
  return null;
}

export const isFreshBook = (asOf: string, now: Date): boolean => bookAgeProblem(asOf, now) === null;

/**
 * Render-time gate: the fund data without its daily book when that book is not fresh at `now` (a rollback or a pin to
 * an old snapshot, a pipeline that stopped): the page then shows the month-end factsheet figures, never a stale book
 * labelled "daily". Pure; returns the input itself when nothing changes (cached values are frozen).
 */
export function dropStalePortfolio<D extends { portfolio?: PortfolioData | null }>(data: D | null | undefined, now: Date): D | null {
  if (!data) return null;
  if (!data.portfolio || isFreshBook(data.portfolio.asOf, now)) return data;
  return { ...data, portfolio: null };
}
