"use client";
/**
 * The four strategies as big gradient figures, each in its fund colour: since-inception return (net for the
 * funds, gross for the GMV strategy, as published), as-of month, risk level and fund code. The card tilts
 * towards the pointer and glows in its colour. A fund without published figures shows "figures coming soon".
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Odometer, Reveal, useTilt } from "@/components/v3/motion";
import { formatMonth, useTranslation } from "@/lib/i18n";
import { HOME, RISK } from "../copy";
import type { FundCard } from "./data";
import { SampleChip, Soon } from "../ui";

const LEVELS = ["low", "low-medium", "medium", "medium-high", "high"] as const;

export function RiskMeter({ risk, label }: { risk: FundCard["risk"]; label: string }) {
  const idx = LEVELS.indexOf(risk);
  return (
    <span className="risk" role="img" aria-label={label}>
      {LEVELS.map((l, i) => <i key={l} className={i <= idx ? "on" : ""} />)}
    </span>
  );
}

export function StrategyCard({ f, sample, index }: { f: FundCard; sample: boolean; index: number }) {
  const { locale, pick } = useTranslation();
  const S = HOME.strategies;
  const tilt = useTilt<HTMLAnchorElement>(7);
  const style = { "--fund-from": f.color.from, "--fund-to": f.color.to, "--fund": f.color.solid } as CSSProperties;
  const label = f.basis === "gross" ? (f.siAnnualized ? S.gross : S.grossCum) : f.siAnnualized ? S.net : S.netCum;
  const riskLabel = `${pick(S.risk)}: ${pick(RISK[f.risk])}`;
  return (
    <Link ref={tilt} href={`/strategies/${f.key}`} className="strat" style={style} data-testid={`strategy-${f.key}`}>
      <span className="strat-glow" aria-hidden="true" />
      <span className="strat-top">
        <span className="strat-no" aria-hidden="true">0{index + 1}</span>
        <span className="pills">
          {sample && f.si !== null ? <SampleChip /> : null}
          <span className="pill">{f.vehicle === "fund" ? pick(S.fund) : pick(S.sma)}</span>
        </span>
      </span>
      <span className="strat-name">{pick(f.short)}</span>
      <span className="strat-class small">{pick(f.assetClass)}</span>
      <span className="strat-fig">
        {f.si !== null ? (
          <>
            <span className="fig l g-fund"><Odometer value={f.si} pct sign decimals={1} lang={locale} /></span>
            <span className="fig-label">{pick(label)} · {pick(S.since)}</span>
            {f.asOf ? <span className="small strat-asof">{formatMonth(f.asOf, locale)}</span> : null}
          </>
        ) : (
          <Soon />
        )}
      </span>
      <span className="strat-meta">
        <span><span className="small">{pick(S.risk)}</span><RiskMeter risk={f.risk} label={riskLabel} /><b>{pick(RISK[f.risk])}</b></span>
        {f.code ? <span><span className="small">{pick(S.code)}</span><b className="tabnum code">{f.code}</b></span> : null}
      </span>
      <span className="strat-go">{pick(S.view)} <ArrowUpRight size={16} aria-hidden="true" /></span>
    </Link>
  );
}

export function StrategyGrid({ funds, sample }: { funds: FundCard[]; sample: boolean }) {
  const { pick } = useTranslation();
  const S = HOME.strategies;
  const anyGross = funds.some((f) => f.si !== null && f.basis === "gross");
  const anyFig = funds.some((f) => f.si !== null);
  return (
    <>
      <Reveal className="strat-grid" kind="pop" stagger={120}>
        {funds.map((f, i) => <StrategyCard key={f.key} f={f} sample={sample} index={i} />)}
      </Reveal>
      {anyFig ? <p className="foot fine">{pick(S.perfNote)}{anyGross ? ` ${pick(S.grossNote)}` : ""}</p> : null}
    </>
  );
}

export function Strategies({ funds, sample }: { funds: FundCard[]; sample: boolean }) {
  const { pick } = useTranslation();
  const S = HOME.strategies;
  return (
    <section className="screen glow strategies-s" data-swap="" aria-labelledby="strat-t">
      <div className="wrap wide">
        <header className="head center-head">
          <Reveal className="eyebrow" self>{pick(S.eyebrow)}</Reveal>
          <h2 id="strat-t" className="sr-only">{pick(S.title)} {pick(S.accent)}</h2>
        </header>
        <StrategyGrid funds={funds} sample={sample} />
        <Reveal className="center-row" self delay={200}>
          <Link className="btn ghost" href="/strategies">{pick(S.all)} <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}
