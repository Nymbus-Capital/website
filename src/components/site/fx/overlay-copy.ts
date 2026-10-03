/**
 * overlay-copy.ts — copy of the home "diversifying engines" band (multi-strategy, futures overlay), EN + FR.
 * Everything drawn is generated; low correlation in down months is stated as a design objective, never as a fact.
 */
import { l, type L } from "../../../lib/i18n/config.ts";

export const OVERLAY_COPY = {
  eyebrow: l("Diversifying engines", "Moteurs de diversification"),
  title: l("Several engines,", "Plusieurs moteurs,"),
  accent: l("designed for down months", "conçus pour les mois de baisse"),
  lead: l("Strategies designed to have low correlation in down months.", "Des stratégies conçues pour une faible corrélation en mois de baisse."),
  panel: l("Multi-strategy · engines in down months", "Multistratégie · moteurs en mois de baisse"),
  illustration: l("Illustration", "Illustration"),
  /** accessible name of the animated figure */
  alt: l(
    "Animated illustration: generic strategy lines move on their own while a generated bond line dips.",
    "Illustration animée : des stratégies génériques évoluent seules pendant qu’une ligne obligataire générée baisse.",
  ),
  /** drawn on the canvas itself, so no screenshot of the panel can lose it */
  watermark: l("ILLUSTRATION · generated values", "ILLUSTRATION · valeurs générées"),
  /** labels drawn on the canvas */
  canvas: {
    bond: l("Bond market (generated)", "Marché obligataire (généré)"),
    combined: l("Engines combined (generated)", "Moteurs combinés (générés)"),
    down: l("Down month", "Mois de baisse"),
    lit: l("Lit: moves on its own", "Allumé : évolue seul"),
    heat: l("Down-month correlation · concept", "Corrélation en mois de baisse · concept"),
    opposite: l("Opposite", "Inverse"),
    low: l("Low", "Faible"),
    together: l("Together", "Même sens"),
  },
  caption: l(
    "Generic strategy types and generated values: not actual strategies or results. Low down-month correlation is a design objective, not a guarantee. Overlays and strategies can lose money.",
    "Types de stratégies génériques, valeurs générées : ni stratégies ni résultats réels. Faible corrélation en mois de baisse : un objectif, pas une garantie. Les superpositions et les stratégies peuvent subir des pertes.",
  ),
  counters: {
    months: l("Simulated months generated", "Simulé : mois générés"),
    down: l("Simulated down months", "Simulé : mois de baisse"),
    engines: l("Simulated engines", "Simulé : moteurs"),
    lit: l("Simulated moves on their own", "Simulé : mouvements autonomes"),
  },
  trio: [
    { title: l("Overlay", "Superposition"), text: l("Futures designed to offset part of bond losses.", "Des contrats à terme conçus pour compenser une partie des pertes obligataires.") },
    { title: l("Distinct engines", "Moteurs distincts"), text: l("Each engine seeks a different source of return.", "Chaque moteur cherche une source de rendement différente.") },
    { title: l("Down months first", "Les mois de baisse d’abord"), text: l("Diversification is judged when markets fall.", "La diversification se juge quand les marchés baissent.") },
  ] as { title: L; text: L }[],
};
