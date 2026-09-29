/** GET /api/admin/status — pipeline status (running, schedule, next run, last run, published run id). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { pipelineStatus } from "@/lib/pipeline";
import { internalError, ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    return ok(await pipelineStatus());
  } catch (e) {
    return internalError("status", e);
  }
}
