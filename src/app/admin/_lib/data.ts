/**
 * Server-side data access for admin pages, with failures turned into `null` + a logged message so a broken
 * pipeline module or a corrupt file never takes the whole admin down.
 */
import { getRun, listRuns, pipelineStatus, type RunReport } from "@/lib/pipeline";
import type { PipelineStatus } from "@/components/admin/runs";
import { alertChannelStatus, readAlertState } from "@/lib/pipeline/alerts";
import { siteStatus } from "@/lib/pipeline/monitor";

async function safe<T>(where: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[admin] ${where}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export const safeStatus = () => safe<PipelineStatus>("pipelineStatus", async () => (await pipelineStatus()) as PipelineStatus);
export const safeRuns = async (limit: number): Promise<RunReport[]> => (await safe("listRuns", () => listRuns(limit))) ?? [];
export const safeRun = (id: string) => safe("getRun", () => getRun(id));
export const safeAlerts = () => safe("alertChannelStatus", async () => alertChannelStatus(await readAlertState()));
/** public data freshness + scheduler retry, for the admin only (the public /api/status shows neither reasons nor runs) */
export const safeFreshness = () => safe("siteStatus", async () => {
  const s = await siteStatus();
  return { verdict: s.verdict, reasons: s.reasons, retryAt: s.scheduler.retryAt };
});
