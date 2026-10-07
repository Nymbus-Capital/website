/** GET /api/admin/documents — all documents (published or not), newest first. */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { documentUrl, listDocuments } from "@/lib/data/documents";
import { internalError, ok } from "../_lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  try {
    const docs = (await listDocuments()).sort(
      (a, b) => b.date.localeCompare(a.date) || b.uploadedAt.localeCompare(a.uploadedAt),
    );
    return ok({ documents: docs.map((d) => ({ ...d, url: documentUrl(d) })) });
  } catch (e) {
    return internalError("documents", e);
  }
}
