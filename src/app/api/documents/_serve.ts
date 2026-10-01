/**
 * Public document download: only PUBLISHED documents, as inline PDF with a safe Content-Disposition and nosniff.
 * The file is streamed from disk (never buffered whole), Content-Length comes from stat, HEAD does not open the file,
 * a single byte range is supported (Accept-Ranges: bytes; If-Range honoured). Caching: `public, no-cache` + a strong
 * ETag (sha256), so every use revalidates (an unpublished or replaced document is never served stale) and repeat
 * downloads cost a 304. Anything else → 404.
 * (No `CSP: sandbox`: Chrome refuses to render PDFs with it; the bytes are guaranteed to start with %PDF- and are
 * always served as application/pdf + nosniff.)
 */
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { contentDisposition, documentFileStat, getDocument, isDocumentId, parseRange } from "@/lib/data/documents";

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export async function serveDocument(request: Request, id: string, head = false): Promise<Response> {
  if (!isDocumentId(id)) return notFound();
  const doc = await getDocument(id);
  if (!doc || !doc.published) return notFound();
  const file = await documentFileStat(id);
  if (!file) return notFound();

  const etag = `"${doc.sha256}"`;
  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": contentDisposition(doc.fileName),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, no-cache",
    ETag: etag,
    "Last-Modified": new Date(doc.uploadedAt).toUTCString(),
    "Accept-Ranges": "bytes",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
  const inm = request.headers.get("if-none-match");
  if (inm && inm.split(",").map((s) => s.trim().replace(/^W\//, "")).some((t) => t === etag || t === "*")) {
    return new Response(null, { status: 304, headers });
  }

  const ifRange = request.headers.get("if-range");
  const range = !ifRange || ifRange.trim() === etag ? parseRange(request.headers.get("range"), file.size) : "none";
  if (range === "unsatisfiable") {
    return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${file.size}` } });
  }
  const partial = range !== "none";
  const start = partial ? range.start : 0;
  const end = partial ? range.end : file.size - 1;
  const length = file.size === 0 ? 0 : end - start + 1;
  headers["Content-Length"] = String(length);
  if (partial) headers["Content-Range"] = `bytes ${start}-${end}/${file.size}`;
  const status = partial ? 206 : 200;
  if (head || length === 0) return new Response(null, { status, headers });

  const stream = createReadStream(file.path, { start, end });
  const body = Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;
  // abort the disk read when the client goes away
  request.signal?.addEventListener("abort", () => stream.destroy(), { once: true });
  return new Response(body, { status, headers });
}
