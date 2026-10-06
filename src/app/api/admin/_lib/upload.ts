/**
 * Multipart PDF upload parsing: bounded body read (never more than 25 MB + form overhead is buffered), then
 * FormData parsing, then PDF validation (magic bytes, size) — see src/lib/data/documents.ts.
 */
import { MAX_DOCUMENT_BYTES, validateUpload } from "@/lib/data/documents";
import { fail, readBodyCapped } from "./http";

const FORM_OVERHEAD = 64 * 1024;

interface ParsedUpload {
  form: FormData;
  fileName: string;
  bytes: Uint8Array;
}

export async function parseUpload(request: Request): Promise<ParsedUpload | Response> {
  const ct = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(ct)) return fail(415, "unsupported_media_type", "Expected multipart/form-data.");
  const buf = await readBodyCapped(request, MAX_DOCUMENT_BYTES + FORM_OVERHEAD);
  if (!buf) return fail(413, "too_large", "The file is larger than 25 MB.");
  let form: FormData;
  try {
    form = await new Response(buf as BodyInit, { headers: { "content-type": ct } }).formData();
  } catch {
    return fail(400, "invalid_form", "Malformed multipart body.");
  }
  const file = form.get("file");
  if (!file || typeof file === "string") return fail(400, "invalid_input", "file: a PDF file is required.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = validateUpload(bytes, file.type);
  if (!check.ok) return fail(check.status, check.status === 413 ? "too_large" : check.status === 415 ? "not_pdf" : "invalid_input", check.message);
  return { form, fileName: file.name || "document.pdf", bytes };
}
