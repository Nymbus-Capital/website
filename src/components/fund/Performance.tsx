"use client";
/**
 * Performance tab: growth of $10,000, trailing / annualized returns vs benchmark, calendar years, monthly heat
 * map, risk statistics (since inception / 3 years) and the performance notes. Every chart has its data table.
 */
import { useMemo, useState } from "react";
import { CountUp, Reveal } from "@/components/v3/motion";
import type { FundContent, Performance as Perf, RiskStats } from "@/lib/data/types";
import { preInceptionNote } from "@/content/disclaimers";
import type { PublicFundData as FundData, PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { FL } from "./labels";
import { Block } from "./Block";
import { GroupedBars, type BarCategory } from "./charts/GroupedBars";
import { GrowthChart } from "./charts/GrowthChart";
import { Heatmap } from "./charts/Heatmap";
import { Ring } from "./charts/Breakdowns";
import { dateLabel, fmt, type Lang } from "./lib/format.ts";
import { benchmarkLabel, calendarRows, growthMethod, partialKind, perfClassLabel, riskWindows, trailingRows, visibleBlocks, type Range } from "./lib/data.ts";

interface Props { spec: FundSpec; content: FundContent; data: FundData | null; lang: Lang }

const P = (v: number | null | undefined, lang: Lang, sign = false) => (v == null ? "—" : fmt(v, { pct: true, decimals: 2, sign, lang }));

export function PerformanceTab({ spec, content, data, lang }: Props) {
  const v = visibleBlocks(data, content, 0);
  const perf = data?.performance ?? null;
  const windows = riskWindows([data?.risk, data?.risk3Y]);
  const isFund = spec.vehicle === "fund";
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  const names = {
    fund: tr(isFund ? T.perf.fund : T.perf.strategy, lang),
    index: tr(T.perf.index, lang),
    va: tr(T.perf.va, lang),
  };
  const cl = perfClassLabel(perf, tr(T.nav.series, lang));
  const any = v.growth || v.trailing || v.calendar || v.heatmap || v.risk;

  return (
    <div className="container fp">
      {perf && any ? (
        <p className="fp-context" data-testid="perf-context">
          {tr(T.perf.classShown, lang)}: {cl ? `${cl}, ` : ""}{tr(gross ? T.disclosure.basisGross : T.disclosure.basisNet, lang)} · {tr(T.perf.asOf, lang)} {dateLabel(perf.asOf, lang, true)}
          {benchmarkLabel(perf.indexName, spec.benchmark, lang) ? <> · {tr(T.perf.index, lang)}: {benchmarkLabel(perf.indexName, spec.benchmark, lang)}</> : null}
        </p>
      ) : null}
      {!any ? <p className="notice" data-testid="perf-soon">{tr(T.perf.none, lang)}</p> : null}
      {v.growth && perf ? (
        <Block title={tr(T.perf.growth, lang)} lead={tr(gross ? T.perf.growthLeadGross : T.perf.growthLead, lang)} testId="growth">
          <GrowthChart points={perf.growth} lang={lang} names={names} rangeGroupLabel={tr(T.perf.range, lang)} label={tr(T.perf.growth, lang)}
            rangeLabels={Object.fromEntries((["1Y", "3Y", "5Y", "SI"] as Range[]).map((r) => [r, tr(T.perf.ranges[r], lang)])) as Record<Range, string>}
            keysHint={tr(T.perf.keys, lang)} rebasedNote={tr(T.perf.rebased, lang)} method={growthMethod(perf, spec.sources.basis)} />
        </Block>
      ) : null}
      {v.trailing && perf ? <TrailingBlock perf={perf} names={names} lang={lang} /> : null}
      {v.calendar && perf ? <CalendarBlock perf={perf} names={names} lang={lang} /> : null}
      {v.heatmap && perf ? (
        <Block title={tr(T.perf.monthly, lang)} lead={tr(T.perf.monthlyLead, lang)} testId="heatmap">
          <Heatmap monthly={perf.monthly} calendar={perf.calendar} asOf={perf.asOf} lang={lang} caption={tr(T.perf.monthly, lang)}
            labels={{ year: tr(T.perf.year, lang), total: tr(T.perf.year, lang), ytd: tr(T.perf.ytd, lang), launch: tr(FL.sinceLaunch, lang), neg: tr(T.perf.negative, lang), pos: tr(T.perf.positive, lang), fund: names.fund }} />
        </Block>
      ) : null}
      {v.risk ? <RiskBlock windows={windows} lang={lang} /> : null}
      <NotesBlock spec={spec} content={content} perf={perf} lang={lang} />
    </div>
  );
}

function Legend({ names, index, va }: { names: { fund: string; index: string; va: string }; index: boolean; va: boolean }) {
  return (
    <div className="fx-legend">
      <span><i className="fund" />{names.fund}</span>
      {index ? <span><i className="index" />{names.index}</span> : null}
      {va ? <span><i className="va pill" />{names.va}</span> : null}
    </div>
  );
}

function TrailingBlock({ perf, names, lang }: { perf: Perf; names: { fund: string; index: string; va: string }; lang: Lang }) {
  const rows = trailingRows(perf);
  const hasIndex = rows.some((r) => r.index != null);
  const hasVa = rows.some((r) => r.va != null);
  const cats: BarCategory[] = rows.map((r) => ({
    key: r.period, label: tr(T.perf.periods[r.period], lang), long: tr(T.perf.periodsLong[r.period], lang) + (r.annualized ? "*" : ""),
    fund: r.fund, index: r.index, va: r.va,
  }));
  return (
    <Block title={tr(T.perf.trailing, lang)} testId="trailing" aside={<Legend names={names} index={hasIndex} va={hasVa} />}>
      <div data-testid="trailing-chart">
        <GroupedBars cats={cats} names={names} lang={lang} label={tr(T.perf.trailing, lang)} height={340} />
      </div>
      {rows.some((r) => r.annualized) ? <p className="fine fxb-foot">* {tr(T.badges.annualized, lang)}</p> : null}
      <details className="fx-details">
        <summary>{tr(T.perf.table, lang)}</summary>
        <div className="fx-scroll">
          <table className="table ft-table" data-testid="trailing-table">
            <caption className="sr-only">{tr(T.perf.trailing, lang)}</caption>
            <thead><tr><th scope="col">{tr(T.perf.period, lang)}</th><th scope="col">{names.fund}</th>{hasIndex ? <th scope="col">{names.index}</th> : null}{hasVa ? <th scope="col">{names.va}</th> : null}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.period}>
                  <td>{tr(T.perf.periodsLong[r.period], lang)}{r.annualized ? "*" : ""}</td>
                  <td>{P(r.fund, lang)}</td>
                  {hasIndex ? <td>{P(r.index, lang)}</td> : null}
                  {hasVa ? <td className={r.va == null ? undefined : r.va < 0 ? "neg" : "pos"}>{P(r.va, lang, true)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Block>
  );
}

function CalendarBlock({ perf, names, lang }: { perf: Perf; names: { fund: string; index: string; va: string }; lang: Lang }) {
  const rows = calendarRows(perf.calendar);
  const hasIndex = rows.some((r) => r.index != null);
  const hasVa = rows.some((r) => r.va != null);
  const kind = (r: (typeof rows)[number]) => partialKind(r.year, r.partial, perf.asOf);
  const flag = (r: (typeof rows)[number]) => { const k = kind(r); return k === "ytd" ? tr(T.perf.ytd, lang) : k === "launch" ? tr(FL.sinceLaunch, lang) : undefined; };
  const cats: BarCategory[] = rows.map((r) => ({
    key: String(r.year), label: String(r.year), long: String(r.year), flag: flag(r),
    fund: r.fund, index: r.index ?? null, va: r.va ?? null,
  }));
  return (
    <Block title={tr(T.perf.calendar, lang)} testId="calendar" aside={<Legend names={names} index={hasIndex} va={hasVa} />}>
      <GroupedBars cats={cats} names={names} lang={lang} label={tr(T.perf.calendar, lang)} height={340} values={rows.length <= 10} />
      <details className="fx-details">
        <summary>{tr(T.perf.table, lang)}</summary>
        <div className="fx-scroll">
          <table className="table ft-table" data-testid="calendar-table">
            <caption className="sr-only">{tr(T.perf.calendar, lang)}</caption>
            <thead><tr><th scope="col">{tr(T.perf.year, lang)}</th><th scope="col">{names.fund}</th>{hasIndex ? <th scope="col">{names.index}</th> : null}{hasVa ? <th scope="col">{names.va}</th> : null}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}{kind(r) ? ` (${tr(kind(r) === "ytd" ? FL.ytdLong : FL.sinceLaunch, lang)})` : ""}</td>
                  <td>{P(r.fund, lang)}</td>
                  {hasIndex ? <td>{P(r.index, lang)}</td> : null}
                  {hasVa ? <td className={r.va == null ? undefined : r.va < 0 ? "neg" : "pos"}>{P(r.va, lang, true)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Block>
  );
}

type RiskKey = Exclude<keyof RiskStats, "window" | "decimals" | "positiveMonths">;
const RISK_FIGS: { k: RiskKey; kind: "pct" | "ratio"; tone: "ink" | "neg" | "pos" }[] = [
  { k: "annReturn", kind: "pct", tone: "ink" },
  { k: "annVol", kind: "pct", tone: "ink" },
  { k: "downsideDev", kind: "pct", tone: "ink" },
  { k: "sharpe", kind: "ratio", tone: "ink" },
  { k: "sortino", kind: "ratio", tone: "ink" },
  { k: "maxDrawdown", kind: "pct", tone: "neg" },
  { k: "bestMonth", kind: "pct", tone: "pos" },
  { k: "worstMonth", kind: "pct", tone: "neg" },
];

function RiskBlock({ windows, lang }: { windows: RiskStats[]; lang: Lang }) {
  const [w, setW] = useState(0);
  const risk = windows[Math.min(w, windows.length - 1)];
  const figs = useMemo(() => RISK_FIGS.filter((f) => typeof risk[f.k] === "number"), [risk]);
  const toggle = windows.length > 1 ? (
    <div className="fx-seg" role="group" aria-label={tr(T.perf.risk, lang)}>
      {windows.map((x, i) => <button type="button" key={x.window} aria-pressed={i === w} onClick={() => setW(i)}>{tr(T.perf.windows[x.window], lang)}</button>)}
    </div>
  ) : <span className="fx-chip">{tr(T.perf.windows[risk.window], lang)}</span>;
  return (
    <Block title={tr(T.perf.risk, lang)} lead={tr(T.perf.riskLead, lang)} aside={toggle} testId="risk">
      <Reveal className="rk-grid" kind="pop" stagger={60} key={risk.window}>
        {figs.map((f) => {
          const v = risk[f.k] as number;
          const tone = f.tone === "ink" ? (f.k === "annReturn" && v < 0 ? "neg" : "ink") : f.tone;
          return (
            <div key={f.k} className="rk-tile" data-testid={`risk-${f.k}`}>
              <CountUp value={v} pct={f.kind === "pct"} decimals={risk.decimals?.[f.k] ?? 2} lang={lang} className={`rk-v ${tone}`} />
              <span className="rk-l">{tr(T.perf[f.k], lang)}</span>
            </div>
          );
        })}
        {typeof risk.positiveMonths === "number" ? (
          <div className="rk-tile rk-ring">
            <Ring value={risk.positiveMonths} lang={lang} label={tr(T.perf.positiveMonths, lang)} />
            <span className="rk-l">{tr(T.perf.positiveMonths, lang)}</span>
          </div>
        ) : null}
      </Reveal>
    </Block>
  );
}

function NotesBlock({ spec, content, perf, lang }: { spec: FundSpec; content: FundContent; perf: Perf | null; lang: Lang }) {
  const note = content.performanceNote && (content.performanceNote.en || content.performanceNote.fr) ? content.performanceNote : preInceptionNote(spec.key);
  const gross = (perf?.basis ?? spec.sources.basis) === "gross";
  return (
    <Block title={tr(T.perf.notes, lang)} card={false} className="fp-notes" testId="perf-notes">
      {note ? <p className="fxb-text sm">{tr(note, lang)}</p> : null}
      <p className="fxb-text sm">{tr(gross ? T.disclosure.gross : T.disclosure.net, lang)}</p>
    </Block>
  );
}
