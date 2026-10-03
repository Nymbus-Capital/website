/**
 * SLOT — third-party category rankings for the advisors use case on /solutions.
 *
 * Renders NOTHING for now, on purpose: ranking claims ("top percentiles since launch" per eVestment, the RBC pooled
 * fund survey, LSEG Lipper, GMR, …) are never hard-coded in the copy. The awards/rankings work (another branch) owns
 * the data — each figure with its source, category, period and "as at" date — and will wire it here, with the
 * rankings disclosure of the fund pages. Until then the advisors card shows only its use-case steps.
 */
export function AdvisorRankings(): null {
  return null;
}
