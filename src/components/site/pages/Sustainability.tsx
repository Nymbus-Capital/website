"use client";
/**
 * /sustainability: responsible investing as part of the systematic process. The previous site's sections
 * (principles, ESG integration, exclusion policy, green bonds, Fondaction, PRI), facts only: the old ESG
 * metrics, green-bond allocation chart and "PRI alignment scorecard" were placeholders and are not shown.
 */
import { ArrowUpRight, Award, Ban, Building2, Bus, Eye, Flame, Handshake, Scale, ShieldAlert, Sprout, Sun, TriangleAlert, Zap } from "lucide-react";
import { useInView } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { ButtonLink, CardGrid, CtaBand, FeatureCard, PageHero, Reveal, Section, SectionHead, Steps } from "../kit";
import { SU } from "./copy-sustainability";
import "./pages.css";

/** Three rings (E, S, G) drawing themselves around the hero. */
function EsgRings() {
  const { locale, pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const rings = [
    { r: 128, c: "#188038", label: locale === "fr" ? "Environnement" : "Environmental" },
    { r: 96, c: "#00a3e0", label: locale === "fr" ? "Social" : "Social" },
    { r: 64, c: "#1a73e8", label: locale === "fr" ? "Gouvernance" : "Governance" },
  ];
  return (
    <div ref={ref} className="su-rings" data-on={seen ? "" : undefined}>
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <defs>
          <filter id="su-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {rings.map((g, i) => (
          <g key={i} style={{ ["--k" as string]: i }}>
            <circle cx="150" cy="150" r={g.r} className="su-ring-track" />
            <circle cx="150" cy="150" r={g.r} className="su-ring" stroke={g.c} pathLength={1} filter="url(#su-glow)" transform="rotate(-90 150 150)" />
            <circle cx={150} cy={150 - g.r} r="5.5" className="su-ring-dot" stroke={g.c} />
          </g>
        ))}
        <text x="150" y="160" textAnchor="middle" className="su-ring-c">ESG</text>
      </svg>
      <ul className="su-ring-l">
        {rings.map((g, i) => <li key={i} style={{ ["--c" as string]: g.c, ["--k" as string]: i }}><i aria-hidden="true" />{g.label}</li>)}
      </ul>
      <p className="su-badge"><Award aria-hidden="true" />{pick(SU.hero.badge)}</p>
    </div>
  );
}

