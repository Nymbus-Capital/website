// context.ts — build options, the per-run issue/provenance collector (Ctx) and what validate.ts receives per fund
import type { FundKey, Issue, PeriodMap, SiteData } from "../../data/types.ts";
import type { Method } from "../metrics.ts";

type PartName = "performance" | "nav" | "aum" | "factsheet";
/** fresh: built this run; held: kept at an older month on purpose (waiting for a factsheet); carried: previous publication reused because a source failed */
export type PartState = "fresh" | "held" | "carried" | "none";

export interface BuildOptions {
  mode?: SiteData["mode"];
  /**
   * H3 gate: a performance month newer than the published one also needs its factsheet and a passing cross-check, in
   * every publish mode (default false). Without it, such a month is published only after an admin review in auto mode
   * (FundContext.unconfirmed).
   */
  requireFactsheetForNewMonth?: boolean;
}

/** What validate.ts needs besides the data itself. */
export interface FundContext {
  key: FundKey;
  method: Method;
  /** where the fund trailing figures come from */
  trailingSource: "computed" | "factsheet" | null;
  /** published fund trailing of the factsheet whose month equals the performance as-of (cross-check) */
  factsheetTrailing: PeriodMap | null;
  factsheetTrailingFile: string | null;
  factsheetTrailingDecimals?: Partial<Record<string, number>>;
  parts: Record<PartName, PartState>;
  /** reasons that must be brought to a human (run status "blocked" + alert) */
  alerts: string[];
  /** already published months whose return changed (headline and every other class entry) */
  revisions: { month: string; before: number; after: number | null; fundserv?: string }[];
  /**
   * new performance months (after the previous publication) that no source independent of the dataplatform confirms
   * (analytics history, a same-class factsheet monthly table or trailing table): auto mode keeps them for an admin
   */
  unconfirmed?: string[];
  /**
   * persistent, expected data limitations a human should know about but that never block publishing (e.g. a class not
   * shown because the fund's CIBC months cannot be verified): warn issues + a non-blocking notice in the run
   */
  advisories?: { code: string; message: string }[];
}

export interface BuildResult {
  data: SiteData;
  context: Partial<Record<FundKey, FundContext>>;
}

/** Issues and provenance collected over one build run. */
export class Ctx {
  issues: Issue[] = [];
  prov: Record<string, string> = {};
  prevProv: Record<string, string> = {};
  prevGenerated = "";
  /** funds whose new fund-data endpoints answered 404 (reported once per run, see absentEndpoints) */
  absent: { portfolio: string[]; distributions: string[] } = { portfolio: [], distributions: [] };
  info(key: string, message: string): void {
    this.issues.push({ key, level: "info", message });
  }
  warn(key: string, message: string): void {
    this.issues.push({ key, level: "warn", message });
  }
  error(key: string, message: string): void {
    this.issues.push({ key, level: "error", message });
  }
}

/** provenance of a part carried over from the previous publication */
export function carriedNoteFor(c: Ctx, base: string, part: string): string {
  const old = c.prevProv[`${base}.${part}`];
  // a part already carried keeps its original provenance (it names the publication it comes from)
  if (old?.startsWith("carried over")) return old;
  return `carried over from the publication of ${c.prevGenerated}${old ? ` (${old})` : ""}`;
}
