/**
 * POST /api/admin/pipeline/run { dryRun } — starts a manual pipeline run WITHOUT awaiting it (a run can take
 * minutes); the UI polls /api/admin/status. A run already in progress answers 409.
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { pipelineStatus, runPipeline } from "@/lib/pipeline";
import { audit } from "@/lib/data/store";
import { fail, internalError, isResponse, ok, parseJson } from "../../_lib/http";
import { runPipelineSchema } from "../../_lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const body = await parseJson(request, runPipelineSchema, 1024);
  if (isResponse(body)) return body;
  try {
    const st = await pipelineStatus();
    if (st.running) return fail(409, "already_running", "A pipeline run is already in progress.");
    await audit({ by: user.email, action: "pipeline.run", detail: { dryRun: body.dryRun } });
    // fire and forget: errors are captured and logged, the run report records the outcome
    void runPipeline({ trigger: "manual", by: user.email, dryRun: body.dryRun })
      .then(async (r) => {
        if ("locked" in r) {
          console.warn("[admin] manual run skipped: another run holds the lock");
          return;
        }
        await audit({
          by: user.email,
          action: "pipeline.run.finished",
          target: r.id,
          detail: { status: r.status },
        }).catch(() => undefined);
      })
      .catch((e: unknown) => {
        console.error("[admin] manual pipeline run failed:", e instanceof Error ? e.message : e);
        void audit({
          by: user.email,
          action: "pipeline.run.crashed",
          detail: { error: e instanceof Error ? e.message.slice(0, 300) : "unknown" },
        }).catch(() => undefined);
      });
    return ok({ started: true, dryRun: body.dryRun }, 202);
  } catch (e) {
    return internalError("pipeline.run", e);
  }
}
