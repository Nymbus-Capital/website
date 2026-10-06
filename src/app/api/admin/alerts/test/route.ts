/** POST /api/admin/alerts/test — send a test message to the alert webhook (checks the channel; one attempt, one a minute). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { audit } from "@/lib/data/store";
import { sendTestAlert } from "@/lib/pipeline/alerts";
import { fail, internalError, ok } from "../../_lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    const result = await sendTestAlert({
      title: "Nymbus website: test alert",
      severity: "info",
      adminPath: "/admin",
      lines: [`Sent from the admin dashboard by ${user.email}. Pipeline, stale-data and rankings alerts arrive here.`],
    });
    if (result === "cooldown") return fail(429, "cooldown", "A test alert was sent less than a minute ago; try again shortly.");
    await audit({ by: user.email, action: "alerts.test", detail: { result } });
    return ok({ result });
  } catch (e) {
    return internalError("alerts.test", e);
  }
}
