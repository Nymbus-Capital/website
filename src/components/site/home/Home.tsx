"use client";
/**
 * Home: an inspiring page, not a data page. hero (data field) · key figures · "science at scale" (the analysis
 * scan: scientists and engineers, hard problems in finance) · "diversifying engines" (multi-strategy and overlay,
 * generated illustration) · strategies (returns, no NAV) · investment process ·
 * institutions and partners · news · call to action.
 */
import { useTranslation } from "@/lib/i18n";
import { ButtonLink, CtaBand, Section, SectionHead } from "../kit";
import { AnalysisScan } from "../fx/fx";
import { SCAN_COPY as S } from "../fx/scan-copy";
import { OverlayEngines } from "../fx/overlay";
import { OVERLAY_COPY as O } from "../fx/overlay-copy";
import type { HomeData } from "./data";
import type { NewsItem } from "./news";
import { HOME_COPY as C } from "./copy";
import { HomeHero } from "./HomeHero";
import { KeyFigures, News, Partners, Process, StrategiesBand } from "./Sections";
import "./home.css";

export function Home({ data, news }: { data: HomeData; news?: NewsItem[] }) {
  const { pick } = useTranslation();
  return (
    <div className="hm">
      <HomeHero />
      <KeyFigures data={data} />
      <Section glow="tr" labelledBy="scan-t" className="sc">
        <SectionHead eyebrow={pick(S.eyebrow)} title={pick(S.title)} accent={pick(S.accent)} lead={pick(S.lead)} id="scan-t" center />
        <AnalysisScan />
      </Section>
      <Section glow="bl" labelledBy="ov-t" className="ov">
        <SectionHead eyebrow={pick(O.eyebrow)} title={pick(O.title)} accent={pick(O.accent)} lead={pick(O.lead)} id="ov-t" center />
        <OverlayEngines />
      </Section>
      <StrategiesBand data={data} />
      <Process />
      <Partners />
      <News items={news} />
      <CtaBand title={pick(C.cta.title)} accent={pick(C.cta.accent)} text={pick(C.cta.text)}>
        <ButtonLink href="/contact">{pick(C.cta.contact)}</ButtonLink>
        <ButtonLink href="/solutions" variant="ghost">{pick(C.cta.solutions)}</ButtonLink>
      </CtaBand>
    </div>
  );
}
