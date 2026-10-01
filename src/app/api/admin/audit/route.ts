/** GET /api/admin/audit — the last 200 audit entries, newest first. */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { readAuditTail } from "@/components/admin/audit-read";
import { internalError, ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    return ok({ entries: await readAuditTail(200) });
  } catch (e) {
    return internalError("audit", e);
  }
}
