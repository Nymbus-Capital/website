/**
 * Copy of the home page and the strategies index, EN + FR side by side. Rewritten from the previous site
 * (origin/main src/lib/i18n/en.ts|fr.ts): same sections, informational tone, sentence case, no promises of
 * outcome ("superior risk-adjusted returns" → what the method does). Regulatory texts come from
 * src/content/disclaimers.ts (compliance review), never from here.
 */
import { l, type L } from "@/lib/i18n";
import { DISC } from "@/content/disclaimers";

export const HOME_COPY = {
  hero: {
    eyebrow: l("Montreal · systematic fixed income and alternative strategies", "Montréal · revenu fixe systématique et stratégies alternatives"),
    // the H1 reads "Scientific investing" / "Investissement scientifique"; the second word carries the gradient
    title: l("Scientific", "Investissement"),
    accent: l("investing", "scientifique"),
    lead: l(
      "Nymbus Capital is a Montreal investment manager that builds fixed income and alternative strategies with quantitative research, systematic portfolio construction and continuous risk management.",
      "Nymbus Capital est un gestionnaire de placements montréalais qui bâtit des stratégies de revenu fixe et alternatives grâce à la recherche quantitative, à la construction systématique de portefeuilles et à une gestion continue des risques.",
    ),
    cta1: l("Explore strategies", "Explorer les stratégies"),
    cta2: l("Investment solutions", "Solutions d’investissement"),
    live: l("Daily NAVs as of", "VL quotidiennes au"),
  },
  figures: {
    title: l("Nymbus at a glance", "Nymbus en bref"),
    aum: l("Assets under management, including mandates", "Actifs sous gestion, mandats compris"),
    strategies: l("Investment strategies", "Stratégies de placement"),
    team: l("People on our team and board", "Personnes au sein de l’équipe et du conseil"),
    where: l("Investment manager headquartered in Montreal.", "Gestionnaire de placements établi à Montréal."),
  },
  approach: {
    eyebrow: l("Our approach", "Notre approche"),
    title: l("At the intersection of", "À l’intersection de"),
    accent: l("technology, data and finance", "la technologie, des données et de la finance"),
    lead: l(
      "We apply the scientific method to investing: form a hypothesis, test it on data, and keep only what holds up out of sample. Our team combines decades of institutional experience with research in machine learning, signal processing and portfolio optimization.",
      "Nous appliquons la méthode scientifique au placement : formuler une hypothèse, la tester sur les données et ne retenir que ce qui résiste hors échantillon. Notre équipe allie des décennies d’expérience institutionnelle à la recherche en apprentissage automatique, en traitement du signal et en optimisation de portefeuille.",
    ),
    cards: [
      {
        title: l("Quantitative research", "Recherche quantitative"),
        text: l(
          "Market dynamics, credit fundamentals and risk factors studied with proprietary models and machine learning, security by security.",
          "Dynamiques de marché, fondamentaux du crédit et facteurs de risque étudiés titre par titre à l’aide de modèles propriétaires et de l’apprentissage automatique.",
        ),
      },
      {
        title: l("Systematic construction", "Construction systématique"),
        text: l(
          "Portfolios built by explicit rules and optimization models, with disciplined allocation and rebalancing instead of discretionary calls.",
          "Des portefeuilles bâtis selon des règles explicites et des modèles d’optimisation, avec une répartition et un rééquilibrage disciplinés plutôt que des décisions discrétionnaires.",
        ),
      },
      {
        title: l("Dynamic risk management", "Gestion dynamique des risques"),
        text: l(
          "Continuous monitoring, market-regime classification and protection strategies designed to soften drawdowns.",
          "Une surveillance continue, une classification des régimes de marché et des stratégies de protection conçues pour atténuer les replis.",
        ),
      },
    ] as { title: L; text: L }[],
    more: l("Read about our approach", "Découvrir notre approche"),
    team: l("Meet the team", "Rencontrer l’équipe"),
  },
  strategies: {
    eyebrow: l("Strategies", "Stratégies"),
    title: l("Our funds and", "Nos fonds et"),
    accent: l("strategies", "stratégies"),
    lead: l(
      "Four strategies built by the same research process: two bond funds, a multi-strategy fund and a protection overlay for managed accounts.",
      "Quatre stratégies issues du même processus de recherche : deux fonds obligataires, un fonds multistratégies et une stratégie de protection pour comptes gérés.",
    ),
    all: l("View all strategies", "Voir toutes les stratégies"),
  },
  process: {
    eyebrow: l("Investment process", "Processus d’investissement"),
    title: l("One pipeline, from data", "Un seul processus, des données"),
    accent: l("to portfolio", "au portefeuille"),
    lead: l(
      "The same four steps run behind every strategy, and each one is documented, tested and monitored.",
      "Les quatre mêmes étapes sont à l’œuvre derrière chaque stratégie, et chacune est documentée, testée et surveillée.",
    ),
    steps: [
      {
        title: l("Data and research", "Données et recherche"),
        text: l(
          "Market, security and fundamental data gathered, cleaned and studied to identify persistent drivers of return.",
          "Des données de marché, de titres et fondamentales recueillies, nettoyées et étudiées pour repérer les moteurs de rendement persistants.",
        ),
      },
      {
        title: l("Signal generation", "Génération de signaux"),
        text: l(
          "Machine-learning models turn that research into signals, which are kept only after rigorous statistical validation.",
          "Des modèles d’apprentissage automatique transforment cette recherche en signaux, conservés seulement après une validation statistique rigoureuse.",
        ),
      },
      {
        title: l("Portfolio construction", "Construction du portefeuille"),
        text: l(
          "Optimization combines the signals into a portfolio under explicit constraints on risk, liquidity and sustainability criteria.",
          "L’optimisation combine les signaux en un portefeuille, sous des contraintes explicites de risque, de liquidité et de critères de durabilité.",
        ),
      },
      {
        title: l("Risk management", "Gestion des risques"),
        text: l(
          "Positions and exposures are monitored continuously, with regime-based adjustments and hedging when conditions change.",
          "Les positions et les expositions sont surveillées en continu, avec des ajustements selon le régime de marché et des couvertures lorsque les conditions changent.",
        ),
      },
    ] as { title: L; text: L }[],
  },
  partners: {
    eyebrow: l("Clients and platforms", "Clients et plateformes"),
    title: l("Institutions and partners", "Les institutions et partenaires"),
    accent: l("we work with", "avec qui nous travaillons"),
    clients: l("Institutional clients and programs", "Clients institutionnels et programmes"),
    platforms: l("Our funds are available through", "Nos fonds sont offerts par l’entremise de"),
    note: l(
      "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement.",
      "Source : Nymbus Capital inc. Liste représentative; tous les clients ne sont pas présentés. QEMP : Programme des gestionnaires en émergence du Québec (Innocap). Leur présence ne constitue pas une recommandation.",
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
      "Our team can walk you through the strategies, their track records and how they could fit your portfolio or mandate.",
      "Notre équipe peut vous présenter les stratégies, leurs historiques de rendement et la façon dont elles pourraient s’intégrer à votre portefeuille ou à votre mandat.",
    ),
    contact: l("Get in touch", "Communiquez avec nous"),
    solutions: l("View solutions", "Voir les solutions"),
  },
};

/** Labels shared by the fund cards and the comparison table (home and /strategies). */
export const FUND_COPY = {
  nav: l("NAV", "VL"),
  navSeries: l("Series", "Série"),
  ytd: l("YTD", "Cumul annuel"),
  y1: l("1 year", "1 an"),
  si: l("Since inception, annualized", "Depuis la création, annualisé"),
  siCum: l("Since inception (cumulative)", "Depuis la création (cumulatif)"),
  siShort: l("SI", "DC"),
  siAnn: l("since inception, annualized", "depuis la création, annualisé"),
  siCumShort: l("since inception, cumulative", "depuis la création, cumulatif"),
  annualized: l("annualized", "annualisé"),
  net: l("Net of fees", "Nets de frais"),
  gross: l("Gross of fees", "Bruts de frais"),
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
  fund: l("Fund · FundServ", "Fonds · FundServ"),
  strategy: l("Managed accounts", "Comptes gérés"),
};
