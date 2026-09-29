"use client";
/** In summary (approach / team / results) and the closing contact screen. */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LightTrail, Reveal, RevealTitle, Spotlight } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { CONTACT } from "../links";
import { Foot, Head } from "../ui";

export function Summary() {
  const { pick } = useTranslation();
  const X = HOME.summary;
  return (
    <section className="screen glow summary" data-swap="" aria-labelledby="sum-t">
      <Spotlight />
      <div className="wrap wide">
        <Head title={pick(X.title)} accent={pick(X.accent)} sub={pick(X.sub)} id="sum-t" size="h1" className="center-head" />
        <Reveal className="sum-grid" kind="pop" stagger={160}>
          {X.items.map(([k, t, d], i) => (
            <article key={i} className="sum-item">
              <span className="lbl">0{i + 1} / {pick(k)}</span>
              <h3 className={`h2 ${["g-blue", "g-cyan", "g-orange"][i]}`}>{pick(t)}</h3>
              <p className="body">{pick(d)}</p>
            </article>
          ))}
        </Reveal>
        <Foot>{pick(X.foot)}</Foot>
      </div>
    </section>
  );
}

export function ContactCta() {
  const { pick } = useTranslation();
  const X = HOME.cta;
  return (
    <section className="screen dark center cta" data-swap="" aria-labelledby="cta-t">
      <LightTrail d="M-40 520 C 240 640, 520 660, 760 600 C 980 545, 1120 470, 1320 430" />
      <Spotlight />
      <div className="wrap narrow">
        <Reveal className="kicker" self><span className="mark" aria-hidden="true" />{pick(X.sub)}</Reveal>
        <RevealTitle as="h2" id="cta-t" text={pick(X.title)} className="display" gradient step={120} />
        <Reveal className="cta-row" delay={500} stagger={120}>
          <Link className="btn" href="/contact">{pick(X.btn)} <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="btn ghost" href="/team">{pick(X.team)}</Link>
        </Reveal>
        <Reveal as="p" className="cta-mail" self delay={800}><a className="link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></Reveal>
      </div>
    </section>
  );
}
