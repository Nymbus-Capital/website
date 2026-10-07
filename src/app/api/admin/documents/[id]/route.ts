/**
 * PATCH  /api/admin/documents/<id> { scope?, type?, lang?, title?, date?, published? } — edit metadata / publish
 * DELETE /api/admin/documents/<id>                                                  — delete (file + metadata)
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { deleteDocument, documentUrl, getDocument, isDocumentId, updateDocument } from "@/lib/data/documents";
import { audit } from "@/lib/data/store";
import { fail, internalError, isResponse, ok, parseJson } from "../../_lib/http";
import { documentPatchSchema } from "../../_lib/schemas";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!isDocumentId(id)) return fail(400, "invalid_id", "Invalid document id.");
  const patch = await parseJson(request, documentPatchSchema, 16 * 1024);
  if (isResponse(patch)) return patch;
  try {
    const before = await getDocument(id);
    if (!before) return fail(404, "not_found", "No such document.");
    const doc = await updateDocument(id, patch);
    if (!doc) return fail(404, "not_found", "No such document.");
    const changed = Object.fromEntries(
      Object.keys(patch).map((k) => [
        k,
        { before: before[k as keyof typeof before], after: doc[k as keyof typeof doc] },
      ]),
    );
    await audit({
      by: user.email,
      action:
        patch.published !== undefined && Object.keys(patch).length === 1
          ? patch.published
            ? "document.publish"
            : "document.unpublish"
          : "document.update",
      target: id,
      detail: changed,
    });
    return ok({ document: { ...doc, url: documentUrl(doc) } });
  } catch (e) {
    return internalError("document.update", e);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!isDocumentId(id)) return fail(400, "invalid_id", "Invalid document id.");
  try {
    const d = await deleteDocument(id);
    if (!d) return fail(404, "not_found", "No such document.");
    await audit({
      by: user.email,
      action: "document.delete",
      target: id,
      detail: { fileName: d.fileName, sha256: d.sha256, scope: d.scope, title: d.title },
    });
    return ok({ deleted: id });
  } catch (e) {
    return internalError("document.delete", e);
  }
}
