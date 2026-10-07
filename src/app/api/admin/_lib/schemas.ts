/**
 * zod schemas for every /api/admin input. Strict objects: unknown keys are rejected, strings are bounded.
 */
import { z } from "zod";
import { FUND_KEYS } from "@/config/funds";
import { HIDE_BLOCKS, RANKING_PERIODS, THIRD_PARTY_PROVIDERS, type FundKey } from "@/lib/data/types";
import { bothOrNeither } from "@/components/admin/fund-content";

const FUND_KEY_VALUES = FUND_KEYS as [FundKey, ...FundKey[]];
export const fundKeySchema = z.enum(FUND_KEY_VALUES);

const text = (max: number) => z.string().trim().max(max);
/**
 * Bilingual text. Both empty = "not set" (falls back to the default); otherwise BOTH languages are required, so a
 * French page never silently shows English (or an empty string) for an admin override.
 */
export const l10n = (max: number) =>
  z
    .strictObject({ en: text(max), fr: text(max) })
    .refine(bothOrNeither, "both EN and FR are required (or leave both empty)");

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

export { HIDE_BLOCKS };
const RISK_RATINGS = ["low", "low-medium", "medium", "medium-high", "high"] as const;

const httpsUrl = z
  .string()
  .trim()
  .max(300)
  .regex(/^https:\/\/[^\s]+$/, "expected an https:// address");
const fundservCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{0,12}$/, "invalid FundServ code");

const rankingRowSchema = z
  .strictObject({
    period: z.enum(RANKING_PERIODS),
    rank: z.number().int().min(1).max(5000),
    of: z.number().int().min(1).max(5000),
    quartile: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable(),
  })
  .refine((r) => r.rank <= r.of, "rank cannot exceed the number of funds");

const fundLibraryRankingSchema = z.strictObject({
  classLabel: text(40).min(1),
  fundserv: fundservCode.optional(),
  category: l10n(120).refine((t) => t.en.length > 0 && t.fr.length > 0, "category (EN and FR) is required"),
  asOf: isoDate,
  fundGrade: z
    .string()
    .trim()
    .regex(/^[A-E]$/, "A to E")
    .optional(),
  rows: z.array(rankingRowSchema).max(RANKING_PERIODS.length),
  url: httpsUrl.optional(),
});

const morningstarSchema = z.strictObject({
  stars: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  asOf: isoDate,
  classLabel: text(40).min(1),
  category: l10n(120)
    .refine((t) => t.en.length > 0 && t.fr.length > 0, "category (EN and FR) is required")
    .optional(),
  fundsInCategory: z.number().int().min(1).max(100_000).optional(),
  url: httpsUrl.optional(),
});

const percentileRowSchema = z
  .strictObject({
    period: z.enum(RANKING_PERIODS),
    percentile: z.number().int().min(1).max(100).nullable(),
    rank: z.number().int().min(1).max(100_000).nullable().optional(),
    of: z.number().int().min(1).max(100_000).nullable().optional(),
    ror: z.number().min(-100).max(1000).nullable().optional(),
  })
  .refine((r) => r.rank == null || r.of == null || r.rank <= r.of, "rank cannot exceed the number of funds");

const rollingRowSchema = z.strictObject({
  end: isoDate,
  years: z.number().int().min(1).max(20),
  percentile: z.number().int().min(1).max(100).nullable(),
  ror: z.number().min(-100).max(1000).nullable().optional(),
});

/**
 * eVestment / LSEG Lipper / GMR / RBC pooled fund survey entry. A draft (confirmed false) may be incomplete; a confirmed
 * entry needs everything the public page shows with it: class, category EN + FR, as-of date, https source and a figure
 * (percentile, or rank out of N) for every period.
 */
