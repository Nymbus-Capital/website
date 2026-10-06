"use client";
/**
 * Home hero: "Scientific investing" rising word by word out of a blur (display size), one line on who we are
 * and the two entry points. Behind: a lattice of data points lit by travelling waves (canvas, lazy, paused
 * off-screen), yield curves drawing themselves in and two drifting lights. No fund data here: the home page
 * inspires; the fund pages carry the NAVs.
 */
import { ButtonLink, Eyebrow, HeroCurves, Reveal, RevealTitle } from "../kit";
import { useTranslation } from "@/lib/i18n";
import { DataField, Parallax } from "../fx/fx";
import { HOME_COPY as C } from "./home.copy";

export function HomeHero() {
  const { pick } = useTranslation();
  return (
    <header className="hm-hero">
      <DataField strength={1.1} />
      <Parallax className="r" speed={0.18} />
      <Parallax className="l" speed={0.1} />
      <HeroCurves className="hm-curves" />
      <div className="container">
        <div className="hm-hero-grid">
          <div className="hm-hero-main">
            <Reveal self><Eyebrow>{pick(C.hero.eyebrow)}</Eyebrow></Reveal>
            <RevealTitle as="h1" id="hero-t" text={pick(C.hero.title)} accent={pick(C.hero.accent)} className="display" step={110} breakBeforeAccent />
            <Reveal self delay={260}><p className="lead">{pick(C.hero.lead)}</p></Reveal>
            <Reveal self delay={380}>
              <div className="actions">
                <ButtonLink href="/strategies">{pick(C.hero.cta1)}</ButtonLink>
                <ButtonLink href="/solutions" variant="ghost">{pick(C.hero.cta2)}</ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </header>
  );
}
