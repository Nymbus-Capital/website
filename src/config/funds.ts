/**
 * Static registry of the funds shown on the website: identity, performance basis, brand colours. Holds nothing
 * internal: where each data point comes from is in src/lib/pipeline/fund-sources.ts (server only); client
 * components use the projection in funds-public.ts. Everything editable by the business (fees, descriptions,
 * visibility, documents) lives in the admin-managed content store instead (see SiteContent), so this file only changes with code.
 *
 * Dependency-free (plain TS) so the pipeline can import it under Node type stripping.
 */
import type { FundKey } from "../lib/data/types.ts";
import type { L } from "../lib/i18n/config.ts";

/**
 * Regulatory minimum (compliance may change it): a series with less than this many months since its inception shows no
 * performance figure, only "Series X launched on <date>. Performance will be shown once the series has 12 months of history."
 */
export const MIN_CLASS_HISTORY_MONTHS = 12;

/** A class (series) the website knows about. Other classes of the register appear in the selector from the NAV data. */
interface FundClassSpec {
  fundserv: string;
  display: string;
  /** offered by simplified prospectus or by offering memorandum, when known (the admin can override: FundContent.classTypes) */
  type?: "prospectus" | "om";
}

/**
 * a strategy variant: `label` is the selector button ("6%"), `name` names the variant wherever its figures are shown;
 * `default` marks the variant selected when nothing else is (the list itself is in display order)
 */
interface VariantSpec { id: string; label: L; name: L; default?: true }

/** Global Minimum Volatility variants are named by their target downside volatility, everywhere a figure is shown. */
const gmvVariant = (pct: number, isDefault = false): VariantSpec => ({
  id: String(pct),
  ...(isDefault ? { default: true as const } : {}),
  label: { en: `${pct}%`, fr: `${pct}\u00a0%` },
  name: { en: `${pct}% downside volatility`, fr: `volatilité à la baisse de ${pct}\u00a0%` },
});

