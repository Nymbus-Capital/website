/**
 * Compliance review state of the disclaimers (pure). The review is required until an admin records the hash of the
 * current texts (boilerplate + admin overrides); any later change to either brings the requirement back.
 */
import { disclaimersHash, type DisclaimerOverrides } from "../../content/disclaimers.ts";
import type { FundKey, SiteContent } from "../../lib/data/types.ts";

function overridesOf(c: Pick<SiteContent, "firm" | "funds">): DisclaimerOverrides {
  const notes: Record<string, { en: string; fr: string } | undefined> = {};
  for (const [k, f] of Object.entries(c.funds ?? {}) as [
    FundKey,
    { performanceNote?: { en: string; fr: string } } | undefined,
  ][]) {
    if (f?.performanceNote) notes[k] = f.performanceNote;
  }
  return { firm: c.firm?.disclaimer ?? null, performanceNotes: notes };
}

export const currentDisclaimersHash = (c: Pick<SiteContent, "firm" | "funds">): string =>
  disclaimersHash(overridesOf(c));

type ComplianceState =
  | { status: "never"; hash: string }
  | { status: "changed"; hash: string; approvedAt: string; approvedBy: string }
  | { status: "approved"; hash: string; approvedAt: string; approvedBy: string };

export function complianceState(c: Pick<SiteContent, "firm" | "funds" | "compliance">): ComplianceState {
  const hash = currentDisclaimersHash(c);
  const a = c.compliance;
  if (!a || !a.textsHash) return { status: "never", hash };
  return a.textsHash === hash
    ? { status: "approved", hash, approvedAt: a.approvedAt, approvedBy: a.approvedBy }
    : { status: "changed", hash, approvedAt: a.approvedAt, approvedBy: a.approvedBy };
}
