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
}

export const SOL_COPY = {
  home: l("Home", "Accueil"),
  crumb: l("Solutions", "Solutions"),
  eyebrow: l("Investment solutions", "Solutions de placement"),
  title: l("Solutions tailored to", "Des solutions adaptées à"),
  accent: l("your mandate", "votre mandat"),
  lead: l(
    "Whether you manage institutional capital, run a family office or advise individual investors, our systematic strategies are available in the form that fits your mandate.",
    "Que vous gériez du capital institutionnel, dirigiez un bureau de gestion familiale ou conseilliez des investisseurs, nos stratégies systématiques sont offertes sous la forme qui convient à votre mandat.",
  ),
  talk: l("Talk to our team", "Parler à notre équipe"),
  strategies: l("Explore strategies", "Explorer les stratégies"),
  whoEyebrow: l("Who we work with", "Avec qui nous travaillons"),
  whoTitle: l("What type of", "Quel type"),
  whoAccent: l("investor are you?", "d’investisseur êtes-vous?"),
  whoLead: l(
    "Each profile below describes how we work with you, the vehicles available and the strategies that usually fit.",
    "Chaque profil ci-dessous décrit notre façon de travailler avec vous, les véhicules offerts et les stratégies qui conviennent habituellement.",
  ),
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
    "Our team is available to discuss your investment objectives and the strategies that could fit your mandate.",
    "Notre équipe est disponible pour discuter de vos objectifs de placement et des stratégies qui pourraient convenir à votre mandat.",
  ),
  cta: l("Schedule a conversation", "Planifier une rencontre"),
};

export const AUDIENCES: AudienceCopy[] = [
  {
    key: "institutional",
    name: l("Institutional investors", "Investisseurs institutionnels"),
    who: l("Pension funds, endowments, foundations and insurance companies.", "Caisses de retraite, fonds de dotation, fondations et compagnies d’assurance."),
    intro: l(
      "We manage mandates built around your investment policy, from a core Canadian bond portfolio to a futures overlay added on top of the bonds you already hold.",
      "Nous gérons des mandats bâtis autour de votre politique de placement, d’un portefeuille obligataire canadien de base à une stratégie de superposition de contrats à terme ajoutée aux obligations que vous détenez déjà.",
    ),
    benefits: [
      l("Segregated mandates tailored to your investment policy statement", "Mandats distincts adaptés à votre énoncé de politique de placement"),
      l("A dedicated portfolio management team", "Une équipe de gestion de portefeuille spécialisée"),
      l("Risk reporting and performance attribution", "Rapports de risque et attribution du rendement"),
      l("ESG integration and exclusions that can be customized", "Intégration ESG et exclusions personnalisables"),
      l("Regular reviews with your investment committee", "Des rencontres régulières avec votre comité de placement"),
    ],
    vehicles: [
      { name: l("Segregated mandate", "Mandat distinct"), text: l("A portfolio managed for you alone, under your own guidelines.", "Un portefeuille géré pour vous seul, selon vos propres lignes directrices.") },
      { name: l("Futures overlay", "Stratégie de superposition"), text: l("Managed futures stacked on an existing bond portfolio; most of the capital stays invested in the bonds. The overlay adds leveraged futures exposure; its losses add to those of the underlying portfolio and may require additional margin.", "Des contrats à terme gérés ajoutés à un portefeuille obligataire existant; la majeure partie du capital reste investie dans les obligations. La superposition ajoute une exposition à effet de levier au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.") },
      { name: l("Funds", "Fonds"), text: l("Access to the strategies through our funds.", "L’accès aux stratégies par l’entremise de nos fonds.") },
    ],
    funds: ["sustainable-enhanced-bonds", "monthly-income", "global-minimum-volatility", "multi-strategy"],
  },
  {
    key: "family",
    name: l("Family offices", "Bureaux de gestion familiale"),
    who: l("Single and multi-family offices seeking systematic, diversified sources of return.", "Bureaux de gestion familiale, unifamiliaux ou multifamiliaux, à la recherche de sources de rendement systématiques et diversifiées."),
    intro: l(
      "We combine core bonds with alternative strategies that behave differently from traditional markets, and we give you direct access to the people who manage them.",
      "Nous combinons des obligations de base et des stratégies alternatives qui se comportent différemment des marchés traditionnels, et nous vous donnons un accès direct aux personnes qui les gèrent.",
    ),
    benefits: [
      l("Diversification across strategies and asset classes", "Une diversification entre stratégies et classes d’actifs"),
      l("Alternative strategies designed to have a low correlation with bonds and equities", "Des stratégies alternatives conçues pour être peu corrélées aux obligations et aux actions"),
      l("Direct access to the investment team", "Un accès direct à l’équipe de placement"),
      l("Transparent, regular reporting", "Des rapports transparents et réguliers"),
    ],
    vehicles: [
      { name: l("Funds", "Fonds"), text: l("Our funds, with daily NAVs.", "Nos fonds, avec des valeurs liquidatives quotidiennes.") },
      { name: l("Managed accounts", "Comptes gérés"), text: l("A strategy run in an account held in your name.", "Une stratégie gérée dans un compte détenu à votre nom.") },
    ],
    funds: ["multi-strategy", "monthly-income", "sustainable-enhanced-bonds", "global-minimum-volatility"],
  },
  {
    key: "advisor",
    name: l("Investment advisors", "Conseillers en placement"),
    who: l("Advisors registered with CIRO or a provincial securities regulator who build client portfolios.", "Conseillers inscrits auprès de l’OCRI ou d’une autorité provinciale en valeurs mobilières qui bâtissent les portefeuilles de leurs clients."),
    intro: l(
      "Our funds can be bought for client accounts through FundServ, and our team supports you with documentation and answers to your clients’ questions.",
      "Nos fonds peuvent être achetés dans les comptes de vos clients par FundServ, et notre équipe vous soutient avec la documentation et des réponses aux questions de vos clients.",
    ),
    benefits: [
      l("Funds available on FundServ for client portfolios", "Des fonds offerts sur FundServ pour les portefeuilles de vos clients"),
      l("Support for model portfolio integration", "Du soutien pour l’intégration aux portefeuilles modèles"),
      l("Educational materials and fund documents", "Du matériel éducatif et les documents des fonds"),
      l("A dedicated advisor support team", "Une équipe de soutien spécialisée pour les conseillers"),
      l("Due diligence documentation on request", "La documentation de vérification diligente sur demande"),
    ],
    vehicles: [
      { name: l("Funds on FundServ", "Fonds sur FundServ"), text: l("Ordered with the fund codes shown on each fund page.", "Commandés avec les codes de fonds indiqués sur chaque page de fonds.") },
      { name: l("Dealer platforms", "Plateformes de courtiers"), text: l("Available through National Bank Financial, RBC Dominion Securities and iA Financial Group.", "Offerts par l’entremise de Financière Banque Nationale, RBC Dominion valeurs mobilières et iA Groupe financier.") },
    ],
    funds: ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"],
  },
];
