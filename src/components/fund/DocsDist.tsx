"use client";
/**
 * Distributions tab (per-series distributions when published: last distribution, trailing 12 months, calendar-year
 * totals, history chart and table; the policy from the admin content, else a neutral note) and Documents tab (admin uploads grouped
 * by type; else the regulatory documents listed as available on request; managed accounts: mandate-holder note).
 */
import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, Download, FileText, Mail } from "lucide-react";
import { Reveal } from "@/components/v3/motion";
import { CONTACT } from "@/components/site/links";
import type { ClassDistribution, FundContent } from "@/lib/data/types";
import type { FundDoc, PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { Block } from "./Block";
import { FL } from "./labels";
import { dateLabel, fileSize, type Lang, colon } from "./lib/format.ts";
import { distributionBars, distributionClasses, groupDocuments, historyRows, REGULATORY_DOCS } from "./lib/data.ts";
import { DistBars, perUnit } from "./charts/DistBars";

const mailto = (subject: string) => `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;

export function DistributionsTab({ spec, content, data, lang }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang }) {
  const isFund = spec.vehicle === "fund";
  const text = content.distributions && (content.distributions.en || content.distributions.fr) ? tr(content.distributions, lang) : null;
  const classes = distributionClasses(content.hide?.distributions ? null : data?.distributions, content.headlineClass ?? spec.headlineClass);
  const policy = (
    <Block title={tr(T.dist.policy, lang)} testId="distributions">
      {text ? <p className="fxb-text" data-testid="distribution-policy">{text}</p>
        : <p className="fxb-text" data-testid="distribution-none">{tr(isFund ? T.dist.none : T.dist.noneStrategy, lang)}</p>}
      {isFund ? <p className="fine fxb-foot">{tr(T.dist.reinvest, lang)}</p> : null}
      {classes.length ? <p className="fine ds-note" data-testid="distributions-note">{tr(T.dist.note, lang)}</p> : null}
      <div className="actions sm">
        <a className="btn ghost sm" href={mailto(`${tr(spec.name, lang)} · ${tr(T.dist.title, lang)}`)}><Mail aria-hidden="true" />{tr(T.dist.ask, lang)}</a>
      </div>
    </Block>
  );
  if (!classes.length) return <div className="container fp"><div className="ds-grid">{policy}</div></div>;
  return (
    <div className="container fp">
      <p className="fp-context" data-testid="distributions-asof">{tr(T.dist.asOf, lang)} {dateLabel(data!.distributions!.asOf, lang, true)}</p>
      <RecentDistributions classes={classes} headline={classes[0].fundserv} lang={lang} />
      <DistributionHistory classes={classes} asOf={data!.distributions!.asOf} lang={lang} />
      <div className="ds-grid">{policy}</div>
    </div>
  );
}

/** Every live series: last distribution, trailing 12 months, observed frequency. */
function RecentDistributions({ classes, headline, lang }: { classes: ClassDistribution[]; headline: string; lang: Lang }) {
  return (
    <Block title={tr(T.dist.recent, lang)} lead={tr(T.dist.recentLead, lang)} testId="distributions-summary">
      <Reveal className="ds-cards" kind="pop" stagger={60}>
        {classes.map((c) => (
          <div key={c.fundserv} className={`ds-card${c.fundserv === headline ? " hl" : ""}`} data-testid={`dist-class-${c.fundserv}`}>
            <div className="ds-card-h">
              <span className="ds-series">{tr(T.dist.series, lang)} {c.display}</span>
              <code>{c.fundserv}</code>
            </div>
            {c.last ? (
              <>
                <span className="ds-amt" data-testid="dist-last-amount">{perUnit(c.last.amount, c.currency, lang)}</span>
                <span className="ds-sub">{tr(T.dist.last, lang)} · {dateLabel(c.last.date, lang)}</span>
              </>
            ) : <span className="ds-sub ds-none">{tr(T.dist.none2, lang)}</span>}
            <dl className="ds-facts">
              {c.trailing12m != null ? <div><dt title={tr(T.dist.t12mLong, lang)}>{tr(T.dist.t12m, lang)}</dt><dd data-testid="dist-t12m">{perUnit(c.trailing12m, c.currency, lang)}</dd></div> : null}
              {c.frequency ? <div><dt>{tr(T.dist.frequency, lang)}</dt><dd>{tr(T.dist.frequencies[c.frequency], lang)}</dd></div> : null}
            </dl>
          </div>
        ))}
      </Reveal>
    </Block>
  );
}

/** One series at a time (the headline one first): bar chart of the last distributions, calendar-year totals, full history. */
function DistributionHistory({ classes, asOf, lang }: { classes: ClassDistribution[]; asOf: string; lang: Lang }) {
  const [code, setCode] = useState((classes.find((x) => x.history.length > 0) ?? classes[0]).fundserv);
  const [all, setAll] = useState(false);
  const listId = useId();
  const c = classes.find((x) => x.fundserv === code) ?? classes[0];
  const bars = distributionBars(c);
  const rows = historyRows(c, all);
  const seriesName = `${tr(T.dist.series, lang)} ${c.display}`;
  const withData = classes.filter((x) => x.history.length > 0);
  if (!withData.length) return null;
  const picker = withData.length > 1 ? (
    <div className="fx-seg" role="group" aria-label={tr(T.nav.chooseSeries, lang)}>
      {withData.map((x) => (
        <button key={x.fundserv} type="button" aria-pressed={x.fundserv === c.fundserv} onClick={() => { setCode(x.fundserv); setAll(false); }} data-testid={`dist-series-${x.fundserv}`}>
          <span className="sr-only">{tr(T.dist.series, lang)} </span>{x.display}
        </button>
      ))}
    </div>
  ) : null;
  return (
    <Block title={tr(T.dist.history, lang)} aside={picker} testId="distributions-history">
      {bars.length ? (
        <>
          <p className="ds-chart-t">{tr(T.dist.chart, lang)}, {seriesName} ({c.currency}){bars.length < c.history.length ? ` · ${tr(T.dist.lastN, lang).replace("{n}", String(bars.length))}` : ""}</p>
          <DistBars points={bars} currency={c.currency} lang={lang} seriesName={seriesName} label={`${tr(T.dist.chart, lang)}, ${seriesName}`} />
        </>
      ) : null}
      <div className="ds-tables">
        {c.calendarYears.length ? (
          <div className="fx-scroll">
            <table className="table ft-table" data-testid="distributions-calendar">
              <caption className="ds-cap">{tr(T.dist.calendar, lang)}</caption>
              <thead><tr><th scope="col">{tr(T.dist.year, lang)}</th><th scope="col">{tr(T.dist.total, lang)}</th><th scope="col">{tr(T.dist.count, lang)}</th></tr></thead>
              <tbody>
                {[...c.calendarYears].reverse().map((y) => (
                  <tr key={y.year}><td>{y.year}{String(y.year) === asOf.slice(0, 4) ? <span className="ds-ytd">{tr(FL.ytdLong, lang)}</span> : null}</td><td className="strong">{perUnit(y.amount, c.currency, lang)}</td><td>{y.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="fx-scroll">
          <table className="table ft-table" data-testid="distributions-table" id={listId}>
            <caption className="ds-cap">{tr(T.dist.all, lang)}</caption>
            <thead><tr><th scope="col">{tr(T.dist.date, lang)}</th><th scope="col">{tr(T.dist.amount, lang)}</th></tr></thead>
            <tbody>
              {rows.map((r) => <tr key={r.date}><td>{dateLabel(r.date, lang)}</td><td className="strong">{perUnit(r.amount, c.currency, lang)}</td></tr>)}
            </tbody>
          </table>
          {c.history.length > 12 ? (
            <button type="button" className="btn ghost sm ds-more" aria-expanded={all} aria-controls={listId} onClick={() => setAll((v) => !v)} data-testid="distributions-show-all">
              {all ? tr(T.dist.showLess, lang) : tr(T.dist.showAll, lang).replace("{n}", String(c.history.length))}
            </button>
          ) : null}
        </div>
      </div>
    </Block>
  );
}

export function DocumentsTab({ spec, docs, lang }: { spec: FundSpec; docs: FundDoc[]; lang: Lang }) {
  const isFund = spec.vehicle === "fund";
  const byId = new Map(docs.map((d) => [d.meta.id, d]));
  const groups = groupDocuments(docs.map((d) => d.meta), lang);
  return (
    <div className="container fp">
      {groups.length ? (
        <div className="dc-groups" data-testid="documents-list">
          {groups.map((g) => (
            <Block key={g.type} title={tr(T.docs.types[g.type], lang)}>
              <Reveal className="dc-list" stagger={50}>
                {g.docs.map((m) => {
                  const d = byId.get(m.id)!;
                  return (
                    <a key={m.id} className="dc-item" href={d.url} target="_blank" rel="noopener" download={m.fileName}
                      aria-label={`${tr(T.docs.download, lang)}${colon(lang)}${tr(m.title, lang)}, ${dateLabel(m.date, lang)}, PDF ${fileSize(m.size, lang)}`}>
                      <span className="dc-ic" aria-hidden="true"><FileText /></span>
                      <span className="dc-t">{tr(m.title, lang)}<small>{m.scope === "firm" ? `${tr(T.docs.firm, lang)} · ` : ""}{tr(T.docs.single[m.type], lang)} · PDF · {fileSize(m.size, lang)}</small></span>
                      <span className="dc-d">{dateLabel(m.date, lang)}</span>
                      <span className="dc-langs" aria-hidden="true">{m.lang === "both" ? <><span>EN</span><span>FR</span></> : <span>{m.lang.toUpperCase()}</span>}</span>
                      <span className="dc-go" aria-hidden="true"><Download /></span>
                    </a>
                  );
                })}
              </Reveal>
            </Block>
          ))}
        </div>
      ) : null}
      {isFund ? (
        !groups.some((g) => REGULATORY_DOCS.includes(g.type)) ? (
          <Block title={tr(T.docs.title, lang)} lead={tr(T.docs.regulatoryLead, lang)} testId="documents-on-request">
            <Reveal className="dc-req" kind="pop" stagger={60}>
              {REGULATORY_DOCS.map((type) => (
                <div key={type} className="dc-req-item">
                  <span className="dc-ic" aria-hidden="true"><FileText /></span>
                  <span className="dc-t">{tr(T.docs.single[type], lang)}<small>{tr(T.docs.regulatoryText[type], lang)}</small></span>
                  <span className="fx-chip">{tr(T.docs.onRequest, lang)}</span>
                  <a className="link" href={mailto(`${tr(spec.name, lang)} · ${tr(T.docs.single[type], lang)}`)}>
                    {tr(T.docs.request, lang)}<span className="sr-only">: {tr(T.docs.single[type], lang)}</span> <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              ))}
            </Reveal>
          </Block>
        ) : null
      ) : (
        <Block title={tr(T.header.strategyDocuments, lang)} testId="documents-mandate">
          <p className="fxb-text">{tr(T.docs.strategyNote, lang)}</p>
          <div className="actions sm"><Link className="btn sm" href="/contact">{tr(T.cta.contact, lang)} <ArrowRight className="arrow" aria-hidden="true" /></Link></div>
        </Block>
      )}
    </div>
  );
}
