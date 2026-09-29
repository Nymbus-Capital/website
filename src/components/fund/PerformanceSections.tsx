"use client";
/**
 * Performance screens: trailing returns (grouped bars + table), growth of 10 000 $, calendar years,
 * monthly heatmap, risk figures (SI / 3Y toggle).
 */
import { useMemo, useState } from "react";
import { CountUp, Reveal, RevealTitle } from "@/components/v3/motion";
import type { FundSpec } from "@/config/funds";
import type { Performance, RiskStats } from "@/lib/data/types";
import { T, tr } from "./copy";
import { GroupedBars, type BarCategory } from "./charts/GroupedBars";
import { GrowthChart } from "./charts/GrowthChart";
import { Heatmap } from "./charts/Heatmap";
import { Ring } from "./charts/Breakdowns";
import { fmt, monthLabel, type Lang } from "./lib/format.ts";
import { calendarRows, isAnnualized, trailingPeriods, type Range } from "./lib/data.ts";

export function SectionHead({ kicker, title, lead, id }: { kicker: string; title: string; lead?: string; id?: string }) {
  return (
    <header className="fx-head">
      <Reveal className="kicker" self><span className="fx-fund-mark" />{kicker}</Reveal>
      <RevealTitle text={title} className="h2" />
      {id ? <span id={id} className="sr-only">{title}</span> : null}
      {lead ? <Reveal as="p" className="lead" self delay={200}>{lead}</Reveal> : null}
    </header>
  );
}

const names = (spec: FundSpec, lang: Lang) => ({
  fund: tr(spec.vehicle === "fund" ? T.trailing.fund : T.trailing.strategy, lang),
  index: tr(T.trailing.index, lang),
  va: tr(T.trailing.va, lang),
});

/* ------------------------------------------------------------------ trailing */

