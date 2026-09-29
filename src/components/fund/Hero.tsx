"use client";
/**
 * Hero screen (black): fund name in its gradient, tagline, the since-inception return counting up,
 * value added vs benchmark, headline class NAV with its daily change, chips (vehicle, asset class,
 * risk meter, inception, FundServ) and the basis label (net / gross, with the managed-accounts note).
 */
import { useEffect, useRef } from "react";
import { CountUp, EASE, Reveal, RevealTitle, Spotlight, reducedMotion } from "@/components/v3/motion";
import type { FundContent, FundData } from "@/lib/data/types";
import type { FundSpec } from "@/config/funds";
import { T, tr } from "./copy";
import { dateLabel, fmt, money, monthLabel, type Lang } from "./lib/format.ts";
import { headlineClass, isAnnualized, riskIndex, RISK_LEVELS } from "./lib/data.ts";

export function Hero({ spec, content, data, lang, sample }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; sample: boolean }) {
  const perf = data?.performance ?? null;
  const showPerf = !!perf && !content.hide?.performance;
  const si = showPerf ? perf!.trailing.fund.SI ?? null : null;
  const va = showPerf ? perf!.trailing.va?.SI ?? null : null;
  const basis = perf?.basis ?? spec.sources.basis;
  const gross = basis === "gross";
  const ann = si != null && isAnnualized("SI", perf?.firstMonth, perf?.asOf);
  const heroLabel = gross ? (ann ? T.hero.gross : T.hero.grossCum) : ann ? T.hero.net : T.hero.netCum;
  const cls = content.hide?.nav ? null : headlineClass(data?.nav?.classes, [content.headlineClass, spec.headlineClass]);
  const code = content.headlineClass || cls?.fundserv || spec.headlineClass;
  const risk = riskIndex(content.riskRating ?? spec.defaults.riskRating);
  const tagline = content.tagline ?? spec.defaults.tagline;
  const inception = perf?.firstMonth ?? null;

  const dir = cls?.changePct == null ? "flat" : cls.changePct > 0 ? "up" : cls.changePct < 0 ? "down" : "flat";

  return (
    <section className="screen dark center fx-hero" id="overview" data-section="overview" data-swap="" aria-labelledby="fx-name">
      <div className="orb a" aria-hidden="true" />
      <div className="orb b" aria-hidden="true" />
      <FundTrail />
      <Spotlight />
      <div className="wrap">
        <Reveal className="kicker" style={{ justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><span className="fx-fund-mark" />{tr(spec.vehicle === "fund" ? T.hero.vehicleFund : T.hero.vehicleStrategy, lang)}</span>
          {sample ? <span className="fx-sample" title={tr(T.sample.note, lang)}>{tr(T.sample.ribbon, lang)}</span> : null}
        </Reveal>
        <RevealTitle as="h1" text={tr(spec.name, lang).toLowerCase()} className="fx-name" step={90} />
        <span id="fx-name" className="sr-only">{tr(spec.name, lang)}</span>
        <Reveal as="p" className="lead" delay={300} self>{tr(tagline, lang)}</Reveal>

        <div className="fx-hero-grid">
          <div>
            {si != null ? (
              <Reveal kind="zoom" delay={200} self>
                <div>
                  <CountUp value={si} pct decimals={1} lang={lang} duration={1800} delay={250} className="fx-bigfig g-fund" />
                </div>
                <div className="fx-figlabel" data-testid="hero-figure-label">
                  {tr(heroLabel, lang)} · {tr(T.hero.since, lang)}
                  {perf?.asOf ? <> · {tr(T.hero.asOf, lang)} <b>{monthLabel(perf.asOf, lang)}</b></> : null}
                </div>
              </Reveal>
            ) : (
              <p className="fx-figlabel">{tr(T.misc.noData, lang)}</p>
            )}
          </div>
          <Reveal className="fx-side" delay={500}>
            {va != null ? (
              <div>
                <CountUp value={va} pct sign decimals={1} lang={lang} delay={700} className={`fig m ${va >= 0 ? "g-cyan" : "g-red"}`} />
                <div className="fx-figlabel">{tr(T.hero.va, lang)}{spec.benchmark ? <><br /><span style={{ fontSize: 12.5 }}>vs {tr(spec.benchmark, lang)}</span></> : null}</div>
              </div>
            ) : null}
            {cls && cls.nav != null ? (
              <div>
                <div className="fx-nav">
                  <span className="v" data-testid="hero-nav">{money(cls.nav, cls.currency, lang, 4)}</span>
                  {cls.changePct != null ? (
                    <span className={`fx-delta ${dir}`} aria-label={`${fmt(cls.changePct, { pct: true, decimals: 2, sign: true, lang })} ${tr(T.hero.day, lang)}`}>
                      {dir !== "flat" ? (
                        <svg viewBox="0 0 10 10" aria-hidden="true"><path d={dir === "up" ? "M5 1 9 8H1Z" : "M5 9 1 2H9Z"} fill="currentColor" /></svg>
                      ) : null}
                      {cls.change != null ? `${fmt(cls.change, { decimals: 4, sign: true, lang })} · ` : ""}{fmt(cls.changePct, { pct: true, decimals: 2, sign: true, lang })}
                    </span>
                  ) : null}
                </div>
                <div className="fx-figlabel">
                  {tr(T.hero.nav, lang)} · {tr(T.hero.class, lang)} <span className="code">{cls.display} ({cls.fundserv})</span>{cls.date ? <> · <b>{dateLabel(cls.date, lang)}</b></> : null}
                </div>
              </div>
            ) : null}
            <div><span className={`fx-basis${gross ? " gross" : ""}`} data-testid="basis">{tr(gross ? T.hero.basisGross : T.hero.basisNet, lang)}</span></div>
          </Reveal>
        </div>

        <Reveal className="fx-chips" kind="pop" stagger={70} delay={200}>
          <span className="fx-chip"><span className="k">{tr(T.facts.assetClass, lang)}</span>{tr(spec.assetClass, lang)}</span>
          <span className="fx-chip" aria-label={`${tr(T.hero.risk, lang)}: ${tr(T.hero.levels[risk], lang)}`}>
            <span className="k">{tr(T.hero.risk, lang)}</span>
            <span className="fx-risk" aria-hidden="true">
              <span className="steps">{RISK_LEVELS.map((_, i) => <i key={i} className={`${i <= risk ? "on" : ""}${i === risk ? " cur" : ""}`} style={i <= risk ? { opacity: 0.45 + 0.55 * ((i + 1) / (risk + 1)) } : undefined} />)}</span>
              {tr(T.hero.levels[risk], lang)}
            </span>
          </span>
          {inception ? <span className="fx-chip"><span className="k">{tr(T.hero.inception, lang)}</span>{monthLabel(inception, lang)}</span> : null}
          {code && spec.vehicle === "fund" ? <span className="fx-chip"><span className="k">{tr(T.hero.fundserv, lang)}</span><code>{code}</code></span> : null}
        </Reveal>

        {gross ? <Reveal as="p" className="fx-gross-note" self delay={400}>{tr(T.hero.grossNote, lang)}</Reveal> : null}
      </div>
    </section>
  );
}

/** The chapter light trail, drawn in the fund's own gradient. */
function FundTrail() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    const a = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 2600, delay: 300, easing: EASE, fill: "both" });
    return () => a.cancel();
  }, []);
  return (
    <svg className="fx-trail" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="fx-trail-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--fund-to)" stopOpacity="0" /><stop offset=".35" stopColor="var(--fund-to)" />
          <stop offset=".75" stopColor="var(--fund-from)" /><stop offset="1" stopColor="#ffffff" stopOpacity=".5" />
        </linearGradient>
        <filter id="fx-trail-f" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="9" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path ref={ref} d="M-40 660 C 260 640, 520 650, 720 610 C 930 566, 1060 520, 1320 430" fill="none" stroke="url(#fx-trail-g)" strokeWidth={5} strokeLinecap="round" filter="url(#fx-trail-f)" opacity=".85" />
    </svg>
  );
}
