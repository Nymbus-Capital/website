"use client";
/**
 * Below the tabs: the fund's own section (text only), the call to action, the strip linking the other funds and,
 * last on the page, the disclosures (regulatory texts of src/content/disclaimers.ts).
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight, Ban, Blocks, CalendarClock, Gauge, Layers, Leaf, Repeat, ScanSearch, ShieldCheck, Sprout, Timer, TrendingUp, Umbrella, Waves,
} from "lucide-react";
import { ButtonLink, CardGrid, CtaBand, FeatureCard, Section, SectionHead } from "@/components/site/kit";
import { Reveal } from "@/components/v3/motion";
import { preInceptionNote } from "@/content/disclaimers";
import type { FundContent } from "@/lib/data/types";
import type { FundLink, PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { FUND_TEXTS, T, tr, type FeatureIcon } from "./copy";
import { dateLabel, monthLabel, type Lang, colon } from "./lib/format.ts";
import { perfClassLabel } from "./lib/data.ts";
import { provenanceLine } from "./lib/provenance.ts";

const ICONS: Record<FeatureIcon, typeof Leaf> = {
  calendar: CalendarClock, timer: Timer, scan: ScanSearch, shield: ShieldCheck, leaf: Leaf, filter: Ban, gauge: Gauge, sprout: Sprout,
  layers: Layers, trend: TrendingUp, repeat: Repeat, umbrella: Umbrella, stack: Blocks, waves: Waves,
};

export function FeatureSection({ spec, data, content, lang }: { spec: FundSpec; data: FundData | null; content: FundContent; lang: Lang }) {
  const f = FUND_TEXTS[spec.key].feature;
  const hasEsg = !content.hide?.esg && !!data?.esg.some((c) => c.fund != null);
  // long cards (disclosure text) would tower over the others: shown last, spanning the row (one long card)
  // or paired in their own row (two long cards)
  const all = f.cards.filter((c) => c.needs !== "esg" || hasEsg);
  const isLong = (c: (typeof all)[number]) => c.text.en.split(/\s+/).length > 22;
  const long = all.filter(isLong);
  const cards = [...all.filter((c) => !isLong(c)), ...long];
  const cols = long.length === 1 && cards.length === 4 ? 3 : long.length === 2 && cards.length === 4 ? 2 : cards.length >= 4 ? 4 : cards.length === 3 ? 3 : 2;
  return (
    <Section tone="tint" glow="bl" className="ff" labelledBy="ff-title">
      <SectionHead eyebrow={tr(f.eyebrow, lang)} title={tr(f.title, lang)} lead={tr(f.lead, lang)} id="ff-title" />
      <CardGrid cols={cols} className="ff-grid">
        {cards.map((c) => {
          const Icon = ICONS[c.icon];
          return <FeatureCard key={c.title.en} icon={<Icon />} title={tr(c.title, lang)} className={cols === 3 && isLong(c) ? "ff-wide" : undefined}><p>{tr(c.text, lang)}</p></FeatureCard>;
        })}
      </CardGrid>
      {f.link ? <Reveal self className="ff-link"><Link className="link" href={f.link.href}>{tr(f.link.label, lang)} <ArrowRight aria-hidden="true" /></Link></Reveal> : null}
    </Section>
  );
}

export function Disclosures({ spec, content, data, lang, sample, firmDisclaimer, ctx }: {
  spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; sample: boolean; firmDisclaimer?: { en: string; fr: string } | null;
  ctx?: { variant: string | null };
}) {
  // regulatory texts come from src/content/disclaimers.ts; the admin may override the firm text and, per fund,
  // the performance note (which then replaces the pre-launch boilerplate)
  const preLaunch = preInceptionNote(spec.key);
  const firm = firmDisclaimer && (firmDisclaimer.en.trim() || firmDisclaimer.fr.trim()) ? firmDisclaimer : T.disclosure.general;
  const perf = data?.performance;
  const hasBenchmark = !!(spec.benchmark || perf?.indexName);
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const cl = perfClassLabel(perf, tr(T.nav.series, lang));
  const variant = spec.variants?.find((x) => x.id === ctx?.variant) ?? null;
  const asOf = [
    perf?.asOf ? `${tr(T.disclosure.perfAsOf, lang)} ${monthLabel(perf.asOf, lang)}` : null,
    data?.nav?.asOf && !content.hide?.nav ? `${tr(T.disclosure.navAsOf, lang)} ${dateLabel(data.nav.asOf, lang)}` : null,
    data?.aum?.asOf && content.hide?.aum === false ? `${tr(T.disclosure.aumAsOf, lang)} ${dateLabel(data.aum.asOf, lang)}` : null,
  ].filter(Boolean);
  return (
    <section id="disclosure" className="section tight fxd" aria-labelledby="fxd-title">
      <div className="container">
        <div className="fxd-grid">
          <div>
            <p className="eyebrow"><span className="mark" aria-hidden="true" />{tr(T.disclosure.eyebrow, lang)}</p>
            <h2 id="fxd-title" className="h3">{tr(T.disclosure.title, lang)}</h2>
          </div>
          <div className="fxd-body">
            {sample ? <p className="fxd-sample">{tr(T.disclosure.sample, lang)}</p> : null}
            {content.performanceNote && (content.performanceNote.en || content.performanceNote.fr)
              ? <p className="fxd-note" data-testid="perf-note">{tr(content.performanceNote, lang)}</p>
              : preLaunch ? <p className="fxd-note" data-testid="perf-note">{tr(preLaunch, lang)}</p> : null}
            {cl || perf ? (
              <p className="fxd-note" data-testid="perf-class">
                {tr(T.perf.classShown, lang)}{colon(lang)}{variant ? <><span data-testid="disclosure-variant">{tr(variant.name, lang)}</span>, </> : null}{cl ? `${cl}, ` : ""}{tr(gross ? T.disclosure.basisGross : T.disclosure.basisNet, lang)}{perf?.indexName ? ` · ${tr(T.perf.index, lang)}${colon(lang)}${perf.indexName}` : ""}
              </p>
            ) : null}
            <p>{gross ? tr(T.disclosure.gross, lang) : tr(T.disclosure.net, lang)}</p>
            {spec.vehicle === "fund" ? <p>{tr(T.disclosure.standard, lang)}</p> : null}
            {hasBenchmark ? <p>{tr(T.disclosure.index, lang)}</p> : null}
            <p data-testid="firm-disclaimer">{tr(firm, lang)}</p>
            {hasBenchmark ? <p className="fine" data-testid="ftse-notice">{tr(T.disclosure.ftse, lang)}</p> : null}
            <p className="fxd-prov" data-testid="provenance">
              <span className="live-dot" aria-hidden="true" />
              <span>
                {provenanceLine(data, lang)}
                {asOf.length ? ` ${asOf.join(" · ")}.` : ""}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FundCta({ spec, lang }: { spec: FundSpec; lang: Lang }) {
  const isFund = spec.vehicle === "fund";
  return (
    <CtaBand title={tr(isFund ? T.cta.title : T.cta.titleStrategy, lang)} text={tr(isFund ? T.cta.text : T.cta.textStrategy, lang)}>
      <ButtonLink href="/contact">{tr(T.cta.contact, lang)}</ButtonLink>
      <ButtonLink href="/strategies" variant="ghost">{tr(T.cta.all, lang)}</ButtonLink>
    </CtaBand>
  );
}

export function OtherFunds({ current, funds, lang }: { current: string; funds: FundLink[]; lang: Lang }) {
  const others = funds.filter((f) => f.key !== current);
  if (!others.length) return null;
  return (
    <Section tone="tint" tight className="fo" labelledBy="fo-title">
      <SectionHead eyebrow={tr(T.others.eyebrow, lang)} title={tr(T.others.title, lang)} id="fo-title" as="h2" size="h3" />
      <Reveal className="fo-grid" kind="pop" stagger={80} data-testid="other-funds">
        {others.map((f) => (
          <Link key={f.key} href={`/strategies/${f.key}`} className="card ring fo-card"
            style={{ "--c-from": f.color.from, "--c-to": f.color.to, "--c": f.color.solid } as CSSProperties}>
            <span className="fo-bar" aria-hidden="true" />
            <span className="fo-class">{tr(f.assetClass, lang)}</span>
            <span className="fo-name">{tr(f.short, lang)}</span>
            <span className="fo-tag">{tr(f.tagline, lang)}</span>
            <span className="link fo-go">{tr(T.others.view, lang)}<span className="sr-only"> {tr(f.name, lang)}</span> <ArrowRight aria-hidden="true" /></span>
          </Link>
        ))}
      </Reveal>
    </Section>
  );
}