const thirdPartyRankingSchema = z
  .strictObject({
    provider: z.enum(THIRD_PARTY_PROVIDERS),
    classLabel: text(40),
    scope: z.literal("fund").optional(),
    basis: z
      .strictObject({ en: text(160), fr: text(160) })
      .refine(bothOrNeither, "basis: both EN and FR (or neither)")
      .optional(),
    fundserv: fundservCode.optional(),
    category: z.strictObject({ en: text(120), fr: text(120) }),
    asOf: z.union([isoDate, z.literal("")]),
    edition: text(40).optional(),
    rows: z.array(percentileRowSchema).max(RANKING_PERIODS.length),
    rolling: z.array(rollingRowSchema).max(10).optional(),
    trackSince: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "expected YYYY-MM")
      .optional(),
    sourceRef: text(80).optional(),
    url: httpsUrl.optional(),
    confirmed: z.boolean().optional(),
    note: text(600).optional(),
  })
  .superRefine((e, ctx) => {
    if (new Set(e.rows.map((r) => r.period)).size !== e.rows.length)
      ctx.addIssue({ code: "custom", message: "each period once", path: ["rows"] });
    if (!e.confirmed) return;
    const need = (ok: boolean, path: string, message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", message, path: [path] });
    };
    need(
      e.classLabel.length > 0 || e.scope === "fund",
      "classLabel",
      "class (or “fund as a whole”) is required to confirm",
    );
    need(
      (e.rolling ?? []).every((a) => a.percentile != null && (e.asOf === "" || a.end <= e.asOf)),
      "rolling",
      "every rolling period needs a percentile and must end by the as-of date",
    );
    need(
      e.category.en.length > 0 && e.category.fr.length > 0,
      "category",
      "category (EN and FR) is required to confirm",
    );
    need(e.asOf !== "", "asOf", "as-of date is required to confirm");
    need(!!e.url, "url", "source URL (https) is required to confirm");
    need(e.rows.length > 0, "rows", "at least one period is required to confirm");
    need(
      e.rows.every((r) => r.percentile != null || (r.rank != null && r.of != null)),
      "rows",
      "every period needs a percentile or a rank out of N to confirm",
    );
  });

const fundRankingsSchema = z.strictObject({
  fundLibrary: z.array(fundLibraryRankingSchema).max(6).optional(),
  morningstar: morningstarSchema.optional(),
  thirdParty: z.array(thirdPartyRankingSchema).max(12).optional(),
});

const fundContentSchema = z.strictObject({
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
  headlineClass: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{0,12}$/, "invalid FundServ code")
    .optional(),
  classTypes: z
    .record(z.string().regex(/^[A-Za-z0-9]{1,12}$/, "invalid FundServ code"), z.enum(["prospectus", "om", "none"]))
    .optional(),
  minSubsequent: text(80).optional(),
  rspEligible: z.enum(["yes", "no"]).optional(),
  liquidity: l10n(200).optional(),
  cifscCategory: l10n(120).optional(),
  rankings: fundRankingsSchema.optional(),
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
  rankingPolicy: z.strictObject({ maxAgeMonths: z.number().int().min(1).max(24) }).optional(),
  inquiryPolicy: z.strictObject({ retentionDays: z.number().int().min(30).max(180) }).optional(),
});

export const runPipelineSchema = z.strictObject({ dryRun: z.boolean().default(false) });

const DOC_TYPE_VALUES = [
  "factsheet",
  "fund-facts",
  "prospectus",
  "annual-report",
  "interim-report",
  "mrfp",
  "proxy-voting",
  "tax-factors",
  "commentary",
  "presentation",
  "esg",
  "other",
] as const;

const docScopeSchema = z.union([fundKeySchema, z.literal("firm")]);

export const documentMetaSchema = z.strictObject({
  scope: docScopeSchema,
  type: z.enum(DOC_TYPE_VALUES),
  lang: z.enum(["en", "fr", "both"]),
  title: l10n(200).refine((t) => t.en.length > 0 && t.fr.length > 0, "a title (EN and FR) is required"),
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
