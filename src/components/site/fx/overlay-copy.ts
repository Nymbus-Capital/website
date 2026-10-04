/**
 * overlay-copy.ts — copy of the home "diversifying engines" band (Multi-Strategy Fund strategies, futures overlay),
 * EN + FR. Everything drawn is generated; low correlation in down months is stated as a design objective, never as a
 * fact; the overlay's futures-exposure disclosure is the one used on /approach and /solutions.
 */
import { l, type L } from "../../../lib/i18n/config.ts";

/** Verbatim futures-exposure disclosure (same sentence as approach, solutions and fund pages). */
export const OVERLAY_EXPOSURE = l(
  "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.",
  "La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
);

export const OVERLAY_COPY = {
  eyebrow: l("Diversifying engines", "Moteurs de diversification"),
  title: l("Several engines,", "Plusieurs moteurs,"),
  accent: l("designed for down months", "conçus pour les mois de baisse"),
  lead: l("Strategies designed to have low correlation in down months.", "Des stratégies conçues pour une faible corrélation en mois de baisse."),
  panel: l("Diversifying engines · down months", "Moteurs de diversification · mois de baisse"),
  illustration: l("Illustration", "Illustration"),
  /** accessible name of the animated figure */
  alt: l(
    "Animated illustration: four strategy lanes and a protective overlay move independently while a generated bond line dips.",
    "Illustration animée : quatre stratégies et une superposition protectrice évoluent indépendamment pendant qu’une ligne obligataire générée baisse.",
  ),
  /** drawn on the canvas itself, so no screenshot of the panel can lose it */
  watermark: l("ILLUSTRATION · generated values", "ILLUSTRATION · valeurs générées"),
  /** labels drawn on the canvas */
  canvas: {
    bond: l("Bond market (generated)", "Marché obligataire (généré)"),
    combined: l("Four strategies combined (generated)", "Quatre stratégies combinées (générées)"),
    down: l("Down month", "Mois de baisse"),
    lit: l("Highlighted: moves independently", "En surbrillance : évolue indépendamment"),
    heat: l("Down-month correlation · concept", "Corrélation en mois de baisse · concept"),
    opposite: l("Opposite", "Inverse"),
    low: l("Low", "Faible"),
    together: l("Together", "Même sens"),
  },
  caption: l(
    `Our funds’ strategy names; generated values, not actual positions or results. Low down-month correlation is a design objective, not a guarantee. Overlays and strategies can lose money. ${OVERLAY_EXPOSURE.en}`,
    `Stratégies de nos fonds; valeurs générées, ni positions ni résultats réels. Faible corrélation en mois de baisse : un objectif, pas une garantie. Les superpositions et les stratégies peuvent subir des pertes. ${OVERLAY_EXPOSURE.fr}`,
  ),
  counters: {
    months: l("Simulated months", "Mois simulés"),
    down: l("Simulated down months", "Mois de baisse simulés"),
    engines: l("Simulated engines", "Moteurs simulés"),
    lit: l("Simulated independent moves", "Mouvements autonomes simulés"),
  },
  trio: [
    { title: l("Protective overlay", "Superposition protectrice"), text: l("Futures designed to offset part of bond losses. They may not.", "Des contrats à terme conçus pour compenser une partie des pertes obligataires. Ils peuvent ne pas y parvenir.") },
    { title: l("Distinct engines", "Moteurs distincts"), text: l("Each engine seeks a different source of return.", "Chaque moteur cherche une source de rendement différente.") },
    { title: l("Down months first", "Les mois de baisse d’abord"), text: l("Diversification is judged when markets fall.", "La diversification se juge quand les marchés baissent.") },
  ] as { title: L; text: L }[],
};
