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
      "How Nymbus Capital invests: risk first, a four-step systematic process, a two-system bond process, protective overlays designed to offset part of losses, and multi-strategy portfolios across asset classes.",
      "Comment Nymbus Capital investit : le risque d’abord, un processus systématique en quatre étapes, un processus obligataire à deux systèmes, des superpositions protectrices conçues pour compenser une partie des pertes, et des portefeuilles multistratégies dans plusieurs catégories d’actifs.",
    ),
  },
  hero: {
    eyebrow: l("Our approach", "Notre approche"),
    title: l("At the intersection of technology,", "À l’intersection de la technologie,"),
    accent: l("data and finance", "des données et de la finance"),
    lead: l(
      "Systematic, with human oversight. Tested before use, monitored while it runs.",
      "Systématique, sous supervision humaine. Testé avant usage, surveillé en continu.",
    ),
    cta1: l("Our strategies", "Nos stratégies"),
    cta2: l("Meet the team", "Rencontrer l’équipe"),
  },
  risk: {
    eyebrow: l("Risk first", "Le risque d’abord"),
    title: l("Every strategy starts", "Chaque stratégie part"),
    accent: l("with risk", "du risque"),
    lead: l(
      "Ultra-micro analysis, at scale.",
      "Une analyse ultra-micro, à grande échelle.",
    ),
    items: [
      { t: l("Ultra-micro analysis", "Analyse ultra-micro"), d: l("Each bond on its own, across entire universes.", "Chaque obligation, dans des univers entiers.") },
      { t: l("Systematic scans", "Balayages systématiques"), d: l("Seeking the most attractive assets for their risk.", "À la recherche des actifs les plus attrayants compte tenu de leur risque.") },
      { t: l("Protective overlays", "Superpositions protectrices"), d: l("Designed to offset part of bond losses, with low correlation with bonds in down months (risks below).", "Conçues pour compenser une partie des pertes obligataires, avec une faible corrélation avec les obligations lors des mois de baisse (risques ci-dessous).") },
    ],
    viz: l("Illustration: a bond universe, scanned bond by bond", "Illustration : un univers obligataire, balayé obligation par obligation"),
    illus: l("Illustration only", "Illustration seulement"),
    metrics: [l("Yield", "Rendement"), l("Credit", "Crédit"), l("Duration", "Durée"), l("Risk-adjusted score", "Score ajusté au risque")],
  },
  pipe: {
    eyebrow: l("Investment methodology", "Méthodologie de placement"),
    title: l("From raw data to a managed portfolio,", "Des données brutes au portefeuille géré,"),
    accent: l("in four steps", "en quatre étapes"),
    diagram: l(
      "Investment process: data and research, signals, portfolio construction, risk management; monitoring feeds research.",
      "Processus de placement : données et recherche, signaux, construction de portefeuille, gestion des risques; la surveillance alimente la recherche.",
    ),
    loop: l("Monitoring results feed back into research", "Les résultats de la surveillance alimentent la recherche"),
  },
  steps: [
    {
      kicker: l("Foundation", "Socle"),
      title: l("Data and research", "Données et recherche"),
      bullets: [
        l("Proprietary credit scoring models", "Modèles propriétaires de notation de crédit"),
        l("Macro regime classification", "Classification des régimes macroéconomiques"),
        l("Pattern recognition at scale", "Reconnaissance de régularités à grande échelle"),
      ],
    },
    {
      kicker: l("Signal discovery", "Découverte de signaux"),
      title: l("Signal generation", "Génération de signaux"),
      bullets: [
        l("Gradient-boosted tree ensembles", "Ensembles d’arbres à gradient boosté"),
        l("Neural network regime classifiers", "Classificateurs de régime par réseaux neuronaux"),
        l("Cross-validation and walk-forward testing", "Validation croisée et validation progressive (walk-forward)"),
      ],
    },
    {
      kicker: l("Optimization", "Optimisation"),
      title: l("Portfolio construction", "Construction de portefeuille"),
      bullets: [
        l("Robust mean-variance optimization", "Optimisation moyenne-variance robuste"),
        l("Risk parity and factor-aware allocation", "Parité des risques et allocation factorielle"),
        l("Allocation across strategies and asset classes", "Répartition entre stratégies et catégories d’actifs"),
      ],
    },
    {
      kicker: l("Risk control", "Contrôle des risques"),
      title: l("Risk management", "Gestion des risques"),
      bullets: [
        l("Value at risk and stress testing", "Valeur à risque et tests de résistance"),
        l("Duration and credit hedging", "Couverture de la durée et du crédit"),
        l("Overlays sized to a downside-volatility target", "Superpositions calibrées selon une cible de volatilité à la baisse"),
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
          l("Build the curve-credit matrix", "Construire la matrice courbe-crédit"),
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
          l("Rank each cell’s bonds by yield and risk", "Classer les obligations de chaque cellule selon le rendement et le risque"),
          l("Select the final securities", "Sélectionner les titres finaux"),
        ],
      },
    ],
  },
  overlay: {
    eyebrow: l("Protective overlay", "Superposition protectrice"),
    title: l("Why add a protective overlay", "Pourquoi ajouter une superposition protectrice"),
    accent: l("to a bond portfolio?", "à un portefeuille obligataire?"),
    lead: l(
      "Bonds tend to struggle when volatility rises.",
      "Les obligations souffrent généralement quand la volatilité monte.",
    ),
    suffer: l("Bonds suffer when…", "Les obligations souffrent lorsque…"),
    risks: [l("rates rise", "les taux montent"), l("inflation spikes", "l’inflation grimpe"), l("spreads widen", "les écarts s’élargissent")],
    common: l("The common thread", "Le point commun"),
    vol: l("Elevated volatility", "Une volatilité élevée"),
    solution: l("Our response", "Notre réponse"),
    solT: l("A protective overlay of managed futures", "Une superposition protectrice de contrats à terme gérés"),
    solD: l(
      "Our protective overlay is designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money.*",
      "Notre superposition protectrice est conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes.*",
    ),
    stackT: l("Most of the capital stays invested", "La majeure partie du capital reste investie"),
    stackD: l(
      "Futures sit on top of the bonds, with a margin deposit of about 5 to 10% of their exposure.** The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.",
      "Les contrats à terme s’ajoutent aux obligations, avec un dépôt de garantie d’environ 5 à 10 % de leur exposition.** La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
    ),
    before: l("Bond portfolio", "Portefeuille obligataire"),
    after: l("With the protective overlay", "Avec la superposition protectrice"),
    bonds: l("Bonds", "Obligations"),
    overlay: l("Protective overlay", "Superposition protectrice"),
    foot1: l(
      "* Source: Nymbus Capital Inc. Statements reflect historical observations of the Nymbus bond funds’ underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations.",
      "* Source : Nymbus Capital Inc. Les déclarations présentées reflètent des observations historiques des stratégies sous-jacentes aux fonds obligataires Nymbus à des fins de visualisation conceptuelle et ne doivent pas être interprétées comme une représentation exacte des rendements passés ou des prévisions futures.",
    ),
    foot2: l(
      "** Source: Nymbus Capital Inc. For illustrative purposes only. The percentages are approximations of typical allocations and may vary as the model allocation evolves.",
      "** Source : Nymbus Capital Inc. À titre indicatif uniquement. Les pourcentages correspondent à des estimations des répartitions types et peuvent varier à mesure que la répartition type évolue.",
    ),
  },
  multi: {
    eyebrow: l("Multi-strategy and protective overlays", "Multistratégie et superpositions protectrices"),
    title: l("Several strategies,", "Plusieurs stratégies,"),
    accent: l("across asset classes", "dans plusieurs catégories d’actifs"),
    lead: l(
      "A liquid alternative across asset classes, designed to have low correlation with stocks and bonds in down months.",
      "Une solution alternative liquide, multi-actifs, conçue pour avoir une faible corrélation avec les actions et les obligations lors des mois de baisse.",
    ),
    strategies: [l("Low volatility", "Faible volatilité"), l("Directional", "Directionnelle"), l("Mean reversion", "Retour à la moyenne"), l("Hedging", "Couverture")],
    assets: [l("Rates", "Taux"), l("Credit", "Crédit"), l("Equity indices", "Indices boursiers"), l("Currencies", "Devises"), l("Commodities", "Matières premières")],
    overlay: l("Protective overlay · designed to offset part of bond losses", "Superposition protectrice · conçue pour compenser une partie des pertes obligataires"),
    strategiesK: l("Strategies", "Stratégies"),
    assetsK: l("Asset classes", "Catégories d’actifs"),
    offersT: l("Three ways to access it", "Trois façons d’y accéder"),
    offers: [
      { t: l("Bond funds with a protective overlay", "Fonds obligataires avec superposition protectrice"), d: l("Both use the protective overlay.", "Les deux utilisent la superposition protectrice."), links: [
        { href: "/strategies/monthly-income", label: l("Monthly Income", "Revenu Mensuel") },
        { href: "/strategies/sustainable-enhanced-bonds", label: l("Sustainable Enhanced Bonds", "Obligations Durables Bonifiées") },
      ] },
      { t: l("Multi-Strategy Fund", "Fonds Multistratégies"), d: l("A liquid alternative, Alternative Multi-Strategy category.", "Une solution alternative liquide, catégorie Multistratégies alternatives."), links: [{ href: "/strategies/multi-strategy" }] },
      { t: l("Global Minimum Volatility", "Global Minimum Volatility"), d: l("The protective overlay alone, on top of your portfolio.", "La superposition protectrice seule, ajoutée à votre portefeuille."), links: [{ href: "/strategies/global-minimum-volatility" }] },
    ],
    note: l(
      "Illustration only: allocations change and not every strategy trades every asset class. Low correlation is an objective, not a guarantee. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.",
      "Illustration seulement : les répartitions changent et chaque stratégie ne porte pas sur chaque catégorie d’actifs. La faible corrélation est un objectif, non une garantie. La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
    ),
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
      { t: l("Hypothesis", "Hypothèse"), d: l("Documented, testable.", "Documentée, vérifiable.") },
      { t: l("Research", "Recherche"), d: l("Backtests, costs included.", "Tests historiques, coûts compris.") },
      { t: l("Validation", "Validation"), d: l("Out of sample, then reviewed.", "Hors échantillon, puis revue.") },
      { t: l("Production", "Production"), d: l("Same code, monitored daily.", "Même code, surveillé chaque jour.") },
    ],
    caps: [
      { t: l("Data platform", "Plateforme de données") },
      { t: l("Machine learning", "Apprentissage automatique") },
      { t: l("Validation discipline", "Rigueur de validation") },
      { t: l("Operations and reporting", "Opérations et rapports") },
    ],
  },
  team: {
    eyebrow: l("The team", "L’équipe"),
    title: l("Scientists, engineers", "Des scientifiques, des développeurs"),
    accent: l("and market veterans", "et des vétérans des marchés"),
    people: l("people on the team", "personnes dans l’équipe"),
    phd: l("PhDs", "doctorats"),
    cfa: l("CFA or CIM holders", "titulaires de titres CFA ou CIM"),
    cta: l("Meet the team", "Rencontrer l’équipe"),
  },
  cta: {
    title: l("See the approach", "Voyez l’approche"),
    accent: l("in practice", "en pratique"),
    b1: l("View strategies", "Voir les stratégies"),
    b2: l("Contact us", "Nous joindre"),
  },
};
