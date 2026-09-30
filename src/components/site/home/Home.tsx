"use client";
/**
 * Home: the previous site's sections as an informational, light corporate page with the v3 keynote motion.
 * hero · key figures · approach · strategies (live figures) · investment process · institutions and partners ·
 * news and milestones · call to action.
 */
import { useTranslation } from "@/lib/i18n";
import { ButtonLink, CtaBand } from "../kit";
import type { HomeData } from "./data";
import { HOME_COPY as C } from "./copy";
import { HomeHero } from "./HomeHero";
import { Approach, KeyFigures, News, Partners, Process, StrategiesBand } from "./Sections";
import "./home.css";

export function Home({ data }: { data: HomeData }) {
  const { pick } = useTranslation();
  return (
    <div className="hm">
      <HomeHero data={data} />
      <KeyFigures data={data} />
      <Approach />
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
