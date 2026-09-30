/**
 * Static registry of the funds shown on the website: identity, performance basis, brand colours. Holds nothing
 * internal: where each data point comes from is in src/lib/pipeline/fund-sources.ts (server only); client
 * components use the projection in funds-public.ts. Everything editable by the business (fees, descriptions,
 * visibility, documents) lives in the admin-managed content store instead (see SiteContent), so this file only changes with code.
 *
 * Dependency-free (plain TS) so the pipeline can import it under Node type stripping.
 */
import type { FundKey, L10n } from "../lib/data/types.ts";

export interface FundSpec {
  key: FundKey;
  name: L10n;
  short: L10n;
  vehicle: "fund" | "strategy";
  assetClass: L10n;
  /** accent gradient (from, to) and solid accent: v3 keynote colours */
  color: { solid: string; from: string; to: string };
  /** legacy slugs that should redirect here */
  aliases: string[];
  sources: {
    /**
     * strategies without a fund vehicle only have gross figures in the factsheet archive. The internal source
     * names / keys (dataplatform, FTSE, analytics, factsheet) live in src/lib/pipeline/fund-sources.ts, server only.
     */
    basis: "net" | "gross";
  };
  benchmark: L10n | null;
  /** default headline class (FundServ) when the admin has not chosen one */
  headlineClass: string | null;
  defaults: {
    riskRating: "low" | "low-medium" | "medium" | "medium-high" | "high";
    tagline: L10n;
    description: L10n;
  };
}

export const FUNDS: FundSpec[] = [
  {
    key: "monthly-income",
    name: { en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel" },
    short: { en: "Monthly Income", fr: "Revenu Mensuel" },
    vehicle: "fund",
    assetClass: { en: "Short-term fixed income", fr: "Revenu fixe à court terme" },
    color: { solid: "#1a73e8", from: "#6ea8ff", to: "#0b57d0" },
    aliases: ["sustainable-enhanced-short-term-bonds", "sest"],
    sources: { basis: "net" },
    benchmark: { en: "FTSE Canada Short Term Corporate Bond Index", fr: "Indice FTSE Canada des obligations corporatives à court terme" },
    headlineClass: "LDM001",
    defaults: {
      riskRating: "low-medium",
      tagline: { en: "Steady monthly income with a short duration", fr: "Un revenu mensuel stable, une courte durée" },
      description: {
        en: "Short-term Canadian corporate bonds selected by our two-system process, with an uncorrelated protection overlay designed to soften bond drawdowns.",
        fr: "Des obligations corporatives canadiennes à court terme sélectionnées par notre processus à deux systèmes, avec une stratégie de protection non corrélée conçue pour atténuer les baisses obligataires.",
      },
    },
  },
  {
    key: "sustainable-enhanced-bonds",
    name: { en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées" },
    short: { en: "Sustainable Enhanced Bonds", fr: "Obligations Durables Bonifiées" },
    vehicle: "fund",
    assetClass: { en: "Core fixed income", fr: "Revenu fixe de base" },
    color: { solid: "#00a3e0", from: "#5ad2ff", to: "#0086c3" },
    aliases: ["seb", "core-bond"],
    sources: { basis: "net" },
    benchmark: { en: "FTSE Canada Universe Bond Index", fr: "Indice FTSE Canada des obligations universelles" },
    headlineClass: "LDM201",
    defaults: {
      riskRating: "low",
      tagline: { en: "The Canadian bond universe, scientifically enhanced", fr: "L'univers obligataire canadien, bonifié scientifiquement" },
      description: {
        en: "A core Canadian bond portfolio built systematically, integrating sustainability criteria and a protection overlay that tends to perform when bonds struggle.",
        fr: "Un portefeuille obligataire canadien de base construit systématiquement, intégrant des critères de durabilité et une stratégie de protection qui tend à performer quand les obligations souffrent.",
      },
    },
  },
  {
    key: "multi-strategy",
    name: { en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies" },
    short: { en: "Multi-Strategy", fr: "Multistratégies" },
    vehicle: "fund",
    assetClass: { en: "Alternative strategies", fr: "Stratégies alternatives" },
    color: { solid: "#fa7b17", from: "#ffc043", to: "#f4511e" },
    aliases: ["multistrategy", "multistrat"],
    sources: { basis: "net" },
    benchmark: null,
    headlineClass: "LDM301",
    defaults: {
      riskRating: "medium",
      tagline: { en: "Four uncorrelated systematic strategies", fr: "Quatre stratégies systématiques non corrélées" },
      description: {
        en: "Low-volatility, directional, mean-reversion and hedging strategies combined into one portfolio: diversified alpha sources, each playing a distinct role across market regimes.",
        fr: "Des stratégies à faible volatilité, directionnelles, de retour à la moyenne et de couverture réunies dans un portefeuille : des sources d'alpha diversifiées, chacune jouant un rôle distinct selon les régimes de marché.",
      },
    },
  },
  {
    key: "global-minimum-volatility",
    name: { en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatilité" },
    short: { en: "Global Minimum Volatility", fr: "Global Minimum Volatilité" },
    vehicle: "strategy",
    assetClass: { en: "Protection overlay (managed accounts)", fr: "Stratégie de protection (comptes gérés)" },
    color: { solid: "#34a853", from: "#5be08f", to: "#0f9d58" },
    aliases: ["gmv"],
    sources: { basis: "gross" },
    benchmark: null,
    headlineClass: null,
    defaults: {
      riskRating: "low",
      tagline: { en: "An uncorrelated buffer against bond drawdowns", fr: "Un coussin non corrélé contre les baisses obligataires" },
      description: {
        en: "A managed-futures overlay stacked on top of an existing portfolio (about 5-10% deposit): capital stays fully invested while the overlay targets 3%, 6% or 9% downside volatility.",
        fr: "Une stratégie de contrats à terme gérés ajoutée par-dessus un portefeuille existant (dépôt d'environ 5-10 %) : le capital reste investi à 100 % tandis que la stratégie cible 3 %, 6 % ou 9 % de volatilité baissière.",
      },
    },
  },
];

export const FUND_KEYS = FUNDS.map((f) => f.key);
export const fundSpec = (key: string): FundSpec | undefined =>
  FUNDS.find((f) => f.key === key) ?? FUNDS.find((f) => f.aliases.includes(key));
