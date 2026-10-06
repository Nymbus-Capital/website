/**
 * overlay.copy.ts — copy of the home "diversifying engines" band (traditional markets vs the Multi-Strategy Fund
 * strategies and the futures overlay), EN + FR. Everything drawn is generated; low correlation in down months is
 * stated as a design objective, never as a fact; the overlay's futures-exposure disclosure is the one used on
 * /approach and /solutions. No counters (docs/architecture.md § Decision log).
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
  lead: l(
    "Strategies designed to have low correlation in down months, with traditional markets and with each other.",
    "Des stratégies conçues pour une faible corrélation en mois de baisse, avec les marchés traditionnels et entre elles.",
  ),
  panel: l("Diversifying engines · down months", "Moteurs de diversification · mois de baisse"),
  illustration: l("Illustration", "Illustration"),
  /** accessible name of the animated figure */
  alt: l(
    "Animated illustration, generated values: equities and bonds fall together in down months; four strategies and a protective overlay, designed to have low down-month correlation, are drawn moving independently. A heatmap shows the concept.",
    "Illustration animée, valeurs générées : actions et obligations baissent ensemble en mois de baisse; quatre stratégies et une superposition protectrice, conçues pour une faible corrélation en mois de baisse, sont illustrées évoluant indépendamment. Une carte de chaleur illustre le concept.",
  ),
  /** drawn on the canvas itself, so no screenshot of the panel can lose it */
  watermark: l("ILLUSTRATION · generated values", "ILLUSTRATION · valeurs générées"),
  /** labels drawn on the canvas */
  canvas: {
    /** "generated" on the canvas itself: a crop of the market lanes must never read as real market data */
    trad: l("Traditional markets · generated", "Marchés traditionnels · générés"),
    strategies: l("Our strategies", "Nos stratégies"),
    combined: l("Four strategies combined", "Quatre stratégies combinées"),
    down: l("Equity down month", "Mois de baisse des actions"),
    lit: l("Highlighted: moves independently", "En surbrillance : évolue indépendamment"),
    heat: l("Down-month correlation · concept", "Corrélation en mois de baisse · concept"),
    opposite: l("Opposite", "Inverse"),
    low: l("Low", "Faible"),
    together: l("Together", "Même sens"),
  },
  caption: l(
    `Our funds’ strategy names; generated values, not actual positions or results. Market lines are not an index. Low down-month correlation is a design objective, not a guarantee. Overlays and strategies can lose money. ${OVERLAY_EXPOSURE.en}`,
    `Stratégies de nos fonds; valeurs générées, ni positions ni résultats réels. Les lignes de marché ne sont pas un indice. Faible corrélation en mois de baisse : un objectif, pas une garantie. Les superpositions et les stratégies peuvent subir des pertes. ${OVERLAY_EXPOSURE.fr}`,
  ),
  trio: [
    { title: l("Protective overlay", "Superposition protectrice"), text: l("Futures designed to offset part of bond losses. They may not.", "Des contrats à terme conçus pour compenser une partie des pertes obligataires. Ils peuvent ne pas y parvenir.") },
    { title: l("Distinct engines", "Moteurs distincts"), text: l("Each engine seeks a different source of return.", "Chaque moteur cherche une source de rendement différente.") },
    { title: l("Down months first", "Les mois de baisse d’abord"), text: l("Diversification is judged when markets fall.", "La diversification se juge quand les marchés baissent.") },
  ] as { title: L; text: L }[],
};
