"use client";
/**
 * Portfolio tab: characteristics (fund vs index), breakdowns (credit quality, sectors, term to maturity,
 * geography, asset classes), top 10 holdings and sustainability metrics, from the monthly factsheet. Each block
 * is omitted when the factsheet does not provide it or the admin has hidden it.
 */
import { CountUp, Reveal } from "@/components/v3/motion";
import type { Bucket, Characteristic, FundContent } from "@/lib/data/types";
import type { PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { Block } from "./Block";
import { Donut, HBars } from "./charts/Breakdowns";
import { charCount, charValue, fmt, monthLabel, type Lang } from "./lib/format.ts";
import { bucketRows, orderedBuckets } from "./lib/data.ts";

type BKey = "credit" | "sectors" | "curve" | "country" | "assetClass";
const ORDERED: BKey[] = ["credit", "curve"];

/** A breakdown adds up to a whole (±3 %): then a donut reads right. */
function isWhole(rows: Bucket[]) {
  const s = rows.reduce((a, r) => a + (r.fund ?? 0), 0);
  return rows.length >= 2 && rows.length <= 8 && Math.abs(s - 1) < 0.03;
}

export function PortfolioTab({ spec, content, data, lang }: { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang }) {
  const h = content.hide ?? {};
  const chars = !data || h.characteristics ? [] : data.characteristics.filter((c) => c.fund != null && c.fund !== "");
  const esg = !data || h.esg ? [] : data.esg.filter((c) => c.fund != null && c.fund !== "");
  const holdings = !data || h.holdings ? [] : data.topHoldings.filter((x) => Number.isFinite(x.weight)).slice(0, 10);
  const bks: { key: BKey; rows: Bucket[] }[] = !data || h.breakdowns ? [] : (["assetClass", "credit", "sectors", "curve", "country"] as BKey[])
    .map((key) => ({ key, rows: ORDERED.includes(key) ? orderedBuckets(data.breakdowns[key]) : bucketRows(data.breakdowns[key]) }))
    .filter((b) => b.rows.length > 0);
  const fundWord = tr(spec.vehicle === "fund" ? T.portfolio.fund : T.portfolio.strategy, lang);
  const names = { fund: fundWord, index: tr(T.portfolio.index, lang) };
  const any = chars.length || esg.length || holdings.length || bks.length;

  if (!any) return <div className="container fp"><p className="notice" data-testid="portfolio-soon">{tr(T.portfolio.none, lang)}</p></div>;
  return (
    <div className="container fp">
      {data?.factsheetMonth ? <p className="fp-context" data-testid="factsheet-month">{tr(T.portfolio.asOf, lang)} {monthLabel(data.factsheetMonth, lang)}</p> : null}
      {chars.length ? (
        <Block title={tr(T.portfolio.characteristics, lang)} testId="characteristics">
          <Reveal className="ch-grid" kind="pop" stagger={55}>
            {chars.map((c) => <CharTile key={c.id} c={c} lang={lang} />)}
          </Reveal>
        </Block>
      ) : null}
      {bks.length ? (
        <div className="bk-grid">
          {bks.map((b) => {
            const donut = b.key === "assetClass" && isWhole(b.rows);
            const hasIndex = b.rows.some((r) => r.index != null);
            return (
              <Block key={b.key} title={tr(T.portfolio.breakdowns[b.key], lang)} className={donut ? "bk-wide" : undefined} testId={`breakdown-${b.key}`}
                aside={hasIndex && !donut ? <div className="fx-legend"><span><i className="fund" />{names.fund}</span><span><i className="index" style={{ height: 5 }} />{names.index}</span></div> : null}>
                {donut
                  ? <Donut rows={b.rows} lang={lang} label={tr(T.portfolio.breakdowns[b.key], lang)} indexName={names.index} />
                  : <HBars rows={b.rows} lang={lang} names={names} label={tr(T.portfolio.breakdowns[b.key], lang)} />}
              </Block>
            );
          })}
        </div>
      ) : null}
      {holdings.length || esg.length ? (
        <div className={`bk-grid ${holdings.length && esg.length ? "" : "one"}`}>
          {holdings.length ? (
            <Block title={tr(T.portfolio.holdings, lang)} testId="holdings">
              <HoldingsTable items={holdings} lang={lang} />
            </Block>
          ) : null}
          {esg.length ? (
            <Block title={tr(T.portfolio.esg, lang)} lead={esg.some((c) => c.index != null) ? tr(T.portfolio.esgLead, lang) : undefined} testId="esg">
              <table className="table ft-table">
                <caption className="sr-only">{tr(T.portfolio.esg, lang)}</caption>
                <thead><tr><th scope="col">{tr(T.portfolio.metric, lang)}</th><th scope="col">{fundWord}</th>{esg.some((c) => c.index != null) ? <th scope="col">{names.index}</th> : null}</tr></thead>
                <tbody>
                  {esg.map((c) => (
                    <tr key={c.id}>
                      <td className="wrap">{tr(c.label, lang)}</td>
                      <td className="strong">{charValue(c.fund, c.unit, lang)}</td>
                      {esg.some((x) => x.index != null) ? <td>{charValue(c.index ?? null, c.unit, lang) ?? "—"}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Block>
          ) : null}
        </div>
      ) : null}
    </div>
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
  return (
    <table className="table ft-table hd-table" data-testid="holdings-table">
      <caption className="sr-only">{tr(T.portfolio.holdings, lang)}</caption>
      <thead><tr><th scope="col">#</th><th scope="col">{tr(T.portfolio.holding, lang)}</th><th scope="col" className="hd-bar-h"><span className="sr-only">{tr(T.portfolio.weight, lang)}</span></th><th scope="col">{tr(T.portfolio.weight, lang)}</th></tr></thead>
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
    </table>
  );
}
