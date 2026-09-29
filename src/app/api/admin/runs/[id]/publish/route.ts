/**
 * POST /api/admin/runs/<id>/publish — publish this run's snapshot: approve a pending-review run, or roll the
 * public site back to an earlier run. Requires { confirm: true }.
 */
import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getRun, pipelineStatus, publishRun } from "@/lib/pipeline";
import { fail, internalError, isResponse, ok, parseJson } from "../../../_lib/http";
import { runIdSchema } from "../../../_lib/schemas";

export const dynamic = "force-dynamic";

const PUBLISHABLE = new Set(["published", "pending-review", "blocked"]);

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!runIdSchema.safeParse(id).success) return fail(400, "invalid_id", "Invalid run id.");
  const body = await parseJson(request, z.strictObject({ confirm: z.literal(true) }), 1024);
  if (isResponse(body)) return body;
  try {
    const run = await getRun(id);
    if (!run) return fail(404, "not_found", "No such run.");
    if (!PUBLISHABLE.has(run.report.status)) {
      return fail(409, "not_publishable", `A ${run.report.status} run cannot be published.`);
    }
    if (run.data.mode !== "live") return fail(409, "not_publishable", "This run does not contain live data.");
    if ((await pipelineStatus()).running) return fail(409, "busy", "A pipeline run is in progress: try again in a minute.");
    // publishRun records the publish / rollback in the audit log itself (with the previous run id)
    const report = await publishRun(id, user.email);
    return ok({ report });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/in progress|cannot be published|live data|not found/.test(msg)) return fail(409, "not_publishable", msg.slice(0, 200));
    return internalError("publish", e);
  }
}
