"use client";
/**
 * Portfolio (characteristics, breakdowns, top holdings, ESG), fund facts & classes, documents, disclosure.
 */
import { useState } from "react";
import { CountUp, Reveal } from "@/components/v3/motion";
import type { FundSpec } from "@/config/funds";
import type { Bucket, Characteristic, FundContent, FundData } from "@/lib/data/types";
import { T, tr } from "./copy";
import { SectionHead } from "./PerformanceSections";
import { Donut, HBars, Holdings } from "./charts/Breakdowns";
import { bigMoney, charCount, charValue, dateLabel, fileSize, fmt, money, monthLabel, type Lang } from "./lib/format.ts";
import { bucketRows, groupDocuments, headlineClass, orderedBuckets, perfClassLabel, riskIndex } from "./lib/data.ts";
import type { FundDoc } from "./types";

/* ------------------------------------------------------------------ portfolio */

type BKey = "credit" | "sectors" | "curve" | "country" | "assetClass";
const ORDERED: BKey[] = ["credit", "curve"];

function CharFigure({ c, lang, tone }: { c: Characteristic; lang: Lang; tone: string }) {
  const n = charCount(c.fund, c.unit);
  const idx = charValue(c.index ?? null, c.unit, lang);
  return (
    <div>
      {n ? <CountUp value={n.value} decimals={n.decimals} pct={n.pct} lang={lang} className={`fig m ${tone}`} />
        : <span className={`fig m ${tone}`}>{charValue(c.fund, c.unit, lang)}</span>}
      <div className="fig-label">{tr(c.label, lang)}</div>
      {idx ? <div className="sub">{tr(T.portfolio.index, lang)} <b>{idx}</b></div> : null}
    </div>
  );
}

