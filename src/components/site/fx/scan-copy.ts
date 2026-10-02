/**
 * scan-copy.ts — copy of the home "science at scale" band (the analysis scan illustration), EN + FR.
 * The figures next to the scan are counters of the animation itself, labelled as an illustration.
 */
import { l, type L } from "../../../lib/i18n/config.ts";

export const SCAN_COPY = {
  eyebrow: l("Science at scale", "La science à grande échelle"),
  title: l("Scientists and engineers,", "Des scientifiques et des ingénieurs,"),
  accent: l("hard problems in finance", "les grands défis de la finance"),
  lead: l("Data at scale. Models tested before they are trusted.", "Des données à grande échelle. Des modèles testés avant d’être crus."),
  panel: l("Analysis · universe, factors, signals", "Analyse · univers, facteurs, signaux"),
  illustration: l("Illustration", "Illustration"),
  /** accessible name of the animated figure */
  alt: l(
    "Animated illustration: a table of securities scanned for factor scores, with flagged signals.",
    "Illustration animée : un tableau de titres analysés selon des facteurs, avec des signaux repérés.",
  ),
  caption: l(
    "Illustration only: generic labels and generated values, not actual securities, signals or results. The counters count what this animation scans.",
    "Illustration seulement\u00a0: libellés génériques et valeurs générées, pas de titres, de signaux ni de résultats réels. Les compteurs comptent ce que cette animation analyse.",
  ),
  counters: {
    datapoints: l("Data points scanned", "Données analysées"),
    securities: l("Securities screened", "Titres examinés"),
    factors: l("Factors per security", "Facteurs par titre"),
    signals: l("Signals flagged", "Signaux repérés"),
  },
  trio: [
    { title: l("Scientists", "Scientifiques"), text: l("Hypotheses, tested on data.", "Des hypothèses, testées sur les données.") },
    { title: l("Engineers", "Ingénieurs"), text: l("Pipelines that run every day.", "Des chaînes de traitement qui roulent chaque jour.") },
    { title: l("Together", "Ensemble"), text: l("The harder problems in fixed income.", "Les problèmes plus difficiles du revenu fixe.") },
  ] as { title: L; text: L }[],
};
