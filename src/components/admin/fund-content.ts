/**
 * Normalisation of the fund content saved by the admin (pure, unit tested): empty strings / empty L10n / empty
 * lists are dropped so the public page falls back to the registry defaults. `hide` keeps `true` entries and
 * `aum: false` — AUM is hidden by default and only an explicit `false` publishes it.
 */
import type { FundContent, ThirdPartyRanking } from "../../lib/data/types.ts";

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
    if (k === "classTypes" && typeof v === "object") {
      const t = Object.fromEntries(Object.entries(v).filter(([code, kind]) => code && (kind === "prospectus" || kind === "om" || kind === "none")));
      if (Object.keys(t).length === 0) continue;
      out[k] = t;
      continue;
    }
    if (k === "rankings" && typeof v === "object") {
      const r = v as NonNullable<FundContent["rankings"]>;
      const lib = (r.fundLibrary ?? []).filter((x) => x.rows.length > 0 || x.fundGrade);
      const rk: NonNullable<FundContent["rankings"]> = {};
      if (lib.length) rk.fundLibrary = lib;
      if (r.morningstar) rk.morningstar = r.morningstar;
      // kept even when empty: an empty list means "removed", so the seeded drafts do not come back
      if (Array.isArray(r.thirdParty)) rk.thirdParty = r.thirdParty.map(cleanThirdParty);
      if (Object.keys(rk).length === 0) continue;
      out[k] = rk;
      continue;
    }
    out[k] = v;
  }
  return out as FundContent;
}

/** Drop empty optional fields of a third-party entry (rows without any figure are kept: the admin is still typing). */
function cleanThirdParty(e: ThirdPartyRanking): ThirdPartyRanking {
  const out: ThirdPartyRanking = { provider: e.provider, classLabel: e.classLabel, category: e.category, asOf: e.asOf, rows: e.rows };
  if (e.fundserv) out.fundserv = e.fundserv;
  if (e.edition) out.edition = e.edition;
  if (e.url) out.url = e.url;
  if (e.confirmed) out.confirmed = true;
  if (e.note) out.note = e.note;
  return out;
}

/** A bilingual admin text is valid when both languages are set or both are empty (after trimming). */
export const bothOrNeither = (t: { en: string; fr: string }): boolean => (t.en.trim() === "") === (t.fr.trim() === "");

/** AUM is public only when the admin explicitly unticked "hide aum". */
export const aumPublic = (c: Pick<FundContent, "hide"> | null | undefined): boolean => c?.hide?.aum === false;
