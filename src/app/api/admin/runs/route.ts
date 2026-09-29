/** GET /api/admin/runs?limit=50 — recent pipeline runs (newest first). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listRuns } from "@/lib/pipeline";
import { internalError, ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const n = Number(request.nextUrl.searchParams.get("limit") || "50");
  const limit = Number.isInteger(n) && n > 0 ? Math.min(n, 200) : 50;
  try {
    return ok({ runs: await listRuns(limit) });
  } catch (e) {
    return internalError("runs", e);
  }
}
