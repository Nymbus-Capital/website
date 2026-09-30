/**
 * Fund page labels added by the data fixes (partial-year flags, per-figure basis markers), EN / FR. Kept apart
 * from copy.ts (texts under review). Pure data.
 */
export type L = { en: string; fr: string };
const l = (en: string, fr: string): L => ({ en, fr });

export const FL = {
  /** flag of a partial inception year (not the current year) */
  sinceLaunch: l("since launch", "depuis le lancement"),
  /** long form of the YTD flag (tables, screen readers) */
  ytdLong: l("year to date", "depuis le début de l’année"),
};
