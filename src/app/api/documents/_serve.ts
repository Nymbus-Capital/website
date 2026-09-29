/**
 * Public document download: only PUBLISHED documents, as inline PDF with a safe Content-Disposition, nosniff and
 * cache headers keyed on the file hash. Anything else → 404. (No `CSP: sandbox`: Chrome refuses to render PDFs with it;
 * the bytes are guaranteed to start with %PDF- and are always served as application/pdf + nosniff.)
 */
import { contentDisposition, getDocument, isDocumentId, readDocumentFile } from "@/lib/data/documents";

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export async function serveDocument(request: Request, id: string, head = false): Promise<Response> {
  if (!isDocumentId(id)) return notFound();
  const doc = await getDocument(id);
  if (!doc || !doc.published) return notFound();
  const etag = `"${doc.sha256}"`;
  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": contentDisposition(doc.fileName),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=300, must-revalidate",
    ETag: etag,
    "Last-Modified": new Date(doc.uploadedAt).toUTCString(),
    "Cross-Origin-Resource-Policy": "same-origin",
  };
  const inm = request.headers.get("if-none-match");
  if (inm && inm.split(",").map((s) => s.trim()).includes(etag)) return new Response(null, { status: 304, headers });
  const bytes = await readDocumentFile(id);
  if (!bytes) return notFound();
  headers["Content-Length"] = String(bytes.byteLength);
  return new Response(head ? null : (bytes as BodyInit), { status: 200, headers });
}