export function PortfolioSection({ data, content, lang }: { data: FundData; content: FundContent; lang: Lang }) {
  const h = content.hide ?? {};
  const chars = h.characteristics ? [] : data.characteristics.filter((c) => c.fund != null);
  const esg = h.esg ? [] : data.esg.filter((c) => c.fund != null);
  const holdings = h.holdings ? [] : data.topHoldings.filter((x) => Number.isFinite(x.weight));
  const bks: { key: BKey; rows: Bucket[] }[] = h.breakdowns ? [] : (["assetClass", "credit", "sectors", "curve", "country"] as BKey[])
    .map((key) => ({ key, rows: ORDERED.includes(key) ? orderedBuckets(data.breakdowns[key]) : bucketRows(data.breakdowns[key]) }))
    .filter((b) => b.rows.length > 0);
  const [tab, setTab] = useState(0);
  const cur = bks[Math.min(tab, bks.length - 1)];
  const names = { fund: tr(T.portfolio.fund, lang), index: tr(T.portfolio.index, lang) };
  const tones = ["g-fund"];
  const factsheet = data.factsheetMonth ? `${tr(T.portfolio.factsheet, lang)} ${monthLabel(data.factsheetMonth, lang)}` : undefined;

  return (
    <section className="screen glow auto" id="portfolio" data-section="portfolio" data-swap="" aria-labelledby="fx-pf-t">
      <div className="wrap">
        <SectionHead kicker={tr(T.portfolio.kicker, lang)} title={tr(T.portfolio.title, lang)} lead={factsheet} id="fx-pf-t" />
        {chars.length ? (
          <Reveal className="fx-figs" kind="pop" stagger={80}>
            {chars.map((c, i) => <CharFigure key={c.id} c={c} lang={lang} tone={tones[i % tones.length]} />)}
          </Reveal>
        ) : null}

        {cur ? (
          <div className="fx-block">
            {bks.length > 1 ? (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 34 }}>
                <div className="fx-seg scroll" role="tablist" aria-label={tr(T.portfolio.kicker, lang)}>
                  {bks.map((b, i) => (
                    <button key={b.key} type="button" role="tab" id={`fx-bk-${b.key}`} aria-selected={b === cur} aria-controls="fx-bk-panel" onClick={() => setTab(i)}>{tr(T.portfolio.breakdowns[b.key], lang)}</button>
                  ))}
                </div>
              </div>
            ) : <h3 className="h3">{tr(T.portfolio.breakdowns[cur.key], lang)}</h3>}
            <div id="fx-bk-panel" role={bks.length > 1 ? "tabpanel" : undefined} aria-labelledby={bks.length > 1 ? `fx-bk-${cur.key}` : undefined} className="wrap narrow" key={cur.key}>
              {cur.key === "assetClass" && isWhole(cur.rows)
                ? <Donut rows={cur.rows} lang={lang} label={tr(T.portfolio.breakdowns[cur.key], lang)} indexName={names.index} />
                : (
                  <>
                    {cur.rows.some((r) => r.index != null) ? (
                      <div className="fx-legend"><span><i className="fund" />{names.fund}</span><span><i className="index" style={{ height: 5 }} />{names.index}</span></div>
                    ) : null}
                    <HBars rows={cur.rows} lang={lang} names={names} label={tr(T.portfolio.breakdowns[cur.key], lang)} />
                  </>
                )}
            </div>
          </div>
        ) : null}

        {holdings.length || esg.length ? (
          <div className={`fx-block ${holdings.length && esg.length >= 4 ? "fx-two" : "fx-stack"}`}>
            {holdings.length ? (
              <div>
                <h3 className="h3" style={{ marginBottom: 18 }}>{tr(T.portfolio.holdings, lang)}</h3>
                <Holdings items={holdings} lang={lang} label={tr(T.portfolio.holdings, lang)} />
              </div>
            ) : null}
            {esg.length ? (
              <div>
                <h3 className="h3" style={{ marginBottom: 6 }}>{tr(T.portfolio.esg, lang)}</h3>
                <p className="small" style={{ margin: "0 0 18px" }}>{tr(T.portfolio.esgLead, lang)}</p>
                <EsgRows items={esg} lang={lang} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** A breakdown adds up to a whole (±3 %): then a donut reads right. */
function isWhole(rows: Bucket[]) {
  const s = rows.reduce((a, r) => a + (r.fund ?? 0), 0);
  return rows.length >= 2 && rows.length <= 8 && Math.abs(s - 1) < 0.03;
}

function EsgRows({ items, lang }: { items: Characteristic[]; lang: Lang }) {
  return (
    <dl className="fx-facts" style={{ gridTemplateColumns: "1fr" }}>
      {items.map((c) => {
        const f = charValue(c.fund, c.unit, lang), ix = charValue(c.index ?? null, c.unit, lang);
        return (
          <div key={c.id}>
            <dt>{tr(c.label, lang)}</dt>
            <dd>
              <span className="g-fund" style={{ fontWeight: 600 }}>{f}</span>
              {ix ? <span className="small" style={{ marginLeft: 10 }}>{tr(T.portfolio.index, lang)} {ix}</span> : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/* ------------------------------------------------------------------ facts */

export function FactsSection({ spec, content, data, lang }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang }) {
  const classes = content.hide?.nav ? [] : data?.nav?.classes ?? [];
  const hl = headlineClass(classes, [content.headlineClass, spec.headlineClass]);
  const aum = content.hide?.aum ? null : data?.aum ?? null;
  const perf = data?.performance;
  const risk = riskIndex(content.riskRating ?? spec.defaults.riskRating);
  const facts: [string, string | null | undefined][] = [
    [tr(T.facts.vehicle, lang), tr(spec.vehicle === "fund" ? T.hero.vehicleFund : T.hero.vehicleStrategy, lang)],
    [tr(T.facts.assetClass, lang), tr(spec.assetClass, lang)],
    [tr(T.facts.inception, lang), perf?.firstMonth ? monthLabel(perf.firstMonth, lang) : null],
    [tr(T.facts.benchmark, lang), perf?.indexName || (spec.benchmark ? tr(spec.benchmark, lang) : null)],
    [tr(T.facts.risk, lang), tr(T.hero.levels[risk], lang)],
    [tr(T.facts.managementFee, lang), content.managementFee],
    [tr(T.facts.performanceFee, lang), content.performanceFee],
    [tr(T.facts.mer, lang), content.mer],
    [tr(T.facts.minInvestment, lang), content.minInvestment],
    [tr(T.facts.distributions, lang), content.distributions ? tr(content.distributions, lang) : null],
    [tr(T.facts.managers, lang), content.managers?.length ? content.managers.join(", ") : null],
  ];
  const shown = facts.filter(([, v]) => v);
  const description = content.description ?? spec.defaults.description;
  return (
    <section className="screen auto" id="facts" data-section="facts" data-swap="" aria-labelledby="fx-facts-t">
      <div className="wrap">
        <SectionHead kicker={tr(T.facts.kicker, lang)} title={tr(T.facts.title, lang)} lead={tr(description, lang)} id="fx-facts-t" />
        {content.objective ? <Reveal as="p" className="body" self style={{ maxWidth: 760, margin: "-24px auto 40px", textAlign: "center" }}>{tr(content.objective, lang)}</Reveal> : null}
        {aum ? (
          <Reveal className="fx-aum" kind="zoom" self>
            <div className="fig l g-fund" data-testid="aum">{bigMoney(aum.cad, lang)}</div>
            <div className="fig-label">{tr(T.facts.aum, lang)} · {tr(T.facts.asOf, lang)} {dateLabel(aum.asOf, lang)}</div>
          </Reveal>
        ) : null}
        {classes.length ? (
          <Reveal self className="fx-block" style={{ marginTop: 0 }}>
            <h3 className="h3" style={{ textAlign: "center", marginBottom: 18 }}>{tr(T.facts.classes, lang)}</h3>
            <div className="scroll-x">
              <table className="table fx-classes" data-testid="classes-table">
                <caption className="sr-only">{tr(T.facts.classes, lang)}</caption>
                <thead>
                  <tr>
                    <th scope="col">{tr(T.facts.fundserv, lang)}</th><th scope="col">{tr(T.facts.class, lang)}</th><th scope="col">{tr(T.facts.currency, lang)}</th>
                    <th scope="col">{tr(T.facts.nav, lang)}</th><th scope="col">{tr(T.facts.change, lang)}</th><th scope="col">{tr(T.facts.date, lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => {
                    const isHl = hl?.fundserv === c.fundserv;
                    return (
                      <tr key={c.fundserv} className={isHl ? "hl" : undefined} aria-current={isHl ? "true" : undefined}>
                        <td data-label={tr(T.facts.fundserv, lang)}>{isHl ? <span className="fx-hl-dot" title={tr(T.facts.headline, lang)} /> : null}<code style={{ font: "inherit", letterSpacing: ".02em" }}>{c.fundserv}</code>{isHl ? <span className="sr-only"> ({tr(T.facts.headline, lang)})</span> : null}</td>
                        <td data-label={tr(T.facts.class, lang)}>{c.display}</td>
                        <td data-label={tr(T.facts.currency, lang)}>{c.currency}</td>
                        <td data-label={tr(T.facts.nav, lang)}>{c.nav != null ? money(c.nav, c.currency, lang, 4) : "—"}</td>
                        <td data-label={tr(T.facts.change, lang)} className={c.changePct == null ? undefined : c.changePct > 0 ? "pos" : c.changePct < 0 ? "neg" : undefined}>
                          {c.changePct != null ? fmt(c.changePct, { pct: true, decimals: 2, sign: true, lang }) : "—"}
                        </td>
                        <td data-label={tr(T.facts.date, lang)}>{c.date ? dateLabel(c.date, lang) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        ) : null}
        <Reveal self className="fx-block">
          <dl className="fx-facts">
            {shown.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ documents */

export function DocumentsSection({ docs, lang }: { docs: FundDoc[]; lang: Lang }) {
  const byId = new Map(docs.map((d) => [d.meta.id, d.url]));
  const groups = groupDocuments(docs.map((d) => d.meta), lang);
  return (
    <section className="screen glow auto" id="documents" data-section="documents" data-swap="" aria-labelledby="fx-docs-t">
      <div className="wrap narrow">
        <SectionHead kicker={tr(T.docs.kicker, lang)} title={tr(T.docs.title, lang)} id="fx-docs-t" />
        <div className="fx-docs">
          {groups.map((g) => (
            <Reveal key={g.type} self>
              <h3><span className="fx-fund-mark" />{tr(T.docs.types[g.type], lang)}</h3>
              <div>
                {g.docs.map((d) => (
                  <a key={d.id} className="fx-doc" href={byId.get(d.id)} target="_blank" rel="noopener" download={d.fileName}
                    aria-label={`${tr(T.docs.download, lang)}: ${tr(d.title, lang)}, ${dateLabel(d.date, lang)}, PDF ${fileSize(d.size, lang)}`}>
                    <span className="t">{tr(d.title, lang)}<small>{d.scope === "firm" ? `${tr(T.docs.firm, lang)} · ` : ""}PDF · {fileSize(d.size, lang)}</small></span>
                    <span className="d">{dateLabel(d.date, lang)}</span>
                    <span className="langs" aria-hidden="true">{d.lang === "both" ? <><span>EN</span><span>FR</span></> : <span>{d.lang.toUpperCase()}</span>}</span>
                    <span className="go" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M3.5 6.5 7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ disclosure */

export function DisclosureSection({ spec, content, data, lang, sample }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang; sample: boolean }) {
  const perf = data?.performance;
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const asOf = [
    perf?.asOf ? `${tr(T.disclosure.perfAsOf, lang)} ${monthLabel(perf.asOf, lang)}` : null,
    data?.nav?.asOf && !content.hide?.nav ? `${tr(T.disclosure.navAsOf, lang)} ${dateLabel(data.nav.asOf, lang)}` : null,
    data?.aum?.asOf && !content.hide?.aum ? `${tr(T.disclosure.aumAsOf, lang)} ${dateLabel(data.aum.asOf, lang)}` : null,
  ].filter(Boolean);
  return (
    <section className="screen dark auto" id="disclosure" data-section="disclosure" aria-labelledby="fx-disc-t">
      <div className="wrap narrow fx-disc">
        <SectionHead kicker={tr(T.disclosure.kicker, lang)} title={tr(T.disclosure.title, lang)} id="fx-disc-t" />
        <Reveal>
          {sample ? <p className="note" style={{ color: "#ffd66b" }}>{tr(T.disclosure.sample, lang)}</p> : null}
          {content.performanceNote ? <p className="note">{tr(content.performanceNote, lang)}</p> : null}
          {(() => {
            const cl = perfClassLabel(perf, tr(T.hero.class, lang));
            return cl ? <p className="note" data-testid="perf-class">{tr(T.disclosure.classShown, lang)}: {tr(gross ? T.hero.basisGross : T.hero.basisNet, lang)} · {cl}{perf?.indexName ? ` · vs ${perf.indexName}` : ""}</p> : null;
          })()}
          <p>{gross ? tr(T.hero.grossNote, lang) : tr(T.disclosure.net, lang)}</p>
          {spec.vehicle === "fund" ? <p>{tr(T.disclosure.standard, lang)}</p> : null}
          {spec.benchmark || perf?.indexName ? <p>{tr(T.disclosure.index, lang)}</p> : null}
          <p>{tr(T.disclosure.general, lang)}</p>
          <div className="prov" data-testid="provenance">
            <span className="live-dot" aria-hidden="true" />
            <span>
              {tr(T.disclosure.provenance, lang)}
              {data?.factsheetMonth ? `; ${tr(T.disclosure.provenanceFactsheet, lang)} ${monthLabel(data.factsheetMonth, lang)}` : ""}.
              {asOf.length ? ` ${asOf.join(" · ")}.` : ""}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
