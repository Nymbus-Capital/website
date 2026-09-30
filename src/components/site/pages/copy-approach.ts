/**
 * /approach copy, EN / FR side by side. Sources: the previous site's Approach page (methodology, philosophy),
 * rewritten to describe the method rather than promise outcomes, and the deck's bond process and protection
 * overlay (nymbus-decks, compliance-approved footnotes kept verbatim).
 */
import { l, type L } from "@/lib/i18n/config";

export const AP = {
  meta: {
    title: l("Approach", "Approche"),
    description: l(
      "How Nymbus Capital invests: a systematic four-step process from data to risk management, a two-system bond process, a protection overlay, and the research and technology behind them.",
      "Comment Nymbus Capital investit : un processus systématique en quatre étapes, des données à la gestion des risques, un processus obligataire à deux systèmes, une stratégie de protection, et la recherche et la technologie qui les soutiennent.",
    ),
  },
  hero: {
    eyebrow: l("Our approach", "Notre approche"),
    title: l("At the intersection of technology,", "À l’intersection de la technologie,"),
    accent: l("data and finance", "des données et de la finance"),
    lead: l(
      "We invest systematically. Every step, from the data we collect to the positions we hold, follows documented rules that are tested before they are used, monitored while they run and refined through ongoing research.",
      "Nous investissons de façon systématique. Chaque étape, des données recueillies aux positions détenues, suit des règles documentées, testées avant d’être utilisées, surveillées en continu et améliorées par une recherche constante.",
    ),
    cta1: l("Our strategies", "Nos stratégies"),
    cta2: l("Meet the team", "Rencontrer l’équipe"),
  },
  pipe: {
    eyebrow: l("Investment methodology", "Méthodologie d’investissement"),
    title: l("From raw data to a managed portfolio,", "Des données brutes au portefeuille géré,"),
    accent: l("in four steps", "en quatre étapes"),
    lead: l(
      "A systematic pipeline turns public market data into portfolios that respect explicit risk budgets. What we learn from monitoring feeds back into research.",
      "Un pipeline systématique transforme les données de marché publiques en portefeuilles qui respectent des budgets de risque explicites. Ce que la surveillance nous apprend alimente la recherche.",
    ),
    diagram: l(
      "Diagram of the investment process: data and research, signal generation, portfolio construction and risk management, with monitoring results feeding back into research.",
      "Schéma du processus d’investissement : données et recherche, génération de signaux, construction de portefeuille et gestion des risques; les résultats de la surveillance alimentent la recherche.",
    ),
    loop: l("Monitoring results feed back into research", "Les résultats de la surveillance alimentent la recherche"),
  },
  steps: [
    {
      kicker: l("Foundation", "Fondation"),
      title: l("Data and research", "Données et recherche"),
      short: l("Prices, credit metrics and macro indicators, cleaned and stored every day.", "Prix, indicateurs de crédit et données macroéconomiques, nettoyés et stockés chaque jour."),
      text: l(
        "We process large volumes of public market data: bond prices, fundamental credit metrics, macroeconomic indicators and cross-asset relationships. Statistical analysis and machine learning look for patterns across billions of data points, a volume no team could review by hand, to find opportunities and measure risk more precisely.",
        "Nous traitons de grands volumes de données de marché publiques : prix des obligations, indicateurs de crédit fondamentaux, indicateurs macroéconomiques et relations inter-actifs. L’analyse statistique et l’apprentissage automatique cherchent des tendances dans des milliards de points de données, un volume qu’aucune équipe ne pourrait examiner à la main, pour repérer des occasions et mesurer le risque avec plus de précision.",
      ),
      bullets: [
        l("Proprietary credit scoring models", "Modèles propriétaires de notation de crédit"),
        l("Macro regime classification", "Classification des régimes macroéconomiques"),
        l("Pattern recognition across billions of data points", "Reconnaissance de tendances sur des milliards de points de données"),
        l("Cross-asset correlation analysis", "Analyse des corrélations inter-actifs"),
      ],
    },
    {
      kicker: l("Signal discovery", "Découverte de signaux"),
      title: l("Signal generation", "Génération de signaux"),
      short: l("Models turn data into investment signals, validated out of sample.", "Des modèles transforment les données en signaux, validés hors échantillon."),
      text: l(
        "Machine learning models turn the data into investment signals. Ensemble methods combine several independent sources so that no single signal dominates, and every signal is validated on data it was not trained on before it is used.",
        "Des modèles d’apprentissage automatique transforment les données en signaux d’investissement. Des méthodes d’ensemble combinent plusieurs sources indépendantes pour qu’aucun signal ne domine, et chaque signal est validé sur des données qui n’ont pas servi à son entraînement avant d’être utilisé.",
      ),
      bullets: [
        l("Gradient-boosted tree ensembles", "Ensembles d’arbres à gradient boosté"),
        l("Neural network regime classifiers", "Classificateurs de régime par réseaux neuronaux"),
        l("Cross-validation and walk-forward testing", "Validation croisée et tests walk-forward"),
        l("Signal decay analysis and refresh cycles", "Analyse du déclin des signaux et cycles de mise à jour"),
      ],
    },
    {
      kicker: l("Optimization", "Optimisation"),
      title: l("Portfolio construction", "Construction de portefeuille"),
      short: l("An optimizer sizes positions within risk, liquidity and cost limits.", "Un optimiseur dimensionne les positions dans des limites de risque, de liquidité et de coûts."),
      text: l(
        "Signals feed a portfolio optimizer that sizes positions within risk budgets, concentration limits, liquidity constraints and transaction-cost models. The result is a portfolio built by the same rules every time, with every position traceable to the signals behind it.",
        "Les signaux alimentent un optimiseur de portefeuille qui dimensionne les positions dans des budgets de risque, des limites de concentration, des contraintes de liquidité et des modèles de coûts de transaction. Le résultat : un portefeuille construit chaque fois selon les mêmes règles, dont chaque position se rattache aux signaux qui la justifient.",
      ),
      bullets: [
        l("Mean-variance with robust covariance estimation", "Moyenne-variance avec estimation robuste de la covariance"),
        l("Risk parity and factor-aware allocation", "Parité des risques et allocation factorielle"),
        l("Transaction-cost optimization", "Optimisation des coûts de transaction"),
        l("Rebalancing threshold calibration", "Calibration des seuils de rééquilibrage"),
      ],
    },
    {
      kicker: l("Protection", "Protection"),
      title: l("Risk management", "Gestion des risques"),
      short: l("Exposures are monitored continuously and adjusted to the market regime.", "Les expositions sont surveillées en continu et ajustées au régime de marché."),
      text: l(
        "A risk engine monitors each portfolio continuously: value at risk, stress tests, concentration and liquidity. Hedging adjusts exposure to the market regime identified by our models, to limit losses in adverse conditions.",
        "Un moteur de risque surveille chaque portefeuille en continu : valeur à risque, tests de résistance, concentration et liquidité. La couverture ajuste l’exposition au régime de marché déterminé par nos modèles, afin de limiter les pertes en conditions défavorables.",
      ),
      bullets: [
        l("Value at risk and stress testing", "Valeur à risque et tests de résistance"),
        l("Regime detection (risk-on / risk-off)", "Détection de régime (appétit ou aversion pour le risque)"),
        l("Duration and credit hedging", "Couverture de la duration et du crédit"),
        l("Tail-risk protection through overlays", "Protection contre les risques extrêmes par superpositions"),
      ],
    },
  ],
  bonds: {
    eyebrow: l("Bond investment process", "Processus d’investissement obligataire"),
    title: l("Two systems", "Deux systèmes"),
    accent: l("for every bond portfolio", "pour chaque portefeuille obligataire"),
    lead: l(
      "Our fixed income mandates run on the same framework: a top-down system positions the portfolio across the yield curve and credit sectors, and a bottom-up system selects the individual bonds.",
      "Nos mandats de revenu fixe reposent sur le même cadre : un système descendant positionne le portefeuille sur la courbe des taux et les secteurs de crédit, et un système ascendant sélectionne les obligations.",
    ),
    systems: [
      {
        tag: l("System 1 · macro", "Système 1 · macro"),
        name: l("Portfolio positioning", "Positionnement du portefeuille"),
        role: l("Systematizes a portfolio manager’s experience", "Systématise l’expérience d’un gestionnaire de portefeuille"),
        facts: [
          [l("Method", "Méthode"), l("Systematic", "Systématique")],
          [l("View", "Angle"), l("Macro, top-down", "Macro, descendant")],
          [l("Rebalancing", "Rééquilibrage"), l("Every six months", "Aux six mois")],
        ] as [L, L][],
        steps: [
          l("Identify market regimes and trends", "Déterminer les régimes et les tendances de marché"),
          l("Build the curve and credit matrix from billions of bond data points", "Construire la matrice courbe-crédit à partir de milliards de données obligataires"),
        ],
      },
      {
        tag: l("System 2 · micro", "Système 2 · micro"),
        name: l("Security selection", "Sélection de titres"),
        role: l("Replicates an analyst’s in-depth knowledge", "Reproduit la connaissance approfondie d’un analyste"),
        facts: [
          [l("Method", "Méthode"), l("Systematic and discretionary", "Systématique et discrétionnaire")],
          [l("View", "Angle"), l("Micro, bottom-up", "Micro, ascendant")],
          [l("Rebalancing", "Rééquilibrage"), l("Continuous, on alerts", "Continu, sur alertes")],
        ] as [L, L][],
        steps: [
          l("Score and rank the bonds of each cell by yield and risk, continuously", "Évaluer et classer en continu les obligations de chaque cellule selon leur rendement et leur risque"),
          l("Select the final securities", "Sélectionner les titres finaux"),
        ],
      },
    ],
  },
  overlay: {
    eyebrow: l("Protection strategy", "Stratégie de protection"),
    title: l("Why add a protection overlay", "Pourquoi ajouter une stratégie de protection"),
    accent: l("to a bond portfolio?", "à un portefeuille obligataire?"),
    lead: l(
      "Bonds tend to struggle in the same conditions: rising rates, inflation spikes and widening credit spreads. All three come with elevated volatility, the environment in which managed futures strategies have tended to perform.",
      "Les obligations souffrent généralement dans les mêmes conditions : hausse des taux, poussées d’inflation et élargissement des écarts de crédit. Ces trois situations s’accompagnent d’une volatilité élevée, l’environnement où les stratégies de contrats à terme gérés ont eu tendance à bien se comporter.",
    ),
    suffer: l("Bonds suffer when…", "Les obligations souffrent lorsque…"),
    risks: [l("rates rise", "les taux montent"), l("inflation spikes", "l’inflation grimpe"), l("spreads widen", "les écarts s’élargissent")],
    common: l("The common thread", "Le point commun"),
    vol: l("Elevated volatility", "Une volatilité élevée"),
    solution: l("Our response", "Notre réponse"),
    solT: l("A managed futures overlay", "Une superposition de contrats à terme gérés"),
    solD: l(
      "Our uncorrelated protection strategy acts as a statistical hedge and has typically buffered bond drawdowns when volatility rises.*",
      "Notre stratégie de protection non corrélée agit comme une couverture statistique et a généralement atténué les baisses obligataires lorsque la volatilité augmente.*",
    ),
    stackT: l("Capital stays invested", "Le capital reste investi"),
    stackD: l(
      "The overlay is added on top of the bond portfolio with futures, which only require a margin deposit of about 5 to 10% of their exposure.**",
      "La stratégie s’ajoute au portefeuille obligataire au moyen de contrats à terme, qui ne demandent qu’un dépôt de garantie d’environ 5 à 10 % de leur exposition.**",
    ),
    before: l("Bond portfolio", "Portefeuille obligataire"),
    after: l("With the overlay", "Avec la stratégie"),
    bonds: l("Bonds, 100% of capital", "Obligations, 100 % du capital"),
    overlay: l("Protection overlay", "Stratégie de protection"),
    foot1: l(
      "* Source: Nymbus Capital Inc. Statements reflect historical observations of the Nymbus bond funds’ underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations.",
      "* Source : Nymbus Capital Inc. Les déclarations présentées reflètent des observations historiques des stratégies sous-jacentes aux fonds obligataires Nymbus à des fins de visualisation conceptuelle et ne doivent pas être interprétées comme une représentation exacte des rendements passés ou des prévisions futures.",
    ),
    foot2: l(
      "** Source: Nymbus Capital Inc. For illustrative purposes only. The percentages are approximations of typical allocations and may vary as the model allocation evolves.",
      "** Source : Nymbus Capital Inc. À titre indicatif uniquement. Les pourcentages correspondent à des estimations des répartitions types et peuvent varier à mesure que la répartition type évolue.",
    ),
  },
  philosophy: {
    eyebrow: l("Investment philosophy", "Philosophie d’investissement"),
    title: l("The principles behind", "Les principes derrière"),
    accent: l("every decision", "chaque décision"),
    items: [
      { t: l("Systematic over discretionary", "Systématique plutôt que discrétionnaire"), d: l("Decisions follow rules that are tested, validated and improved over time, which keeps emotion out of the process.", "Les décisions suivent des règles testées, validées et améliorées au fil du temps, ce qui tient l’émotion à l’écart du processus.") },
      { t: l("Risk before return", "Le risque avant le rendement"), d: l("Every source of return is weighed against the risk it adds. Portfolios are built to risk budgets, not return targets.", "Chaque source de rendement est évaluée en fonction du risque qu’elle ajoute. Les portefeuilles sont bâtis selon des budgets de risque, non des cibles de rendement.") },
      { t: l("Technology first", "La technologie d’abord"), d: l("Purpose-built infrastructure processes data at scale, so research moves quickly and strategies run reliably.", "Une infrastructure conçue sur mesure traite les données à grande échelle, pour une recherche rapide et des stratégies exécutées de façon fiable.") },
      { t: l("Continuous research", "Recherche continue"), d: l("A dedicated quantitative research team keeps testing new data, methods and market structures.", "Une équipe de recherche quantitative dédiée teste sans cesse de nouvelles données, méthodes et structures de marché.") },
      { t: l("Capital preservation", "Préservation du capital"), d: l("Downside protection is built into each strategy through systematic risk limits and hedging.", "La protection contre les baisses est intégrée à chaque stratégie par des limites de risque systématiques et des couvertures.") },
      { t: l("Diversified return sources", "Sources de rendement diversifiées"), d: l("Combining strategies that behave differently across market regimes makes a portfolio less dependent on any one of them.", "Combiner des stratégies qui se comportent différemment selon les régimes de marché rend un portefeuille moins dépendant de chacune d’elles.") },
    ],
  },
  research: {
    eyebrow: l("Research and technology", "Recherche et technologie"),
    title: l("Built like a research lab,", "Organisés comme un laboratoire,"),
    accent: l("run like a trading desk", "exploités comme un pupitre de négociation"),
    lead: l(
      "Our strategies are developed and operated on in-house technology. The same data and code serve research, daily operations and reporting, so what we test is what we run.",
      "Nos stratégies sont développées et exploitées sur une technologie interne. Les mêmes données et le même code servent la recherche, les opérations quotidiennes et la production de rapports : ce que nous testons est ce que nous exploitons.",
    ),
    lifecycleT: l("From idea to production", "De l’idée à la production"),
    lifecycle: [
      { t: l("Hypothesis", "Hypothèse"), d: l("A documented idea about a market behaviour, with the data needed to test it.", "Une idée documentée sur un comportement de marché, avec les données nécessaires pour la tester.") },
      { t: l("Research", "Recherche"), d: l("Backtests on historical data, including transaction costs.", "Des tests sur données historiques, coûts de transaction compris.") },
      { t: l("Validation", "Validation"), d: l("Out-of-sample and walk-forward tests, then review by the team.", "Des tests hors échantillon et walk-forward, puis une revue par l’équipe.") },
      { t: l("Production", "Production"), d: l("Deployed with the same code, monitored daily, retired when its signal decays.", "Déployée avec le même code, surveillée chaque jour, retirée quand son signal s’estompe.") },
    ],
    caps: [
      { t: l("Data platform", "Plateforme de données"), d: l("Custodian, market and index data consolidated into one central store every business day.", "Les données des dépositaires, des marchés et des indices consolidées chaque jour ouvrable dans un entrepôt central.") },
      { t: l("Machine learning", "Apprentissage automatique"), d: l("Regime classification and pattern recognition across the bond universe.", "Classification des régimes et reconnaissance de tendances dans l’univers obligataire.") },
      { t: l("Validation discipline", "Rigueur de validation"), d: l("Cross-validation, walk-forward testing and signal-decay monitoring before and after launch.", "Validation croisée, tests walk-forward et suivi du déclin des signaux, avant et après le lancement.") },
      { t: l("Operations and reporting", "Opérations et rapports"), d: l("Trade reporting and fund analytics built on the same data as research.", "La déclaration des opérations et l’analytique des fonds reposent sur les mêmes données que la recherche.") },
    ],
  },
  team: {
    eyebrow: l("The team", "L’équipe"),
    title: l("Scientists", "Des scientifiques"),
    accent: l("and market veterans", "et des vétérans des marchés"),
    lead: l(
      "Physicists, engineers and computer scientists work alongside portfolio managers who have spent their careers in fixed income and derivatives.",
      "Des physiciens, des ingénieurs et des informaticiens travaillent aux côtés de gestionnaires de portefeuille qui ont fait carrière en revenu fixe et en produits dérivés.",
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
      "Each of our strategies applies this process to a different mandate. Explore them, or talk to our team about yours.",
      "Chacune de nos stratégies applique ce processus à un mandat différent. Découvrez-les, ou parlez du vôtre avec notre équipe.",
    ),
    b1: l("View strategies", "Voir les stratégies"),
    b2: l("Contact us", "Nous joindre"),
  },
};
