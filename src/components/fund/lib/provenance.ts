/**
 * The provenance line of the disclosure: how often the data is updated and where the Portfolio tab's figures come from
 * (portfolioOrigin): the daily holdings with their date, else the month-end factsheet with its month. When the daily
 * book is shown, the sustainability metrics (factsheet only) say so separately. Texts: src/content/disclaimers.ts. Pure.
 */
import type { FundData } from "../../../lib/data/types.ts";
import { T, tr } from "../copy.ts";
import { dateLabel, elide, monthLabel, type Lang } from "./format.ts";
import { portfolioOrigin } from "./data.ts";

export function provenanceLine(data: Pick<FundData, "portfolio" | "factsheetMonth" | "esg"> | null | undefined, lang: Lang): string {
  const parts = [tr(T.disclosure.provenance, lang)];
  const origin = portfolioOrigin(data);
  if (origin?.kind === "daily") {
    parts.push(`${tr(T.disclosure.provenanceDaily, lang)} ${dateLabel(origin.asOf, lang, true)}`);
    const esg = (data?.esg ?? []).some((c) => c.fund != null && c.fund !== "");
    if (esg && data?.factsheetMonth) parts.push(elide(tr(T.disclosure.provenanceEsgFactsheet, lang), monthLabel(data.factsheetMonth, lang), lang));
  } else if (origin?.kind === "factsheet") {
    parts.push(elide(tr(T.disclosure.provenanceFactsheet, lang), monthLabel(origin.month, lang), lang));
  }
  return `${parts.join("; ")}.`;
}
