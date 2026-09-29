"use client";
/**
 * /sustainability: responsible investing as part of the process. Facts only (commitments the firm has
 * made publicly: PRI signatory since 2018, Tobacco-Free Finance Pledge, Fondaction partnership, exclusions
 * built into the sustainable bond strategies); no invented ESG metrics. Fund-level ESG characteristics are
 * published on the fund pages when the data pipeline provides them.
 */
import Link from "next/link";
import { ArrowUpRight, Ban, Leaf, Scale, Sprout } from "lucide-react";
import { Reveal, ScreenSwap, useTilt } from "@/components/v3/motion";
import { l, useTranslation, type L } from "@/lib/i18n";
import { ContactCta } from "../home/Summary";
import { Chapter, Head } from "../ui";
import { PageHero } from "./PageHero";

const S = {
  eyebrow: l("sustainability", "durabilité"),
  title: l("modernity meets", "la modernité rencontre"), accent: l("responsibility", "la responsabilité"),
  lead: l("responsible investing is not a separate strategy at Nymbus: it is woven into the systematic process behind every portfolio decision.",
    "l’investissement responsable n’est pas une stratégie à part chez Nymbus : il est intégré au processus systématique derrière chaque décision de portefeuille."),
  how: l("integration in practice", "l’intégration en pratique"), howT: l("three layers,", "trois couches,"), howA: l("one process", "un seul processus"),
  layers: [
    { icon: Ban, t: l("exclusion screening", "filtrage d’exclusion"), d: l("securities are systematically excluded from our sustainable portfolios on strict ESG criteria, tobacco included", "des titres sont systématiquement exclus de nos portefeuilles durables selon des critères ESG stricts, y compris le tabac") },
    { icon: Sprout, t: l("positive screening", "filtrage positif"), d: l("ESG metrics are integrated directly into our quantitative models, not bolted on as an afterthought", "les métriques ESG sont intégrées directement dans nos modèles quantitatifs, pas ajoutées après coup") },
    { icon: Scale, t: l("quantitative integration", "intégration quantitative"), d: l("ESG data is embedded into our credit models and systematic security selection", "les données ESG sont intégrées à nos modèles de crédit et à notre sélection systématique de titres") },
  ] as { icon: typeof Ban; t: L; d: L }[],
  commit: l("our commitments", "nos engagements"), commitT: l("pledges we", "des engagements"), commitA: l("stand behind", "que nous tenons"),
  pledges: [
    { y: "2018", t: l("UN PRI signatory", "signataire des PRI de l’ONU"), d: l("Nymbus became a signatory of the UN Principles for Responsible Investment and reports on its progress.", "Nymbus est devenue signataire des Principes pour l’investissement responsable de l’ONU et rend compte de ses progrès.") },
    { y: "2023", t: l("sustainable bond funds with Fondaction", "fonds obligataires durables avec Fondaction"), d: l("We partner with Fondaction, a Canadian fund focused on sustainable development, on sustainable bond solutions.", "Nous collaborons avec Fondaction, un fonds canadien axé sur le développement durable, pour offrir des solutions obligataires durables.") },
    { y: "2024", t: l("Tobacco-Free Finance Pledge", "Engagement pour une finance sans tabac"), d: l("Nymbus committed to excluding tobacco companies from all of its portfolios.", "Nymbus s’est engagée à exclure les entreprises du tabac de tous ses portefeuilles.") },
  ],
  solutions: l("sustainable solutions", "solutions durables"),
  seb: l("sustainable enhanced bonds", "obligations durables bonifiées"),
  sebD: l("a core Canadian bond portfolio built systematically, integrating sustainability criteria and a protection overlay that tends to perform when bonds struggle.",
    "un portefeuille obligataire canadien de base construit systématiquement, intégrant des critères de durabilité et une stratégie de protection qui tend à performer quand les obligations souffrent."),
  sebGo: l("explore the fund", "découvrir le fonds"),
  chapter: l("capital with a conscience", "du capital avec une conscience"),
};

function Pledge({ p, i }: { p: (typeof S.pledges)[number]; i: number }) {
  const { pick } = useTranslation();
  const tilt = useTilt<HTMLLIElement>(5);
  return (
    <li ref={tilt} className="pledge" style={{ ["--fund" as string]: ["#34a853", "#1a73e8", "#00a3e0"][i] }}>
      <span className="pledge-y fig m g-green tabnum">{p.y}</span>
      <h3 className="h3">{pick(p.t)}</h3>
      <p className="body">{pick(p.d)}</p>
    </li>
  );
}

export function Sustainability() {
  const { pick } = useTranslation();
  return (
    <div className="stage sustain">
      <ScreenSwap />
      <PageHero eyebrow={pick(S.eyebrow)} title={pick(S.title)} accent={pick(S.accent)} lead={pick(S.lead)} />

      <section className="screen glow" data-swap="" aria-labelledby="su-how-t">
        <div className="wrap wide">
          <Head eyebrow={pick(S.how)} title={pick(S.howT)} accent={pick(S.howA)} id="su-how-t" size="h1" className="center-head" />
          <Reveal as="ol" className="layers" kind="pop" stagger={150}>
            {S.layers.map((x, i) => {
              const I = x.icon;
              return (
                <li key={i} className="layer">
                  <span className="bubble" style={{ ["--bc" as string]: ["#0f9d58", "#34a853", "#00a3e0"][i] }} aria-hidden="true"><I size={22} strokeWidth={1.7} /></span>
                  <span className="lbl">0{i + 1}</span>
                  <h3 className="h3">{pick(x.t)}</h3>
                  <p className="body">{pick(x.d)}</p>
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <Chapter no={1} title={pick(S.chapter)} kicker={pick(S.commit)} id="su-ch" variant={2} />

      <section className="screen glow auto" data-swap="" aria-labelledby="su-commit-t">
        <div className="wrap wide">
          <Head eyebrow={pick(S.commit)} title={pick(S.commitT)} accent={pick(S.commitA)} id="su-commit-t" size="h1" className="center-head" />
          <Reveal as="ol" className="pledges" kind="pop" stagger={140}>
            {S.pledges.map((p, i) => <Pledge key={i} p={p} i={i} />)}
          </Reveal>
        </div>
      </section>

      <section className="screen dark auto su-fund" data-swap="" aria-labelledby="su-fund-t">
        <div className="wrap narrow" style={{ textAlign: "center" }}>
          <Reveal className="kicker" self style={{ justifyContent: "center" }}><Leaf size={16} aria-hidden="true" /> {pick(S.solutions)}</Reveal>
          <Reveal as="h2" className="h1 g-cyan" self id="su-fund-t">{pick(S.seb)}</Reveal>
          <Reveal as="p" className="lead" self delay={200}>{pick(S.sebD)}</Reveal>
          <Reveal className="center-row" self delay={350}>
            <Link className="btn" href="/strategies/sustainable-enhanced-bonds">{pick(S.sebGo)} <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </Reveal>
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
