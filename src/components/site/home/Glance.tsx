"use client";
/**
 * nymbus at a glance: approach / team / firm, three columns on the screen (no boxes), figures in gradient.
 * AUM comes from the admin content (firm.aumLabel); the other figures are the deck's approved wording.
 */
import { CountUp, Reveal, RevealTitle, Spotlight } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import type { L10n } from "@/lib/data/types";
import { HOME } from "../copy";
import { Foot } from "../ui";

export function Glance({ aumLabel }: { aumLabel: L10n | null }) {
  const { locale, pick } = useTranslation();
  const G = HOME.glance;
  return (
    <section className="screen glow glance" data-swap="" aria-labelledby="glance-t">
      <Spotlight />
      <div className="wrap wide">
        <header className="head center-head">
          <Reveal className="eyebrow" self>{pick(G.eyebrow)}</Reveal>
          <RevealTitle as="h2" id="glance-t" text={locale === "fr" ? "une firme," : "one firm,"} accent={locale === "fr" ? "trois forces" : "three strengths"} className="h1" />
        </header>
        <Reveal className="glance-grid" kind="pop" stagger={140}>
          <div className="gcol">
            <div className="gk"><span className="mark" aria-hidden="true" />{pick(G.approach)}</div>
            <p className="gt grad">{pick(G.a1)}</p>
            <span className="gplus" aria-hidden="true">+</span>
            <p className="gt grad">{pick(G.a2)}</p>
            <div className="gfig">
              <span className="fig l g-cyan"><CountUp value={10} decimals={0} suffix="+" lang={locale} /></span>
              <span className="fig-label">{pick(G.a3)}</span>
            </div>
          </div>
          <div className="gcol">
            <div className="gk"><span className="mark" aria-hidden="true" />{pick(G.team)}</div>
            <p className="gt grad">{pick(G.t1)}</p>
            <p className="small gsub">{pick(G.t1s)}</p>
            <span className="gplus" aria-hidden="true">+</span>
            <p className="gt grad">{pick(G.t2)}</p>
            <div className="gfig">
              <span className="fig l g-green"><CountUp value={23} decimals={0} lang={locale} /></span>
              <span className="fig-label">{pick(G.t2s)}</span>
            </div>
          </div>
          <div className="gcol">
            <div className="gk"><span className="mark" aria-hidden="true" />{pick(G.firm)}</div>
            {aumLabel ? (
              <div className="gfig first">
                <span className="fig l g-blue">{pick(aumLabel)}</span>
                <span className="fig-label">{pick(G.aum)}</span>
              </div>
            ) : null}
            <div className="gfig">
              <span className="fig l g-orange">top 1%<sup>*</sup></span>
              <span className="fig-label">{pick(G.topS)}</span>
            </div>
          </div>
        </Reveal>
        <Foot>{pick(G.foot)}</Foot>
      </div>
    </section>
  );
}