export function Sustainability() {
  const { locale, pick } = useTranslation();
  const exIcons = [Flame, Ban, ShieldAlert, TriangleAlert];
  const useIcons = [Sun, Zap, Bus, Building2];
  return (
    <div className="pg su">
      <PageHero eyebrow={pick(SU.hero.eyebrow)} title={pick(SU.hero.title)} accent={pick(SU.hero.accent)} lead={pick(SU.hero.lead)} art="none"
        crumbs={[{ href: "/", label: locale === "fr" ? "Accueil" : "Home" }, { label: pick(SU.hero.eyebrow) }]} aside={<EsgRings />}>
        <ButtonLink href="/strategies/sustainable-enhanced-bonds">{pick(SU.hero.cta1)}</ButtonLink>
        <ButtonLink href="#exclusions" variant="ghost">{pick(SU.hero.cta2)}</ButtonLink>
      </PageHero>

      <Section labelledBy="su-pr-t">
        <SectionHead eyebrow={pick(SU.principles.eyebrow)} title={pick(SU.principles.title)} accent={pick(SU.principles.accent)} lead={pick(SU.principles.lead)} id="su-pr-t" />
        <CardGrid cols={3}>
          {SU.principles.items.map((it, i) => {
            const Icon = [Sprout, Eye, Award][i];
            return <FeatureCard key={i} icon={<Icon />} title={pick(it.t)} className="ring su-card"><p>{pick(it.d)}</p></FeatureCard>;
          })}
        </CardGrid>
      </Section>

      <Section tone="tint" labelledBy="su-int-t" glow="tr">
        <SectionHead eyebrow={pick(SU.integration.eyebrow)} title={pick(SU.integration.title)} accent={pick(SU.integration.accent)} lead={pick(SU.integration.lead)} id="su-int-t" />
        <Steps items={SU.integration.steps.map((s, i) => ({
          title: pick(s.t), text: pick(s.d), color: ["#188038", "#0f9d58", "#00a3e0"][i],
          icon: [<Ban key="b" aria-hidden="true" />, <Sprout key="s" aria-hidden="true" />, <Scale key="q" aria-hidden="true" />][i],
        }))} />
      </Section>

      <Section id="exclusions" labelledBy="su-ex-t">
        <SectionHead eyebrow={pick(SU.exclusions.eyebrow)} title={pick(SU.exclusions.title)} accent={pick(SU.exclusions.accent)} lead={pick(SU.exclusions.lead)} id="su-ex-t" />
        <CardGrid cols={4} className="su-ex">
          {SU.exclusions.items.map((it, i) => {
            const Icon = exIcons[i];
            return <FeatureCard key={i} icon={<Icon />} title={pick(it.t)} className="su-ex-card"><p>{pick(it.d)}</p></FeatureCard>;
          })}
        </CardGrid>
      </Section>

      <Section tone="tint" labelledBy="su-gb-t" glow="bl">
        <div className="split su-green">
          <div>
            <SectionHead eyebrow={pick(SU.green.eyebrow)} title={pick(SU.green.title)} accent={pick(SU.green.accent)} id="su-gb-t" className="su-green-head" />
            <Reveal self><p className="body">{pick(SU.green.text)}</p></Reveal>
            <Reveal self delay={120}><p className="small su-note">{pick(SU.green.note)}</p></Reveal>
            <Reveal self delay={200}><div className="actions"><ButtonLink href="/strategies/sustainable-enhanced-bonds" variant="ghost">{pick(SU.green.go)}</ButtonLink></div></Reveal>
          </div>
          <Reveal as="ul" kind="pop" stagger={110} className="su-uses">
            {SU.green.uses.map((u, i) => {
              const Icon = useIcons[i];
              return (
                <li key={i}>
                  <span className="bubble" style={{ ["--bc" as string]: ["#188038", "#0f9d58", "#00a3e0", "#1a73e8"][i], ["--size" as string]: "52px" }} aria-hidden="true"><Icon /></span>
                  <span>{pick(u)}</span>
                </li>
              );
            })}
          </Reveal>
        </div>
      </Section>

      <Section labelledBy="su-fa-t">
        <div className="split su-fa">
          <div>
            <SectionHead eyebrow={pick(SU.fondaction.eyebrow)} title={pick(SU.fondaction.title)} accent={pick(SU.fondaction.accent)} lead={pick(SU.fondaction.p1)} id="su-fa-t" />
          </div>
          <Reveal self kind="pop" className="card su-commit">
            <h3 className="h4">{pick(SU.commitments.title)} {pick(SU.commitments.accent)}</h3>
            <ol className="su-tl">
              {SU.commitments.items.map((c) => (
                <li key={c.y}>
                  <span className="su-tl-y tabnum">{c.y}</span>
                  <div><p className="su-tl-t">{pick(c.t)}</p><p className="su-tl-d">{pick(c.d)}</p></div>
                </li>
              ))}
              <li>
                <span className="su-tl-y" aria-hidden="true"><Handshake /></span>
                <div><p className="su-tl-t">{pick(SU.commitments.fondaction.t)}</p><p className="su-tl-d">{pick(SU.commitments.fondaction.d)}</p></div>
              </li>
            </ol>
          </Reveal>
        </div>
      </Section>

      <Section tone="tint" labelledBy="su-pri-t" glow="tr">
        <SectionHead eyebrow={pick(SU.pri.eyebrow)} title={pick(SU.pri.title)} accent={pick(SU.pri.accent)} lead={pick(SU.pri.lead)} id="su-pri-t" />
        <Reveal as="ol" kind="pop" stagger={80} className="su-pri">
          {SU.pri.items.map((p, i) => (
            <li key={i}>
              <span className="bubble" style={{ ["--bc" as string]: i % 2 ? "#00a3e0" : "#188038", ["--size" as string]: "44px" }} aria-hidden="true">{i + 1}</span>
              <p>{pick(p)}</p>
            </li>
          ))}
        </Reveal>
        <p className="su-pri-link"><a className="link" href="https://www.unpri.org/" target="_blank" rel="noopener noreferrer">{pick(SU.pri.link)} <ArrowUpRight aria-hidden="true" /></a></p>
      </Section>

      <CtaBand title={pick(SU.cta.title)} accent={pick(SU.cta.accent)} text={pick(SU.cta.text)}>
        <ButtonLink href="/strategies/sustainable-enhanced-bonds">{pick(SU.cta.b1)}</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">{pick(SU.cta.b2)}</ButtonLink>
      </CtaBand>
    </div>
  );
}
