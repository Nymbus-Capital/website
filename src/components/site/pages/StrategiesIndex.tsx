"use client";
/**
 * /strategies: the four strategies with their live since-inception figures, what each one is built from
 * (the deck's layer "cakes", rising layer by layer) and a side-by-side table. Figures come from the data
 * only; a fund without published figures says so.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal, ScreenSwap, useInView } from "@/components/v3/motion";
import { formatMonth, l, useTranslation } from "@/lib/i18n";
import { HOME, RISK, STACKS } from "../copy";
import type { FundCard, HomeData } from "../home/data";
import { RiskMeter, StrategyGrid } from "../home/Strategies";
import { ContactCta } from "../home/Summary";
import { Head } from "../ui";
import { PageHero } from "./PageHero";

const C = {
  eyebrow: l("strategies", "stratégies"),
  title: l("our investment", "nos stratégies"), accent: l("strategies", "de placement"),
  lead: l("systematic fixed income and uncorrelated strategies, built by the same scientific process.",
    "du revenu fixe systématique et des stratégies non corrélées, bâtis par le même processus scientifique."),
  inside: l("what's inside", "leur composition"), insideT: l("built in", "bâties en"), insideA: l("layers", "couches"),
  insideS: l("every strategy stacks independent sources of return, each with its own role", "chaque stratégie superpose des sources de rendement indépendantes, chacune avec son rôle"),
  compare: l("side by side", "côte à côte"), compareT: l("compare the", "comparer les"), compareA: l("strategies", "stratégies"),
  cols: { strategy: l("strategy", "stratégie"), vehicle: l("vehicle", "véhicule"), asset: l("asset class", "classe d’actifs"), si: l("since inception", "depuis la création"),
    asOf: l("as of", "au"), risk: l("risk", "risque"), code: l("fund code", "code de fonds"), bench: l("benchmark", "indice de référence") },
  soon: l("coming soon", "à venir"),
  none: l("none", "aucun"),
};

/** Deck strategy "cake": isometric layers that stack up one after the other. */
function Cake({ f, index }: { f: FundCard; index: number }) {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const blocks = STACKS[f.key]?.blocks ?? [];
  const style = { "--fund-from": f.color.from, "--fund-to": f.color.to, "--fund": f.color.solid } as CSSProperties;
  return (
    <div ref={ref} className={`cake ${seen ? "go" : ""}`} style={style}>
      <div className="cake-stack" aria-hidden="true">
        {blocks.map((b, i) => (
          <div key={i} className="cake-l" style={{ ["--i" as string]: blocks.length - 1 - i, ["--k" as string]: (i / Math.max(1, blocks.length - 1)).toFixed(3) }}>
            <span>{pick(b)}</span>
          </div>
        ))}
      </div>
      <ul className="sr-only">{blocks.map((b, i) => <li key={i}>{pick(b)}</li>)}</ul>
      <Link href={`/strategies/${f.key}`} className="cake-name">
        <span className="small">0{index + 1}</span> {pick(f.short)} <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function StrategiesIndex({ data }: { data: HomeData }) {
  const { locale, pick } = useTranslation();
  const S = HOME.strategies;
  const pctText = (v: number) => {
    const x = v * 100;
    const s = Math.abs(x).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${x < 0 ? "−" : "+"}${s}${locale === "fr" ? " %" : "%"}`;
  };
  return (
    <div className="stage">
      <ScreenSwap />
      <PageHero eyebrow={pick(C.eyebrow)} title={pick(C.title)} accent={pick(C.accent)} lead={pick(C.lead)} />

      <section className="screen glow" data-swap="" aria-labelledby="si-grid-t">
        <div className="wrap wide">
          <h2 id="si-grid-t" className="sr-only">{pick(C.title)} {pick(C.accent)}</h2>
          <StrategyGrid funds={data.funds} sample={data.sample} />
        </div>
      </section>

      <section className="screen dark auto" data-swap="" aria-labelledby="si-cake-t">
        <div className="wrap wide">
          <Head eyebrow={pick(C.inside)} title={pick(C.insideT)} accent={pick(C.insideA)} sub={pick(C.insideS)} id="si-cake-t" size="h1" className="center-head" />
          <div className="cakes">{data.funds.map((f, i) => <Cake key={f.key} f={f} index={i} />)}</div>
        </div>
      </section>

      <section className="screen glow auto" data-swap="" aria-labelledby="si-cmp-t">
        <div className="wrap wide">
          <Head eyebrow={pick(C.compare)} title={pick(C.compareT)} accent={pick(C.compareA)} id="si-cmp-t" size="h1" className="center-head" />
          <Reveal className="scroll-x" self>
            <table className="table cmp">
              <thead>
                <tr>
                  <th scope="col">{pick(C.cols.strategy)}</th>
                  <th scope="col">{pick(C.cols.si)}</th>
                  <th scope="col">{pick(C.cols.asOf)}</th>
                  <th scope="col">{pick(C.cols.risk)}</th>
                  <th scope="col">{pick(C.cols.code)}</th>
                  <th scope="col">{pick(C.cols.vehicle)}</th>
                  <th scope="col">{pick(C.cols.bench)}</th>
                </tr>
              </thead>
              <tbody>
                {data.funds.map((f) => (
                  <tr key={f.key} style={{ "--fund-from": f.color.from, "--fund-to": f.color.to, "--fund": f.color.solid } as CSSProperties}>
                    <td>
                      <Link className="cmp-name" href={`/strategies/${f.key}`}>
                        <i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />{pick(f.short)}
                      </Link>
                      <span className="small cmp-asset">{pick(f.assetClass)}</span>
                    </td>
                    <td data-label={pick(C.cols.si)}>
                      <span className="cmp-sic">
                        {f.si !== null ? (
                          <b className="g-fund cmp-si">{pctText(f.si)}</b>
                        ) : <span className="small">{pick(C.soon)}</span>}
                        {f.si !== null ? <span className="small cmp-basis">{f.basis === "gross" ? pick(f.siAnnualized ? S.gross : S.grossCum) : pick(f.siAnnualized ? S.net : S.netCum)}</span> : null}
                      </span>
                    </td>
                    <td data-label={pick(C.cols.asOf)}>{f.asOf ? formatMonth(f.asOf, locale) : "—"}</td>
                    <td data-label={pick(C.cols.risk)}><span className="cmp-risk"><RiskMeter risk={f.risk} label={`${pick(S.risk)}: ${pick(RISK[f.risk])}`} />{pick(RISK[f.risk])}</span></td>
                    <td className="tabnum" data-label={pick(C.cols.code)}>{f.code ?? "—"}</td>
                    <td data-label={pick(C.cols.vehicle)}>{f.vehicle === "fund" ? pick(S.fund) : pick(S.sma)}</td>
                    <td className="cmp-bench" data-label={pick(C.cols.bench)}>{f.benchmark ? pick(f.benchmark) : pick(C.none)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          {data.funds.some((f) => f.si !== null) ? <p className="foot fine">{pick(S.perfNote)}{data.funds.some((f) => f.si !== null && f.basis === "gross") ? ` ${pick(S.grossNote)}` : ""}</p> : null}
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
