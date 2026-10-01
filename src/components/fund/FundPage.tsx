"use client";
/**
 * Fund detail page (/strategies/<key>): informational, light. Header band with the NAV card, return badges,
 * sticky tabs (overview, performance, portfolio, distributions, documents), the fund's own section, disclosures,
 * call to action and the other funds. Receives plain JSON from the server page; every block whose data is
 * missing or hidden by the admin is omitted or says "figures coming soon".
 */
import type { CSSProperties } from "react";
import { useTranslation } from "@/lib/i18n";
import { T, tr } from "./copy";
import { FundHeader, ReturnStrip } from "./Header";
import { FundTabs } from "./FundTabs";
import { Overview } from "./Overview";
import { PerformanceTab } from "./Performance";
import { PortfolioTab } from "./Portfolio";
import { DistributionsTab, DocumentsTab } from "./DocsDist";
import { Disclosures, FeatureSection, FundCta, OtherFunds } from "./Closing";
import type { Lang } from "./lib/format.ts";
import { stripHidden } from "./lib/data.ts";
import type { FundPageProps } from "./types";
import "./fund.css";

export function FundPage({ spec, content, data: published, sample, docs, funds, firmDisclaimer }: FundPageProps) {
  const { locale } = useTranslation();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const isFund = spec.vehicle === "fund";
  const style = { "--fund-from": spec.color.from, "--fund-to": spec.color.to, "--fund": spec.color.solid } as CSSProperties;
  // the server already strips hidden blocks; stripping again here keeps every block consistent whatever the caller
  const data = stripHidden(published, content);
  const props = { spec, content, data, lang };
  const tabs = [
    { id: "overview", label: tr(T.tabs.overview, lang), content: <Overview {...props} /> },
    { id: "performance", label: tr(T.tabs.performance, lang), content: <PerformanceTab {...props} /> },
    { id: "portfolio", label: tr(T.tabs.portfolio, lang), content: <PortfolioTab {...props} /> },
    { id: "distributions", label: tr(T.tabs.distributions, lang), content: <DistributionsTab spec={spec} content={content} data={data} lang={lang} /> },
    { id: "documents", label: tr(T.tabs.documents, lang), content: <DocumentsTab spec={spec} docs={docs} lang={lang} /> },
  ];
  return (
    <div className="fund-page" style={style} data-fund={spec.key} lang={lang}>
      {sample ? <div className="fx-ribbon" aria-hidden="true">{tr(T.sample.ribbon, lang)}</div> : null}
      <FundHeader {...props} sample={sample} />
      <ReturnStrip {...props} />
      <FundTabs tabs={tabs} label={tr(isFund ? T.tabs.label : T.tabs.labelStrategy, lang)} />
      <FeatureSection spec={spec} data={data} content={content} lang={lang} />
      <Disclosures {...props} sample={sample} firmDisclaimer={firmDisclaimer} />
      <FundCta spec={spec} lang={lang} />
      <OtherFunds current={spec.key} funds={funds} lang={lang} />
    </div>
  );
}
