/** POST /api/admin/upload/documents/<id> (multipart: file) — replace the PDF of an existing document. */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getDocument, isDocumentId, replaceDocumentFile } from "@/lib/data/documents";
import { audit } from "@/lib/data/store";
import { fail, internalError, isResponse, ok } from "../../../_lib/http";
import { parseUpload } from "../../../_lib/upload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!isDocumentId(id)) return fail(400, "invalid_id", "Invalid document id.");
  if (!(await getDocument(id))) return fail(404, "not_found", "No such document.");
  const up = await parseUpload(request);
  if (isResponse(up)) return up;
  try {
    const before = await getDocument(id);
    const doc = await replaceDocumentFile(id, up.fileName, up.bytes, user.email);
    if (!doc) return fail(404, "not_found", "No such document.");
    await audit({
      by: user.email,
      action: "document.replace",
      target: id,
      detail: {
        before: before ? { fileName: before.fileName, sha256: before.sha256 } : null,
        after: { fileName: doc.fileName, size: doc.size, sha256: doc.sha256 },
      },
    });
    return ok({ document: doc });
  } catch (e) {
    return internalError("document.replace", e);
  }
}
