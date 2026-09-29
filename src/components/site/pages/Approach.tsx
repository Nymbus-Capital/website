"use client";
/**
 * /approach: the scientific process end to end. Reuses the home keynote screens (pillars, the two systems,
 * the fixed income challenge, the overlay) and adds the data pipeline and the multi-strategy's four engines.
 */
import { Brain, Cpu, Database, Layers } from "lucide-react";
import { Reveal, ScreenSwap } from "@/components/v3/motion";
import { l, useTranslation } from "@/lib/i18n";
import { FOUR, HOME } from "../copy";
import { Pillars } from "../home/Pillars";
import { Process } from "../home/Process";
import { Challenge } from "../home/Challenge";
import { Overlay } from "../home/Overlay";
import { ContactCta, Summary } from "../home/Summary";
import { Chapter, Head } from "../ui";
import { PageHero } from "./PageHero";

const A = {
  eyebrow: l("our approach", "notre approche"),
  title: l("where science", "là où la science"), accent: l("meets bonds", "rencontre les obligations"),
  lead: l("we process vast quantities of public market data. using statistical analysis and machine learning, we perform pattern recognition across billions of data points to find opportunities where humans cannot process the sheer volume of information.",
    "nous traitons d'immenses volumes de données des marchés publics. à l'aide d'analyses statistiques et d'apprentissage automatique, nous effectuons de la reconnaissance de tendances sur des milliards de points de données pour trouver des occasions là où l'humain ne peut traiter un tel volume d'information."),
  engine: l("the engine", "le moteur"), engineT: l("from data", "des données"), engineA: l("to portfolios", "aux portefeuilles"),
  steps: [
    { icon: Database, t: l("data & research", "données et recherche"), d: l("pricing, fundamental credit metrics, macroeconomic indicators and cross-asset relationships, cleaned and stored at scale", "prix, indicateurs de crédit fondamentaux, indicateurs macroéconomiques et relations inter-actifs, nettoyés et stockés à grande échelle") },
    { icon: Brain, t: l("pattern recognition", "reconnaissance de patterns"), d: l("machine learning classifies market regimes and uncovers relationships a human team could not process by hand", "l'apprentissage automatique classe les régimes de marché et révèle des relations qu'une équipe humaine ne pourrait traiter à la main") },
    { icon: Layers, t: l("portfolio construction", "construction de portefeuille"), d: l("rules-based positioning under risk budgets, concentration limits and liquidity constraints", "un positionnement fondé sur des règles, sous budgets de risque, limites de concentration et contraintes de liquidité") },
    { icon: Cpu, t: l("continuous monitoring", "surveillance continue"), d: l("alerts rebalance security selection continuously; the macro positioning is reviewed on a set schedule", "des alertes rééquilibrent la sélection de titres en continu; le positionnement macro est revu selon un calendrier établi") },
  ],
  multi: l("multi-strategy", "multistratégies"),
};

export function Approach() {
  const { pick } = useTranslation();
  return (
    <div className="stage">
      <ScreenSwap />
      <PageHero eyebrow={pick(A.eyebrow)} title={pick(A.title)} accent={pick(A.accent)} lead={pick(A.lead)} />

      <section className="screen glow" data-swap="" aria-labelledby="eng-t">
        <div className="wrap wide">
          <Head eyebrow={pick(A.engine)} title={pick(A.engineT)} accent={pick(A.engineA)} id="eng-t" size="h1" className="center-head" />
          <Reveal as="ol" className="engine" kind="pop" stagger={140}>
            {A.steps.map((s, i) => {
              const I = s.icon;
              return (
                <li key={i} className="eng">
                  <span className="bubble" style={{ ["--bc" as string]: ["#1a73e8", "#4c8dff", "#00a3e0", "#4fd1ff"][i] }} aria-hidden="true"><I size={22} strokeWidth={1.7} /></span>
                  <span className="lbl">0{i + 1}</span>
                  <h3 className="h3">{pick(s.t)}</h3>
                  <p className="body">{pick(s.d)}</p>
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <Chapter no={1} title={pick(HOME.chapters.bonds)} kicker={pick(HOME.chapters.k1)} id="ap-ch1" variant={0} />
      <Pillars />
      <Process />
      <Chapter no={2} title={pick(HOME.chapters.overlay)} kicker={pick(HOME.chapters.k2)} id="ap-ch2" variant={1} />
      <Challenge />
      <Overlay />

      <section className="screen dark" data-swap="" aria-labelledby="four-t">
        <div className="wrap wide">
          <Head eyebrow={pick(A.multi)} title={pick(FOUR.title)} sub={pick(FOUR.sub)} id="four-t" size="h1" className="center-head" />
          <Reveal as="ol" className="four" kind="pop" stagger={130}>
            {FOUR.items.map((it, i) => (
              <li key={i} className="four-i">
                <span className="fig m g-orange tabnum" aria-hidden="true">0{i + 1}</span>
                <h3 className="h3">{pick(it.name)}</h3>
                <span className="lbl four-role">{pick(it.role)}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <Summary />
      <ContactCta />
    </div>
  );
}
