/**
 * Shapes of the normalized WordPress document (`/wp-json/nymbus/v1/site-content`, schemaVersion 1) AFTER validation.
 * Dependency-free (unit tested under plain Node): relative imports with explicit `.ts`, erasable TypeScript only.
 */
export type Bi = { en: string; fr: string };

export const NEWS_CATEGORIES = ["partnership", "esg", "recognition", "community"] as const;
export type CmsNewsCategory = (typeof NEWS_CATEGORIES)[number];

export const DEPARTMENTS = ["Leadership", "Quantitative Research", "Investment Team", "Operations", "Board"] as const;
export type CmsDepartment = (typeof DEPARTMENTS)[number];

export interface CmsNews {
  /** URL slug (`/news/<id>`), unique */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  category: CmsNewsCategory;
  title: Bi;
  summary: Bi;
  /** plain text, paragraphs separated by a blank line (may be empty) */
  body: Bi;
  /** https URL on the configured media origin, or null */
  image: string | null;
  /** https URL of an external page, or null */
  link: string | null;
}

export interface CmsTeamMember {
  id: string;
  name: string;
  role: Bi;
  bio: Bi;
  department: CmsDepartment;
  additionalDepartments: CmsDepartment[];
  designations: string[];
  education: string[];
  previousRoles: { en: string[]; fr: string[] };
  yearJoined: number | null;
  photo: string | null;
  linkedin: string | null;
  order: number;
}

/** Pages whose intro (headline, highlighted ending, lead) editors may change. Compliance-reviewed copy is not editable. */
export const INTRO_PAGES = ["approach", "solutions", "sustainability", "team"] as const;
export type IntroPage = (typeof INTRO_PAGES)[number];
/** Intro pages whose lead stays in code (Sustainability: the compliance-reviewed scope qualifier of the ESG criteria). */
export const INTRO_LEAD_LOCKED: readonly IntroPage[] = ["sustainability"];

/** Each part is present only when filled in at least one language. `highlight` is only sent with a `headline`. */
export interface CmsPageIntro {
  headline?: Bi;
  /** few words shown in colour after the headline */
  highlight?: Bi;
  lead?: Bi;
}

export interface CmsTexts {
  homeHeadline?: Bi;
  homeSubheadline?: Bi;
  aumLabel?: Bi;
  /** present only when the banner is switched on and has text */
  banner?: Bi;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: Bi;
  pageIntros?: Partial<Record<IntroPage, CmsPageIntro>>;
}

export interface CmsDocument {
  schemaVersion: 1;
  news: CmsNews[];
  team: CmsTeamMember[];
  texts: CmsTexts;
}
