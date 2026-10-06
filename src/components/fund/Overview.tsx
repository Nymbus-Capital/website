"use client";
/**
 * Overview tab: objective (admin) or what the fund does, investment approach, compact returns table, fund facts,
 * fees and expenses, series and FundServ codes, investment team.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/v3/motion";
import { Bullets } from "@/components/site/kit";
import type { FundContent } from "@/lib/data/types";
import { team } from "@/data/team";
import { FUND_INCEPTION } from "@/content/disclaimers";
import type { PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { FUND_TEXTS, T } from "./copy";
import { Block } from "./Block";
import { bigMoney, dateLabel, fmt, money, monthLabel, NAV_DECIMALS } from "./lib/format.ts";
import { benchmarkLabel, initials, navDirection, perfClassLabel, resolveManagers, riskIndex, sortedClasses, trailingRows } from "./lib/data.ts";
import { classInfoOf, classType, defaultClassCode, type ClassCtx } from "./lib/select.ts";
import { noFiguresText, periodLong } from "./lib/notice.ts";
import { ClassTypeBadge } from "./ClassBadge";
import { cifscCategory, rankingsToShow } from "./lib/rankings.ts";
import type { BrandAssets } from "@/lib/data/brand-assets";
import { MorningstarRatingBlock } from "./Morningstar";
import { RK } from "./rankings-copy";
import { tr, type Locale } from "@/lib/i18n/config";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Props { spec: FundSpec; content: FundContent; data: FundData | null; lang: Locale; ctx?: ClassCtx; brand?: BrandAssets }

const P = (v: number | null | undefined, lang: Locale, sign = false) => (v == null ? "—" : fmt(v, { pct: true, decimals: 2, sign, lang }));

export function Overview({ spec, content, data, lang, ctx, brand }: Props) {
  const texts = FUND_TEXTS[spec.key];
  const isFund = spec.vehicle === "fund";
  const perf = content.hide?.performance ? null : data?.performance ?? null;
  const rows = trailingRows(perf);
  const hasIndex = rows.some((r) => r.index != null);
  const hasVa = rows.some((r) => r.va != null);
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const cl = perfClassLabel(perf, tr(T.nav.series, lang));
  const fundWord = tr(isFund ? T.perf.fund : T.perf.strategy, lang);
  const soon = noFiguresText(ctx, lang, T.perf.none);
  const variant = spec.variants?.find((x) => x.id === ctx?.variant) ?? null;
  // Morningstar rating of the fund, prominently on the overview (bond funds); the server removed a stale one
  const ms = isFund ? rankingsToShow(content, spec.classes)?.morningstar ?? null : null;

  return (
    <div className="container fp">
      <div className="fxov-grid">
        <div className="fxov-main">
          <Block title={tr(content.objective ? T.overview.objective : isFund ? T.overview.whatFund : T.overview.whatStrategy, lang)} card={false} testId="objective">
            <p className="fxb-text lg">{tr(content.objective ?? texts.summary, lang)}</p>
          </Block>
          <Block title={tr(T.overview.approach, lang)} card={false} testId="fund-focus">
            <Bullets items={texts.focus.map((b) => tr(b, lang))} />
            {texts.note ? <p className="fxb-text fxb-risk" data-testid="fund-risk-note">{tr(texts.note, lang)}</p> : null}
          </Block>
          <Block title={tr(T.overview.returns, lang)} testId="overview-returns"
            aside={rows.length ? <a className="link" href="#performance">{tr(T.overview.returnsMore, lang)} <ArrowRight aria-hidden="true" /></a> : null}
            lead={rows.length && perf ? <>{variant ? <><span data-testid="overview-variant">{tr(variant.name, lang)}</span>, </> : null}{cl ? `${cl}, ${tr(gross ? T.disclosure.basisGross : T.disclosure.basisNet, lang)}` : cap(tr(gross ? T.disclosure.basisGross : T.disclosure.basisNet, lang))} · {tr(T.perf.asOf, lang)} {dateLabel(perf.asOf, lang, true)}</> : null}>
            {rows.length ? (
              <div className="fx-scroll">
                <table className="table ft-table">
                  <caption className="sr-only">{tr(T.overview.returns, lang)}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{tr(T.perf.period, lang)}</th>
                      <th scope="col">{fundWord}</th>
                      {hasIndex ? <th scope="col">{tr(T.perf.index, lang)}</th> : null}
                      {hasVa ? <th scope="col">{tr(T.perf.va, lang)}</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.period} className={r.period === "SI" ? "hl" : undefined}>
                        <td><span className="fx-long">{periodLong(r.period, perf, lang, !!spec.classes?.length)}</span><span className="fx-short" aria-hidden="true">{tr(T.perf.periods[r.period], lang)}</span>{r.annualized ? "*" : ""}</td>
                        <td className={r.fund != null && r.fund < 0 ? "neg" : undefined}>{P(r.fund, lang)}</td>
                        {hasIndex ? <td>{P(r.index, lang)}</td> : null}
                        {hasVa ? <td className={r.va == null ? undefined : r.va < 0 ? "neg" : "pos"}>{P(r.va, lang, true)}</td> : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.some((r) => r.annualized) ? <p className="fine fxb-foot">* {tr(T.badges.annualized, lang)}</p> : null}
                {rows.some((r) => r.fund == null) ? <p className="fine fxb-foot" data-testid="overview-withheld-note">{tr(T.classes.withheld, lang)}</p> : null}
                {perf?.shortRecord && perf.firstMonth ? <p className="fine fxb-foot">{tr(T.classes.since, lang).replace("{date}", dateLabel(perf.firstMonth, lang, true))}</p> : null}
              </div>
            ) : <p className="notice" data-testid="overview-soon">{soon}</p>}
          </Block>
        </div>
        <aside className="fxov-side">
          {ms ? (
            <Block title={tr(RK.ms.title, lang)} testId="overview-morningstar" className="fxov-ms"
              aside={<a className="link" href="#awards">{tr(T.tabs.awards, lang)} <ArrowRight aria-hidden="true" /></a>}>
              <MorningstarRatingBlock m={ms} brand={brand} lang={lang} variant="overview" testId="overview-morningstar-rating" />
            </Block>
          ) : null}
          <FactsCard spec={spec} content={content} data={data} lang={lang} />
          <FeesCard spec={spec} content={content} lang={lang} />
        </aside>
      </div>
      {isFund ? <SeriesTable spec={spec} content={content} data={data} lang={lang} ctx={ctx} /> : null}
      <TeamBlock spec={spec} content={content} lang={lang} />
    </div>
  );
}

/* ------------------------------------------------------------------ facts */

