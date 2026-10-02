"use client";
/**
 * Portfolio tab. Two sources, never mixed in one figure:
 *  - the daily book computed by the data platform (characteristics with coverage, breakdowns, top 10 holdings with
 *    coupon / maturity / rating / sector and a green-bond marker, green bonds weight), when the pipeline published it;
 *  - otherwise the month-end factsheet (characteristics vs index, breakdowns, top 10 holdings), as before.
 * Sustainability metrics always come from the factsheet and say so. Each block is omitted when its data is missing or
 * the admin hid it; the source and its date head the tab.
 */
import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { CountUp, Reveal } from "@/components/v3/motion";
import type { Bucket, Characteristic, FundContent, PortfolioData, PortfolioHolding, PortfolioMetric } from "@/lib/data/types";
import type { PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { categoryLabel } from "./labels";
import { Block } from "./Block";
import { Donut, HBars } from "./charts/Breakdowns";
import { charCount, charValue, dateLabel, elide, fmt, monthLabel, type Lang } from "./lib/format.ts";
import { bucketRows, dailyBreakdowns, fullRowItems, hasDailyPortfolio, orderedBuckets, partialCoverage, topTotal } from "./lib/data.ts";

type BKey = "credit" | "sectors" | "curve" | "country" | "assetClass";
const ORDERED: BKey[] = ["credit", "curve"];

/** A breakdown adds up to a whole (±3 %): then a donut reads right. */
function isWhole(rows: Bucket[]) {
  const s = rows.reduce((a, r) => a + (r.fund ?? 0), 0);
  return rows.length >= 2 && rows.length <= 8 && Math.abs(s - 1) < 0.03;
}

export function PortfolioTab({ spec, content, data, lang }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang }) {
  const h = content.hide ?? {};
  const esg = !data || h.esg ? [] : data.esg.filter((c) => c.fund != null && c.fund !== "");
  const daily = data && hasDailyPortfolio(data.portfolio) ? data.portfolio : null;
  const fundWord = tr(spec.vehicle === "fund" ? T.portfolio.fund : T.portfolio.strategy, lang);
  const names = { fund: fundWord, index: tr(T.portfolio.index, lang) };
  const esgBlock = esg.length ? <EsgBlock esg={esg} month={data?.factsheetMonth ?? null} daily={!!daily} fundWord={fundWord} indexWord={names.index} lang={lang} /> : null;

  if (daily) return <DailyPortfolio p={daily} esgBlock={esgBlock} names={names} lang={lang} />;

  const chars = !data || h.characteristics ? [] : data.characteristics.filter((c) => c.fund != null && c.fund !== "");
  const holdings = !data || h.holdings ? [] : data.topHoldings.filter((x) => Number.isFinite(x.weight)).slice(0, 10);
  const bks: { key: BKey; rows: Bucket[] }[] = !data || h.breakdowns ? [] : (["assetClass", "credit", "sectors", "curve", "country"] as BKey[])
    .map((key) => ({ key, rows: ORDERED.includes(key) ? orderedBuckets(data.breakdowns[key]) : bucketRows(data.breakdowns[key]) }))
    .filter((b) => b.rows.length > 0);
  const any = chars.length || esg.length || holdings.length || bks.length;
  const full = fullRowItems(bks.map((b) => b.key === "assetClass" && isWhole(b.rows)));

  if (!any) return <div className="container fp"><p className="notice" data-testid="portfolio-soon">{tr(T.portfolio.none, lang)}</p></div>;
  return (
    <div className="container fp">
      {data?.factsheetMonth ? (
        <p className="fp-context pf-source" data-testid="portfolio-source" data-source="factsheet">
          <span className="fx-chip">{tr(T.portfolio.monthEnd, lang)}</span>
          <span data-testid="factsheet-month">{tr(T.portfolio.asOf, lang)} {monthLabel(data.factsheetMonth, lang)}</span>
        </p>
      ) : null}
      {chars.length ? (
        <Block title={tr(T.portfolio.characteristics, lang)} testId="characteristics">
          <Reveal className="ch-grid" kind="pop" stagger={55}>
            {chars.map((c) => <CharTile key={c.id} c={c} lang={lang} />)}
          </Reveal>
        </Block>
      ) : null}
      {bks.length ? (
        <div className="bk-grid">
          {bks.map((b, i) => {
            const donut = b.key === "assetClass" && isWhole(b.rows);
            const hasIndex = b.rows.some((r) => r.index != null);
            return (
              <Block key={b.key} title={tr(T.portfolio.breakdowns[b.key], lang)} className={full[i] ? "bk-wide" : undefined} testId={`breakdown-${b.key}`}
                aside={hasIndex && !donut ? <div className="fx-legend"><span><i className="fund" />{names.fund}</span><span><i className="index" style={{ height: 5 }} />{names.index}</span></div> : null}>
                {donut
                  ? <Donut rows={b.rows} lang={lang} label={tr(T.portfolio.breakdowns[b.key], lang)} indexName={names.index} />
                  : <HBars rows={b.rows} lang={lang} names={names} label={tr(T.portfolio.breakdowns[b.key], lang)} />}
              </Block>
            );
          })}
        </div>
      ) : null}
      {holdings.length || esgBlock ? (
        <div className={`bk-grid ${holdings.length && esgBlock ? "" : "one"}`}>
          {holdings.length ? (
            <Block title={tr(T.portfolio.holdings, lang)} testId="holdings">
              <HoldingsTable items={holdings} lang={lang} />
            </Block>
          ) : null}
          {esgBlock}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ daily book */

function DailyPortfolio({ p, esgBlock, names, lang }: { p: PortfolioData; esgBlock: ReactNode; names: { fund: string; index: string }; lang: Lang }) {
  const metrics = p.characteristics.filter((m) => m.value != null);
  const partial = partialCoverage(metrics);
  const count = p.totals?.holdings;
  const bks = dailyBreakdowns(p).map((b) => ({ ...b, rows: b.rows.map((r) => ({ ...r, label: categoryLabel(r.label, lang, b.key === "term" ? "term" : undefined) })) }));
  const green = typeof p.greenBondsWeight === "number" && Number.isFinite(p.greenBondsWeight) ? p.greenBondsWeight : null;
  const full = fullRowItems(bks.map(() => false));
  const pctLabel = (v: number, d = 0) => fmt(v, { pct: true, decimals: d, lang });
  return (
    <div className="container fp">
      <p className="fp-context pf-source" data-testid="portfolio-source" data-source="daily">
        <span className="fx-chip live"><span className="live-dot" aria-hidden="true" />{tr(T.portfolio.daily, lang)}</span>
        <span data-testid="portfolio-asof">{tr(T.portfolio.dailyAsOf, lang)} {dateLabel(p.asOf, lang, true)}</span>
      </p>
      {metrics.length || count != null ? (
        <Block title={tr(T.portfolio.characteristics, lang)} testId="characteristics">
          <Reveal className="ch-grid pf-metrics" kind="pop" stagger={55}>
            {metrics.map((m) => <MetricTile key={m.id} m={m} marked={partial.includes(m)} lang={lang} />)}
            {count != null ? (
              <div className="ch-tile" data-testid="metric-securities">
                <span className="ch-v"><CountUp value={count} decimals={0} lang={lang} /></span>
                <span className="ch-l">{tr(T.portfolio.securities, lang)}</span>
              </div>
            ) : null}
          </Reveal>
          {partial.length ? (
            <p className="fine pf-foot" data-testid="coverage-note">
              <sup aria-hidden="true">*</sup> {tr(T.portfolio.coverage, lang).replace("{x}", partial.map((m) => `${tr(T.portfolio.metrics[m.id], lang).toLowerCase()} ${pctLabel(m.coverage)}`).join(", "))}
            </p>
          ) : null}
        </Block>
      ) : null}
      {green != null ? (
        <Block title={tr(T.portfolio.greenTitle, lang)} testId="green-bonds" className="pf-green">
          <div className="pf-green-body">
            <p className="pf-green-v"><Leaf aria-hidden="true" /><b data-testid="green-weight">{pctLabel(green, 1)}</b> {tr(T.portfolio.greenOf, lang)}</p>
            <span className="pf-meter" aria-hidden="true"><i style={{ width: `${Math.min(100, green * 100)}%` }} /></span>
            <p className="fxb-text sm">{tr(T.portfolio.greenLead, lang)}</p>
          </div>
        </Block>
      ) : null}
      {bks.length ? (
        <div className="bk-grid">
          {bks.map((b, i) => {
            const title = tr(T.portfolio.dailyBreakdowns[b.key], lang);
            // bars for every daily breakdown: exact values side by side (a donut hides the small slices); an odd last
            // breakdown takes the whole row rather than half of it
            return (
              <Block key={b.key} title={title} testId={`breakdown-${b.key}`} className={full[i] ? "bk-wide" : undefined}>
                <HBars rows={b.rows} lang={lang} names={names} label={title} />
              </Block>
            );
          })}
          <p className="fine pf-note bk-wide">{tr(T.portfolio.weightsNote, lang)}</p>
        </div>
      ) : null}
      {p.topHoldings.length ? (
        <Block title={tr(T.portfolio.holdings, lang)} testId="holdings">
          <DailyHoldings items={p.topHoldings.slice(0, 10)} lang={lang} />
        </Block>
      ) : null}
      {esgBlock ? <div className="bk-grid one">{esgBlock}</div> : null}
    </div>
  );
}

/** Value of a daily characteristic: years with 2 decimals (1 for the maturity), yields with 2 decimals, the rating as is. */
function metricParts(m: PortfolioMetric): { value: number; decimals: number; pct: boolean } | null {
  if (typeof m.value !== "number" || !Number.isFinite(m.value)) return null;
  if (m.unit === "pct") return { value: m.value, decimals: 2, pct: true };
  return { value: m.value, decimals: m.id === "maturity" ? 1 : 2, pct: false };
}

function MetricTile({ m, marked, lang }: { m: PortfolioMetric; marked: boolean; lang: Lang }) {
  const n = metricParts(m);
  if (!n && typeof m.value !== "string") return null;
  return (
    <div className="ch-tile" data-testid={`metric-${m.id}`}>
      <span className="ch-v">
        {n ? <CountUp value={n.value} decimals={n.decimals} pct={n.pct} lang={lang} /> : m.value}
        {m.unit === "years" ? <small className="ch-u"> {tr(T.portfolio.years, lang)}</small> : null}
        {marked ? <sup className="ch-mark" aria-hidden="true">*</sup> : null}
      </span>
      <span className="ch-l">{tr(T.portfolio.metrics[m.id], lang)}{marked ? <span className="sr-only"> ({fmt(m.coverage, { pct: true, decimals: 0, lang })})</span> : null}</span>
    </div>
  );
}

function DailyHoldings({ items, lang }: { items: PortfolioHolding[]; lang: Lang }) {
  const max = Math.max(0.0001, ...items.map((h) => h.weight));
  const any = (k: "coupon" | "maturity" | "rating" | "sector") => items.some((h) => h[k] != null);
  const cols = { coupon: any("coupon"), maturity: any("maturity"), rating: any("rating"), sector: any("sector") };
  const hasGreen = items.some((h) => h.green);
  const total = topTotal(items);
  return (
    <div className="fx-scroll" role="region" aria-label={tr(T.portfolio.holdings, lang)} tabIndex={0}>
      <table className="table ft-table hd-table hd-daily" data-testid="holdings-table">
        <caption className="sr-only">{tr(T.portfolio.holdings, lang)}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col" className="hd-name">{tr(T.portfolio.holding, lang)}</th>
            {cols.coupon ? <th scope="col">{tr(T.portfolio.col.coupon, lang)}</th> : null}
            {cols.maturity ? <th scope="col" className="hd-opt">{tr(T.portfolio.col.maturity, lang)}</th> : null}
            {cols.rating ? <th scope="col">{tr(T.portfolio.col.rating, lang)}</th> : null}
            {cols.sector ? <th scope="col" className="hd-opt hd-sector">{tr(T.portfolio.col.sector, lang)}</th> : null}
            <th scope="col" className="hd-bar-h"><span className="sr-only">{tr(T.portfolio.weight, lang)}</span></th>
            <th scope="col">{tr(T.portfolio.weight, lang)}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h, i) => (
            <tr key={`${h.name}-${i}`} data-green={h.green ? "" : undefined}>
              <td className="hd-n">{String(i + 1).padStart(2, "0")}</td>
              <td className="hd-name">
                {h.name}
                {h.green ? <span className="hd-green" title={tr(T.portfolio.green, lang)} data-testid="green-marker"><Leaf aria-hidden="true" /><span className="sr-only">{` (${tr(T.portfolio.green, lang)})`}</span></span> : null}
              </td>
              {cols.coupon ? <td>{h.coupon != null ? fmt(h.coupon, { pct: true, decimals: 2, lang }) : "—"}</td> : null}
              {cols.maturity ? <td className="hd-opt">{h.maturity ? dateLabel(h.maturity, lang) : "—"}</td> : null}
              {cols.rating ? <td>{h.rating ?? "—"}</td> : null}
              {cols.sector ? <td className="hd-opt hd-sector">{h.sector ? categoryLabel(h.sector, lang) : "—"}</td> : null}
              <td className="hd-bar" aria-hidden="true"><span style={{ width: `${(h.weight / max) * 100}%`, transitionDelay: `${i * 50}ms` }} /></td>
              <td className="strong">{fmt(h.weight, { pct: true, decimals: 2, lang })}</td>
            </tr>
          ))}
        </tbody>
        {total != null ? (
          <tfoot>
            <tr data-testid="holdings-total">
              <th scope="row" colSpan={3 + Object.values(cols).filter(Boolean).length}>{tr(T.portfolio.topTotal, lang)}</th>
              <td className="strong">{fmt(total, { pct: true, decimals: 2, lang })}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
      {hasGreen ? <p className="fine pf-legend"><Leaf aria-hidden="true" /> {tr(T.portfolio.green, lang)}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ shared */

function EsgBlock({ esg, month, daily, fundWord, indexWord, lang }: { esg: Characteristic[]; month: string | null; daily: boolean; fundWord: string; indexWord: string; lang: Lang }) {
  const hasIndex = esg.some((c) => c.index != null);
  // next to the daily book, say that these figures come from the month-end factsheet
  const lead = daily && month ? `${elide(tr(T.portfolio.esgMonth, lang), monthLabel(month, lang), lang)}.` : hasIndex ? tr(T.portfolio.esgLead, lang) : undefined;
  return (
    <Block title={tr(T.portfolio.esg, lang)} lead={lead} testId="esg">
      <table className="table ft-table">
        <caption className="sr-only">{tr(T.portfolio.esg, lang)}</caption>
        <thead><tr><th scope="col">{tr(T.portfolio.metric, lang)}</th><th scope="col">{fundWord}</th>{hasIndex ? <th scope="col">{indexWord}</th> : null}</tr></thead>
        <tbody>
          {esg.map((c) => (
            <tr key={c.id}>
              <td className="wrap">{tr(c.label, lang)}</td>
              <td className="strong">{charValue(c.fund, c.unit, lang)}</td>
              {hasIndex ? <td>{charValue(c.index ?? null, c.unit, lang) ?? "—"}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </Block>
  );
}

function CharTile({ c, lang }: { c: Characteristic; lang: Lang }) {
  const n = charCount(c.fund, c.unit);
  const idx = charValue(c.index ?? null, c.unit, lang);
  return (
    <div className="ch-tile" data-testid={`char-${c.id}`}>
      <span className="ch-v">{n ? <CountUp value={n.value} decimals={n.decimals} pct={n.pct} lang={lang} /> : charValue(c.fund, c.unit, lang)}</span>
      <span className="ch-l">{tr(c.label, lang)}</span>
      {idx ? <span className="ch-i">{tr(T.portfolio.index, lang)} <b>{idx}</b></span> : null}
    </div>
  );
}

function HoldingsTable({ items, lang }: { items: { name: string; weight: number }[]; lang: Lang }) {
  const max = Math.max(0.0001, ...items.map((h) => h.weight));
  const total = topTotal(items);
  return (
    <table className="table ft-table hd-table" data-testid="holdings-table">
      <caption className="sr-only">{tr(T.portfolio.holdings, lang)}</caption>
      <thead><tr><th scope="col">#</th><th scope="col" className="hd-name">{tr(T.portfolio.holding, lang)}</th><th scope="col" className="hd-bar-h"><span className="sr-only">{tr(T.portfolio.weight, lang)}</span></th><th scope="col">{tr(T.portfolio.weight, lang)}</th></tr></thead>
      <tbody>
        {items.map((h, i) => (
          <tr key={`${h.name}-${i}`}>
            <td className="hd-n">{String(i + 1).padStart(2, "0")}</td>
            <td className="hd-name">{h.name}</td>
            <td className="hd-bar" aria-hidden="true"><span style={{ width: `${(h.weight / max) * 100}%`, transitionDelay: `${i * 50}ms` }} /></td>
            <td className="strong">{fmt(h.weight, { pct: true, decimals: 2, lang })}</td>
          </tr>
        ))}
      </tbody>
      {total != null ? (
        <tfoot>
          <tr data-testid="holdings-total">
            <th scope="row" colSpan={3}>{tr(T.portfolio.topTotal, lang)}</th>
            <td className="strong">{fmt(total, { pct: true, decimals: 2, lang })}</td>
          </tr>
        </tfoot>
      ) : null}
    </table>
  );
}
