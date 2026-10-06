/** GET /api/admin/inquiries — website inquiries (contact form), newest first; expired ones are purged first. Audited. */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listInquiries, purgeExpiredInquiries } from "@/lib/contact/store";
import { audit } from "@/lib/data/store";
import { internalError, ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    await purgeExpiredInquiries();
    const inquiries = await listInquiries();
    await audit({ by: user.email, action: "inquiries.view", detail: { count: inquiries.length, via: "api" } });
    return ok({ inquiries });
  } catch (e) {
    return internalError("inquiries", e);
  }
}
