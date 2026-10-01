/**
 * Normalisation of the fund content saved by the admin (pure, unit tested): empty strings / empty L10n / empty
 * lists are dropped so the public page falls back to the registry defaults. `hide` keeps `true` entries and
 * `aum: false` — AUM is hidden by default and only an explicit `false` publishes it.
 */
import type { FundContent } from "../../lib/data/types.ts";

export function cleanFundContent(f: FundContent): FundContent {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && "en" in v && "fr" in v) {
      const l = v as { en: string; fr: string };
      if (!l.en && !l.fr) continue;
    }
    if (Array.isArray(v) && v.length === 0) continue;
    if (k === "hide" && typeof v === "object") {
      const h = Object.fromEntries(Object.entries(v).filter(([block, b]) => b === true || (block === "aum" && b === false)));
      if (Object.keys(h).length === 0) continue;
      out[k] = h;
      continue;
    }
    out[k] = v;
  }
  return out as FundContent;
}

/** A bilingual admin text is valid when both languages are set or both are empty (after trimming). */
export const bothOrNeither = (t: { en: string; fr: string }): boolean => (t.en.trim() === "") === (t.fr.trim() === "");

/** AUM is public only when the admin explicitly unticked "hide aum". */
export const aumPublic = (c: Pick<FundContent, "hide"> | null | undefined): boolean => c?.hide?.aum === false;
