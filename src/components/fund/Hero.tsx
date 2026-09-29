"use client";
/**
 * Hero screen (black): fund name in its gradient, tagline, the since-inception return counting up,
 * value added vs benchmark, headline class NAV with its daily change, chips (vehicle, asset class,
 * risk meter, inception, FundServ) and the basis label (net / gross, with the managed-accounts note).
 */
import { useEffect, useMemo, useRef, type PointerEvent } from "react";
import { CountUp, EASE, Odometer, Reveal, RevealTitle, Spotlight, reducedMotion } from "@/components/v3/motion";
import type { FundContent, GrowthPoint } from "@/lib/data/types";
import type { PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { dateLabel, fmt, money, monthLabel, type Lang } from "./lib/format.ts";
import { headlineClass, isAnnualized, perfClassLabel, riskIndex, RISK_LEVELS, vaRounded, benchmarkLabel } from "./lib/data.ts";
import { monotonePath } from "./lib/scale.ts";

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

  const vaR = vaRounded(va, 1);
  const bench = benchmarkLabel(perf?.indexName, spec.benchmark, lang);
  const classLabel = perfClassLabel(perf, tr(T.hero.class, lang));
  const glow = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
  };
  const dir = cls?.changePct == null ? "flat" : cls.changePct > 0 ? "up" : cls.changePct < 0 ? "down" : "flat";

  return (
    <section className="screen dark center fx-hero" id="overview" data-section="overview" data-swap="" aria-labelledby="fx-name">
      <div className="orb a" aria-hidden="true" />
      <div className="orb b" aria-hidden="true" />
      <FundTrail growth={showPerf ? perf!.growth : null} />
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
                <div className="fx-bigwrap" onPointerMove={glow}>
                  <span className="fx-bigfig g-fund" data-testid="hero-figure"><Odometer value={si} pct decimals={1} lang={lang} duration={1800} delay={250} /></span>
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
            {va != null && vaR != null ? (
              <div data-testid="hero-va">
                {vaR === 0
                  ? <span className="fig s fx-inline">{tr(T.hero.inLine, lang)}</span>
                  : <CountUp value={vaR} pct sign decimals={1} lang={lang} delay={700} className={`fig m ${vaR > 0 ? "g-cyan" : "g-red"}`} />}
                <div className="fx-figlabel">{vaR === 0 ? null : tr(T.hero.va, lang)}{bench ? <>{vaR === 0 ? null : <br />}<span style={{ fontSize: 12.5 }}>vs {bench}</span></> : null}</div>
              </div>
            ) : null}
            {cls && cls.nav != null ? (
              <div>
                <div className="fx-nav">
                  <span className="v" data-testid="hero-nav">{money(cls.nav, cls.currency, lang, 4)}</span>
                  {cls.changePct == null ? <span className="fx-delta flat" aria-label={tr(T.hero.noChange, lang)}>—</span> : (
                    <span className={`fx-delta ${dir}`} aria-label={`${fmt(cls.changePct, { pct: true, decimals: 2, sign: true, lang })} ${tr(T.hero.day, lang)}`}>
                      {dir !== "flat" ? (
                        <svg viewBox="0 0 10 10" aria-hidden="true"><path d={dir === "up" ? "M5 1 9 8H1Z" : "M5 9 1 2H9Z"} fill="currentColor" /></svg>
                      ) : null}
                      {cls.change != null ? `${fmt(cls.change, { decimals: 4, sign: true, lang })} · ` : ""}{fmt(cls.changePct, { pct: true, decimals: 2, sign: true, lang })}
                    </span>
                  )}
                </div>
                <div className="fx-figlabel">
                  {tr(T.hero.nav, lang)} · {tr(T.hero.class, lang)} <span className="code">{cls.display} ({cls.fundserv})</span>{cls.date ? <> · <b>{dateLabel(cls.date, lang)}</b></> : null}
                </div>
              </div>
            ) : null}
            <div><span className={`fx-basis${gross ? " gross" : ""}`} data-testid="basis">{tr(gross ? T.hero.basisGross : T.hero.basisNet, lang)}{classLabel ? ` · ${classLabel}` : ""}</span></div>
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

/**
 * "Data as light": the glowing trail is the fund's own growth-of-10 000 $ path, normalised into the lower
 * third of the screen and drawn in while the since-inception figure counts up. Decorative path without data.
 */
export function trailPath(growth: GrowthPoint[] | null | undefined): string | null {
  const pts = (growth ?? []).filter((p) => typeof p.fund === "number" && Number.isFinite(p.fund));
  if (pts.length < 3) return null;
  const vs = pts.map((p) => p.fund);
  const lo = Math.min(...vs), hi = Math.max(...vs);
  const n = pts.length;
  // x from just off the left edge to just off the right; y in the bottom band, 640 (high) to 712 (low) of 720,
  // so it runs behind the (opaque, dark) chips and never through the figures
  const xy: [number, number][] = vs.map((v, i) => [-30 + (i / (n - 1)) * 1340, 712 - (hi === lo ? 0.5 : (v - lo) / (hi - lo)) * 72]);
  return monotonePath(xy);
}

function FundTrail({ growth }: { growth: GrowthPoint[] | null }) {
  const ref = useRef<SVGPathElement>(null);
  const d = useMemo(() => trailPath(growth), [growth]);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    const a = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: d ? 1900 : 2600, delay: d ? 250 : 300, easing: EASE, fill: "both" });
    return () => a.cancel();
  }, [d]);
  return (
    <svg className="fx-trail" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true" data-growth={d ? "" : undefined}>
      <defs>
        <linearGradient id="fx-trail-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--fund-to)" stopOpacity="0" /><stop offset=".3" stopColor="var(--fund-to)" />
          <stop offset=".8" stopColor="var(--fund-from)" /><stop offset="1" stopColor="#ffffff" stopOpacity=".6" />
        </linearGradient>
        <filter id="fx-trail-f" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="9" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path ref={ref} d={d ?? "M-40 690 C 260 676, 520 684, 720 660 C 930 634, 1060 606, 1320 560"} fill="none" stroke="url(#fx-trail-g)" strokeWidth={d ? 4 : 5}
        strokeLinecap="round" strokeLinejoin="round" filter="url(#fx-trail-f)" opacity=".85" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
