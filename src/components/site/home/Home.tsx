"use client";
/**
 * Home: an inspiring page, not a data page. hero (data field) · key figures · "science at scale" (the analysis
 * scan: scientists and engineers, hard problems in finance) · strategies (returns, no NAV) · investment process ·
 * institutions and partners · news · call to action.
 */
import { useTranslation } from "@/lib/i18n";
import { ButtonLink, CtaBand, Section, SectionHead } from "../kit";
import { AnalysisScan } from "../fx/fx";
import { SCAN_COPY as S } from "../fx/scan-copy";
import type { HomeData } from "./data";
import { HOME_COPY as C } from "./copy";
import { HomeHero } from "./HomeHero";
import { KeyFigures, News, Partners, Process, StrategiesBand } from "./Sections";
import "./home.css";

export function Home({ data }: { data: HomeData }) {
  const { pick } = useTranslation();
  return (
    <div className="hm">
      <HomeHero />
      <KeyFigures data={data} />
      <Section glow="tr" labelledBy="scan-t" className="sc">
        <SectionHead eyebrow={pick(S.eyebrow)} title={pick(S.title)} accent={pick(S.accent)} lead={pick(S.lead)} id="scan-t" center />
        <AnalysisScan />
      </Section>
      <StrategiesBand data={data} />
      <Process />
      <Partners />
      <News />
      <CtaBand title={pick(C.cta.title)} accent={pick(C.cta.accent)} text={pick(C.cta.text)}>
        <ButtonLink href="/contact">{pick(C.cta.contact)}</ButtonLink>
        <ButtonLink href="/solutions" variant="ghost">{pick(C.cta.solutions)}</ButtonLink>
      </CtaBand>
    </div>
  );
}
