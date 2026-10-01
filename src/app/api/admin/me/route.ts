/** GET /api/admin/me — the signed-in admin (email, name). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  return ok({ email: user.email, name: user.name });
}
