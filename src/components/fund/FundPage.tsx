"use client";
/**
 * Fund detail page (/strategies/<key>): informational, light. Header band with the NAV card, return badges,
 * sticky tabs (overview, performance, portfolio, distributions, awards and rankings, documents), the fund's own section,
 * disclosures, call to action and the other funds. Receives plain JSON from the server page; every block whose data is
 * missing or hidden by the admin is omitted or says "figures coming soon".
 *
 * The selected share class (default F) drives the NAV card and every return figure of the page; a strategy with
 * variants (Global Minimum Volatility 3 / 6 / 9 %) switches all its figures. See lib/select.ts.
 */
import { useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "@/lib/i18n";
import { T, tr } from "./copy";
import { FundHeader, ReturnStrip } from "./Header";
import { FundTabs } from "./FundTabs";
import { Overview } from "./Overview";
import { PerformanceTab } from "./Performance";
import { PortfolioTab } from "./Portfolio";
import { DistributionsTab, DocumentsTab } from "./DocsDist";
import { AwardsTab } from "./Awards";
import { rankingsToShow } from "./lib/rankings.ts";
import { Disclosures, FeatureSection, FundCta, OtherFunds } from "./Closing";
import type { Lang } from "./lib/format.ts";
import { stripHidden } from "./lib/data.ts";
import { classInfoOf, classOptions, initialSelection, pickData, type ClassCtx, type Selection } from "./lib/select.ts";
import type { FundPageProps } from "./types";
import "./fund.css";

export function FundPage({ spec, content, data: published, sample, docs, funds, firmDisclaimer, brand }: FundPageProps) {
  const { locale } = useTranslation();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const isFund = spec.vehicle === "fund";
  const style = { "--fund-from": spec.color.from, "--fund-to": spec.color.to, "--fund": spec.color.solid } as CSSProperties;
  const [sel, setSel] = useState<Selection>(() => initialSelection(published, spec, content));
  // class / variant first (their own series, or none), then what the admin hid: hidden figures never reach a block
  const picked = useMemo(() => pickData(published, spec, content, sel), [published, spec, content, sel]);
  const data = stripHidden(picked.data, content);
  const ctx: ClassCtx = {
    options: isFund ? classOptions(published, spec, content) : [],
    selected: sel.classCode,
    select: (code) => setSel((s) => ({ ...s, classCode: code })),
    variant: sel.variant,
    selectVariant: (id) => setSel((s) => ({ ...s, variant: id })),
    returnsSoon: picked.returnsSoon,
    shortRecord: picked.shortRecord,
    notice: picked.notice ?? null,
    // the series' own inception next to its figures only when they start there (never next to the track record)
    inception: picked.data?.performance ? picked.data.performance.inception ?? null : classInfoOf(published, sel.classCode)?.inception ?? null,
  };
  const props = { spec, content, data, lang, ctx };
  const hasAwards = !!rankingsToShow(content, spec.classes);
  const tabs = [
    { id: "overview", label: tr(T.tabs.overview, lang), content: <Overview {...props} brand={brand} /> },
    { id: "performance", label: tr(T.tabs.performance, lang), content: <PerformanceTab {...props} /> },
    { id: "portfolio", label: tr(T.tabs.portfolio, lang), content: <PortfolioTab {...props} /> },
    // managed accounts (no fund units) make no distributions
    ...(isFund ? [{ id: "distributions", label: tr(T.tabs.distributions, lang), content: <DistributionsTab spec={spec} content={content} data={data} lang={lang} /> }] : []),
    ...(hasAwards ? [{ id: "awards", label: tr(T.tabs.awards, lang), content: <AwardsTab spec={spec} content={content} lang={lang} brand={brand} /> }] : []),
    { id: "documents", label: tr(T.tabs.documents, lang), content: <DocumentsTab spec={spec} docs={docs} lang={lang} /> },
  ];
  return (
    <div className="fund-page" style={style} data-fund={spec.key} lang={lang}>
      {sample ? <div className="fx-ribbon" aria-hidden="true">{tr(T.sample.ribbon, lang)}</div> : null}
      <FundHeader {...props} sample={sample} docs={docs} />
      <ReturnStrip {...props} />
      <FundTabs tabs={tabs} label={tr(isFund ? T.tabs.label : T.tabs.labelStrategy, lang)} />
      <FeatureSection spec={spec} data={data} content={content} lang={lang} />
      <Disclosures {...props} sample={sample} firmDisclaimer={firmDisclaimer} />
      <FundCta spec={spec} lang={lang} />
      <OtherFunds current={spec.key} funds={funds} lang={lang} />
    </div>
  );
}
