"use client";
/**
 * Home hero: "Scientific investing" rising word by word out of a blur (display size), a factual lead, the two
 * entry points of the previous site (Explore strategies / Investment solutions) and, on the right, the daily NAVs
 * as published (fund colour, series, NAV, valuation date) in a glass panel. Behind: yield curves drawing
 * themselves in, a soft blue-cyan light. The NAV panel only exists when NAVs are published.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { ButtonLink, Eyebrow, HeroCurves, Reveal, RevealTitle } from "../kit";
import type { HomeData } from "./data";
import { HOME_COPY as C, FUND_COPY as F } from "./copy";
import { SampleTag, fundStyle } from "./FundTile";
import { dayText, navText } from "./figures";

function NavPanel({ data }: { data: HomeData }) {
  const { locale, pick } = useTranslation();
  const rows = data.funds.filter((f) => f.nav);
  if (!rows.length) return null;
  return (
    <div className="hm-nav" data-testid="nav-panel">
      <p className="hm-nav-h">
        <span className="live-dot" aria-hidden="true" />
        <span>{pick(C.hero.live)} {dayText(data.navAsOf, locale)}</span>
        {data.sample ? <SampleTag /> : null}
      </p>
      <ul>
        {rows.map((f) => (
          <li key={f.key} style={fundStyle(f)}>
            <Link href={`/strategies/${f.key}`}>
              <i aria-hidden="true" />
              <span className="hm-nav-n">
                <b>{pick(f.short)}</b>
                <span>{pick(F.navSeries)} {f.nav!.display}{f.nav!.date && f.nav!.date !== data.navAsOf ? ` · ${dayText(f.nav!.date, locale)}` : ""}</span>
              </span>
              <span className="hm-nav-v tabnum">{navText(f.nav!.nav, f.nav!.currency, locale)}</span>
              <ArrowUpRight aria-hidden="true" className="hm-nav-go" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="hm-nav-f">{pick(F.nav)} · {locale === "fr" ? "valeur liquidative par part" : "net asset value per unit"}</p>
    </div>
  );
}

export function HomeHero({ data }: { data: HomeData }) {
  const { pick } = useTranslation();
  const hasNav = data.funds.some((f) => f.nav);
  return (
    <header className={`hm-hero ${hasNav ? "has-aside" : ""}`}>
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
          {hasNav ? <Reveal self kind="pop" delay={450} className="hm-hero-aside"><NavPanel data={data} /></Reveal> : null}
        </div>
      </div>
    </header>
  );
}
