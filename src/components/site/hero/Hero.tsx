"use client";
/**
 * Home hero (black screen): the living bond-universe canvas, "scientific investing" rising word by word in
 * the brand gradient, and a live ribbon of NAVs (headline class of each fund, daily change, as-of date)
 * read from the published data. The ribbon is not rendered at all when no NAV is published.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealTitle, onScrollFrame, reducedMotion } from "@/components/v3/motion";
import { formatDay, useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import type { FundCard } from "../home/data";
import { SampleChip } from "../ui";
import { createBondUniverse } from "./bond-universe";

function Universe() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const u = createBondUniverse(c, { still: reducedMotion(), onReady: () => setReady(true) });
    // scroll hand-off: as the hero leaves, the surface collapses into one glowing yield curve that the
    // next screen's light trail picks up
    const host = c.closest(".screen") as HTMLElement | null;
    const off = reducedMotion() || !host ? () => {} : onScrollFrame((vh) => {
      const r = host.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, -r.top / (r.height * 0.55)));
      u.setFlatten(k);
      host.style.setProperty("--flat", k.toFixed(3));
    });
    return () => { off(); u.destroy(); };
  }, []);
  return <canvas ref={ref} className={`hero-canvas ${ready ? "on" : ""}`} aria-hidden="true" />;
}

function navText(v: number, lang: "en" | "fr") {
  return v.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
function chgText(v: number, lang: "en" | "fr") {
  const x = v * 100;
  const s = Math.abs(x).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const zero = Number(Math.abs(x).toFixed(2)) === 0;
  return `${zero ? "" : x < 0 ? "−" : "+"}${s}${lang === "fr" ? " %" : "%"}`;
}

export function NavRibbon({ funds, asOf, sample }: { funds: FundCard[]; asOf: string | null; sample: boolean }) {
  const { locale, pick, t } = useTranslation();
  const items = funds.filter((f) => f.nav);
  if (!items.length) return null;
  const row = (dup: boolean) => (
    <div className="ribbon-row" aria-hidden={dup || undefined}>
      {items.map((f) => {
        const n = f.nav!;
        const c = n.changePct;
        return (
          <Link key={f.key} href={`/strategies/${f.key}`} className="rb" tabIndex={dup ? -1 : undefined}>
            <i className="rb-dot" style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />
            <b>{pick(f.short)}</b>
            <em>{n.code}</em>
            <span className="rb-v tabnum">{navText(n.nav, locale)}{n.currency && n.currency !== "CAD" ? ` ${n.currency}` : ""}</span>
            {c !== null ? <span className={`tabnum ${c > 0 ? "pos" : c < 0 ? "neg" : ""}`}>{chgText(c, locale)}</span> : null}
          </Link>
        );
      })}
      {asOf ? <span className="rb asof">{t("ui.navAsOf", { date: formatDay(asOf, locale) })}</span> : null}
    </div>
  );
  return (
    <div className="ribbon" role="region" aria-label={pick(HOME.hero.ribbon)} data-testid="nav-ribbon">
      <span className="live-dot" aria-hidden="true" />
      {sample ? <SampleChip /> : null}
      <div className="ribbon-view">
        <div className="ribbon-track">{row(false)}{row(true)}</div>
      </div>
    </div>
  );
}

export function Hero({ funds, navAsOf, sample }: { funds: FundCard[]; navAsOf: string | null; sample: boolean }) {
  const { pick } = useTranslation();
  const H = HOME.hero;
  const hasRibbon = funds.some((f) => f.nav);
  return (
    <section className={`screen dark hero ${hasRibbon ? "has-ribbon" : ""}`} data-swap="" aria-labelledby="hero-t">
      <Universe />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="wrap wide hero-in">
        <Reveal className="eyebrow" self delay={150}>{pick(H.eyebrow)}</Reveal>
        <RevealTitle as="h1" id="hero-t" text={pick(H.title)} className="display hero-t" gradient step={140} delay={250} />
        <Reveal as="p" className="lead hero-lead" self delay={700}>{pick(H.lead)}</Reveal>
        <Reveal className="hero-cta" delay={900} stagger={120}>
          <Link className="btn" href="/strategies">{pick(H.cta1)} <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="btn ghost" href="/approach">{pick(H.cta2)}</Link>
        </Reveal>
      </div>
      <NavRibbon funds={funds} asOf={navAsOf} sample={sample} />
      <div className="scroll-cue" aria-hidden="true"><span /></div>
    </section>
  );
}
