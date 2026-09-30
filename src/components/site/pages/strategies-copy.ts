/** Copy of /strategies, EN + FR side by side (rewritten from the previous site's strategies page). */
import { l } from "../../../lib/i18n/config.ts";

export const STRAT_COPY = {
  home: l("Home", "Accueil"),
  crumb: l("Strategies", "Stratégies"),
  eyebrow: l("Investment strategies", "Stratégies de placement"),
  title: l("Our funds and", "Nos fonds et"),
  accent: l("strategies", "stratégies"),
  lead: l(
    "Systematic, quantitative strategies in fixed income and alternatives. Each one is built on the same research process and disciplined risk management, and its figures are published here as soon as each month is closed and validated.",
    "Des stratégies systématiques et quantitatives en revenu fixe et en placements alternatifs. Chacune repose sur le même processus de recherche et une gestion disciplinée des risques, et ses chiffres sont publiés ici dès que chaque mois est fermé et validé.",
  ),
  toTable: l("Compare the strategies", "Comparer les stratégies"),
  fundsTitle: l("Funds and strategies", "Fonds et stratégies"),
  filterLabel: l("Filter by asset class", "Filtrer par classe d’actifs"),
  one: l("strategy", "stratégie"),
  many: l("strategies", "stratégies"),
  none: l("No strategy in this category.", "Aucune stratégie dans cette catégorie."),
  cmpEyebrow: l("Side by side", "Côte à côte"),
  cmpTitle: l("Strategy", "Comparaison des"),
  cmpAccent: l("comparison", "stratégies"),
  cmpLead: l(
    "The main facts and published returns of each strategy in one table. Select a name for the full fund page: objectives, fees, portfolio, risk statistics and documents.",
    "Les principales caractéristiques et les rendements publiés de chaque stratégie dans un seul tableau. Sélectionnez un nom pour la page complète du fonds : objectifs, frais, portefeuille, statistiques de risque et documents.",
  ),
  cols: {
    fund: l("Strategy", "Stratégie"),
    asset: l("Asset class", "Classe d’actifs"),
    vehicle: l("Vehicle", "Véhicule"),
    bench: l("Benchmark", "Indice de référence"),
    si: l("Since inception", "Depuis la création"),
    risk: l("Risk rating", "Niveau de risque"),
    nav: l("NAV", "VL"),
  },
  noBench: l("None (absolute return)", "Aucun (rendement absolu)"),
  cumulative: l("cumulative", "cumulatif"),
  siNote: l(
    "Since-inception returns are annualized when the track record covers at least 12 months, cumulative otherwise. Year to date and 1 year are not annualized.",
    "Les rendements depuis la création sont annualisés lorsque l’historique couvre au moins 12 mois, cumulatifs sinon. Les rendements depuis le début de l’année et sur 1 an ne sont pas annualisés.",
  ),
  dashNote: l(
    "— : not published yet. A figure appears once it is available and validated; we never show an estimate in its place.",
    "— : pas encore publié. Un chiffre apparaît une fois disponible et validé; nous n’affichons jamais d’estimation à sa place.",
  ),
  ctaTitle: l("Which strategy fits", "Quelle stratégie convient à"),
  ctaAccent: l("your mandate?", "votre mandat?"),
  ctaText: l(
    "Our team can walk you through each strategy, its documents and how it is offered to institutions, family offices and advisors.",
    "Notre équipe peut vous présenter chaque stratégie, ses documents et la façon dont elle est offerte aux institutions, aux bureaux de gestion familiale et aux conseillers.",
  ),
};
