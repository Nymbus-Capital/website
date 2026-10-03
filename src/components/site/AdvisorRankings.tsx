"use client";
/**
 * Compact list of the confirmed, fresh third-party rankings and ratings of our funds (Morningstar, RBC Investor
 * Services pooled fund survey, eVestment, LSEG Lipper, GMR, Fund Library), for financial advisors (/solutions). Each
 * line carries its source name, link and as-of date; provider names are text unless the official logo file is present.
 *
 * Usage: `<AdvisorRankings />` anywhere under <AdvisorRankingsProvider items={…}> (the server page builds the items
 * with src/lib/rankings/advisor.ts), or `<AdvisorRankings items={…} />`. Renders nothing when there is no item.
 */
import { createContext, useContext, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { AdvisorFigure, AdvisorRankingItem } from "@/lib/rankings/advisor";
import { ordinal } from "@/lib/rankings/policy";
import { RK } from "@/components/fund/rankings-copy";
import { ratingText } from "@/components/fund/Morningstar";
import "./advisor-rankings.css";

const Ctx = createContext<AdvisorRankingItem[] | null>(null);

export function AdvisorRankingsProvider({ items, children }: { items: AdvisorRankingItem[]; children: ReactNode }) {
  return <Ctx.Provider value={items}>{children}</Ctx.Provider>;
}

const CLASS_WORD = /^(class|series|série|classe)\s+/i;

function dateText(iso: string, locale: "en" | "fr"): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(d);
}

function figureText(f: AdvisorFigure, locale: "en" | "fr", pick: (l: { en: string; fr: string }) => string): string {
  if (f.percentile != null) return pick(RK.tp.percentile).replace("{ord}", ordinal(f.percentile, locale));
  if (f.rank != null && f.of != null) return pick(RK.adv.rankOf).replace("{rank}", String(f.rank)).replace("{of}", String(f.of));
  return "";
}

export function AdvisorRankings({ items: own, title = true }: { items?: AdvisorRankingItem[]; title?: boolean }) {
  const ctx = useContext(Ctx);
  const { locale: loc, pick } = useTranslation();
  const locale: "en" | "fr" = loc === "fr" ? "fr" : "en";
  const items = own ?? ctx ?? [];
  if (!items.length) return null;
  const funds = [...new Map(items.map((i) => [i.fund, i.fundName] as const)).entries()];
  const hasMs = items.some((i) => i.kind === "morningstar");
  const msAsOf = items.find((i) => i.kind === "morningstar")?.asOf ?? "";
  return (
    <section className="advr" data-testid="advisor-rankings" aria-labelledby={title ? "advr-t" : undefined} aria-label={title ? undefined : pick(RK.adv.eyebrow)}>
      {title ? (
        <header className="advr-head">
          <p className="advr-eyebrow">{pick(RK.adv.eyebrow)}</p>
          <h3 className="h4" id="advr-t">{pick(RK.adv.title)}</h3>
          <p className="advr-lead">{pick(RK.adv.lead)}</p>
        </header>
      ) : null}
      {funds.map(([key, name]) => (
        <div key={key} className="advr-fund" data-testid={`advisor-rankings-${key}`}>
          <h4 className="advr-fund-n">{pick(name)}</h4>
          <ul className="advr-list" role="list">
            {items.filter((i) => i.fund === key).map((i, n) => (
              <li key={`${i.kind}-${n}`} className="advr-item" data-testid={`advisor-item-${i.kind}`}>
                <span className="advr-prov">
                  {i.logo ? <img src={i.logo} alt={i.provider} height={20} /> : <span className="advr-wm">{i.provider}</span>}
                </span>
                <span className="advr-body">
                  <span className="advr-what">
                    {i.kind === "morningstar" && i.stars ? <b>{ratingText({ stars: i.stars as 1 | 2 | 3 | 4 | 5 }, locale)}</b> : null}
                    {i.figures.length ? (
                      <span className="advr-figs">
                        {i.figures.map((f) => (
                          <span key={f.period} className="advr-fig"><b>{figureText(f, locale, pick)}</b> <span>{pick(RK.adv.periods[f.period])}</span></span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                  <span className="advr-meta">
                    {pick(RK.ms.series).replace("{x}", i.classLabel.replace(CLASS_WORD, ""))}
                    {i.category ? ` · ${pick(i.category)}` : ""}
                    {i.edition ? ` · ${i.edition}` : ""}
                    {` · ${pick(RK.adv.asAt)} ${dateText(i.asOf, locale)} · `}
                    <a className="link" href={i.url} target="_blank" rel="noopener noreferrer">
                      {pick(RK.adv.source)}{locale === "fr" ? " : " : ": "}{pick(i.source)}<ExternalLink aria-hidden="true" /><span className="sr-only"> ({pick(RK.adv.newTab)})</span>
                    </a>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="fine advr-note">{pick(RK.adv.note)}</p>
      {items.some((i) => i.figures.some((f) => f.percentile != null)) ? <p className="fine advr-note">{pick(RK.tp.note)}</p> : null}
      {hasMs ? <p className="fine advr-note" data-testid="advisor-ms-attribution">{pick(RK.ms.methodology).replace("{date}", msAsOf ? dateText(msAsOf, locale) : "")} {pick(RK.ms.attribution).replace("{year}", msAsOf.slice(0, 4))}</p> : null}
    </section>
  );
}
