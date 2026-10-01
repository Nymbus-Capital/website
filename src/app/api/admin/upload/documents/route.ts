/**
 * POST /api/admin/upload/documents (multipart: file + scope, type, lang, titleEn, titleFr, date, published)
 * Not matched by the proxy (to avoid its 10 MB body buffering cap): requireAdmin() does session + policy + CSRF
 * BEFORE the body is read.
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createDocument } from "@/lib/data/documents";
import { audit } from "@/lib/data/store";
import { internalError, isResponse, ok, validate } from "../../_lib/http";
import { documentMetaSchema, metaFromForm } from "../../_lib/schemas";
import { parseUpload } from "../../_lib/upload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const up = await parseUpload(request);
  if (isResponse(up)) return up;
  const meta = validate(documentMetaSchema, metaFromForm(up.form));
  if (isResponse(meta)) return meta;
  try {
    const doc = await createDocument(meta, up.fileName, up.bytes, user.email);
    await audit({ by: user.email, action: "document.upload", target: doc.id, detail: { fileName: doc.fileName, size: doc.size, sha256: doc.sha256, scope: doc.scope, published: doc.published } });
    return ok({ document: doc }, 201);
  } catch (e) {
    return internalError("document.upload", e);
  }
}
