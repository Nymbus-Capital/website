/**
 * Page copy, EN / FR side by side. Deck wording (nymbus-decks src/v2/content.ts + the prospectus deck's
 * footnotes) is reused verbatim where it exists: that text is compliance-approved. UI strings written for
 * the site are kept neutral (no performance claims).
 */
import { l, type L } from "@/lib/i18n/config";

export type { L };

export const HOME = {
  hero: {
    eyebrow: l("systematic fixed income", "revenu fixe systématique"),
    title: l("scientific investing", "investissement scientifique"),
    lead: l("scientists and market veterans tackling problems traditional managers don't.",
      "des scientifiques et des vétérans des marchés s'attaquant à des problèmes que les gestionnaires traditionnels ignorent."),
    cta1: l("explore our strategies", "explorer nos stratégies"),
    cta2: l("our approach", "notre approche"),
    ribbon: l("net asset value per unit", "valeur liquidative par part"),
    scroll: l("scroll", "défiler"),
  },
  glance: {
    eyebrow: l("nymbus at a glance", "à propos de nymbus"),
    approach: l("approach", "approche"), team: l("team", "équipe"), firm: l("firm", "firme"),
    a1: l("systematic fixed income", "revenu fixe systématique"),
    a2: l("systematic uncorrelated strategies", "stratégies non-corrélées"),
    a3: l("year track record", "ans d'historique"),
    t1: l("specialists", "spécialistes"),
    t1s: l("data scientists · physics PhDs · applied mathematicians · computer scientists", "scientifiques des données · PhDs physique · mathématiques appliquées · ingénieurs informatiques"),
    t2: l("markets veterans", "vétérans des marchés"),
    t2s: l("years average experience", "ans d’expérience moyenne"),
    aum: l("aum", "ASG"),
    top: l("top 1%*", "top 1%*"),
    topS: l("performance since launch (amongst Canadian institutional bond managers)", "performance depuis lancement (parmi les gestionnaires institutionnels de fonds obligataires canadiens)"),
    foot: l("* Source: Nymbus Capital Inc., eVestment, RBC PFS.",
      "* Source: Nymbus Capital Inc., eVestment (au 30 avril 2026), RBC PFS (au 31 mars 2026) pour nos deux stratégies obligataires soit le Fonds Nymbus Revenu Mensuel et le Fonds Nymbus Obligations Durables Bonifiées."),
  },
  chapters: {
    bonds: l("how we build bond portfolios", "comment nous construisons nos portefeuilles obligataires"),
    overlay: l("why add a protection overlay to a bond portfolio?", "pourquoi ajouter une stratégie de protection à un fonds obligataire"),
    strategies: l("our investment strategies", "nos stratégies de placement"),
    kicker: l("chapter", "chapitre"),
    k1: l("bonds investment process", "processus d’investissement"),
    k2: l("protection strategy", "stratégie de protection"),
    k3: l("strategies", "stratégies"),
  },
  pillars: {
    eyebrow: l("our investment philosophy", "notre philosophie de placement"),
    title: l("two pillars,", "deux piliers,"), accent: l("working together.", "qui travaillent ensemble."),
    items: [
      { k: l("fixed income process", "processus de revenu fixe"), t: l("systematic, regime-aware bond management", "gestion obligataire systématique sensible au régime"),
        d: l("a two-system framework (macro regime/sector positioning and security selection) running across all of our fixed income mandates", "un cadre à deux systèmes (positionnement sectoriel par régime macro et sélection de titres) appliqué à l'ensemble de nos mandats en revenu fixe") },
      { k: l("protection overlay", "superposition de protection"), t: l("an uncorrelated buffer for bond drawdowns", "un coussin non corrélé contre les baisses obligataires"),
        d: l("a managed futures overlay that tends to perform in higher-volatility regimes, softening the conditions that hurt bond portfolios", "une superposition de contrats à terme gérés qui tend à performer en régimes de plus forte volatilité, atténuant les conditions qui nuisent aux portefeuilles obligataires") },
    ],
  },
  process: {
    eyebrow: l("bonds investment process", "processus d’investissement"),
    title: l("bonds investment", "processus d’investissement"), accent: l("process", "obligataire"),
    systems: [
      { tag: l("system 1", "algo 1"), name: l("(macro) portfolio positioning", "(macro) allocation sectorielle"),
        bullets: [l("systematic", "systématique"), l("macro; top-down", "macro; top-down"), l("rebalancing every 6 month", "rééquilibrage au 6 mois"), l("systematize a PM’s experience", "répliquer l’expérience d’un « PM »")],
        steps: [l("identify market regimes & trends", "identifier les régimes de marché & tendances"), l("build the curve/credit matrix using billions of bond datapoints", "construire la matrice courbe/crédit utilisant des milliards de points de données")] },
      { tag: l("system 2", "algo 2"), name: l("(micro) security selection", "(micro) sélection de titres"),
        bullets: [l("systematic + discretionary", "systématique + discrétionnaire"), l("micro; bottom-up", "micro; bottom-up"), l("continuous rebalancing (alert)", "rééquilibrage continu (alertes)"), l("replicate an analyst’s in-depth knowledge", "répliquer la profondeur d’un « analyste »")],
        steps: [l("continuously score and rank the bonds in each “cell” by yield to maturity / risk", "évaluer et classer en continu les obligations en termes de rendement/risque"), l("select the final securities", "sélectionner les titres finaux")] },
    ],
  },
  challenge: {
    eyebrow: l("protection strategy", "stratégie de protection"),
    title: l("the fixed income", "le défi du"), accent: l("challenge", "revenu fixe"),
    sub: l("the risks we’re trying to mitigate statistically with overlays", "les risques que nous cherchons à atténuer statistiquement avec les superpositions"),
    problem: l("the problem", "le problème"), suffer: l("bonds suffer when…", "les obligations souffrent lorsque…"),
    risks: [l("rates rise", "les taux montent"), l("inflation spikes", "pics d'inflation"), l("spreads widen", "les écarts s'élargissent")],
    thread: l("the common thread", "le dénominateur commun"), create: l("all create…", "tous créent…"), vol: l("elevated volatility", "volatilité élevée"),
    solution: l("our solution", "notre solution"),
    solT: l("managed futures overlays tend to perform in those same conditions", "les superpositions de contrats à terme gérés tendent à performer dans ces mêmes conditions"),
    solD: l("our uncorrelated protection strategy acts as a statistical hedge and typically buffers bond drawdowns when volatility rises*", "notre stratégie de protection non corrélée agit comme une couverture statistique et tend à atténuer les baisses obligataires lorsque la volatilité augmente*"),
    foot: l("* Source: Nymbus Capital Inc. | Statements reflect historical observations of the Nymbus bond funds underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations.",
      "* Source : Nymbus Capital Inc. Les déclarations présentées reflètent des observations historiques des stratégies sous-jacentes aux fonds obligataires Nymbus à des fins de visualisation conceptuelle et ne doivent pas être interprétées comme une représentation exacte des rendements passés ou des prévisions futures."),
  },
  overlay: {
    eyebrow: l("protection strategy", "stratégie de protection"),
    title: l("how a protection", "comment fonctionne la"), accent: l("overlay works", "stratégie de protection"),
    sub: l("your capital stays 100% invested: the overlay stacks on top using futures (~5-10% deposit)", "le portefeuille existant reste investi à 100 % : la stratégie s'ajoute par-dessus via des contrats à terme (avec un dépôt d'environ 5-10%)"),
    before: l("before", "avant"), after: l("after (with overlay)", "après (avec la stratégie)"),
    portfolio: l("your portfolio", "portefeuille existant"), overlay: l("overlay", "stratégie de protection"),
    cap: l("100% of your capital", "100% de votre capital"), cap2: l("still 100% of your capital", "toujours 100% de votre capital"),
    deposit: l("futures require only 5-10% deposit to maintain protection strategy positions", "les contrats à terme nécessitent uniquement un dépôt de ~5-10% pour maintenir les positions de la stratégie"),
    tr: l("total return", "rendement total"), trS: l("enhanced risk/return profile", "profil risque/rendement amélioré"),
    eq: [l("total return", "rendement total"), l("portfolio return", "rendement du portefeuille"), l("overlay return", "rendement de la stratégie de superposition")],
    foot: l("* Source : Nymbus Capital Inc. | For illustrative purposes only. The percentages (%) are approximations of typical allocations. They may vary as model allocation evolves.",
      "* Source: Nymbus Capital Inc. | À titre indicatif uniquement. Les pourcentages (%) correspondent à des estimations des répartitions types. Ils peuvent varier à mesure que la répartition type évolue."),
  },
  strategies: {
    eyebrow: l("strategies", "stratégies"),
    title: l("four strategies,", "quatre stratégies,"), accent: l("one scientific process", "un processus scientifique"),
    net: l("net annualized return", "rendement annualisé net"),
    netCum: l("net return", "rendement net"),
    gross: l("gross annualized return", "rendement annualisé brut"),
    grossCum: l("gross return", "rendement brut"),
    since: l("since inception", "depuis la création"),
    risk: l("risk", "risque"), code: l("fund code", "code de fonds"),
    view: l("view the strategy", "voir la stratégie"),
    all: l("all strategies", "toutes les stratégies"),
    fund: l("fund", "fonds"), sma: l("SMA", "SMA"),
    perfNote: l("Net of fees, in CAD. Past performance is not indicative of future results.", "Net des frais, en CAD. Le rendement passé n’est pas indicatif des résultats futurs."),
    grossNote: l("Strategy returns are gross of fees.", "Les rendements de la stratégie sont bruts de frais."),
  },
  investors: {
    eyebrow: l("the firm", "la firme"),
    title: l("trusted by", "reconnu par des"), accent: l("leading institutions", "institutions de renom"),
    inst: l("institutions", "institutions"), instS: l("vetted by sophisticated capital", "approuvé par des investisseurs qualifiés"),
    plat: l("platforms", "plateformes"), platS: l("available on leading platforms", "disponible sur des plateformes de premier plan"),
    more: l("… and many more", "… et plusieurs autres"),
    mix: l("investor mix", "investisseurs"), mixS: l("(as % of aum)", "(en % de notre ASG)"),
    parts: [
      { v: 45, label: l("institutions", "institutions") },
      { v: 35, label: l("family offices", "family offices") },
      { v: 20, label: l("financial advisors", "conseillers en placements") },
    ],
    qemp: l("*Quebec Emerging Managers Program", "*programme des gestionnaires en émergence du Québec"),
    foot: l("* Source: Nymbus Capital Inc. | Representative client list. Not all clients shown. For illustrative purposes only.",
      "* Source: Nymbus Capital Inc. | Liste représentative de clients. Tous les clients ne sont pas présentés. À titre illustratif uniquement."),
  },
  summary: {
    title: l("in", "en"), accent: l("summary", "résumé"),
    sub: l("Canada's only pure-play systematic bond manager*", "le seul gestionnaire obligataire systématique pur au Canada*"),
    items: [
      [l("approach", "approche"), l("scientific edge", "avantage scientifique"), l("ultra-micro analysis at scale, with ML-based pattern recognition across billions of data points", "analyse ultra-micro à grande échelle, avec reconnaissance de patterns par apprentissage automatique sur des milliards de données")],
      [l("team", "équipe"), l("a unique team", "une équipe unique"), l("scientists and market veterans tackling problems traditional managers don't", "scientifiques et vétérans des marchés s'attaquant à des problèmes que les gestionnaires traditionnels ignorent")],
      [l("results", "résultats"), l("top 1% results", "résultats dans le premier 1 %"), l("top 1% among institutional bond managers: consistent performance with attractive downside risk", "dans le premier 1 % des gestionnaires obligataires institutionnels, performance constante avec un risque baissier attrayant")],
    ] as [L, L, L][],
    foot: l("* Source: Nymbus Capital Inc. | This characterization is based on internal proprietary research, comprehensive reviews of the Canadian landscape, and ongoing consultations with institutional allocators and investment consultants. “Pure-play” is defined as a canadian-domiciled firm whose investment engine and organizational structure are dedicated exclusively to systematic and algorithmic modeling, distinguishing it from firms utilizing fundamental credit research, hybrid quantitative overlays, or passive index replication strategies.",
      "* Source: Nymbus Capital Inc. | Cette caractérisation repose sur des recherches internes exclusives, des examens approfondis du cadre canadien et des consultations continues avec des répartiteurs institutionnels et des consultants en placement. Un acteur « pur » est défini comme une firme domiciliée au Canada dont le moteur d'investissement et la structure organisationnelle sont voués exclusivement à la modélisation systématique et algorithmique, ce qui la distingue des firmes utilisant la recherche fondamentale en crédit, des superpositions quantitatives hybrides ou des stratégies de réplication passive d'indices."),
  },
  cta: {
    title: l("let’s talk", "parlons-en"),
    sub: l("contact us if you have any questions", "communiquez avec nous si vous avez des questions"),
    btn: l("contact us", "nous joindre"),
    team: l("meet the team", "rencontrer l’équipe"),
  },
};

