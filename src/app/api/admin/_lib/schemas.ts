/**
 * zod schemas for every /api/admin input. Strict objects: unknown keys are rejected, strings are bounded.
 */
import { z } from "zod";
import { FUND_KEYS } from "@/config/funds";
import type { FundKey } from "@/lib/data/types";

const FUND_KEY_VALUES = FUND_KEYS as [FundKey, ...FundKey[]];
export const fundKeySchema = z.enum(FUND_KEY_VALUES);

const text = (max: number) => z.string().trim().max(max);
export const l10n = (max: number) => z.strictObject({ en: text(max), fr: text(max) });

/** ISO date YYYY-MM-DD that is a real calendar date. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "invalid date");

/** Pipeline run / snapshot id: same charset as site.ts accepts for pins; no dots, slashes or traversal. */
export const runIdSchema = z.string().regex(/^[0-9A-Za-z][0-9A-Za-z-]{0,79}$/, "invalid run id");

export const HIDE_BLOCKS = ["performance", "calendar", "growth", "risk", "nav", "aum", "characteristics", "breakdowns", "holdings", "esg"] as const;
export const RISK_RATINGS = ["low", "low-medium", "medium", "medium-high", "high"] as const;

export const fundContentSchema = z.strictObject({
  hidden: z.boolean().optional(),
  hide: z.partialRecord(z.enum(HIDE_BLOCKS), z.boolean()).optional(),
  tagline: l10n(200).optional(),
  description: l10n(2000).optional(),
  objective: l10n(2000).optional(),
  riskRating: z.enum(RISK_RATINGS).optional(),
  managementFee: text(60).optional(),
  performanceFee: text(120).optional(),
  mer: text(60).optional(),
  minInvestment: text(80).optional(),
  distributions: l10n(300).optional(),
  headlineClass: z.string().trim().regex(/^[A-Za-z0-9]{0,12}$/, "invalid FundServ code").optional(),
  performanceNote: l10n(1500).optional(),
  managers: z.array(text(120).min(1)).max(12).optional(),
  pinnedSnapshot: runIdSchema.nullable().optional(),
});

export const saveFundSchema = z.strictObject({
  version: z.number().int().min(0),
  fund: fundContentSchema,
});

export const saveSettingsSchema = z.strictObject({
  version: z.number().int().min(0),
  firm: z.strictObject({
    aumLabel: l10n(40).optional(),
    announcement: l10n(400).nullable().optional(),
    disclaimer: l10n(4000).optional(),
  }),
  publishMode: z.enum(["auto", "review"]),
});

export const runPipelineSchema = z.strictObject({ dryRun: z.boolean().default(false) });

export const DOC_TYPE_VALUES = [
  "factsheet", "fund-facts", "prospectus", "annual-report", "interim-report", "mrfp", "commentary", "presentation", "esg", "other",
] as const;

export const docScopeSchema = z.union([fundKeySchema, z.literal("firm")]);

export const documentMetaSchema = z.strictObject({
  scope: docScopeSchema,
  type: z.enum(DOC_TYPE_VALUES),
  lang: z.enum(["en", "fr", "both"]),
  title: l10n(200).refine((t) => t.en.length > 0 || t.fr.length > 0, "a title (EN or FR) is required"),
  date: isoDate,
  published: z.boolean(),
});

export const documentPatchSchema = documentMetaSchema.partial();

/** Multipart form fields of an upload (strings) → documentMetaSchema input. */
export function metaFromForm(form: FormData): unknown {
  const s = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : undefined;
  };
  return {
    scope: s("scope"),
    type: s("type"),
    lang: s("lang"),
    title: { en: s("titleEn") ?? "", fr: s("titleFr") ?? "" },
    date: s("date"),
    published: s("published") === "true" || s("published") === "1" || s("published") === "on",
  };
}