export interface FundSpec {
  key: FundKey;
  name: L;
  short: L;
  vehicle: "fund" | "strategy";
  assetClass: L;
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
  benchmark: L | null;
  /** default headline class (FundServ) when the admin has not chosen one: class F, the page opens on it */
  headlineClass: string | null;
  /** classes known to the site, the default (F) first; the selector adds the other live classes from the NAV data */
  classes: FundClassSpec[];
  /**
   * variants of a strategy offered with their own figures (Global Minimum Volatility: target downside volatility, %), in
   * display order (3 %, 6 %, 9 %: Gabriel, 2026-10-04); the one flagged `default` (6 %) is selected unless another is
   */
  variants?: VariantSpec[];
  defaults: {
    riskRating: "low" | "low-medium" | "medium" | "medium-high" | "high";
    tagline: L;
    description: L;
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
    headlineClass: "LDM081",
    // every active class of the fund register (2026-10-04); the register stays the source of the live list (build.ts)
    classes: [
      { fundserv: "LDM081", display: "F", type: "prospectus" },
      { fundserv: "LDM001", display: "FP", type: "om" },
      { fundserv: "LDM011", display: "F USD" },
      { fundserv: "LDM021", display: "A" },
      { fundserv: "LDM031", display: "I" },
      { fundserv: "LDM061", display: "J" },
    ],
    defaults: {
      riskRating: "low-medium",
      tagline: { en: "Monthly income from short-term corporate bonds", fr: "Un revenu mensuel tiré d’obligations de sociétés à court terme" },
      description: {
        en: "Short-term Canadian corporate bonds selected by our two-system process, with a protective futures overlay designed to have low correlation with bonds in down months and to offset part of bond losses; it may not do so and can lose money. Distributions are not guaranteed, may change and may include a return of capital.",
        fr: "Des obligations de sociétés canadiennes à court terme sélectionnées par notre processus à deux systèmes, avec une superposition protectrice conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse et compenser une partie des pertes obligataires; elle peut ne pas y parvenir et peut subir des pertes. Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.",
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
    classes: [
      { fundserv: "LDM201", display: "F" },
      { fundserv: "LDM202", display: "H" },
      { fundserv: "LDM203", display: "I" },
      { fundserv: "LDM204", display: "J" },
      { fundserv: "LDM205", display: "A" },
      { fundserv: "LDM206", display: "FP" },
    ],
    defaults: {
      riskRating: "low",
      tagline: { en: "Canadian core bonds, managed systematically", fr: "Obligations canadiennes de base, gérées de façon systématique" },
      description: {
        en: "A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a protective futures overlay designed to have low correlation with bonds in down months and to offset part of bond losses; it may not do so and can lose money.",
        fr: "Un portefeuille obligataire canadien de base construit de façon systématique, intégrant des critères de durabilité dans la sélection des obligations, avec une superposition protectrice conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse et compenser une partie des pertes obligataires; elle peut ne pas y parvenir et peut subir des pertes.",
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
    classes: [
      { fundserv: "LDM301", display: "F" },
      { fundserv: "LDM300", display: "A" },
      { fundserv: "LDM303", display: "I" },
      { fundserv: "LDM304", display: "J" },
      { fundserv: "LDM305", display: "FP" },
    ],
    defaults: {
      riskRating: "medium",
      tagline: { en: "Four systematic strategies designed to have low correlation with one another", fr: "Quatre stratégies systématiques conçues pour être peu corrélées entre elles" },
      description: {
        en: "Low-volatility, directional, mean-reversion and hedging strategies combined into one portfolio, each designed to play a distinct role across market regimes.",
        fr: "Des stratégies à faible volatilité, directionnelles, de retour à la moyenne et de couverture réunies dans un portefeuille, chacune conçue pour jouer un rôle distinct selon les régimes de marché.",
      },
    },
  },
  {
    key: "global-minimum-volatility",
    name: { en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatility" },
    short: { en: "Global Minimum Volatility", fr: "Global Minimum Volatility" },
    vehicle: "strategy",
    assetClass: { en: "Protective overlay (managed accounts)", fr: "Superposition protectrice (comptes gérés)" },
    color: { solid: "#34a853", from: "#5be08f", to: "#0f9d58" },
    aliases: ["gmv"],
    sources: { basis: "gross" },
    benchmark: null,
    headlineClass: null,
    classes: [],
    variants: [
      gmvVariant(3),
      gmvVariant(6, true),
      gmvVariant(9),
    ],
    defaults: {
      riskRating: "low",
      tagline: { en: "A protective futures overlay designed to have low correlation with bonds in down months", fr: "Une superposition protectrice conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse" },
      description: {
        en: "A protective managed-futures overlay stacked on top of an existing portfolio (margin deposit of about 5 to 10% of exposure): most of the capital stays invested in the underlying portfolio while the overlay targets 3%, 6% or 9% downside volatility. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.",
        fr: "Une superposition protectrice de contrats à terme gérés ajoutée par-dessus un portefeuille existant (dépôt de garantie d’environ 5 à 10 % de l’exposition) : la majeure partie du capital reste investie dans le portefeuille sous-jacent, tandis que la stratégie cible une volatilité à la baisse de 3 %, 6 % ou 9 %. La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
      },
    },
  },
];

/** The default variant (flagged `default`, else the first); null without variants. */
export function defaultVariant<V extends { default?: true }>(spec: { variants?: V[] }): V | null {
  if (!spec.variants?.length) return null;
  return spec.variants.find((v) => v.default) ?? spec.variants[0];
}

/** The variant whose figures are shown (the selected one, else the default); null without variants. */
export function shownVariant(spec: Pick<FundSpec, "variants">, id: string | null | undefined): VariantSpec | null {
  if (!spec.variants?.length) return null;
  return spec.variants.find((v) => v.id === id) ?? defaultVariant(spec);
}

export const FUND_KEYS = FUNDS.map((f) => f.key);
export const fundSpec = (key: string): FundSpec | undefined =>
  FUNDS.find((f) => f.key === key) ?? FUNDS.find((f) => f.aliases.includes(key));