/** Risk ratings (registry / admin values) as the deck words them. */
export const RISK: Record<"low" | "low-medium" | "medium" | "medium-high" | "high", L> = {
  low: l("low", "faible"),
  "low-medium": l("low to medium", "faible à moyen"),
  medium: l("medium", "moyen"),
  "medium-high": l("medium to high", "moyen à élevé"),
  high: l("high", "élevé"),
};

/** Strategy "cake" layers (deck strategies slide), per fund key. */
export const STACKS: Record<string, { tags: ("fund" | "SMA")[]; blocks: L[] }> = {
  "monthly-income": { tags: ["fund"], blocks: [l("protection strategy", "stratégie de protection"), l("ST corp. bonds alpha", "obligations corp. CT alpha"), l("ST corp. bonds beta", "obligations corp. CT beta")] },
  "sustainable-enhanced-bonds": { tags: ["fund"], blocks: [l("protection strategy", "stratégie de protection"), l("universe bond alpha", "alpha obligataire univers"), l("universe bond beta", "beta obligataire univers")] },
  "global-minimum-volatility": { tags: ["SMA"], blocks: [l("protection strategy (9%)", "stratégie de protection (9%)"), l("protection strategy (6%)", "stratégie de protection (6%)"), l("protection strategy (3%)", "stratégie de protection (3%)"), l("existing portfolio (client)", "portefeuille existant (client)")] },
  "multi-strategy": { tags: ["fund", "SMA"], blocks: [l("hedges", "couvertures"), l("low-volatility strategies", "stratégies à faible volatilité"), l("mean-reversion strategies", "stratégies de retour à la moyenne"), l("directional strategies", "stratégies directionnelles")] },
};

export const FOUR = {
  title: l("four uncorrelated systematic strategies", "quatre stratégies systématiques non corrélées"),
  sub: l("each strategy plays a distinct role across market regimes", "chaque stratégie joue un rôle distinct selon les régimes de marché"),
  items: [
    { name: l("low volatility", "faible volatilité"), role: l("steady core", "noyau stable") },
    { name: l("directional", "directionnel"), role: l("trend capture", "capture de tendance") },
    { name: l("mean reversion", "retour à la moyenne"), role: l("relative value", "valeur relative") },
    { name: l("hedges", "couvertures"), role: l("downside protection", "protection à la baisse") },
  ],
};

export const TEAM_COPY = {
  investment: { title: l("investment team", "équipe d'investissement"), sub: l("a combination of « quants » and of markets veterans supported by modern technologies", "une combinaison de « quants » et de vétérans des marchés appuyée par les technologies modernes") },
  governance: { title: l("governance & operations team", "équipe des opérations"), sub: l("a dedicated group with an average of over 25 years of investment experience", "une équipe dédiée comptant en moyenne plus de 25 ans d'expérience en placement") },
};
