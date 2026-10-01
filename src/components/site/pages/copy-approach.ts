/**
 * /approach copy, EN / FR side by side. Sources: the previous site's Approach page (methodology, philosophy),
 * rewritten to describe the method rather than promise outcomes, and the deck's bond process and protection
 * overlay (nymbus-decks, compliance-approved footnotes kept verbatim).
 */
import { l, type L } from "../../../lib/i18n/config.ts";

export const AP = {
  meta: {
    title: l("Approach", "Approche"),
    description: l(
      "How Nymbus Capital invests: a four-step systematic process, a two-system bond process, a futures overlay, and the research behind them.",
      "Comment Nymbus Capital investit : un processus systématique en quatre étapes, un processus obligataire à deux systèmes, une stratégie de superposition et la recherche qui les soutient.",
    ),
  },
  hero: {
    eyebrow: l("Our approach", "Notre approche"),
    title: l("At the intersection of technology,", "À l’intersection de la technologie,"),
    accent: l("data and finance", "des données et de la finance"),
    lead: l(
      "Systematic, with human oversight. Documented rules, tested before use, monitored while they run.",
      "Systématique, sous supervision humaine. Des règles documentées, testées avant usage, surveillées en continu.",
    ),
    cta1: l("Our strategies", "Nos stratégies"),
    cta2: l("Meet the team", "Rencontrer l’équipe"),
  },
  pipe: {
    eyebrow: l("Investment methodology", "Méthodologie de placement"),
    title: l("From raw data to a managed portfolio,", "Des données brutes au portefeuille géré,"),
    accent: l("in four steps", "en quatre étapes"),
    lead: l(
      "Public market data in, portfolios within explicit risk budgets out.",
      "Des données de marché publiques aux portefeuilles qui respectent des budgets de risque explicites.",
    ),
    diagram: l(
      "Diagram of the investment process: data and research, signal generation, portfolio construction and risk management, with monitoring results feeding back into research.",
      "Schéma du processus de placement : données et recherche, génération de signaux, construction de portefeuille et gestion des risques; les résultats de la surveillance alimentent la recherche.",
    ),
    loop: l("Monitoring results feed back into research", "Les résultats de la surveillance alimentent la recherche"),
  },
  steps: [
    {
      kicker: l("Foundation", "Socle"),
      title: l("Data and research", "Données et recherche"),
      short: l("Prices, credit and macro data, cleaned daily.", "Prix, crédit et données macro, nettoyés chaque jour."),
      bullets: [
        l("Proprietary credit scoring models", "Modèles propriétaires de notation de crédit"),
        l("Macro regime classification", "Classification des régimes macroéconomiques"),
        l("Pattern recognition across large datasets", "Reconnaissance de régularités dans de grands ensembles de données"),
      ],
    },
    {
      kicker: l("Signal discovery", "Découverte de signaux"),
      title: l("Signal generation", "Génération de signaux"),
      short: l("Models turn data into signals, validated out of sample.", "Des modèles en tirent des signaux, validés hors échantillon."),
      bullets: [
        l("Gradient-boosted tree ensembles", "Ensembles d’arbres à gradient boosté"),
        l("Neural network regime classifiers", "Classificateurs de régime par réseaux neuronaux"),
        l("Cross-validation and walk-forward testing", "Validation croisée et validation progressive (walk-forward)"),
      ],
    },
    {
      kicker: l("Optimization", "Optimisation"),
      title: l("Portfolio construction", "Construction de portefeuille"),
      short: l("Positions sized within risk, liquidity and cost limits.", "Positions dimensionnées selon des limites de risque, de liquidité et de coûts."),
      bullets: [
        l("Mean-variance with robust covariance estimation", "Moyenne-variance avec estimation robuste de la covariance"),
        l("Risk parity and factor-aware allocation", "Parité des risques et allocation factorielle"),
        l("Transaction-cost optimization", "Optimisation des coûts de transaction"),
      ],
    },
    {
      kicker: l("Risk control", "Contrôle des risques"),
      title: l("Risk management", "Gestion des risques"),
      short: l("Exposures monitored continuously, adjusted to the regime.", "Expositions surveillées en continu, ajustées au régime."),
      bullets: [
        l("Value at risk and stress testing", "Valeur à risque et tests de résistance"),
        l("Regime detection (risk-on / risk-off)", "Détection de régime (appétit ou aversion pour le risque)"),
        l("Duration and credit hedging", "Couverture de la duration et du crédit"),
      ],
      note: l(
        "Hedging seeks to limit losses in adverse conditions; it does not eliminate the risk of loss.",
        "La couverture cherche à limiter les pertes en conditions défavorables; elle n’élimine pas le risque de perte.",
      ),
    },
  ],
  bonds: {
    eyebrow: l("Bond investment process", "Processus de placement obligataire"),
    title: l("Two systems", "Deux systèmes"),
    accent: l("for every bond portfolio", "pour chaque portefeuille obligataire"),
    lead: l(
      "Top-down positions the curve and credit sectors. Bottom-up selects the bonds.",
      "Le système descendant positionne la courbe et les secteurs de crédit. L’ascendant choisit les obligations.",
    ),
    systems: [
      {
        tag: l("System 1 · macro", "Système 1 · macro"),
        name: l("Portfolio positioning", "Positionnement du portefeuille"),
        role: l("Systematizes a portfolio manager’s experience", "Systématise l’expérience d’un gestionnaire de portefeuille"),
        facts: [
          [l("Method", "Méthode"), l("Systematic", "Systématique")],
          [l("View", "Angle"), l("Macro, top-down", "Macro, descendant")],
          [l("Rebalancing", "Rééquilibrage"), l("Every six months", "Tous les six mois")],
        ] as [L, L][],
        steps: [
          l("Identify market regimes and trends", "Déterminer les régimes et les tendances de marché"),
          l("Build the curve and credit matrix from bond market data", "Construire la matrice courbe-crédit à partir des données du marché obligataire"),
        ],
      },
      {
        tag: l("System 2 · micro", "Système 2 · micro"),
        name: l("Security selection", "Sélection de titres"),
        role: l("Replicates an analyst’s in-depth knowledge", "Reproduit la connaissance approfondie d’un analyste"),
        facts: [
          [l("Method", "Méthode"), l("Systematic, with human oversight", "Systématique, sous supervision humaine")],
          [l("View", "Angle"), l("Micro, bottom-up", "Micro, ascendant")],
          [l("Rebalancing", "Rééquilibrage"), l("Continuous, on alerts", "Continu, sur alertes")],
        ] as [L, L][],
        steps: [
          l("Score and rank each cell’s bonds by yield and risk", "Évaluer et classer les obligations de chaque cellule selon le rendement et le risque"),
          l("Select the final securities", "Sélectionner les titres finaux"),
        ],
      },
    ],
  },
  overlay: {
    eyebrow: l("Futures overlay", "Stratégie de superposition"),
    title: l("Why add a futures overlay", "Pourquoi ajouter une stratégie de superposition"),
    accent: l("to a bond portfolio?", "à un portefeuille obligataire?"),
    lead: l(
      "Bonds tend to struggle when volatility rises. Managed futures strategies seek to perform then.",
      "Les obligations souffrent généralement quand la volatilité monte. Les stratégies de contrats à terme gérés cherchent alors à bien se comporter.",
    ),
    suffer: l("Bonds suffer when…", "Les obligations souffrent lorsque…"),
    risks: [l("rates rise", "les taux montent"), l("inflation spikes", "l’inflation grimpe"), l("spreads widen", "les écarts s’élargissent")],
    common: l("The common thread", "Le point commun"),
    vol: l("Elevated volatility", "Une volatilité élevée"),
    solution: l("Our response", "Notre réponse"),
    solT: l("A managed futures overlay", "Une superposition de contrats à terme gérés"),
    solD: l(
      "Our overlay is designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money.*",
      "Notre stratégie de superposition est conçue pour avoir une faible corrélation avec les obligations et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes.*",
    ),
    stackT: l("Most of the capital stays invested", "La majeure partie du capital reste investie"),
    stackD: l(
      "Futures sit on top of the bonds, with a margin deposit of about 5 to 10% of exposure.** The overlay adds leveraged futures exposure; its losses add to those of the underlying portfolio and may require additional margin.",
      "Les contrats à terme s’ajoutent aux obligations, avec un dépôt de garantie d’environ 5 à 10 % de l’exposition.** La superposition ajoute une exposition à effet de levier au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
    ),
    before: l("Bond portfolio", "Portefeuille obligataire"),
    after: l("With the overlay", "Avec la superposition"),
    bonds: l("Bonds", "Obligations"),
    overlay: l("Futures overlay", "Superposition"),
    foot1: l(
      "* Source: Nymbus Capital Inc. Statements reflect historical observations of the Nymbus bond funds’ underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations.",
      "* Source : Nymbus Capital Inc. Les déclarations présentées reflètent des observations historiques des stratégies sous-jacentes aux fonds obligataires Nymbus à des fins de visualisation conceptuelle et ne doivent pas être interprétées comme une représentation exacte des rendements passés ou des prévisions futures.",
    ),
    foot2: l(
      "** Source: Nymbus Capital Inc. For illustrative purposes only. The percentages are approximations of typical allocations and may vary as the model allocation evolves.",
      "** Source : Nymbus Capital Inc. À titre indicatif uniquement. Les pourcentages correspondent à des estimations des répartitions types et peuvent varier à mesure que la répartition type évolue.",
    ),
  },
  philosophy: {
    eyebrow: l("Investment philosophy", "Philosophie de placement"),
    title: l("The principles behind", "Les principes qui guident"),
    accent: l("every decision", "chaque décision"),
    items: [
      { t: l("Systematic, with human oversight", "Systématique, sous supervision humaine"), d: l("Tested rules, team oversight, less emotion.", "Règles testées, supervision de l’équipe, moins d’émotion.") },
      { t: l("Risk before return", "Le risque avant le rendement"), d: l("Risk budgets, not return targets.", "Des budgets de risque, non des cibles de rendement.") },
      { t: l("Technology first", "La technologie d’abord"), d: l("Purpose-built infrastructure, data at scale.", "Infrastructure sur mesure, données à grande échelle.") },
      { t: l("Continuous research", "Recherche continue"), d: l("New data and methods, tested continuously.", "Nouvelles données et méthodes, testées en continu.") },
      { t: l("Risk control", "Contrôle des risques"), d: l("Explicit risk limits, possible hedging; this does not eliminate the risk of loss.", "Des limites de risque explicites, des couvertures possibles; cela n’élimine pas le risque de perte.") },
      { t: l("Diversified return sources", "Sources de rendement diversifiées"), d: l("Strategies that behave differently across regimes.", "Des stratégies au comportement différent selon les régimes.") },
    ],
  },
  research: {
    eyebrow: l("Research and technology", "Recherche et technologie"),
    title: l("Built like a research lab,", "Organisés comme un laboratoire,"),
    accent: l("run like a trading desk", "exploités comme un pupitre de négociation"),
    lead: l(
      "Same data and code: what we test is what we run.",
      "Mêmes données, même code : ce que nous testons est ce que nous exploitons.",
    ),
    lifecycleT: l("From idea to production", "De l’idée à la production"),
    lifecycle: [
      { t: l("Hypothesis", "Hypothèse"), d: l("A documented, testable idea.", "Une idée documentée et vérifiable.") },
      { t: l("Research", "Recherche"), d: l("Backtests, transaction costs included.", "Tests historiques, coûts de transaction compris.") },
      { t: l("Validation", "Validation"), d: l("Out-of-sample and walk-forward tests, then team review.", "Tests hors échantillon et validation progressive (walk-forward), puis revue par l’équipe.") },
      { t: l("Production", "Production"), d: l("Same code, monitored daily, retired on decay.", "Même code, surveillée chaque jour, retirée si le signal s’estompe.") },
    ],
    caps: [
      { t: l("Data platform", "Plateforme de données"), d: l("Custodian, market and index data, daily.", "Données des dépositaires, des marchés et des indices, chaque jour.") },
      { t: l("Machine learning", "Apprentissage automatique"), d: l("Regime classification, pattern recognition.", "Classification des régimes, reconnaissance de régularités.") },
      { t: l("Validation discipline", "Rigueur de validation"), d: l("Cross-validation, walk-forward tests, signal-decay monitoring.", "Validation croisée, validation progressive (walk-forward), suivi du déclin des signaux.") },
      { t: l("Operations and reporting", "Opérations et rapports"), d: l("Reporting on the research data.", "Rapports sur les données de recherche.") },
    ],
  },
  team: {
    eyebrow: l("The team", "L’équipe"),
    title: l("Scientists", "Des scientifiques"),
    accent: l("and market veterans", "et des vétérans des marchés"),
    lead: l(
      "Physicists, engineers and computer scientists, alongside fixed income managers.",
      "Physiciens, ingénieurs et informaticiens, aux côtés de gestionnaires en revenu fixe.",
    ),
    people: l("people on the team", "personnes dans l’équipe"),
    phd: l("PhDs in physics", "doctorats en physique"),
    cfa: l("CFA charterholders", "titulaires de la charte CFA"),
    cta: l("Meet the team", "Rencontrer l’équipe"),
  },
  cta: {
    title: l("See the approach", "Voyez l’approche"),
    accent: l("in practice", "en pratique"),
    text: l(
      "One process, applied to each mandate.",
      "Un seul processus, appliqué à chaque mandat.",
    ),
    b1: l("View strategies", "Voir les stratégies"),
    b2: l("Contact us", "Nous joindre"),
  },
};
