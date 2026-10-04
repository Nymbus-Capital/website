"use client";
/**
 * Awards and rankings tab, in this order: the Morningstar overall rating, Fundata category rank and quartile per period
 * with the FundGrade (read on FundLibrary.com; Fund Library is now Fundata), then percentile rankings from RBC Investor
 * Services (pooled fund survey) and eVestment, LSEG Lipper and GMR once an admin confirmed them. Shown only for a fund
 * with a Fundata FundGrade of A or B (lib/rankings.ts). Third-party data kept in the admin content (updated manually), always shown with its source,
 * link and as-of date; the server page already removed drafts and stale entries. Provider names are plain text unless
 * the official logo file is present (no imitation artwork).
 */
import { ExternalLink } from "lucide-react";
import type { FundContent, FundLibraryRanking, ThirdPartyRanking } from "@/lib/data/types";
import type { BrandAssets } from "@/lib/data/brand-assets";
import { ordinal, PROVIDER_META } from "@/lib/rankings/policy";
import type { PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { RK } from "./rankings-copy";
import { Block } from "./Block";
import { MorningstarRatingBlock } from "./Morningstar";
import { dateLabel, monthLabel, type Lang } from "./lib/format.ts";
import { FUND_INCEPTION } from "@/content/disclaimers";
import { rankingsToShow } from "./lib/rankings.ts";

const CLASS_WORD = /^(class|series|série|classe)\s+/i;

const EXTRA_PERIODS: Record<string, { en: string; fr: string }> = { "6M": { en: "6 months", fr: "6 mois" }, "4Y": { en: "4 years", fr: "4 ans" } };
function periodLabel(p: string, lang: Lang): string {
  const known = (T.perf.periodsLong as Record<string, { en: string; fr: string }>)[p] ?? EXTRA_PERIODS[p];
  return known ? tr(known, lang) : p;
}

/** Provider name as plain text, or its official logo when the file is present (sized per provider in fund.css). */
export const Wordmark = ({ kind, children, logo }: { kind: string; children: string; logo?: string }) =>
  logo ? <img className={`aw-logo aw-logo-${kind}`} src={logo} alt={children} data-testid={`logo-${kind}`} /> : <span className={`aw-wm aw-wm-${kind}`}>{children}</span>;

/** Fundata's name on the page; the figures are read on its FundLibrary.com fund pages (the source link says so). */
export const FUNDATA = "Fundata";
export const FUNDATA_SOURCE = "Fundata (FundLibrary.com)";

const sep = (lang: Lang) => (lang === "fr" ? "\u00a0: " : ": ");

function SourceLink({ url, name, lang }: { url?: string; name: string; lang: Lang }) {
  return url ? (
    <p className="fine fxb-foot">
      {tr(T.awards.source, lang)}{sep(lang)}<a className="link" href={url} target="_blank" rel="noopener noreferrer">{name}<ExternalLink aria-hidden="true" /><span className="sr-only"> ({lang === "fr" ? "nouvel onglet" : "opens in a new tab"})</span></a>
    </p>
  ) : <p className="fine fxb-foot">{tr(T.awards.source, lang)}{sep(lang)}{name}</p>;
}

/** "1st percentile" / « 1er centile », else "3 of 108". */
export function standing(r: ThirdPartyRanking["rows"][number], lang: Lang): string {
  if (r.percentile != null) return tr(RK.tp.percentile, lang).replace("{ord}", ordinal(r.percentile, lang));
  return tr(RK.tp.rankOf, lang).replace("{rank}", String(r.rank)).replace("{of}", String(r.of));
}

/** Who the figures are for: the strategy track record (incl. pre-launch periods), the fund as a whole, or a series. */
export function scopeLabel(e: Pick<ThirdPartyRanking, "scope" | "trackSince" | "classLabel">, lang: Lang, short = false): string {
  if (e.trackSince) return tr(short ? RK.tp.strategyShort : RK.tp.strategyScope, lang).replace("{month}", monthLabel(e.trackSince, lang));
  if (e.scope === "fund") return tr(short ? RK.tp.fundShort : RK.tp.fundLevel, lang);
  return e.classLabel;
}

function ThirdPartyEntry({ e, lang, brand, fundKey }: { e: ThirdPartyRanking; lang: Lang; brand?: BrandAssets; fundKey: string }) {
  const meta = PROVIDER_META[e.provider];
  const code = e.fundserv ? ` (${e.fundserv})` : "";
  const launch = FUND_INCEPTION[fundKey]?.fundLaunch;
  return (
    <Block title={`${tr(meta.source, lang)}${e.edition ? ` — ${e.edition}` : ""}`} testId={`tp-${e.provider}`}
      aside={<Wordmark kind={e.provider} logo={brand?.[meta.logoSlot as keyof BrandAssets]}>{meta.name}</Wordmark>}
      lead={<><span data-testid="tp-scope">{scopeLabel(e, lang)}</span>{code} · {tr(RK.tp.category, lang)}{sep(lang)}<strong>{tr(e.category, lang)}</strong> · {tr(RK.tp.periodEnd, lang)} {dateLabel(e.asOf, lang, true)}</>}>
      {e.basis ? <p className="fine aw-basis" data-testid="tp-basis">{tr(RK.tp.basis, lang).replace("{b}", tr(e.basis, lang))}</p> : null}
      {e.trackSince ? (
        <p className="fine aw-basis" data-testid="tp-prelaunch">
          {tr(RK.tp.preLaunch, lang).replace("{month}", monthLabel(e.trackSince, lang)).replace("{launch}", launch ? tr(RK.tp.launchOn, lang).replace("{date}", tr(launch, lang)) : "")}{" "}
          <a className="link" href="#disclosure">{tr(RK.tp.disclosures, lang)}</a>
        </p>
      ) : null}
      <div className="fx-scroll">
        <table className="table ft-table aw-table" data-testid="tp-table">
          <caption className="sr-only">{tr(RK.tp.table, lang)}</caption>
          <thead><tr><th scope="col">{tr(RK.tp.period, lang)}</th><th scope="col">{tr(RK.tp.standing, lang)}</th></tr></thead>
          <tbody>
            {e.rows.map((r) => (
              <tr key={r.period} data-testid={`tp-row-${r.period}`}>
                <td>{periodLabel(r.period, lang)}</td>
                <td><strong>{standing(r, lang)}</strong></td>
              </tr>
            ))}
            {(e.rolling ?? []).map((a) => (
              <tr key={`${a.years}-${a.end}`} data-testid={`tp-rolling-${a.years}y-${a.end.slice(0, 4)}`}>
                <td>{tr(RK.tp.rolling, lang).replace("{n}", String(a.years)).replace("{date}", dateLabel(a.end, lang, true))}</td>
                <td><strong>{a.percentile != null ? tr(RK.tp.percentile, lang).replace("{ord}", ordinal(a.percentile, lang)) : "—"}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SourceLink url={e.url} name={tr(meta.source, lang)} lang={lang} />
    </Block>
  );
}

function Entry({ e, lang, brand }: { e: FundLibraryRanking; lang: Lang; brand?: BrandAssets }) {
  const code = e.fundserv ? ` (${e.fundserv})` : "";
  return (
    <Block title={`${tr(T.awards.series, lang)} ${e.classLabel.replace(CLASS_WORD, "")}${code}`} testId={`ranking-${e.fundserv ?? e.classLabel}`}
      aside={<Wordmark kind="fundata" logo={brand?.["fundata-logo"]}>{FUNDATA}</Wordmark>}
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
      <SourceLink url={e.url} name={FUNDATA_SOURCE} lang={lang} />
    </Block>
  );
}

export function AwardsTab({ spec, content, lang, brand }: { spec: FundSpec; content: FundContent; lang: Lang; brand?: BrandAssets }) {
  const r = rankingsToShow(content, spec.classes);
  if (!r) return null;
  const ms = r.morningstar;
  return (
    <div className="container fp" data-testid="awards">
      <p className="fp-context">{tr(T.awards.intro, lang)}</p>
      {ms ? (
        <Block title={tr(T.awards.morningstar, lang)} testId="awards-morningstar">
          <MorningstarRatingBlock m={ms} brand={brand} lang={lang} variant="full" />
        </Block>
      ) : null}
      {r.fundLibrary.map((e) => <Entry key={`${e.fundserv ?? ""}-${e.classLabel}`} e={e} lang={lang} brand={brand} />)}
      {r.thirdParty.map((e, i) => <ThirdPartyEntry key={`${e.provider}-${i}`} e={e} lang={lang} brand={brand} fundKey={spec.key} />)}
      {r.thirdParty.length ? <p className="fine aw-note" data-testid="tp-note">{tr(RK.tp.note, lang)}</p> : null}
      <p className="fine aw-note" data-testid="awards-note">{tr(T.awards.note, lang)}</p>
    </div>
  );
}
