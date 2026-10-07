"use client";
/**
 * 404, light and a little playful: a bond's price path drawing itself towards par and stopping at a glowing
 * "maturity" point, behind the page's "404". Links home, to the strategies and to the main pages.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/components/motion/motion";
import { l, useTranslation } from "@/lib/i18n";
import { ButtonLink, Eyebrow, Reveal, RevealTitle } from "../kit";
import "../kit.css";
import "./pages.css";

const C = {
  kicker: l("Error 404", "Erreur 404"),
  title: l("This page", "Cette page"),
  accent: l("has matured", "est arrivée à échéance"),
  lead: l(
    "Like a bond at maturity, the page you are looking for is no longer outstanding. It may have moved, or the address may be mistyped.",
    "Comme une obligation à l’échéance, la page que vous cherchez n’est plus en circulation. Elle a peut-être été déplacée, ou l’adresse contient une erreur.",
  ),
  home: l("Back to home", "Retour à l’accueil"),
  strategies: l("Our strategies", "Nos stratégies"),
  maturity: l("maturity", "échéance"),
  par: l("par", "pair"),
  more: l("Or try one of these pages", "Ou essayez l’une de ces pages"),
  links: [
    { href: "/approach", t: l("Our approach", "Notre approche") },
    { href: "/team", t: l("About us", "À propos") },
    { href: "/sustainability", t: l("Sustainability", "Développement durable") },
    { href: "/contact", t: l("Contact", "Nous joindre") },
  ],
};

function MaturityCurve() {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div ref={ref} className="nf2-art" data-on={seen ? "" : undefined} aria-hidden="true">
      <span className="nf2-404 grad">404</span>
      <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="nf2-g" x1="0" x2="1">
            <stop offset="0" stopColor="#1a73e8" stopOpacity=".2" />
            <stop offset=".5" stopColor="#1a73e8" />
            <stop offset="1" stopColor="#00a3e0" />
          </linearGradient>
          <filter id="nf2-f" x="-5%" y="-40%" width="110%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line className="nf2-par" x1="20" y1="170" x2="780" y2="170" />
        <text className="nf2-lbl" x="24" y="160">
          {pick(C.par)}
        </text>
        <path
          className="nf2-path"
          pathLength={1}
          filter="url(#nf2-f)"
          stroke="url(#nf2-g)"
          d="M20 250 C 90 90, 150 260, 230 150 S 330 60, 400 200 S 520 120, 580 180 S 680 168, 720 170"
        />
        <circle className="nf2-ring" cx="720" cy="170" r="18" />
        <circle className="nf2-dot" cx="720" cy="170" r="8" />
        <text className="nf2-lbl nf2-mat" x="720" y="214" textAnchor="middle">
          {pick(C.maturity)}
        </text>
      </svg>
    </div>
  );
}

export function NotFoundScreen() {
  const { pick } = useTranslation();
  return (
    <div className="pg nf2">
      <section className="nf2-s glow-tr" aria-labelledby="nf-t">
        <div className="container nf2-in">
          <MaturityCurve />
          <Reveal self>
            <Eyebrow>{pick(C.kicker)}</Eyebrow>
          </Reveal>
          <RevealTitle as="h1" id="nf-t" text={pick(C.title)} accent={pick(C.accent)} className="h1" />
          <Reveal self delay={200}>
            <p className="lead">{pick(C.lead)}</p>
          </Reveal>
          <Reveal self delay={320}>
            <div className="actions">
              <ButtonLink href="/">{pick(C.home)}</ButtonLink>
              <ButtonLink href="/strategies" variant="ghost">
                {pick(C.strategies)}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal self delay={440} className="nf2-more">
            <p className="small">{pick(C.more)}</p>
            <ul>
              {C.links.map((x) => (
                <li key={x.href}>
                  <Link className="link" href={x.href}>
                    {pick(x.t)} <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
