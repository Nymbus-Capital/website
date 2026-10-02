"use client";
/**
 * Awards and rankings tab: Fund Library category rank and quartile per period, FundGrade, and the Morningstar overall
 * rating when the admin has confirmed one. Third-party data kept in the admin content (updated manually), always shown
 * with its source and "as at" date. The logos are CSS wordmarks (text), not the owners' artwork.
 */
import { ExternalLink } from "lucide-react";
import type { FundContent, FundLibraryRanking } from "@/lib/data/types";
import type { PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { Block } from "./Block";
import { dateLabel, type Lang } from "./lib/format.ts";
import { rankingsToShow } from "./lib/rankings.ts";

const CLASS_WORD = /^(class|series|série|classe)\s+/i;

function Stars({ n, lang }: { n: number; lang: Lang }) {
  const label = tr(T.awards.stars, lang).replace("{n}", String(n));
  return (
    <span className="aw-stars" role="img" aria-label={label} data-testid="morningstar-stars" data-stars={n}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className={i <= n ? "on" : "off"}>
          <path d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6l-5.2 2.9 1.2-5.8-4.4-4 5.9-.7z" />
        </svg>
      ))}
    </span>
  );
}

const EXTRA_PERIODS: Record<string, { en: string; fr: string }> = { "6M": { en: "6 months", fr: "6 mois" }, "4Y": { en: "4 years", fr: "4 ans" } };
function periodLabel(p: string, lang: Lang): string {
  const known = (T.perf.periodsLong as Record<string, { en: string; fr: string }>)[p] ?? EXTRA_PERIODS[p];
  return known ? tr(known, lang) : p;
}

/** Text-only wordmark badges (no third-party artwork). */
const Wordmark = ({ kind, children }: { kind: "fl" | "ms" | "fg"; children: string }) => <span className={`aw-wm aw-wm-${kind}`}>{children}</span>;

function Entry({ e, lang }: { e: FundLibraryRanking; lang: Lang }) {
  const code = e.fundserv ? ` (${e.fundserv})` : "";
  return (
    <Block title={`${tr(T.awards.series, lang)} ${e.classLabel.replace(CLASS_WORD, "")}${code}`} testId={`ranking-${e.fundserv ?? e.classLabel}`}
      aside={<Wordmark kind="fl">Fund Library</Wordmark>}
      lead={<>{tr(T.awards.category, lang)}{lang === "fr" ? " " : ""}: <strong>{tr(e.category, lang)}</strong> · {tr(T.awards.asAt, lang)} {dateLabel(e.asOf, lang, true)}</>}>
      {e.fundGrade ? (
        <div className="aw-grade" data-testid="fundgrade">
          <span className="aw-grade-l"><Wordmark kind="fg">FundGrade</Wordmark></span>
          <span className="aw-grade-v" aria-label={`${tr(T.awards.fundGradeLabel, lang)} ${e.fundGrade}`}>{e.fundGrade}</span>
        </div>
      ) : null}
      {e.rows.length ? (
        <div className="fx-scroll">
          <table className="table ft-table aw-table" data-testid="ranking-table">
            <caption className="sr-only">{tr(T.awards.table, lang)}</caption>
            <thead><tr><th scope="col">{tr(T.awards.period, lang)}</th><th scope="col">{tr(T.awards.rank, lang)}</th><th scope="col">{tr(T.awards.quartile, lang)}</th></tr></thead>
            <tbody>
              {e.rows.map((r) => (
                <tr key={r.period} data-testid={`rank-${r.period}`}>
                  <td>{periodLabel(r.period, lang)}</td>
                  <td><strong>{r.rank}</strong> {tr(T.awards.of, lang)} {r.of}</td>
                  <td>{r.quartile != null ? <span className="aw-q" data-q={r.quartile} aria-label={`${tr(T.awards.quartile, lang)} ${r.quartile}`}>Q{r.quartile}</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {e.url ? (
        <p className="fine fxb-foot">
          {tr(T.awards.source, lang)}{lang === "fr" ? " " : ""}: <a className="link" href={e.url} target="_blank" rel="noopener noreferrer">Fund Library<ExternalLink aria-hidden="true" /><span className="sr-only"> ({lang === "fr" ? "nouvel onglet" : "opens in a new tab"})</span></a>
        </p>
      ) : <p className="fine fxb-foot">{tr(T.awards.source, lang)}{lang === "fr" ? " " : ""}: Fund Library</p>}
    </Block>
  );
}

export function AwardsTab({ spec, content, lang }: { spec: FundSpec; content: FundContent; lang: Lang }) {
  const r = rankingsToShow(content, spec.classes);
  if (!r) return null;
  const ms = r.morningstar;
  return (
    <div className="container fp" data-testid="awards">
      <p className="fp-context">{tr(T.awards.intro, lang)}</p>
      {r.fundLibrary.map((e) => <Entry key={`${e.fundserv ?? ""}-${e.classLabel}`} e={e} lang={lang} />)}
      {ms ? (
        <Block title={tr(T.awards.morningstar, lang)} aside={<Wordmark kind="ms">Morningstar</Wordmark>} testId="morningstar"
          lead={<>{ms.category ? `${tr(T.awards.category, lang)}${lang === "fr" ? " " : ""}: ${tr(ms.category, lang)} · ` : ""}{tr(T.awards.asAt, lang)} {dateLabel(ms.asOf, lang, true)}</>}>
          <p className="aw-ms-row"><Stars n={ms.stars} lang={lang} /> <strong data-testid="morningstar-class">{tr(T.awards.series, lang)} {ms.classLabel.replace(CLASS_WORD, "")}</strong></p>
          {ms.url ? <p className="fine fxb-foot">{tr(T.awards.source, lang)}{lang === "fr" ? " " : ""}: <a className="link" href={ms.url} target="_blank" rel="noopener noreferrer">Morningstar<ExternalLink aria-hidden="true" /><span className="sr-only"> ({lang === "fr" ? "nouvel onglet" : "opens in a new tab"})</span></a></p>
            : <p className="fine fxb-foot">{tr(T.awards.source, lang)}{lang === "fr" ? " " : ""}: Morningstar</p>}
        </Block>
      ) : null}
      <p className="fine aw-note" data-testid="awards-note">{tr(T.awards.note, lang)}</p>
    </div>
  );
}
