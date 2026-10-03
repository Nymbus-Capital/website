/**
 * Copy of /solutions, EN + FR side by side. Same three audiences as the previous site (institutional investors,
 * family offices, advisors), rewritten to describe what is offered rather than promise outcomes. The previous
 * site's minimum investments are NOT reused (they contradicted the fund documents); a minimum appears only when
 * the admin enters one for a fund (FundContent.minInvestment).
 */
import { l, type L } from "../../../lib/i18n/config.ts";
import type { FundKey } from "@/lib/data/types";

export type Audience = "institutional" | "family" | "advisor";

export interface AudienceCopy {
  key: Audience;
  name: L;
  who: L;
  intro: L;
  benefits: L[];
  vehicles: { name: L; text: L }[];
  funds: FundKey[];
  /** illustrative use case (not a client testimonial, no performance promise); `note` = its risk disclosure */
  useCase: { title: L; steps: L[]; note?: L };
}

/* compliance-reviewed overlay disclosures (same wording as the fund pages and the approach page) */
const OVERLAY_ADDS = l(
  "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.",
  "La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
);
const MAY_NOT = l("The overlay may not reach its objective and can lose money.", "La superposition peut ne pas atteindre son objectif et peut subir des pertes.");
const join = (...xs: L[]): L => ({ en: xs.map((x) => x.en).join(" "), fr: xs.map((x) => x.fr).join(" ") });

export const SOL_COPY = {
  home: l("Home", "Accueil"),
  crumb: l("Solutions", "Solutions"),
  eyebrow: l("Investment solutions", "Solutions de placement"),
  title: l("Solutions tailored to", "Des solutions adaptées à"),
  accent: l("your mandate", "votre mandat"),
  lead: l(
    "Our systematic strategies, in the form your mandate needs.",
    "Nos stratégies systématiques, sous la forme que votre mandat exige.",
  ),
  talk: l("Talk to our team", "Parler à notre équipe"),
  strategies: l("Explore strategies", "Explorer les stratégies"),
  whoEyebrow: l("Who we work with", "Avec qui nous travaillons"),
  whoTitle: l("What type of", "Quel type"),
  whoAccent: l("investor are you?", "d’investisseur êtes-vous?"),
  see: l("See the details", "Voir le détail"),
  benefits: l("How we work with you", "Notre façon de travailler avec vous"),
  vehicles: l("Available vehicles", "Véhicules offerts"),
  suitable: l("Strategies that usually fit", "Stratégies qui conviennent habituellement"),
  minimum: l("Minimum investment", "Placement minimal"),
  minNote: l(
    "Minimum investments, fees and eligibility are set out in each fund’s offering documents. Suitability depends on your objectives and constraints; this page is not investment advice.",
    "Les placements minimaux, les frais et l’admissibilité sont précisés dans les documents de placement de chaque fonds. La pertinence dépend de vos objectifs et de vos contraintes; cette page ne constitue pas un conseil en placement.",
  ),
  ctaTitle: l("Talk to", "Parlez à"),
  ctaAccent: l("our team", "notre équipe"),
  ctaText: l(
    "Discuss your objectives with us.",
    "Discutez de vos objectifs avec nous.",
  ),
  cta: l("Schedule a conversation", "Planifier une rencontre"),
  useCase: l("Illustrative use case", "Cas d’utilisation illustratif"),
  useCaseNote: l(
    "Illustrative only: not a client testimonial and not a promise of performance.",
    "À titre illustratif seulement : ni un témoignage de client, ni une promesse de rendement.",
  ),
};

