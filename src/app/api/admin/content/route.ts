/** GET /api/admin/content — the admin-managed content (defaults merged in) with its version. */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getContent } from "@/lib/data/content";
import { internalError, ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    return ok({ content: await getContent() });
  } catch (e) {
    return internalError("content", e);
  }
}
