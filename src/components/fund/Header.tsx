"use client";
/**
 * Fund header band: breadcrumb, asset class, H1, description, chips (vehicle, risk), actions, and the NAV card
 * (headline series NAV with a series selector, daily change, valuation date, key facts). Strategies without a
 * fund vehicle (managed accounts, no NAV) get a strategy card instead. Behind it, a light trail drawn from the
 * fund's own growth of $10,000. Then the row of return badges.
 */
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { CalendarDays, Download, FileText } from "lucide-react";
import { CountUp, EASE, Odometer, Reveal, RevealTitle, reducedMotion, useTilt } from "@/components/v3/motion";
import { ButtonLink, Crumbs } from "@/components/site/kit";
import type { FundContent, GrowthPoint } from "@/lib/data/types";
import { FUND_INCEPTION } from "@/content/disclaimers";
import type { FundDoc, PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { ClassTypeBadge, ClassTypeNote } from "./ClassBadge";
import type { ClassCtx } from "./lib/select.ts";
import { T, tr } from "./copy";
import { bigMoney, dateLabel, fmt, monthLabel, moneyParts, NAV_DECIMALS, type Lang } from "./lib/format.ts";
import { benchmarkLabel, groupDocuments, isAnnualized, navDirection, perfClassLabel, returnBadges, riskIndex, RISK_LEVELS } from "./lib/data.ts";
import { monotonePath } from "./lib/scale.ts";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Props { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; sample: boolean; ctx: ClassCtx; docs?: FundDoc[] }

/** Header shortcuts to the documents most asked for (factsheet, fund facts, prospectus), when one is published. */
const QUICK_DOCS = ["factsheet", "fund-facts", "prospectus"] as const;
export function quickDocs(docs: FundDoc[] | undefined, lang: Lang): { type: (typeof QUICK_DOCS)[number]; doc: FundDoc }[] {
  const groups = groupDocuments((docs ?? []).map((d) => ({ ...d.meta, doc: d })), lang);
  return QUICK_DOCS.flatMap((type) => { const g = groups.find((x) => x.type === type); return g ? [{ type, doc: g.docs[0].doc }] : []; });
}

export function FundHeader({ spec, content, data, lang, sample, ctx, docs }: Props) {
  const risk = riskIndex(content.riskRating ?? spec.defaults.riskRating);
  const description = content.description ?? spec.defaults.description;
  const tagline = content.tagline ?? spec.defaults.tagline;
  const showPerf = !!data?.performance && !content.hide?.performance && !content.hide?.growth;
  const isFund = spec.vehicle === "fund";
  return (
    <header className="fh" data-trail-host="">
      <FundTrail growth={showPerf ? data!.performance!.growth : null} />
      <div className="container">
        <Crumbs items={[{ href: "/", label: tr(T.crumbs.home, lang) }, { href: "/strategies", label: tr(T.crumbs.strategies, lang) }, { label: tr(spec.short, lang) }]} />
        <div className="fh-grid">
          <div className="fh-main">
            <Reveal self>
              <p className="eyebrow fh-eyebrow"><span className="fh-mark" aria-hidden="true" />{tr(spec.assetClass, lang)}</p>
            </Reveal>
            <RevealTitle as="h1" text={tr(spec.name, lang)} className="h1 fh-title" step={60} />
            <Reveal self delay={160}><p className="fh-tagline">{tr(tagline, lang)}</p></Reveal>
            <Reveal self delay={240}><p className="lead fh-lead">{tr(description, lang)}</p></Reveal>
            <Reveal className="fh-chips" kind="pop" stagger={60} delay={300}>
              <span className="fx-chip fh-chip"><span className="fh-dot" aria-hidden="true" />{tr(isFund ? T.header.vehicleFund : T.header.vehicleStrategy, lang)}</span>
              <span className="fx-chip fh-chip" data-testid="risk-chip">
                <span className="fh-chip-k">{tr(T.header.risk, lang)}</span>
                <span className="fh-risk" aria-hidden="true">
                  {RISK_LEVELS.map((_, i) => <i key={i} className={i <= risk ? "on" : undefined} />)}
                </span>
                {tr(T.header.levels[risk], lang)}
              </span>
              {sample ? <span className="fx-chip fh-sample" title={tr(T.sample.note, lang)} data-testid="sample-chip">{tr(T.sample.ribbon, lang)}</span> : null}
            </Reveal>
            <Reveal self delay={420}>
              <div className="actions fh-actions">
                <ButtonLink href="/contact">{tr(T.header.contact, lang)}</ButtonLink>
                <a className="btn ghost" href="#documents"><FileText aria-hidden="true" />{tr(isFund ? T.header.documents : T.header.strategyDocuments, lang)}</a>
                {quickDocs(docs, lang).map(({ type, doc }) => (
                  <a key={type} className="btn ghost sm" href={doc.url} data-testid={`quick-doc-${type}`}><Download aria-hidden="true" />{tr(T.docs.single[type], lang)}</a>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal self kind="pop" delay={220} className="fh-aside">
            {isFund ? <NavCard spec={spec} content={content} data={data} lang={lang} ctx={ctx} /> : <StrategyCard spec={spec} content={content} data={data} lang={lang} ctx={ctx} />}
          </Reveal>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ NAV card */

function Fact({ k, children, testId }: { k: string; children: ReactNode; testId?: string }) {
  return <div className="nc-fact"><dt>{k}</dt><dd data-testid={testId}>{children}</dd></div>;
}

function NavCard({ spec, content, data, lang, ctx }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; ctx: ClassCtx }) {
  const tilt = useTilt<HTMLDivElement>(4);
  const opts = ctx.options;
  const sel = opts.find((o) => o.fundserv === ctx.selected) ?? opts[0] ?? null;
  const cls = sel?.nav ?? null;
  const perf = data?.performance ?? null;
  const launch = FUND_INCEPTION[spec.key]?.fundLaunch ?? null;
  const bench = benchmarkLabel(perf?.indexName, spec.benchmark, lang);
  const aum = content.hide?.aum === false ? data?.aum ?? null : null;
  const dir = navDirection(cls?.changePct);
  const parts = moneyParts(cls?.currency ?? "CAD", lang);
  const selector = sel ? (
    <>
      <div className="nc-series-row">
        {opts.length > 1 ? (
          <div className="nc-series" role="radiogroup" aria-label={tr(T.nav.chooseSeries, lang)}>
            {opts.map((c) => (
              <button key={c.fundserv} type="button" role="radio" aria-checked={c.fundserv === sel.fundserv} onClick={() => ctx.select(c.fundserv)}
                data-testid={`series-${c.fundserv}`}>
                <span className="sr-only">{tr(T.nav.series, lang)} </span>{c.display}
              </button>
            ))}
          </div>
        ) : null}
        <ClassTypeBadge type={sel.type} lang={lang} />
      </div>
      <ClassTypeNote type={sel.type} lang={lang} />
    </>
  ) : null;
  return (
    <div ref={tilt} className="navcard" data-testid="nav-card">
      <span className="nc-shine" aria-hidden="true" />
      <div className="nc-head">
        <span className="nc-title">{tr(T.nav.title, lang)}</span>
        {cls?.date ? <span className="nc-date"><span className="live-dot" aria-hidden="true" />{tr(T.nav.asOf, lang)} {dateLabel(cls.date, lang)}</span> : null}
      </div>
      {selector}
      {cls && cls.nav != null ? (
        <>
          <div className="nc-fig" data-testid="hero-nav" aria-live="polite">
            <Odometer key={`${cls.fundserv}-${lang}`} value={cls.nav} decimals={NAV_DECIMALS} prefix={parts.prefix} suffix={parts.suffix} lang={lang} duration={1300} />
          </div>
          <p className={`nc-change ${dir}`} data-testid="nav-change">
            {cls.changePct == null ? <span>{tr(T.nav.noChange, lang)}</span> : (
              <>
                {dir !== "flat" ? <svg viewBox="0 0 10 10" aria-hidden="true"><path d={dir === "up" ? "M5 1 9 8H1Z" : "M5 9 1 2H9Z"} fill="currentColor" /></svg> : null}
                <b>{cls.change != null ? `${fmt(cls.change, { decimals: 4, sign: true, lang })} (${fmt(cls.changePct, { pct: true, decimals: 2, sign: true, lang })})` : fmt(cls.changePct, { pct: true, decimals: 2, sign: true, lang })}</b>
                <span>{tr(T.nav.change, lang)}</span>
              </>
            )}
          </p>
          <dl className="nc-facts">
            <Fact k={tr(T.nav.series, lang)}>{cls.display}</Fact>
            <Fact k={tr(T.nav.fundserv, lang)} testId="nav-fundserv"><code>{cls.fundserv}</code></Fact>
            <Fact k={tr(T.nav.currency, lang)}>{cls.currency}</Fact>
            {launch ? <Fact k={tr(T.nav.fundLaunch, lang)}>{tr(launch, lang)}</Fact>
              : perf?.firstMonth ? <Fact k={tr(T.nav.trackRecord, lang)}>{monthLabel(perf.firstMonth, lang)}</Fact> : null}
            {content.mer ? <Fact k={tr(T.nav.mer, lang)}>{content.mer}</Fact> : content.managementFee ? <Fact k={tr(T.nav.managementFee, lang)}>{content.managementFee}</Fact> : null}
            {aum ? <Fact k={tr(T.nav.aum, lang)} testId="aum">{bigMoney(aum.cad, lang)}</Fact> : null}
            {bench ? <div className="nc-fact wide"><dt>{tr(T.nav.benchmark, lang)}</dt><dd>{bench}</dd></div> : null}
          </dl>
        </>
      ) : (
        <>
          <p className="nc-empty">{tr(T.nav.none, lang)}</p>
          <dl className="nc-facts">
            {sel ? <Fact k={tr(T.nav.fundserv, lang)} testId="nav-fundserv"><code>{sel.fundserv}</code></Fact> : null}
            {launch ? <Fact k={tr(T.nav.fundLaunch, lang)}>{tr(launch, lang)}</Fact> : perf?.firstMonth ? <Fact k={tr(T.nav.trackRecord, lang)}>{monthLabel(perf.firstMonth, lang)}</Fact> : null}
            {bench ? <div className="nc-fact wide"><dt>{tr(T.nav.benchmark, lang)}</dt><dd>{bench}</dd></div> : null}
          </dl>
        </>
      )}
    </div>
  );
}

/** Managed-accounts strategy: no NAV, gross figures only. */
function StrategyCard({ spec, content, data, lang, ctx }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; ctx: ClassCtx }) {
  const tilt = useTilt<HTMLDivElement>(4);
  const perf = content.hide?.performance ? null : data?.performance ?? null;
  const si = perf?.trailing.fund.SI ?? null;
  const ann = si != null && isAnnualized("SI", perf?.firstMonth, perf?.asOf);
  return (
    <div ref={tilt} className="navcard" data-testid="strategy-card">
      <span className="nc-shine" aria-hidden="true" />
      <div className="nc-head">
        <span className="nc-title">{tr(T.nav.strategyTitle, lang)}</span>
        {perf?.asOf ? <span className="nc-date"><CalendarDays aria-hidden="true" />{tr(T.nav.asOf, lang)} {dateLabel(perf.asOf, lang)}</span> : null}
      </div>
      {spec.variants?.length && ctx.variant ? (
        <div className="nc-variants" data-testid="variant-selector">
          <span className="nc-var-l" id="nc-var-l">{tr(T.variants.label, lang)}</span>
          <div className="nc-series" role="radiogroup" aria-labelledby="nc-var-l">
            {spec.variants.map((v) => (
              <button key={v.id} type="button" role="radio" aria-checked={v.id === ctx.variant} onClick={() => ctx.selectVariant(v.id)} data-testid={`variant-${v.id}`}>
                <span className="sr-only">{tr(T.variants.shown, lang)} </span>{tr(v.label, lang)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {si != null ? (
        <>
          <div className="nc-fig" data-testid="hero-figure"><Odometer value={si} pct decimals={1} lang={lang} duration={1500} /></div>
          <p className="nc-change flat"><span>{tr(ann ? T.nav.siGross : T.nav.siGrossCum, lang)}</span></p>
        </>
      ) : <p className="nc-empty">{tr(T.perf.none, lang)}</p>}
      <dl className="nc-facts">
        <Fact k={tr(T.nav.vehicle, lang)}>{tr(T.nav.vehicleAccounts, lang)}</Fact>
        <Fact k={tr(T.nav.basis, lang)}>{tr(T.nav.grossBasis, lang)}</Fact>
        {perf?.firstMonth ? <Fact k={tr(T.nav.trackRecord, lang)}>{monthLabel(perf.firstMonth, lang)}</Fact> : null}
        <Fact k={tr(T.header.risk, lang)}>{tr(T.header.levels[riskIndex(content.riskRating ?? spec.defaults.riskRating)], lang)}</Fact>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ return badges */

export function ReturnStrip({ spec, content, data, lang, ctx }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; ctx: ClassCtx }) {
  const perf = data?.performance ?? null;
  const badges = returnBadges(perf, !!content.hide?.performance);
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const cl = perfClassLabel(perf, tr(T.nav.series, lang));
  const basis = tr(gross ? T.disclosure.basisGross : T.disclosure.basisNet, lang);
  const sel = ctx.options.find((o) => o.fundserv === ctx.selected) ?? null;
  const variant = spec.variants?.find((v) => v.id === ctx.variant) ?? null;
  const soonText = sel ? tr(T.classes.soon, lang).replace("{x}", sel.display) : tr(T.badges.soon, lang);
  return (
    <section className="fr" aria-labelledby="fr-title" data-testid="return-strip">
      <div className="container">
        <div className="fr-card">
          <div className="fr-head">
            <h2 id="fr-title" className="fr-title">{tr(T.badges.title, lang)}</h2>
            {badges.length && perf ? (
              <p className="fr-sub" data-testid="basis">
                {variant ? <>{tr(T.variants.label, lang)} {tr(variant.label, lang)}, </> : null}
                {cl ? <>{cl}, {basis}</> : cap(basis)} · {tr(T.perf.asOf, lang)} {dateLabel(perf.asOf, lang, true)}
                {sel && !variant ? <> <ClassTypeBadge type={sel.type} lang={lang} testId="returns-class-type" /></> : null}
              </p>
            ) : null}
          </div>
          {badges.length ? (
            <>
              <Reveal className="fr-badges" kind="pop" stagger={45} role="list">
                {badges.map((b) => (
                  <div key={b.period} className="fr-badge" role="listitem" data-testid={`badge-${b.period}`}>
                    <span className="fr-p" title={tr(T.perf.periodsLong[b.period], lang)}>
                      <span aria-hidden="true">{tr(T.perf.periods[b.period], lang)}</span>
                      <span className="sr-only">{tr(T.perf.periodsLong[b.period], lang)}</span>
                      {b.annualized ? <sup aria-hidden="true">*</sup> : null}
                    </span>
                    <CountUp value={b.value} pct sign decimals={2} lang={lang} className={`fr-v ${b.value < 0 ? "neg" : "pos"}`} />
                  </div>
                ))}
              </Reveal>
              {badges.some((b) => b.annualized) ? <p className="fr-note">* {tr(T.badges.annualized, lang)}</p> : null}
              {perf?.shortRecord && perf.firstMonth ? <p className="fr-note" data-testid="since-class-inception">{tr(T.classes.since, lang).replace("{date}", monthLabel(perf.firstMonth, lang))}</p> : null}
            </>
          ) : (
            <p className="notice fr-soon" data-testid="figures-soon">{ctx.returnsSoon ? soonText : tr(T.badges.soon, lang)}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ light trail */

/**
 * "Data as light": the glowing line behind the header is the fund's own growth of $10,000, normalised into the
 * lower part of the band. Decorative path when there is no data.
 */
export function trailPath(growth: GrowthPoint[] | null | undefined): string | null {
  const pts = (growth ?? []).filter((p) => typeof p.fund === "number" && Number.isFinite(p.fund));
  if (pts.length < 3) return null;
  const vs = pts.map((p) => p.fund);
  const lo = Math.min(...vs), hi = Math.max(...vs);
  const n = pts.length;
  const xy: [number, number][] = vs.map((v, i) => [-30 + (i / (n - 1)) * 1340, 690 - (hi === lo ? 0.5 : (v - lo) / (hi - lo)) * 250]);
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
    const a = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 2400, delay: 250, easing: EASE, fill: "both" });
    return () => a.cancel();
  }, [d]);
  return (
    <svg className="fh-trail" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true" data-growth={d ? "" : undefined}>
      <defs>
        <linearGradient id="fh-trail-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--fund-to)" stopOpacity="0" /><stop offset=".35" stopColor="var(--fund-to)" stopOpacity=".7" />
          <stop offset=".85" stopColor="var(--fund-from)" /><stop offset="1" stopColor="var(--fund-from)" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id="fh-trail-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--fund-from)" stopOpacity=".16" /><stop offset="1" stopColor="var(--fund-from)" stopOpacity="0" />
        </linearGradient>
        <filter id="fh-trail-f" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g className="fh-grid-lines">
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * 128} y1="0" x2={(i + 1) * 128} y2="720" />)}
        {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="0" y1={120 + i * 130} x2="1280" y2={120 + i * 130} />)}
      </g>
      {d ? <path d={`${d}L1310,720L-30,720Z`} fill="url(#fh-trail-a)" className="fh-trail-area" /> : null}
      <path ref={ref} d={d ?? "M-40 660 C 260 646, 520 654, 720 630 C 930 604, 1060 560, 1320 500"} fill="none" stroke="url(#fh-trail-g)" strokeWidth={3}
        strokeLinecap="round" strokeLinejoin="round" filter="url(#fh-trail-f)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
