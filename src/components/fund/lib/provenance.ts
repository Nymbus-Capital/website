/**
 * The "as of" line of the disclosure: the date of the Portfolio tab's figures (the daily book's date, else the month-end
 * of the factsheet month) and, next to the daily book, the date of the sustainability metrics. Never the data source
 * (owner's decision 2026-10-07: visitors see dates; sources are in the admin run details). Texts:
 * src/content/disclaimers.ts. Pure. Empty string when there is no portfolio date.
 */
import type { FundData } from "../../../lib/data/types.ts";
import { T } from "../fund.copy.ts";
import { dateLabel } from "./format.ts";
import { portfolioOrigin } from "./portfolio.ts";
import { tr, type Locale } from "../../../lib/i18n/config.ts";

/** last day of a "YYYY-MM" (or a month-end date) month, as YYYY-MM-DD */
export function monthEndOf(month: string): string {
  const y = +month.slice(0, 4),
    m = +month.slice(5, 7);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export function provenanceLine(
  data: Pick<FundData, "portfolio" | "factsheetMonth" | "esg"> | null | undefined,
  lang: Locale,
): string {
  const parts: string[] = [];
  const origin = portfolioOrigin(data);
  if (origin?.kind === "daily") {
    parts.push(`${tr(T.disclosure.provenanceDaily, lang)} ${dateLabel(origin.asOf, lang, true)}`);
    const esg = (data?.esg ?? []).some((c) => c.fund != null && c.fund !== "");
    if (esg && data?.factsheetMonth)
      parts.push(`${tr(T.disclosure.provenanceEsgFactsheet, lang)} ${dateLabel(monthEndOf(data.factsheetMonth), lang, true)}`);
  } else if (origin?.kind === "factsheet") {
    parts.push(`${tr(T.disclosure.provenanceFactsheet, lang)} ${dateLabel(monthEndOf(origin.month), lang, true)}`);
  }
  if (!parts.length) return "";
  const s = parts.join("; ");
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
}