export const AUDIENCES: AudienceCopy[] = [
  {
    key: "institutional",
    name: l("Institutional investors", "Investisseurs institutionnels"),
    who: l("Pension funds, endowments, foundations, insurers.", "Caisses de retraite, fonds de dotation, fondations, assureurs."),
    intro: l(
      "Mandates built around your investment policy.",
      "Des mandats bâtis autour de votre politique de placement.",
    ),
    benefits: [
      l("Segregated mandates under your policy", "Mandats distincts selon votre politique"),
      l("A dedicated portfolio management team", "Une équipe de gestion spécialisée"),
      l("Risk reports and performance attribution", "Rapports de risque et attribution du rendement"),
      l("Your responsible-investment guidelines, if any", "Vos lignes directrices d’investissement responsable, s’il y a lieu"),
    ],
    vehicles: [
      { name: l("Segregated mandate", "Mandat distinct"), text: l("Managed for you alone, under your guidelines.", "Géré pour vous seul, selon vos lignes directrices.") },
      { name: l("Futures overlay", "Stratégie de superposition"), text: l("Managed futures on top of your bonds; most of the capital stays invested in the bonds. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.", "Des contrats à terme gérés ajoutés à vos obligations; la majeure partie du capital reste investie dans les obligations. La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.") },
      { name: l("Funds", "Fonds"), text: l("The strategies, through our funds.", "Les stratégies, par l’entremise de nos fonds.") },
    ],
    funds: ["sustainable-enhanced-bonds", "monthly-income", "global-minimum-volatility", "multi-strategy"],
    useCase: {
      title: l("Pension plan: liability matching, plus a second objective", "Régime de retraite : appariement du passif, et un second objectif"),
      steps: [
        l("Liability-matching bonds, actively managed to seek added value", "Des obligations appariées au passif, gérées activement pour chercher une valeur ajoutée"),
        l("A futures overlay, designed to offset part of bond losses, with an objective of returns above inflation over a full rate cycle", "Une superposition de contrats à terme, conçue pour compenser une partie des pertes obligataires, avec un objectif de rendement supérieur à l’inflation sur un cycle complet de taux"),
        l("Most of the capital stays in the bonds", "La majeure partie du capital reste dans les obligations"),
      ],
      note: join(MAY_NOT, OVERLAY_ADDS),
    },
  },
  {
    key: "family",
    name: l("Family offices", "Bureaux de gestion familiale"),
    who: l("Single and multi-family offices.", "Bureaux unifamiliaux et multifamiliaux."),
    intro: l(
      "Core bonds plus alternative strategies.",
      "Des obligations de base et des stratégies alternatives.",
    ),
    benefits: [
      l("Diversification across strategies and asset classes", "Diversification entre stratégies et catégories d’actifs"),
      l("Liquid alternatives designed for low down-month correlation", "Des solutions alternatives liquides conçues pour une faible corrélation lors des mois de baisse"),
      l("Direct access to the investment team", "Accès direct à l’équipe de placement"),
      l("Transparent, regular reporting", "Rapports transparents et réguliers"),
    ],
    vehicles: [
      { name: l("Funds", "Fonds"), text: l("Our funds, with daily NAVs.", "Nos fonds, avec des valeurs liquidatives quotidiennes.") },
      { name: l("Managed accounts", "Comptes gérés"), text: l("A strategy run in an account in your name, such as the Global Minimum Volatility futures overlay. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.", "Une stratégie gérée dans un compte à votre nom, comme la stratégie de superposition Global Minimum Volatility. La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.") },
    ],
    funds: ["global-minimum-volatility", "multi-strategy", "monthly-income", "sustainable-enhanced-bonds"],
    useCase: {
      title: l("Family office: capital efficiency", "Bureau de gestion familiale : l’efficacité du capital"),
      steps: [
        l("Existing positions serve as collateral for the futures", "Des positions existantes servent de garantie pour les contrats à terme"),
        l("Overlay sized to a downside-volatility target", "Superposition calibrée selon une cible de volatilité à la baisse"),
        l("The existing portfolio stays invested", "Le portefeuille existant demeure investi"),
      ],
      note: join(
        MAY_NOT,
        OVERLAY_ADDS,
        l("Positions held as collateral may have to be sold to meet margin calls.", "Les positions données en garantie peuvent devoir être vendues pour répondre aux appels de marge."),
      ),
    },
  },
  {
    key: "advisor",
    name: l("Investment advisors", "Conseillers en placement"),
    who: l("Advisors registered with CIRO or a provincial securities regulator.", "Conseillers inscrits auprès de l’OCRI ou d’une autorité provinciale en valeurs mobilières."),
    intro: l(
      "Our funds on Fundserv, with documents and support.",
      "Nos fonds sur Fundserv, avec documents et soutien.",
    ),
    benefits: [
      l("Funds on Fundserv for client portfolios", "Fonds sur Fundserv pour les portefeuilles de vos clients"),
      l("Model portfolio integration support", "Soutien à l’intégration aux portefeuilles modèles"),
      l("A dedicated advisor support team", "Équipe de soutien réservée aux conseillers"),
      l("Due diligence documentation on request", "Documentation de vérification diligente sur demande"),
    ],
    vehicles: [
      { name: l("Funds on Fundserv", "Fonds sur Fundserv"), text: l("Fund codes on each fund page.", "Codes de fonds sur chaque page de fonds.") },
      { name: l("Dealer platforms", "Plateformes de courtiers"), text: l("National Bank Financial, RBC Dominion Securities, iA Financial Group.", "Financière Banque Nationale, RBC Dominion valeurs mobilières, iA Groupe financier.") },
    ],
    funds: ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"],
    useCase: {
      title: l("Advisors: systematic funds for your clients", "Conseillers : des fonds systématiques pour vos clients"),
      steps: [
        l("A systematic fixed income core, on Fundserv", "Un noyau de revenu fixe systématique, sur Fundserv"),
        l("A liquid alternative to diversify", "Une solution alternative liquide pour diversifier"),
        l("Documents and due diligence support", "Documents et soutien à la vérification diligente"),
      ],
    },
  },
];