function FactsCard({ spec, content, data, lang }: Props) {
  const isFund = spec.vehicle === "fund";
  const perf = data?.performance ?? null;
  const classes = content.hide?.nav ? [] : data?.nav?.classes ?? [];
  const currencies = [...new Set(classes.map((c) => c.currency))];
  const launch = FUND_INCEPTION[spec.key]?.fundLaunch ?? null;
  const aum = content.hide?.aum === false ? data?.aum ?? null : null;
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const rows: [string, ReactNode | null | undefined][] = [
    [tr(isFund ? T.facts.legalName : T.facts.strategyName, lang), tr(spec.name, lang)],
    [tr(T.facts.vehicle, lang), tr(isFund ? T.header.vehicleFund : T.nav.vehicleAccounts, lang)],
    [tr(T.facts.assetClass, lang), tr(spec.assetClass, lang)],
    [tr(T.facts.benchmark, lang), benchmarkLabel(perf?.indexName, spec.benchmark, lang)],
    [tr(T.facts.fundLaunch, lang), launch ? tr(launch, lang) : null],
    [tr(T.facts.trackRecord, lang), perf?.firstMonth ? monthLabel(perf.firstMonth, lang) : null],
    [tr(T.facts.currency, lang), currencies.length ? currencies.join(", ") : null],
    [tr(T.facts.series, lang), classes.length ? sortedClasses(classes, null).map((c) => c.display).join(", ") : null],
    [tr(T.facts.risk, lang), tr(T.header.levels[riskIndex(content.riskRating ?? spec.defaults.riskRating)], lang)],
    [tr(T.facts.basis, lang), perf ? tr(gross ? T.nav.grossBasis : T.nav.netBasis, lang) : null],
    [tr(T.facts.distributions, lang), content.distributions ? firstSentence(tr(content.distributions, lang)) : null],
    [tr(T.facts.minInvestment, lang), content.minInvestment],
    [tr(T.facts.minSubsequent, lang), content.minSubsequent],
    [tr(T.facts.rsp, lang), content.rspEligible ? tr(content.rspEligible === "yes" ? T.facts.yes : T.facts.no, lang) : null],
    [tr(T.facts.liquidity, lang), content.liquidity && (content.liquidity.en || content.liquidity.fr) ? tr(content.liquidity, lang) : null],
    [tr(T.facts.cifsc, lang), cifscCategory(content, lang, spec.classes)],
    [tr(T.facts.managers, lang), resolveManagers(content.managers, team).map((m) => m.name).join(", ") || null],
    [tr(T.facts.aum, lang), aum ? `${bigMoney(aum.cad, lang)} (${dateLabel(aum.asOf, lang)})` : null],
  ];
  return (
    <Block title={tr(isFund ? T.overview.facts : T.overview.strategyFacts, lang)} testId="fund-facts">
      <dl className="fdl">
        {rows.filter(([, v]) => v != null && v !== "").map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </Block>
  );
}

/** The frequency sentence of an admin distribution text ("Monthly. Distributions are…" → "Monthly."). */
function firstSentence(s: string): string {
  const m = /^(.{1,60}?[.;])(\s|$)/.exec(s.trim());
  return m ? m[1].replace(/[.;]$/, "") : s.length > 60 ? `${s.slice(0, 57)}…` : s;
}

function FeesCard({ spec, content, lang }: { spec: FundSpec; content: FundContent; lang: Locale }) {
  const rows: [string, string | undefined][] = [
    [tr(T.facts.managementFee, lang), content.managementFee],
    [tr(T.facts.mer, lang), content.mer],
    [tr(T.facts.performanceFee, lang), content.performanceFee],
  ];
  const shown = rows.filter(([, v]) => v && v.trim());
  return (
    <Block title={tr(T.overview.fees, lang)} testId="fees">
      {shown.length ? (
        <dl className="fdl">{shown.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      ) : null}
      <p className={shown.length ? "fine fxb-foot" : "fxb-text sm"}>{tr(spec.vehicle === "fund" ? T.overview.feesNone : T.overview.feesNoneStrategy, lang)}</p>
    </Block>
  );
}

/* ------------------------------------------------------------------ series */

function SeriesTable({ spec, content, data, lang, ctx }: Props) {
  const all = content.hide?.nav ? [] : data?.nav?.classes ?? [];
  if (!all.length) return null;
  const hlCode = ctx?.selected ?? defaultClassCode(data, spec, content);
  const hl = all.find((c) => c.fundserv.toUpperCase() === (hlCode ?? "").toUpperCase()) ?? null;
  const classes = sortedClasses(all, hl?.fundserv);
  const types = new Map(classes.map((c) => [c.fundserv, classType(c.fundserv, spec, content)] as const));
  const showType = [...types.values()].some((t) => t !== "none");
  const inception = (code: string): string | null => classInfoOf(data, code)?.inception ?? null;
  const showInception = classes.some((c) => inception(c.fundserv));
  return (
    <Block title={tr(T.overview.series, lang)} className="fxov-wide" testId="series">
      <div className="fx-scroll">
        <table className="table ft-table ft-classes" data-testid="classes-table">
          <caption className="sr-only">{tr(T.overview.series, lang)}</caption>
          <thead>
            <tr>
              <th scope="col">{tr(T.facts.series, lang)}</th><th scope="col">{tr(T.facts.fundserv, lang)}</th>
              {showType ? <th scope="col">{tr(T.classes.type, lang)}</th> : null}
              <th scope="col">{tr(T.facts.currency, lang)}</th>
              {showInception ? <th scope="col">{tr(T.classes.launch, lang)}</th> : null}
              <th scope="col">{tr(T.facts.nav, lang)}</th><th scope="col">{tr(T.facts.change, lang)}</th><th scope="col">{tr(T.facts.date, lang)}</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => {
              const isHl = hl?.fundserv === c.fundserv;
              const dir = navDirection(c.changePct);
              const type = types.get(c.fundserv) ?? "none";
              return (
                <tr key={c.fundserv} className={isHl ? "hl" : undefined}>
                  <td data-label={tr(T.facts.series, lang)}>{isHl ? <span className="fx-hl-dot" aria-hidden="true" /> : null}{c.display}{isHl ? <span className="sr-only"> ({tr(T.facts.headline, lang)})</span> : null}</td>
                  <td data-label={tr(T.facts.fundserv, lang)}><code>{c.fundserv}</code></td>
                  {showType ? <td data-label={tr(T.classes.type, lang)} data-testid={`class-type-cell-${c.fundserv}`}>{type === "none" ? <span aria-hidden="true">—</span> : <ClassTypeBadge type={type} lang={lang} testId={`class-type-${c.fundserv}`} />}</td> : null}
                  <td data-label={tr(T.facts.currency, lang)}>{c.currency}</td>
                  {showInception ? <td data-label={tr(T.classes.launch, lang)} data-testid={`class-inception-${c.fundserv}`}>{inception(c.fundserv) ? dateLabel(inception(c.fundserv), lang) : "—"}</td> : null}
                  <td data-label={tr(T.facts.nav, lang)}>{c.nav != null ? money(c.nav, c.currency, lang, NAV_DECIMALS) : "—"}</td>
                  <td data-label={tr(T.facts.change, lang)} className={dir === "up" ? "pos" : dir === "down" ? "neg" : undefined}>
                    {c.changePct != null ? fmt(c.changePct, { pct: true, decimals: 2, sign: true, lang }) : "—"}
                  </td>
                  <td data-label={tr(T.facts.date, lang)}>{c.date ? dateLabel(c.date, lang) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ team */

function Avatar({ name, photo }: { name: string; photo?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="tm-av" aria-hidden="true">
      {photo && !broken ? <img src={photo} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} /> : <span>{initials(name)}</span>}
    </span>
  );
}

function TeamBlock({ spec, content, lang }: { spec: FundSpec; content: FundContent; lang: Locale }) {
  const people = resolveManagers(content.managers, team);
  const isFund = spec.vehicle === "fund";
  return (
    <Block title={tr(T.overview.team, lang)} className="fxov-wide" testId="team"
      aside={<Link className="link" href="/team">{tr(T.overview.teamLink, lang)} <ArrowRight aria-hidden="true" /></Link>}>
      {people.length ? (
        <Reveal className="tm-grid" kind="pop" stagger={70}>
          {people.map(({ name, member }) => (
            <Link key={name} href="/team" className="tm-card">
              <Avatar name={name} photo={member?.photo} />
              <span className="tm-txt">
                <span className="tm-name">{name}</span>
                <span className="tm-role">{member ? (lang === "fr" ? member.titleFr ?? member.title : member.title) : tr(T.overview.manager, lang)}</span>
              </span>
            </Link>
          ))}
        </Reveal>
      ) : <p className="fxb-text sm">{tr(isFund ? T.overview.teamGeneric : T.overview.teamGenericStrategy, lang)}</p>}
    </Block>
  );
}
