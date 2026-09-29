"use client";
/**
 * One scrolling keynote per fund. Receives plain JSON from the server page, reads the language from the
 * i18n context and renders every block whose data exists and that the admin has not hidden.
 */
import type { CSSProperties } from "react";
import { ScreenSwap } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { T, tr } from "./copy";
import { FundDock } from "./FundDock";
import { Hero } from "./Hero";
import { CalendarSection, GrowthSection, HeatmapSection, RiskSection, TrailingSection } from "./PerformanceSections";
import { DisclosureSection, DocumentsSection, FactsSection, PortfolioSection } from "./PortfolioSections";
import { riskWindows, visibleBlocks } from "./lib/data.ts";
import type { Lang } from "./lib/format.ts";
import type { FundPageProps } from "./types";
import "./fund.css";

export function FundPage({ spec, content, data, sample, docs, funds }: FundPageProps) {
  const { locale } = useTranslation();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const v = visibleBlocks(data, content, docs.length);
  const perf = data?.performance ?? null;
  const windows = riskWindows([data?.risk, data?.risk3Y]);

  const style = { "--fund-from": spec.color.from, "--fund-to": spec.color.to, "--fund": spec.color.solid } as CSSProperties;
  const sections = [
    { id: "overview", label: tr(T.sections.overview, lang), on: true },
    { id: "performance", label: tr(T.sections.performance, lang), on: v.trailing },
    { id: "growth", label: tr(T.sections.growth, lang), on: v.growth },
    { id: "calendar", label: tr(T.sections.calendar, lang), on: v.calendar },
    { id: "monthly", label: tr(T.sections.monthly, lang), on: v.heatmap },
    { id: "risk", label: tr(T.sections.risk, lang), on: v.risk },
    { id: "portfolio", label: tr(T.sections.portfolio, lang), on: v.portfolio },
    { id: "facts", label: tr(T.sections.facts, lang), on: true },
    { id: "documents", label: tr(T.sections.documents, lang), on: v.documents },
  ].filter((s) => s.on).map(({ id, label }) => ({ id, label }));

  return (
    <div className="fund-page stage" style={style} data-fund={spec.key} lang={lang}>
      <ScreenSwap />
      {sample ? <div className="fx-ribbon" aria-hidden="true">{tr(T.sample.ribbon, lang)}</div> : null}
      <Hero spec={spec} content={content} data={data} lang={lang} sample={sample} />
      {v.trailing && perf ? <TrailingSection spec={spec} perf={perf} lang={lang} /> : null}
      {v.growth && perf ? <GrowthSection spec={spec} perf={perf} lang={lang} /> : null}
      {v.calendar && perf ? <CalendarSection spec={spec} perf={perf} lang={lang} /> : null}
      {v.heatmap && perf ? <HeatmapSection spec={spec} perf={perf} lang={lang} /> : null}
      {v.risk ? <RiskSection windows={windows} lang={lang} perf={perf} /> : null}
      {v.portfolio && data ? <PortfolioSection data={data} content={content} lang={lang} /> : null}
      <FactsSection spec={spec} content={content} data={data} lang={lang} />
      {v.documents ? <DocumentsSection docs={docs} lang={lang} /> : null}
      <DisclosureSection spec={spec} content={content} data={data} lang={lang} sample={sample} />
      <FundDock current={spec.key} funds={funds} sections={sections} lang={lang} sample={sample} />
    </div>
  );
}
