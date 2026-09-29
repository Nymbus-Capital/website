"use client";
/**
 * /solutions: who we work with and how each can access the strategies. Neutral wording, no minimums or
 * fees (those live in the fund documents), investor mix from the deck.
 */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Briefcase, Building2, Users } from "lucide-react";
import { Reveal, ScreenSwap } from "@/components/v3/motion";
import { l, useTranslation, type L } from "@/lib/i18n";
import { FUNDS } from "@/config/funds";
import type { FundKey } from "@/lib/data/types";
import { HOME } from "../copy";
import { Overlay } from "../home/Overlay";
import { ContactCta } from "../home/Summary";
import { Head } from "../ui";
import { PageHero } from "./PageHero";

type Kind = "institutional" | "family" | "advisor";
const TYPES: { key: Kind; icon: typeof Building2; name: L; desc: L; share: number; ways: L[]; funds: FundKey[] }[] = [
  { key: "institutional", icon: Building2, name: l("institutions", "institutions"), share: 45,
    desc: l("Pension funds, endowments, foundations and insurance companies.", "Caisses de retraite, fonds de dotation, fondations et compagnies d’assurance."),
    ways: [l("segregated mandates tailored to your investment policy", "mandats distincts adaptés à votre politique de placement"), l("protection overlay on an existing bond portfolio", "stratégie de protection sur un portefeuille obligataire existant"), l("pooled funds", "fonds communs")],
    funds: ["sustainable-enhanced-bonds", "monthly-income", "global-minimum-volatility", "multi-strategy"] },
  { key: "family", icon: Users, name: l("family offices", "family offices"), share: 35,
    desc: l("Single and multi-family offices seeking systematic, diversified sources of return.", "Family offices uniques et multiples à la recherche de sources de rendement systématiques et diversifiées."),
    ways: [l("pooled funds", "fonds communs"), l("managed accounts", "comptes gérés"), l("direct access to the investment team", "accès direct à l’équipe d’investissement")],
    funds: ["multi-strategy", "monthly-income", "sustainable-enhanced-bonds", "global-minimum-volatility"] },
  { key: "advisor", icon: Briefcase, name: l("financial advisors", "conseillers en placements"), share: 20,
    desc: l("Advisors building client portfolios, through FundServ.", "Les conseillers qui bâtissent les portefeuilles de leurs clients, via FundServ."),
    ways: [l("funds available on FundServ", "fonds offerts sur FundServ"), l("available on leading platforms", "disponible sur des plateformes de premier plan"), l("due diligence documentation on request", "documentation de vérification diligente sur demande")],
    funds: ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"] },
];

const C = {
  eyebrow: l("solutions", "solutions"),
  title: l("solutions for", "des solutions pour"), accent: l("every mandate", "chaque mandat"),
  lead: l("whether you manage institutional capital, run a family office or advise individual investors, our systematic strategies fit your mandate.",
    "que vous gériez du capital institutionnel, un family office ou que vous conseilliez des investisseurs, nos stratégies systématiques s’adaptent à votre mandat."),
  who: l("who we work with", "avec qui nous travaillons"), whoT: l("which investor", "quel investisseur"), whoA: l("are you?", "êtes-vous?"),
  mix: l("of our aum", "de notre ASG"),
  how: l("how to invest", "comment investir"), fit: l("strategies that fit", "stratégies adaptées"),
};

export function Solutions() {
  const { pick } = useTranslation();
  const [k, setK] = useState<Kind>("institutional");
  const cur = TYPES.find((x) => x.key === k)!;
  return (
    <div className="stage">
      <ScreenSwap />
      <PageHero eyebrow={pick(C.eyebrow)} title={pick(C.title)} accent={pick(C.accent)} lead={pick(C.lead)} />
      <section className="screen glow auto" data-swap="" aria-labelledby="sol-t">
        <div className="wrap wide">
          <Head eyebrow={pick(C.who)} title={pick(C.whoT)} accent={pick(C.whoA)} id="sol-t" size="h1" className="center-head" />
          <Reveal className="sol-types" role="tablist" aria-label={pick(C.who)} kind="pop" stagger={110}>
            {TYPES.map((x) => {
              const I = x.icon;
              return (
                <button key={x.key} type="button" role="tab" aria-selected={k === x.key} aria-controls="sol-panel" className={`sol-type ${k === x.key ? "on" : ""}`} onClick={() => setK(x.key)}>
                  <span className="bubble" aria-hidden="true"><I size={22} strokeWidth={1.7} /></span>
                  <span className="h3">{pick(x.name)}</span>
                  <span className="small">{pick(x.desc)}</span>
                  <span className="sol-share"><b className="tabnum grad">{x.share}%</b> <span className="small">{pick(C.mix)}</span></span>
                </button>
              );
            })}
          </Reveal>
          <div id="sol-panel" role="tabpanel" className="sol-panel" key={k}>
            <div>
              <h3 className="lbl">{pick(C.how)}</h3>
              <ul className="sol-ways">{cur.ways.map((w, i) => <li key={i} style={{ ["--i" as string]: i }}>{pick(w)}</li>)}</ul>
            </div>
            <div>
              <h3 className="lbl">{pick(C.fit)}</h3>
              <ul className="sol-funds">
                {cur.funds.map((key, i) => {
                  const f = FUNDS.find((x) => x.key === key)!;
                  return (
                    <li key={key} style={{ ["--i" as string]: i, "--fund-from": f.color.from, "--fund-to": f.color.to, "--fund": f.color.solid } as CSSProperties}>
                      <Link href={`/strategies/${key}`}><i aria-hidden="true" />{pick(f.short)}<span className="small">{pick(f.assetClass)}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <p className="foot fine">{pick(HOME.investors.foot)}</p>
        </div>
      </section>
      <Overlay />
      <ContactCta />
    </div>
  );
}
