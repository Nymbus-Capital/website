"use client";
/**
 * Overview tab: objective (admin) or what the fund does, investment approach, compact returns table, fund facts,
 * fees and expenses, series and FundServ codes, investment team.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/v3/motion";
import type { FundContent } from "@/lib/data/types";
import { team } from "@/data/team";
import { FUND_INCEPTION } from "@/content/disclaimers";
import type { PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { FUND_TEXTS, T, tr } from "./copy";
import { Block } from "./Block";
import { bigMoney, dateLabel, fmt, money, monthLabel, type Lang } from "./lib/format.ts";
import { benchmarkLabel, headlineClass, initials, navDirection, perfClassLabel, resolveManagers, riskIndex, sortedClasses, trailingRows } from "./lib/data.ts";

interface Props { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang }

const P = (v: number | null | undefined, lang: Lang, sign = false) => (v == null ? "—" : fmt(v, { pct: true, decimals: 2, sign, lang }));

export function Overview({ spec, content, data, lang }: Props) {
  const texts = FUND_TEXTS[spec.key];
  const isFund = spec.vehicle === "fund";
  const perf = content.hide?.performance ? null : data?.performance ?? null;
  const rows = trailingRows(perf);
  const hasIndex = rows.some((r) => r.index != null);
  const hasVa = rows.some((r) => r.va != null);
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const cl = perfClassLabel(perf, tr(T.nav.series, lang));
  const fundWord = tr(isFund ? T.perf.fund : T.perf.strategy, lang);

  return (
    <div className="container fp">
      <div className="ov-grid">
        <div className="ov-main">
          <Block title={tr(content.objective ? T.overview.objective : isFund ? T.overview.whatFund : T.overview.whatStrategy, lang)} card={false} testId="objective">
            <p className="fb-text lg">{tr(content.objective ?? texts.summary, lang)}</p>
          </Block>
          <Block title={tr(T.overview.approach, lang)} card={false}>
            <p className="fb-text">{tr(texts.approach, lang)}</p>
          </Block>
          <Block title={tr(T.overview.returns, lang)} testId="overview-returns"
            aside={rows.length ? <a className="link" href="#performance">{tr(T.overview.returnsMore, lang)} <ArrowRight aria-hidden="true" /></a> : null}
            lead={rows.length && perf ? <>{cl ? `${cl}, ` : ""}{tr(gross ? T.disclosure.basisGross : T.disclosure.basisNet, lang)} · {tr(T.perf.asOf, lang)} {dateLabel(perf.asOf, lang, true)}</> : null}>
            {rows.length ? (
              <div className="scroll-x">
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
                        <td>{tr(T.perf.periodsLong[r.period], lang)}{r.annualized ? "*" : ""}</td>
                        <td className={r.fund < 0 ? "neg" : undefined}>{P(r.fund, lang)}</td>
                        {hasIndex ? <td>{P(r.index, lang)}</td> : null}
                        {hasVa ? <td className={r.va == null ? undefined : r.va < 0 ? "neg" : "pos"}>{P(r.va, lang, true)}</td> : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.some((r) => r.annualized) ? <p className="fine fb-foot">* {tr(T.badges.annualized, lang)}</p> : null}
              </div>
            ) : <p className="notice">{tr(T.perf.none, lang)}</p>}
          </Block>
        </div>
        <aside className="ov-side">
          <FactsCard spec={spec} content={content} data={data} lang={lang} />
          <FeesCard spec={spec} content={content} lang={lang} />
        </aside>
      </div>
      {isFund ? <SeriesTable spec={spec} content={content} data={data} lang={lang} /> : null}
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
    [tr(T.facts.basis, lang), perf ? tr(gross ? T.nav.grossBasis : T.disclosure.basisNet, lang) : null],
    [tr(T.facts.distributions, lang), content.distributions ? firstSentence(tr(content.distributions, lang)) : null],
    [tr(T.facts.minInvestment, lang), content.minInvestment],
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

function FeesCard({ spec, content, lang }: { spec: FundSpec; content: FundContent; lang: Lang }) {
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
      <p className={shown.length ? "fine fb-foot" : "fb-text sm"}>{tr(spec.vehicle === "fund" ? T.overview.feesNone : T.overview.feesNoneStrategy, lang)}</p>
    </Block>
  );
}

/* ------------------------------------------------------------------ series */

function SeriesTable({ spec, content, data, lang }: Props) {
  const all = content.hide?.nav ? [] : data?.nav?.classes ?? [];
  if (!all.length) return null;
  const hl = headlineClass(all, [content.headlineClass, spec.headlineClass]);
  const classes = sortedClasses(all, hl?.fundserv);
  return (
    <Block title={tr(T.overview.series, lang)} className="ov-wide" testId="series">
      <div className="scroll-x">
        <table className="table ft-table ft-classes" data-testid="classes-table">
          <caption className="sr-only">{tr(T.overview.series, lang)}</caption>
          <thead>
            <tr>
              <th scope="col">{tr(T.facts.series, lang)}</th><th scope="col">{tr(T.facts.fundserv, lang)}</th><th scope="col">{tr(T.facts.currency, lang)}</th>
              <th scope="col">{tr(T.facts.nav, lang)}</th><th scope="col">{tr(T.facts.change, lang)}</th><th scope="col">{tr(T.facts.date, lang)}</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => {
              const isHl = hl?.fundserv === c.fundserv;
              const dir = navDirection(c.changePct);
              return (
                <tr key={c.fundserv} className={isHl ? "hl" : undefined}>
                  <td data-label={tr(T.facts.series, lang)}>{isHl ? <span className="fx-hl-dot" aria-hidden="true" /> : null}{c.display}{isHl ? <span className="sr-only"> ({tr(T.facts.headline, lang)})</span> : null}</td>
                  <td data-label={tr(T.facts.fundserv, lang)}><code>{c.fundserv}</code></td>
                  <td data-label={tr(T.facts.currency, lang)}>{c.currency}</td>
                  <td data-label={tr(T.facts.nav, lang)}>{c.nav != null ? money(c.nav, c.currency, lang, 4) : "—"}</td>
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

function TeamBlock({ spec, content, lang }: { spec: FundSpec; content: FundContent; lang: Lang }) {
  const people = resolveManagers(content.managers, team);
  const isFund = spec.vehicle === "fund";
  return (
    <Block title={tr(T.overview.team, lang)} className="ov-wide" testId="team"
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
      ) : <p className="fb-text sm">{tr(isFund ? T.overview.teamGeneric : T.overview.teamGenericStrategy, lang)}</p>}
    </Block>
  );
}
