/**
 * Fund page labels added by the data fixes (partial-year flags, per-figure basis markers), EN / FR. Kept apart
 * from fund.copy.ts (texts under review). Pure data.
 */
import { l } from "../../lib/i18n/config.ts";

export const FL = {
  /** flag of a partial inception year (not the current year) */
  sinceLaunch: l("since launch", "depuis le lancement"),
  /** long form of the YTD flag (tables, screen readers) */
  ytdLong: l("year to date", "depuis le début de l’année"),
};

/** French names of the category labels the data platform publishes in English (unknown labels are shown as published). */
const CATEGORY_FR: Record<string, string> = {
  cash: "Liquidités", "not rated": "Non coté", other: "Autres", government: "Gouvernement", financials: "Services financiers",
  energy: "Énergie", utilities: "Services publics", communications: "Communications", industrials: "Industrie", "real estate": "Immobilier",
  "consumer staples": "Consommation de base", "consumer discretionary": "Consommation discrétionnaire", "health care": "Santé",
  materials: "Matériaux", "information technology": "Technologies de l’information", technology: "Technologie", equities: "Actions",
  canada: "Canada", "united states": "États-Unis", "corporate bonds": "Obligations de sociétés", "provincial bonds": "Obligations provinciales",
  "federal bonds": "Obligations fédérales", "municipal bonds": "Obligations municipales", "government bonds": "Obligations gouvernementales",
  "supranational bonds": "Obligations supranationales", funds: "Fonds",
  // Bloomberg industry sectors and the website-computed book (fund-portfolio.ts)
  financial: "Services financiers", industrial: "Industrie", "consumer, non-cyclical": "Consommation de base", "consumer, cyclical": "Consommation discrétionnaire",
  "basic materials": "Matériaux", diversified: "Diversifié", "mortgage-backed bonds": "Obligations hypothécaires",
  "preferred shares": "Actions privilégiées", "bonds (unclassified)": "Obligations (non classées)", "unknown maturity": "Échéance inconnue",
  "other assets": "Autres actifs", unclassified: "Non classé",
};

/** Label of a breakdown row: term buckets spelled out ("1-3" → "1–3 years" / "1–3 ans"), known categories in French. */
export function categoryLabel(label: string, lang: "en" | "fr", kind?: "term"): string {
  const t = label.trim();
  if (kind === "term") {
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(t);
    if (range) return lang === "fr" ? `${range[1]}–${range[2]}\u00a0${+range[2] > 1 ? "ans" : "an"}` : `${range[1]}–${range[2]} ${+range[2] > 1 ? "years" : "year"}`;
    const plus = /^(\d+)\s*\+$/.exec(t);
    if (plus) return lang === "fr" ? `${plus[1]}\u00a0ans et plus` : `${plus[1]}+ years`;
  }
  return lang === "fr" ? CATEGORY_FR[t.toLowerCase()] ?? t : t;
}
