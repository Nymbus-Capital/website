/** Copy of /strategies, EN + FR side by side (rewritten from the previous site's strategies page). */
import { l } from "../../../lib/i18n/config.ts";

export const STRAT_COPY = {
  home: l("Home", "Accueil"),
  crumb: l("Strategies", "Stratégies"),
  eyebrow: l("Investment strategies", "Stratégies de placement"),
  title: l("Our funds and", "Nos fonds et"),
  accent: l("strategies", "stratégies"),
  lead: l(
    "Systematic fixed income and alternatives. Monthly figures, once validated.",
    "Revenu fixe systématique et stratégies alternatives. Chiffres mensuels, une fois validés.",
  ),
  toTable: l("Compare the strategies", "Comparer les stratégies"),
  fundsTitle: l("Funds and strategies", "Fonds et stratégies"),
  filterLabel: l("Filter by asset class", "Filtrer par catégorie d’actifs"),
  one: l("strategy", "stratégie"),
  many: l("strategies", "stratégies"),
  none: l("No strategy in this category.", "Aucune stratégie dans cette catégorie."),
  cmpEyebrow: l("Side by side", "Côte à côte"),
  cmpTitle: l("Strategy", "Comparaison des"),
  cmpAccent: l("comparison", "stratégies"),
  cmpLead: l("Key facts and published returns, side by side.", "Caractéristiques et rendements publiés, côte à côte."),
  cols: {
    fund: l("Strategy", "Stratégie"),
    asset: l("Asset class", "Catégorie d’actifs"),
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
    "— : not published yet; we never show an estimate in its place.",
    "— : pas encore publié; nous n’affichons jamais d’estimation à sa place.",
  ),
  ctaTitle: l("Which strategy fits", "Quelle stratégie convient à"),
  ctaAccent: l("your mandate?", "votre mandat?"),
  ctaText: l(
    "Ask us about any strategy and how it is offered.",
    "Posez-nous vos questions sur chaque stratégie et la façon d’y accéder.",
  ),
};
