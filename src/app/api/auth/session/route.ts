import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  return new Response(null, { status: 202, headers: { "Cache-Control": "no-store" } });
}
