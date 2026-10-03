/**
 * scan-copy.ts — copy of the home "science at scale" band (the analysis scan illustration), EN + FR.
 * The figures next to the scan are counters of the animation itself, labelled as an illustration.
 */
import { l, type L } from "../../../lib/i18n/config.ts";

export const SCAN_COPY = {
  eyebrow: l("Science at scale", "La science à grande échelle"),
  title: l("Scientists, engineers and market veterans,", "Des scientifiques, des développeurs et des vétérans des marchés,"),
  accent: l("hard problems in finance", "les grands défis de la finance"),
  lead: l("Data at scale. Models tested before they are trusted.", "Des données à grande échelle. Des modèles testés avant d’être crus."),
  panel: l("Analysis · universe, factors, signals", "Analyse · univers, facteurs, signaux"),
  illustration: l("Illustration", "Illustration"),
  /** accessible name of the animated figure */
  alt: l(
    "Animated illustration: a table of securities scanned for factor scores, with flagged signals.",
    "Illustration animée : un tableau de titres analysés selon des facteurs, avec des signaux repérés.",
  ),
  /** drawn on the canvas itself, so no screenshot of the panel can lose it */
  watermark: l("ILLUSTRATION · generated values", "ILLUSTRATION · valeurs générées"),
  caption: l(
    "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans.",
    "Libellés génériques et valeurs générées\u00a0: pas de titres, de signaux ni de résultats réels. Les compteurs comptent ce que cette animation analyse.",
  ),
  counters: {
    datapoints: l("Simulated data points scanned", "Simulé\u00a0: données analysées"),
    securities: l("Simulated securities screened", "Simulé\u00a0: titres examinés"),
    factors: l("Simulated factors per security", "Simulé\u00a0: facteurs par titre"),
    signals: l("Simulated signals flagged", "Simulé\u00a0: signaux repérés"),
  },
  trio: [
    { title: l("Scientists", "Scientifiques"), text: l("Hypotheses, tested on data.", "Des hypothèses, testées sur les données.") },
    { title: l("Engineers", "Développeurs"), text: l("Pipelines that run every day.", "Des chaînes de traitement qui roulent chaque jour.") },
    { title: l("Market veterans", "Vétérans des marchés"), text: l("Decades in fixed income and derivatives.", "Des décennies en revenu fixe et en dérivés.") },
  ] as { title: L; text: L }[],
};
