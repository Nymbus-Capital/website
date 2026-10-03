/**
 * Copy of the home page and the strategies index, EN + FR side by side. Rewritten from the previous site
 * (origin/main src/lib/i18n/en.ts|fr.ts): same sections, informational tone, sentence case, no promises of
 * outcome ("superior risk-adjusted returns" → what the method does). Regulatory texts come from
 * src/content/disclaimers.ts (compliance review), never from here.
 */
import { l, type L } from "../../../lib/i18n/config.ts";
import { DISC } from "../../../content/disclaimers.ts";

export const HOME_COPY = {
  hero: {
    eyebrow: l("Montreal · systematic fixed income and alternatives", "Montréal · revenu fixe systématique et alternatives"),
    // the H1 reads "Scientific investing" / "Investissement scientifique"; the second word carries the gradient
    title: l("Scientific", "Investissement"),
    accent: l("investing", "scientifique"),
    lead: l(
      "Scientists and technologists solving the harder problems in finance.",
      "Des scientifiques, des informaticiens et des analystes s’attaquent aux problèmes difficiles de la finance.",
    ),
    cta1: l("Explore strategies", "Explorer les stratégies"),
    cta2: l("Investment solutions", "Solutions de placement"),
  },
  figures: {
    title: l("Nymbus at a glance", "Nymbus en bref"),
    aum: l("Assets under management, including mandates", "Actifs sous gestion, mandats compris"),
    strategies: l("Strategies", "Stratégies"),
    team: l("People, team and board", "Personnes, équipe et conseil"),
    phd: l("PhDs on the team", "Doctorats dans l’équipe"),
  },
  strategies: {
    eyebrow: l("Strategies", "Stratégies"),
    title: l("Our funds and", "Nos fonds et"),
    accent: l("strategies", "stratégies"),
    lead: l(
      "Two bond funds, a multi-strategy fund, a futures overlay.",
      "Deux fonds obligataires, un fonds multistratégies, une stratégie de superposition.",
    ),
    all: l("View all strategies", "Voir toutes les stratégies"),
  },
  process: {
    more: l("Our approach", "Notre approche"),
    team: l("Meet the team", "Rencontrer l’équipe"),
    eyebrow: l("Investment process", "Processus de placement"),
    title: l("One pipeline, from data", "Un seul processus, des données"),
    accent: l("to portfolio", "au portefeuille"),
    lead: l(
      "Four documented, tested and monitored steps.",
      "Quatre étapes documentées, testées et surveillées.",
    ),
    steps: [
      {
        title: l("Data and research", "Données et recherche"),
        text: l(
          "Market and fundamental data, cleaned and studied.",
          "Données de marché et fondamentales, nettoyées et étudiées.",
        ),
      },
      {
        title: l("Signal generation", "Génération de signaux"),
        text: l(
          "Machine-learning signals, kept only after statistical validation.",
          "Des signaux d’apprentissage automatique, conservés seulement après validation statistique.",
        ),
      },
      {
        title: l("Portfolio construction", "Construction du portefeuille"),
        text: l(
          "Optimization within each mandate’s risk and liquidity limits.",
          "Optimisation dans les limites de risque et de liquidité de chaque mandat.",
        ),
      },
      {
        title: l("Risk management", "Gestion des risques"),
        text: l(
          "Continuous monitoring, adjustments and hedging. Risk management does not eliminate the risk of loss.",
          "Surveillance continue, ajustements et couvertures. La gestion des risques n’élimine pas le risque de perte.",
        ),
      },
    ] as { title: L; text: L }[],
  },
  partners: {
    eyebrow: l("Clients and platforms", "Clients et plateformes"),
    title: l("Institutions and partners", "Les institutions et partenaires"),
    accent: l("we work with", "avec qui nous travaillons"),
    note: l(
      "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement.",
      "Source : Nymbus Capital inc. Liste représentative; tous les clients ne sont pas présentés. QEMP : Programme des gestionnaires en émergence du Québec (Innocap). Leur présence ne constitue pas une recommandation.",
    ),
    marquee: l("Logos of institutions and platforms we work with", "Logos des institutions et plateformes avec qui nous travaillons"),
  },
  news: {
    eyebrow: l("News and milestones", "Nouvelles et jalons"),
    title: l("Recent", "Développements"),
    accent: l("developments", "récents"),
    read: l("Read more", "Lire la suite"),
    close: l("Close", "Fermer"),
    prev: l("Previous news", "Nouvelle précédente"),
    next: l("Next news", "Nouvelle suivante"),
  },
  cta: {
    title: l("Let’s discuss your", "Discutons de vos"),
    accent: l("investment objectives", "objectifs de placement"),
    text: l(
      "Talk to our team about your mandate.",
      "Parlez de votre mandat avec notre équipe.",
    ),
    contact: l("Get in touch", "Communiquez avec nous"),
    solutions: l("View solutions", "Voir les solutions"),
  },
};

/** Labels shared by the fund cards and the comparison table (home and /strategies). */
export const FUND_COPY = {
  nav: l("NAV", "VL"),
  navSeries: l("Series", "Série"),
  /** class of the returns shown (not of the NAV series next to them), followed by its code */
  perfClass: l("Returns: Series", "Rendements\u00a0: Série"),
  ytd: l("YTD", "DDA"),
  y1: l("1 year", "1 an"),
  si: l("Since inception, annualized", "Depuis la création, annualisé"),
  siCum: l("Since inception (cumulative)", "Depuis la création (cumulatif)"),
  siShort: l("SI", "DC"),
  siAnn: l("since inception, annualized", "depuis la création, annualisé"),
  siCumShort: l("since inception, cumulative", "depuis la création, cumulatif"),
  annualized: l("annualized", "annualisé"),
  net: l("Net of fees", "Après déduction des frais"),
  gross: l("Gross of fees", "Avant déduction des frais"),
  asOf: l("Returns as of", "Rendements au"),
  navAsOf: l("as of", "au"),
  view: l("View the strategy", "Voir la stratégie"),
  fund: l("Fund", "Fonds"),
  sma: l("Managed accounts", "Comptes gérés"),
  risk: l("Risk rating", "Niveau de risque"),
  code: l("Fund code", "Code de fonds"),
  soon: l("Figures coming soon", "Chiffres à venir"),
  soonLong: l(
    "Performance is published here once the month is closed and validated.",
    "Les rendements sont publiés ici une fois le mois fermé et validé.",
  ),
  sample: l("Sample data", "Données fictives"),
  sampleLong: l("Illustrative figures only, not actual performance.", "Chiffres illustratifs seulement, pas des rendements réels."),
  calendar: l("Calendar-year returns", "Rendements par année civile"),
  ytdMark: l("year to date", "depuis le début de l’année"),
  perfNote: DISC.summaryNet,
  grossNote: DISC.summaryGross,
};

export const RISK_COPY: Record<"low" | "low-medium" | "medium" | "medium-high" | "high", L> = {
  low: l("Low", "Faible"),
  "low-medium": l("Low to medium", "Faible à moyen"),
  medium: l("Medium", "Moyen"),
  "medium-high": l("Medium to high", "Moyen à élevé"),
  high: l("High", "Élevé"),
};

export const CATEGORY_COPY = {
  all: l("All", "Toutes"),
  "fixed-income": l("Fixed income", "Revenu fixe"),
  alternatives: l("Alternatives", "Alternatives"),
};

/** Vehicle as the cards and the comparison table word it. */
export const VEHICLE_COPY = {
  fund: l("Fund · Fundserv", "Fonds · Fundserv"),
  strategy: l("Managed accounts", "Comptes gérés"),
};
