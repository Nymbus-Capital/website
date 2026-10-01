/**
 * Class label of the published performance, derived from the class of the data actually used (Gabriel 2026-10-01:
 * "if you showcase the class H time series, then show class H"). Used by the build (carried publications) and by
 * the pages (render-time, so a rollback or a pin to a publication made before classes were tracked is labelled
 * by its data, never by a business label). Pure, dependency-free (Node type stripping); server only.
 */
import type { FundData, FundKey, Performance } from "../data/types.ts";
import { classLabel, FUND_SOURCES } from "./fund-sources.ts";

/**
 * Class code of a published performance: its own `classCode`, or — for a publication made before the class was
 * recorded — the fund's track-record class, from which every such publication was built.
 */
export function perfClassCode(key: FundKey, perf: Pick<Performance, "classCode"> | null | undefined): string | null {
  if (!perf) return null;
  return perf.classCode ?? FUND_SOURCES[key].trackRecordClass;
}

/**
 * The performance with `returnClass` / `returnClassLabel` re-derived from its class code. null when the class has no
 * label for the fund (a figure is never shown under a label that can disagree with it). Unchanged for a strategy
 * without classes (GMV).
 */
export function withClassLabel(key: FundKey, perf: Performance | null | undefined): Performance | null {
  if (!perf) return null;
  if (!Object.keys(FUND_SOURCES[key].classLabels).length) return perf;
  const code = perfClassCode(key, perf);
  const label = classLabel(key, code);
  if (!code || !label) return null;
  if (perf.classCode === code && perf.returnClass === label && perf.returnClassLabel === `Series ${label}`) return perf;
  return { ...perf, classCode: code, returnClass: label, returnClassLabel: `Series ${label}` };
}

/** The fund with its performance labelled by its own class (performance and risk dropped when the class is unknown). */
export function fundWithClassLabel(f: FundData | null): FundData | null {
  if (!f?.performance) return f;
  const p = withClassLabel(f.key, f.performance);
  if (p === f.performance) return f;
  return p ? { ...f, performance: p } : { ...f, performance: null, risk: null, risk3Y: null };
}
