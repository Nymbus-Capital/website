/** GET /api/admin/runs/<id> — one run: report + a per-fund summary of its data (not the full dataset). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRun } from "@/lib/pipeline";
import { summarizeRunData } from "@/components/admin/summary";
import { fail, internalError, ok } from "../../_lib/http";
import { runIdSchema } from "../../_lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!runIdSchema.safeParse(id).success) return fail(400, "invalid_id", "Invalid run id.");
  try {
    const run = await getRun(id);
    if (!run) return fail(404, "not_found", "No such run.");
    return ok({ report: run.report, summary: summarizeRunData(run.data) });
  } catch (e) {
    return internalError("run", e);
  }
}
