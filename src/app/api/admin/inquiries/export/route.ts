/** GET /api/admin/inquiries/export — every stored inquiry as CSV (newest first). Admin only, audited (count only). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listInquiries, purgeExpiredInquiries } from "@/lib/contact/store";
import { inquiriesCsv } from "@/lib/contact/csv";
import { audit } from "@/lib/data/store";
import { internalError } from "../../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    await purgeExpiredInquiries();
    const inquiries = await listInquiries();
    await audit({ by: user.email, action: "inquiries.export", detail: { count: inquiries.length } });
    const day = new Date().toISOString().slice(0, 10);
    return new Response(inquiriesCsv(inquiries), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nymbus-website-messages-${day}.csv"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return internalError("inquiries.export", e);
  }
}