export function TrailingSection({ spec, perf, lang }: { spec: FundSpec; perf: Performance; lang: Lang }) {
  const periods = trailingPeriods(perf.trailing.fund);
  const hasIndex = periods.some((p) => perf.trailing.index?.[p] != null);
  const hasVa = periods.some((p) => perf.trailing.va?.[p] != null);
  const n = names(spec, lang);
  const cats: BarCategory[] = periods.map((p) => ({
    key: p, label: tr(T.trailing.periods[p], lang), long: tr(T.trailing.periodsLong[p], lang) + (isAnnualized(p, perf.firstMonth, perf.asOf) ? "*" : ""),
    fund: perf.trailing.fund[p] ?? null, index: perf.trailing.index?.[p] ?? null, va: perf.trailing.va?.[p] ?? null,
  }));
  const anyAnn = periods.some((p) => isAnnualized(p, perf.firstMonth, perf.asOf));
  const p = (v: number | null | undefined, sign = false) => (v == null ? "—" : fmt(v, { pct: true, decimals: 2, sign, lang }));
  return (
    <section className="screen glow auto" id="performance" data-section="performance" data-swap="" aria-labelledby="fx-trailing-t">
      <div className="wrap">
        <SectionHead kicker={`${tr(T.trailing.kicker, lang)} · ${tr(T.hero.asOf, lang)} ${monthLabel(perf.asOf, lang)}`} title={tr(T.trailing.title, lang)} id="fx-trailing-t" />
        <Reveal self>
          <div className="fx-legend">
            <span><i className="fund" />{n.fund}</span>
            {hasIndex ? <span><i className="index" />{n.index}</span> : null}
            {hasVa ? <span><i className="va" />{n.va}</span> : null}
          </div>
        </Reveal>
        <div data-testid="trailing-chart">
          <GroupedBars cats={cats} names={n} lang={lang} label={tr(T.trailing.title, lang)} />
        </div>
        {anyAnn ? <p className="fine fx-foot">* {tr(T.trailing.annualized, lang)}</p> : null}
        <details className="fx-details">
          <summary>{tr(T.trailing.table, lang)}</summary>
          <div className="scroll-x">
            <table className="table" data-testid="trailing-table">
              <caption className="sr-only">{tr(T.trailing.title, lang)}</caption>
              <thead>
                <tr><th scope="col">{tr(T.trailing.period, lang)}</th>{periods.map((x) => <th key={x} scope="col">{tr(T.trailing.periods[x], lang)}{isAnnualized(x, perf.firstMonth, perf.asOf) ? "*" : ""}</th>)}</tr>
              </thead>
              <tbody>
                <tr className="hl"><th scope="row" style={{ textAlign: "left", fontWeight: 600, color: "var(--ink)", padding: "13px 12px 13px 0" }}>{n.fund}</th>{periods.map((x) => <td key={x}>{p(perf.trailing.fund[x])}</td>)}</tr>
                {hasIndex ? <tr><th scope="row" style={{ textAlign: "left", fontWeight: 400, color: "var(--ink2)", padding: "13px 12px 13px 0", borderTop: "1px solid var(--line)" }}>{n.index}</th>{periods.map((x) => <td key={x}>{p(perf.trailing.index?.[x])}</td>)}</tr> : null}
                {hasVa ? <tr><th scope="row" style={{ textAlign: "left", fontWeight: 400, color: "var(--ink2)", padding: "13px 12px 13px 0", borderTop: "1px solid var(--line)" }}>{n.va}</th>{periods.map((x) => <td key={x} className={(perf.trailing.va?.[x] ?? 0) < 0 ? "neg" : undefined}>{p(perf.trailing.va?.[x], true)}</td>)}</tr> : null}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ growth */

export function GrowthSection({ spec, perf, lang }: { spec: FundSpec; perf: Performance; lang: Lang }) {
  const n = names(spec, lang);
  const ranges = Object.fromEntries((["1Y", "3Y", "5Y", "SI"] as Range[]).map((r) => [r, tr(T.growth.ranges[r], lang)])) as Record<Range, string>;
  return (
    <section className="screen dark auto" id="growth" data-section="growth" data-swap="" aria-labelledby="fx-growth-t">
      <div className="wrap">
        <SectionHead kicker={tr(T.growth.kicker, lang)} title={tr(T.growth.title, lang)} lead={tr(T.growth.lead, lang)} id="fx-growth-t" />
        <GrowthChart points={perf.growth} lang={lang} names={n} rangeLabels={ranges} rangeGroupLabel={tr(T.growth.range, lang)}
          label={tr(T.growth.title, lang)} keysHint={tr(T.growth.keys, lang)} rebasedNote={tr(T.growth.rebased, lang)} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ calendar */

export function CalendarSection({ spec, perf, lang }: { spec: FundSpec; perf: Performance; lang: Lang }) {
  const rows = calendarRows(perf.calendar);
  const n = names(spec, lang);
  const hasIndex = rows.some((r) => r.index != null);
  const hasVa = rows.some((r) => r.va != null);
  const cats: BarCategory[] = rows.map((r) => ({
    key: String(r.year), label: String(r.year), long: String(r.year), flag: r.partial ? tr(T.calendar.ytd, lang) : undefined,
    fund: r.fund, index: r.index ?? null, va: r.va ?? null,
  }));
  const p = (v: number | null | undefined, sign = false) => (v == null ? "—" : fmt(v, { pct: true, decimals: 2, sign, lang }));
  return (
    <section className="screen glow auto" id="calendar" data-section="calendar" data-swap="" aria-labelledby="fx-cal-t">
      <div className="wrap">
        <SectionHead kicker={tr(T.calendar.kicker, lang)} title={tr(T.calendar.title, lang)} id="fx-cal-t" />
        <Reveal self>
          <div className="fx-legend">
            <span><i className="fund" />{n.fund}</span>
            {hasIndex ? <span><i className="index" />{n.index}</span> : null}
            {hasVa ? <span><i className="va" />{n.va}</span> : null}
          </div>
        </Reveal>
        <GroupedBars cats={cats} names={n} lang={lang} label={tr(T.calendar.title, lang)} height={360} values={rows.length <= 10} />
        <details className="fx-details">
          <summary>{tr(T.trailing.table, lang)}</summary>
          <div className="scroll-x">
            <table className="table">
              <caption className="sr-only">{tr(T.calendar.title, lang)}</caption>
              <thead><tr><th scope="col">{tr(T.calendar.year, lang)}</th><th scope="col">{n.fund}</th>{hasIndex ? <th scope="col">{n.index}</th> : null}{hasVa ? <th scope="col">{n.va}</th> : null}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.year}>
                    <td>{r.year}{r.partial ? ` (${tr(T.calendar.partial, lang)})` : ""}</td>
                    <td>{p(r.fund)}</td>
                    {hasIndex ? <td>{p(r.index)}</td> : null}
                    {hasVa ? <td className={(r.va ?? 0) < 0 ? "neg" : undefined}>{p(r.va, true)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ heatmap */

export function HeatmapSection({ spec, perf, lang }: { spec: FundSpec; perf: Performance; lang: Lang }) {
  return (
    <section className="screen auto" id="monthly" data-section="monthly" data-swap="" aria-labelledby="fx-hm-t">
      <div className="wrap">
        <SectionHead kicker={tr(T.heatmap.kicker, lang)} title={tr(T.heatmap.title, lang)} id="fx-hm-t" />
        <Heatmap monthly={perf.monthly} calendar={perf.calendar} lang={lang} caption={tr(T.heatmap.kicker, lang)}
          labels={{ year: tr(T.heatmap.year, lang), total: tr(T.heatmap.total, lang), ytd: tr(T.calendar.ytd, lang), neg: tr(T.heatmap.legendNeg, lang), pos: tr(T.heatmap.legendPos, lang), fund: names(spec, lang).fund }} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ risk */

type RiskKey = Exclude<keyof RiskStats, "window">;
const RISK_FIGS: { k: RiskKey; kind: "pct" | "ratio"; tone: "fund" | "cyan" | "neg" | "pos" }[] = [
  { k: "annReturn", kind: "pct", tone: "fund" },
  { k: "annVol", kind: "pct", tone: "cyan" },
  { k: "downsideDev", kind: "pct", tone: "cyan" },
  { k: "sharpe", kind: "ratio", tone: "fund" },
  { k: "sortino", kind: "ratio", tone: "fund" },
  { k: "maxDrawdown", kind: "pct", tone: "neg" },
  { k: "bestMonth", kind: "pct", tone: "pos" },
  { k: "worstMonth", kind: "pct", tone: "neg" },
];

export function RiskSection({ windows, lang, perf }: { windows: RiskStats[]; lang: Lang; perf: Performance | null }) {
  const [w, setW] = useState(0);
  const risk = windows[Math.min(w, windows.length - 1)];
  const figs = useMemo(() => RISK_FIGS.filter((f) => typeof risk[f.k] === "number"), [risk]);
  const cls = (tone: string, v: number) => (tone === "fund" ? (v < 0 ? "g-red" : "g-fund") : tone === "cyan" ? "g-cyan" : tone === "pos" ? (v < 0 ? "g-red" : "g-green") : "g-red");
  return (
    <section className="screen dark auto" id="risk" data-section="risk" data-swap="" aria-labelledby="fx-risk-t">
      <div className="wrap">
        <SectionHead kicker={tr(T.risk.kicker, lang)} title={tr(T.risk.title, lang)} id="fx-risk-t"
          lead={perf ? `${tr(T.risk.annualized, lang)} · ${tr(T.hero.asOf, lang)} ${monthLabel(perf.asOf, lang)}` : undefined} />
        {windows.length > 1 ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
            <div className="fx-seg" role="group" aria-label={tr(T.risk.kicker, lang)}>
              {windows.map((x, i) => <button type="button" key={x.window} aria-pressed={i === w} onClick={() => setW(i)}>{tr(T.risk.windows[x.window], lang)}</button>)}
            </div>
          </div>
        ) : (
          <p className="small" style={{ textAlign: "center", marginTop: -24, marginBottom: 48, textTransform: "lowercase" }}>{tr(T.risk.windows[risk.window], lang)}</p>
        )}
        <Reveal className="fx-figs" kind="pop" stagger={80} key={risk.window}>
          {figs.map((f) => {
            const v = risk[f.k] as number;
            return (
              <div key={f.k}>
                <CountUp value={v} pct={f.kind === "pct"} decimals={f.kind === "pct" ? 1 : 2} lang={lang} className={`fig l ${cls(f.tone, v)}`} />
                <div className="fig-label">{tr(T.risk[f.k], lang)}</div>
              </div>
            );
          })}
          {typeof risk.positiveMonths === "number" ? (
            <div>
              <Ring value={risk.positiveMonths} lang={lang} label={tr(T.risk.positiveMonths, lang)} />
              <div className="fig-label">{tr(T.risk.positiveMonths, lang)}</div>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
