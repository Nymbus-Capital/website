/**
 * concepts-copy.ts — copy of /core-concepts (protective overlays, futures, ultra-micro analysis at scale), EN + FR (Québec typography).
 * Few words: the animations carry the explanation. Every drawn value is generated; the coverage figures are
 * illustrative estimates (docs/compliance-review.md § Core concepts). Low correlation is never stated as a fact;
 * wherever overlays are described, the verbatim futures-exposure disclosure follows.
 */
import { l, type L } from "../../../lib/i18n/config.ts";
import { OVERLAY_EXPOSURE } from "../fx/overlay-copy.ts";

export { OVERLAY_EXPOSURE };

const NB = " ";

interface ConceptCopy {
  eyebrow: L; title: L; accent: L; lead: L;
  panel: L; chip: L; alt: L;
  steps: L[];
  stats: { label: L; value: L }[];
  caption: L;
}

export const CC = {
  meta: {
    title: l("Core concepts", "Concepts de base"),
    description: l(
      "Protective overlays (designed to offset part of losses), futures and ultra-micro analysis at scale: three ideas behind Nymbus Capital’s funds, in simple animations.",
      `Superpositions protectrices (conçues pour compenser une partie des pertes), contrats à terme et analyse ultra-micro à grande échelle${NB}: trois idées derrière les fonds de Nymbus Capital, en animations simples.`,
    ),
  },
  hero: {
    eyebrow: l("Core concepts", "Concepts de base"),
    title: l("Three ideas", "Trois idées"),
    accent: l("behind our funds", "derrière nos fonds"),
    lead: l("Protective overlays, futures and ultra-micro analysis at scale, in motion.", "Superpositions protectrices, contrats à terme et analyse ultra-micro à grande échelle, en mouvement."),
  },
  jump: l("Concepts on this page", "Concepts de cette page"),
  watermark: l("ILLUSTRATION · generated values", "ILLUSTRATION · valeurs générées"),
  controls: {
    group: l("Animation controls", "Commandes de l’animation"),
    play: l("Play animation", "Lire l’animation"),
    pause: l("Pause animation", "Mettre l’animation en pause"),
    step: l("Step", "Étape"),
  },

  overlay: {
    eyebrow: l("Concept 1 · Protective overlays", "Concept 1 · Superpositions protectrices"),
    title: l("What is", "Qu’est-ce qu’une"),
    accent: l("a protective overlay?", "superposition protectrice?"),
    // the qualifier sits right under the name (heading), as everywhere on the site
    lead: l(
      "Futures on top of a fully invested core, designed to offset part of bond losses; they may not do so.",
      "Des contrats à terme par-dessus une base investie, conçus pour compenser une partie des pertes obligataires; ils peuvent ne pas y parvenir.",
    ),
    panel: l("Protective overlay · same capital, two sources of return", "Superposition protectrice · même capital, deux sources de rendement"),
    chip: l("Illustration", "Illustration"),
    alt: l(
      "Animated illustration: a core portfolio stays fully invested; a small deposit supports a protective futures overlay stacked on top, designed to offset part of losses (it may not); both return streams add up in the combined portfolio. Generated overlay returns are larger in volatile periods.",
      `Illustration animée${NB}: un portefeuille de base reste entièrement investi; un petit dépôt soutient une superposition protectrice de contrats à terme par-dessus, conçue pour compenser une partie des pertes (elle peut ne pas y parvenir); les deux sources de rendement s’additionnent dans le portefeuille combiné. Les rendements générés de la superposition sont plus élevés en période volatile.`,
    ),
    steps: [
      l("Core: 100% invested", `Base${NB}: 100${NB}% investie`),
      l("≈10% deposit", `Dépôt ≈${NB}10${NB}%`),
      l("Overlay on top", "Superposition par-dessus"),
      l("Two return streams", "Deux sources de rendement"),
    ],
    stats: [
      { label: l("Core portfolio invested", "Portefeuille de base investi"), value: l("100%", `100${NB}%`) },
      { label: l("Margin deposit", "Dépôt de garantie"), value: l("≈10%", `≈${NB}10${NB}%`) },
      { label: l("Overlay exposure", "Exposition de la superposition"), value: l("100%", `100${NB}%`) },
      { label: l("Sources of return", "Sources de rendement"), value: l("2", "2") },
    ],
    caption: l(
      `Simplified illustration with generated values, not actual positions or results. Percentages are illustrative estimates; margin requirements vary. Protective overlays are designed to offset part of losses; they may not do so and can lose money. Illustration of the overlay strategy’s sensitivity to volatility (vega); it may not behave this way. ${OVERLAY_EXPOSURE.en}`,
      `Illustration simplifiée, valeurs générées${NB}: ni positions ni résultats réels. Pourcentages estimatifs; les dépôts exigés varient. Les superpositions protectrices sont conçues pour compenser une partie des pertes; elles peuvent ne pas y parvenir et subir des pertes. Illustration de la sensibilité de la stratégie de superposition à la volatilité (vega); elle pourrait ne pas se comporter ainsi. ${OVERLAY_EXPOSURE.fr}`,
    ),
    canvas: {
      core: l("Core portfolio", "Portefeuille de base"),
      coreSub: l("100% invested · stays invested", `100${NB}% investi · reste investi`),
      deposit: l("Deposit", "Dépôt"),
      depositSub: l("≈10%", `≈${NB}10${NB}%`),
      overlay: l("Overlay exposure · 100%", `Superposition · 100${NB}%`),
      overlaySub: l("futures", "contrats à terme"),
      bracket: l("Same capital base", "Même capital"),
      bracketSub: l(
        "deposit posted from the same capital (e.g. existing positions as collateral)",
        "dépôt versé à même ce capital (p. ex. positions existantes données en nantissement)",
      ),
      coreRet: l("Core return", "Base"),
      ovRet: l("Overlay return", "Superposition"),
      combined: l("Combined", "Combiné"),
      tagline: l("Same capital base. Two sources of return.", "Même capital. Deux sources de rendement."),
      loss: l("Overlay losses add up too", "Les pertes s’additionnent aussi"),
      calm: l("Calm", "Calme"),
      volatile: l("Volatile", "Agité"),
      volNote: l("More volatility → overlay has historically tended to do better", "Plus de volatilité → la superposition a historiquement eu tendance à mieux se comporter"),
    },
  },

  futures: {
    eyebrow: l("Concept 2 · Futures", "Concept 2 · Contrats à terme"),
    title: l("How futures", "Comment fonctionnent"),
    accent: l("work", "les contrats à terme"),
    lead: l(
      "Gains and losses change hands in cash every day: only one day of market movement is ever unsettled.",
      `Gains et pertes sont réglés en espèces chaque jour${NB}: seule la variation d’une journée reste à régler.`,
    ),
    panel: l("Futures · daily settlement", "Contrats à terme · règlement quotidien"),
    chip: l("Illustration", "Illustration"),
    alt: l(
      "Animated illustration: a generated index moves day by day; each close settles the day’s move in cash between the long and the short; the margin buffer grows when volatility rises.",
      `Illustration animée${NB}: un indice généré varie jour après jour; chaque clôture règle la variation du jour en espèces entre l’acheteur et le vendeur; le dépôt de garantie augmente quand la volatilité monte.`,
    ),
    steps: [
      l("Long meets short", "Acheteur et vendeur"),
      l("Daily cash settlement", "Règlement quotidien"),
      l("Margin buffer", "Dépôt de garantie"),
      l("One day at risk", "Un seul jour à risque"),
    ],
    stats: [
      { label: l("Unsettled at any time", "Non réglé à tout moment"), value: l("1 day", "1 jour") },
      { label: l("Settlement", "Règlement"), value: l("Daily, in cash", "Quotidien, en espèces") },
      { label: l("Margin buffer", "Dépôt de garantie"), value: l("Grows with volatility", "Suit la volatilité") },
    ],
    caption: l(
      "Simplified illustration with generated prices. Margin and settlement rules vary by contract, exchange, broker and market conditions; losses can exceed the margin deposited. Daily settlement describes cash flows, not tax treatment.",
      `Illustration simplifiée, prix générés. Les règles de dépôt et de règlement varient selon le contrat, la bourse, le courtier et les conditions de marché; les pertes peuvent dépasser le dépôt. Le règlement quotidien décrit des flux d’espèces, pas un traitement fiscal.`,
    ),
    canvas: {
      price: l("Index (generated)", "Indice (généré)"),
      settled: l("Settled", "Réglé"),
      today: l("Today: unsettled", `Aujourd’hui${NB}: non réglé`),
      long: l("Long", "Acheteur"),
      short: l("Short", "Vendeur"),
      clearing: l("Clearing house", "Chambre de compensation"),
      matched: l("Equal long and short exposure", "Expositions égales et opposées"),
      /** "{n}" is the day number of the close being settled */
      closeDay: l("Day {n} close:", `Clôture du jour {n}${NB}:`),
      upPays: l("index up → short pays long", "indice en hausse → le vendeur paie l’acheteur"),
      downPays: l("index down → long pays short", "indice en baisse → l’acheteur paie le vendeur"),
      buffer: l("Margin buffer", "Dépôt de garantie"),
      bufferNote: l("sized to a one-day move", "calibré sur une journée"),
      calm: l("Calm market", "Marché calme"),
      volatile: l("Volatile: larger buffer", `Volatil${NB}: dépôt plus élevé`),
      settleRow: l("Daily cash settlements (long)", "Règlements quotidiens (acheteur)"),
      sum: l("Sum = total P&L", "Somme = résultat total"),
      realized: l("Like realizing gains and losses daily (not a tax statement)", "Comme réaliser gains et pertes chaque jour (hors fiscalité)"),
      formula: l("futures return ≈ underlying return − overnight rate", "rendement du contrat ≈ sous-jacent − taux à un jour"),
    },
  },

  coverage: {
    eyebrow: l("Concept 3 · Ultra-micro analysis, at scale", "Concept 3 · Analyse ultra-micro, à grande échelle"),
    title: l("Why machines", "Pourquoi les machines"),
    accent: l("see more", "en voient plus"),
    lead: l(
      "A conventional team covers a fraction of the bond universe in depth. Our systems review every liquid bond, every day.",
      "Une équipe conventionnelle suit en profondeur une fraction de l’univers obligataire. Nos systèmes examinent chaque obligation liquide, chaque jour.",
    ),
    panel: l("Ultra-micro analysis · Canadian investment-grade bonds", "Analyse ultra-micro · obligations canadiennes de qualité investissement"),
    chip: l("Illustrative estimates", "Estimations illustratives"),
    alt: l(
      "Animated illustration comparing two methods on the same 2,000 or so dots standing for the Canadian investment-grade bond index, grouped by sector: first, a conventional fundamental team (a portfolio manager and six sector analysts) lights about 180 of them; then our systems scan every liquid bond and keep layers of history in memory; last, both are compared.",
      `Illustration animée qui compare deux méthodes sur les mêmes quelque 2${NB}000 points qui représentent l’indice obligataire canadien de qualité investissement, groupés par secteur${NB}: d’abord, une équipe fondamentale conventionnelle (un gestionnaire et six analystes sectoriels) en allume environ 180; ensuite, nos systèmes balaient chaque obligation liquide et gardent des couches d’historique en mémoire; enfin, les deux sont comparées.`,
    ),
    steps: [
      l("The universe", "L’univers"),
      l("Conventional team", "Équipe conventionnelle"),
      l("Our systems", "Nos systèmes"),
      l("Compare", "Comparaison"),
    ],
    stats: [
      { label: l("Securities per analyst per year", "Titres par analyste par an"), value: l("≈30", `≈${NB}30`) },
      { label: l("Covered by a team of 6 analysts", "Suivis par une équipe de 6 analystes"), value: l("≈180", `≈${NB}180`) },
      { label: l("Bonds in the Canadian IG index", "Obligations de l’indice canadien"), value: l("≈2,000", `≈${NB}2${NB}000`) },
      { label: l("Liquidity filter (outstanding)", "Seuil de liquidité (en circulation)"), value: l("≥ $200 MM", `≥${NB}200${NB}M$`) },
    ],
    note: l(
      "Bonds trade over the counter, where prices are scattered and opaque: doing this systematically is hard.",
      `Les obligations se négocient hors cote, où les prix sont dispersés et opaques${NB}: le faire de façon systématique est difficile.`,
    ),
    caption: l(
      "Illustrative estimates from discussions with analysts; generated dots, not actual bonds. Systematic models can be wrong.",
      `Estimations illustratives tirées de discussions avec des analystes; points générés, pas des obligations réelles. Les modèles systématiques peuvent se tromper.`,
    ),
    canvas: {
      pm: l("Portfolio manager", "Gestionnaire"),
      perYear: l("≈30 securities a year each", `≈${NB}30 titres par an chacun`),
      covered: l("Covered in depth", "Suivis en profondeur"),
      of: l("of ≈2,000", `sur ≈${NB}2${NB}000`),
      universe: l("Canadian IG index · ≈2,000 bonds", `Indice canadien · ≈${NB}2${NB}000 obligations`),
      liquid: l("Filter: ≥ $200 MM outstanding", `Seuil${NB}: ≥${NB}200${NB}M$ en circulation`),
      below: l("below the filter", "sous le seuil"),
      scanned: l("Every liquid bond, every day", "Chaque obligation liquide, chaque jour"),
      memory: l("Every day of history, remembered", "Chaque jour d’historique, en mémoire"),
      otc: l("Over the counter: scattered, opaque data", `Hors cote${NB}: données dispersées et opaques`),
      dot: l("Each dot: one bond", `Chaque point${NB}: une obligation`),
      team: l("Conventional fundamental team", "Équipe fondamentale conventionnelle"),
      teamShort: l("Conventional team", "Équipe conventionnelle"),
      systems: l("Our systems", "Nos systèmes"),
      teamLegend: l("Conventional team: ≈180", `Équipe conventionnelle${NB}: ≈${NB}180`),
      systemsLegend: l("Our systems: every liquid bond", `Nos systèmes${NB}: chaque obligation liquide`),
      scan: l("Systematic scan", "Balayage systématique"),
      vs: l("VS", "VS"),
    },
    /** the six analysts' sectors (illustrative split; analyst a covers sector a), in three lengths for the canvas */
    sectors: [
      { long: l("Financials", "Services financiers"), short: l("Financials", "Finance"), abbr: l("Fin.", "Fin.") },
      { long: l("Technology & communications", "Technologies et communications"), short: l("Tech & comms", "Techno et comm."), abbr: l("Tech", "Tech.") },
      { long: l("Consumer (discr. & staples)", "Consommation (disc. et base)"), short: l("Consumer", "Consommation"), abbr: l("Cons.", "Conso.") },
      { long: l("Utilities & infrastructure", "Services publics et infrastructures"), short: l("Utilities & infra.", "Services publics"), abbr: l("Util.", "Infra.") },
      { long: l("Energy", "Énergie"), short: l("Energy", "Énergie"), abbr: l("Energy", "Énergie") },
      { long: l("Industrials", "Produits industriels"), short: l("Industrials", "Industrie"), abbr: l("Ind.", "Ind.") },
    ],
  },
};

/**
 * The three concepts in page order: internal id (test ids, engines), page anchor, and the old anchors kept as aliases
 * (concept 3 was "Coverage at scale", #coverage, until 2026-10-03).
 */
export const CONCEPTS: { id: "overlay" | "futures" | "coverage"; anchor: string; aliases: string[]; copy: ConceptCopy }[] = [
  { id: "overlay", anchor: "overlay", aliases: [], copy: CC.overlay },
  { id: "futures", anchor: "futures", aliases: [], copy: CC.futures },
  { id: "coverage", anchor: "ultra-micro-analysis", aliases: ["coverage"], copy: CC.coverage },
];
