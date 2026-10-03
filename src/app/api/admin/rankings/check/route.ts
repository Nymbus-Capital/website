/** POST /api/admin/rankings/check — run the RBC pooled fund survey freshness check now (it also runs weekly). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getContent } from "@/lib/data/content";
import { audit } from "@/lib/data/store";
import { runRbcSurveyCheck } from "@/lib/rankings/rbc-survey";
import { internalError, ok } from "../../_lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    const state = await runRbcSurveyCheck({ content: await getContent() });
    await audit({ by: user.email, action: "rankings.check", detail: { ok: state.ok, latest: state.latest?.label ?? null } });
    return ok({ state });
  } catch (e) {
    return internalError("rankings.check", e);
  }
}
