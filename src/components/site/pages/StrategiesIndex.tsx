"use client";
/**
 * /strategies: our funds and strategies. Hero · filter (all / fixed income / alternatives) · one card per fund with
 * its published figures (NAV, YTD, 1 year, since inception, calendar years) · comparison table. Every figure comes
 * from the published data; a missing one is "figures coming soon" on a card and an em dash in the table.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { ButtonLink, CtaBand, Reveal, Section, SectionHead } from "../kit";
import type { HomeData } from "../home/data";
import { Intro } from "../home/Intro";
import { CATEGORY_COPY, FUND_COPY as F, HOME_COPY, VEHICLE_COPY } from "../home/copy";
import { STRAT_COPY as S } from "./strategies-copy";
import { FundTile, RiskScale, SampleTag, fundStyle } from "../home/FundTile";
import { cell, dayText, filterFunds, monthText, navText, type Filter } from "../home/figures";
import { HL } from "../home/labels";
import "../home/home.css";

const FILTERS: Filter[] = ["all", "fixed-income", "alternatives"];

export function StrategiesIndex({ data }: { data: HomeData }) {
  const { locale, pick } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");
  // the filter survives a reload / can be linked (#fixed-income, #alternatives)
  useEffect(() => {
    const h = window.location.hash.slice(1) as Filter;
    if (FILTERS.includes(h)) setFilter(h);
  }, []);
  const choose = (f: Filter) => {
    setFilter(f);
    history.replaceState(null, "", f === "all" ? window.location.pathname : `#${f}`);
  };
  const shown = filterFunds(data.funds, filter);
  const missing = data.funds.some((f) => f.ytd === null || f.y1 === null || f.si === null || !f.nav);
  const anyFig = data.funds.some((f) => f.si !== null || f.y1 !== null || f.ytd !== null);
  const anyGross = data.funds.some((f) => f.basis === "gross" && (f.si !== null || f.y1 !== null || f.ytd !== null));
  // gross-of-fees figures sit among net ones in the table: each carries an inline marker
  const gross = (f: HomeData["funds"][number]) => f.basis === "gross";
  const mark = <abbr title={pick(HL.grossLong)} data-testid="gross-marker">{pick(HL.gross)}</abbr>;
  return (
    <div className="hm">
      <Intro
        crumbs={[{ href: "/", label: pick(S.home) }, { label: pick(S.crumb) }]}
        eyebrow={pick(S.eyebrow)} title={pick(S.title)} accent={pick(S.accent)} lead={pick(S.lead)} id="strategies-t"
      >
        <ButtonLink href="#compare" variant="ghost">{pick(S.toTable)}</ButtonLink>
        <ButtonLink href="/solutions">{pick(HOME_COPY.hero.cta2)}</ButtonLink>
      </Intro>

      <Section tone="tint" labelledBy="funds-t" className="xs-funds">
        <h2 id="funds-t" className="sr-only">{pick(S.fundsTitle)}</h2>
        <div className="xs-bar">
          <div className="xf-pills" role="group" aria-label={pick(S.filterLabel)}>
            {FILTERS.map((k) => {
              const n = filterFunds(data.funds, k).length;
              return (
                <button key={k} type="button" className="xf-pill" aria-pressed={filter === k} onClick={() => choose(k)} data-filter={k}>
                  {pick(CATEGORY_COPY[k])}<span className="xf-n" aria-hidden="true">{n}</span>
                </button>
              );
            })}
          </div>
          <p className="small xs-count" aria-live="polite">{shown.length} {pick(shown.length === 1 ? S.one : S.many)}</p>
        </div>
        {shown.length ? (
          <Reveal kind="pop" stagger={100} className="fx-grid fx-grid-2" key={filter}>
            {shown.map((f) => <FundTile key={f.key} f={f} sample={data.sample} index={data.funds.indexOf(f)} variant="full" />)}
          </Reveal>
        ) : <p className="notice">{pick(S.none)}</p>}
        {anyFig ? <p className="fine hm-note">{pick(F.perfNote)}{anyGross ? ` ${pick(F.grossNote)}` : ""}</p> : null}
      </Section>

      <Section labelledBy="compare-t" id="compare" className="xs-compare">
        <SectionHead eyebrow={pick(S.cmpEyebrow)} title={pick(S.cmpTitle)} accent={pick(S.cmpAccent)} lead={pick(S.cmpLead)} id="compare-t" />
        <Reveal self className="xs-table-w">
          <div className="scroll-x" tabIndex={0} role="region" aria-labelledby="compare-t">
            <table className="table xs-table" data-testid="compare-table">
              <caption className="sr-only">{pick(S.cmpTitle)} {pick(S.cmpAccent)}</caption>
              <thead>
                <tr>
                  <th scope="col">{pick(S.cols.fund)}</th>
                  <th scope="col">{pick(S.cols.vehicle)}</th>
                  <th scope="col">{pick(S.cols.bench)}</th>
                  <th scope="col">{pick(F.ytd)}</th>
                  <th scope="col">{pick(F.y1)}</th>
                  <th scope="col">{pick(S.cols.si)}</th>
                  <th scope="col">{pick(S.cols.risk)}</th>
                  <th scope="col">{pick(S.cols.nav)}</th>
                </tr>
              </thead>
              <tbody>
                {data.funds.map((f) => (
                  <tr key={f.key} style={fundStyle(f)}>
                    <th scope="row">
                      <Link href={`/strategies/${f.key}`} className="xs-name"><i aria-hidden="true" />{pick(f.short)}</Link>
                      <span className="xs-sub xs-wrap">{pick(f.assetClass)}</span>
                      {f.asOf ? <span className="xs-sub">{pick(F.asOf)} {monthText(f.asOf, locale)}{f.perfClass ? <> · <span data-testid="perf-class">{pick(F.perfClass)} {f.perfClass}</span></> : null}{f.perfVariant ? <> · <span data-testid="perf-variant">{pick(f.perfVariant)}</span></> : null}</span> : null}
                    </th>
                    <td className="xs-l">{pick(f.vehicle === "fund" ? VEHICLE_COPY.fund : VEHICLE_COPY.strategy)}{f.code ? <span className="xs-sub tabnum">{f.code}</span> : null}</td>
                    <td className="xs-l xs-bench">{f.benchmark ? pick(f.benchmark) : pick(S.noBench)}</td>
                    <td>{cell(f.ytd, locale)}{gross(f) && f.ytd !== null ? <span className="xs-sub">{mark}</span> : null}</td>
                    <td>{cell(f.y1, locale)}{gross(f) && f.y1 !== null ? <span className="xs-sub">{mark}</span> : null}</td>
                    <td>{cell(f.si, locale)}{f.si !== null ? <span className="xs-sub">{f.siAnnualized ? pick(F.annualized) : pick(S.cumulative)}{gross(f) ? <> · {mark}</> : null}</span> : null}</td>
                    <td className="xs-l"><RiskScale risk={f.risk} /></td>
                    <td>
                      {f.nav ? (
                        <>
                          {navText(f.nav.nav, f.nav.currency, locale)}
                          <span className="xs-sub">{pick(F.navSeries)} {f.nav.display}{f.nav.date ? ` · ${dayText(f.nav.date, locale)}` : ""}</span>
                        </>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <div className="xs-notes">
          {data.sample ? <p className="fine xs-sample"><SampleTag /> {pick(F.sampleLong)}</p> : null}
          {anyFig ? <p className="fine">{pick(F.perfNote)}{anyGross ? ` ${pick(F.grossNote)}` : ""}</p> : null}
          {missing ? <p className="fine">{pick(S.dashNote)}</p> : null}
          {anyFig ? <p className="fine">{pick(S.siNote)}</p> : null}
        </div>
      </Section>

      <CtaBand title={pick(S.ctaTitle)} accent={pick(S.ctaAccent)} text={pick(S.ctaText)}>
        <ButtonLink href="/contact">{pick(HOME_COPY.cta.contact)}</ButtonLink>
        <ButtonLink href="/solutions" variant="ghost">{pick(HOME_COPY.cta.solutions)}</ButtonLink>
      </CtaBand>
    </div>
  );
}
