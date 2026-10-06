/**
 * Fund / firm documents (PDF only) uploaded in the admin.
 *
 *   documents/index.json      DocumentMeta[]
 *   documents/files/<id>      the PDF bytes (id = store.newId())
 *
 * Public pages use `listPublishedDocuments(scope)` and `documentUrl(doc)`; files are served by
 * GET /api/documents/<id>/<name> only while `published` is true.
 *
 * Dependency-free (Node built-ins + relative `.ts` imports) so validation and storage are unit tested under plain Node.
 */
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import { newId, p, readJson, removePath, withLock, writeFileAtomic, writeJson } from "./store.ts";
import type { DocType, DocumentMeta, FundKey } from "./types.ts";
import type { L, Locale } from "../i18n/config.ts";

export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

/** ids produced by store.newId(): `20260929T043000-1a2b3c4d` */
const ID_RE = /^\d{8}T\d{6}-[0-9a-f]{8}$/;
export const isDocumentId = (v: unknown): v is string => typeof v === "string" && ID_RE.test(v);

/* ------------------------------------------------------------------ validation (pure) */

/** `%PDF-` magic bytes at offset 0. */
export function hasPdfMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

/**
 * Safe display / download file name: basename only, NFC, no control chars, no path separators or reserved
 * characters, no leading dots, collapsed whitespace, ≤ 120 chars, always ending in `.pdf`.
 */
export function sanitizeFileName(raw: string): string {
  let n = String(raw ?? "").normalize("NFC");
  n = n.split(/[\\/]/).pop() ?? "";
  // eslint-disable-next-line no-control-regex
  n = n.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "");
  n = n.replace(/[<>:"|?*;%#&=+$,'`{}^[\]~]/g, "_");
  n = n.replace(/\s+/g, " ").trim().replace(/^[.\s_-]+/, "");
  n = n.replace(/\.pdf$/i, "").replace(/[.\s]+$/, "");
  if (n.length > 116) n = n.slice(0, 116).trim();
  if (!n) n = "document";
  return `${n}.pdf`;
}

type UploadCheck = { ok: true } | { ok: false; status: 400 | 413 | 415; message: string };

export function validateUpload(bytes: Uint8Array, declaredType?: string): UploadCheck {
  if (bytes.length === 0) return { ok: false, status: 400, message: "The file is empty." };
  if (bytes.length > MAX_DOCUMENT_BYTES) return { ok: false, status: 413, message: "The file is larger than 25 MB." };
  if (declaredType && declaredType !== "application/pdf" && declaredType !== "application/octet-stream" && declaredType !== "") {
    return { ok: false, status: 415, message: "Only PDF files can be uploaded." };
  }
  if (!hasPdfMagic(bytes)) return { ok: false, status: 415, message: "The file is not a PDF (missing %PDF- header)." };
  return { ok: true };
}

export const sha256 = (bytes: Uint8Array): string => crypto.createHash("sha256").update(bytes).digest("hex");

/** RFC 6266 / 5987 inline disposition with an ASCII fallback. */
export function contentDisposition(fileName: string): string {
  const safe = sanitizeFileName(fileName);
  const ascii = safe.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(safe).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/* ------------------------------------------------------------------ storage */

const INDEX = ["documents", "index.json"];

export async function listDocuments(): Promise<DocumentMeta[]> {
  const all = await readJson<DocumentMeta[]>(INDEX, []);
  return Array.isArray(all) ? all.filter((d) => isDocumentId(d?.id)) : [];
}

export async function getDocument(id: string): Promise<DocumentMeta | null> {
  if (!isDocumentId(id)) return null;
  return (await listDocuments()).find((d) => d.id === id) ?? null;
}

const byDateDesc = (a: DocumentMeta, b: DocumentMeta) => b.date.localeCompare(a.date) || b.uploadedAt.localeCompare(a.uploadedAt);

/** Published documents, newest first; `scope` filters on a fund key or "firm". */
export async function listPublishedDocuments(scope?: FundKey | "firm"): Promise<DocumentMeta[]> {
  return (await listDocuments()).filter((d) => d.published && (scope === undefined || d.scope === scope)).sort(byDateDesc);
}

/** Public URL of a document (served only while published). */
export const documentUrl = (d: Pick<DocumentMeta, "id" | "fileName">): string => `/api/documents/${encodeURIComponent(d.id)}/${encodeURIComponent(sanitizeFileName(d.fileName))}`;

async function mutateIndex<T>(fn: (docs: DocumentMeta[]) => Promise<{ docs: DocumentMeta[]; result: T }>): Promise<T> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const r = await withLock(
      "documents",
      async () => {
        const { docs, result } = await fn(await listDocuments());
        await writeJson(INDEX, docs);
        return { result };
      },
      60_000,
    );
    if (!("locked" in r)) return r.result;
    await new Promise((res) => setTimeout(res, 50 + attempt * 25));
  }
  throw new Error("documents index is busy");
}

interface NewDocument {
  scope: FundKey | "firm";
  type: DocType;
  lang: Locale | "both";
  title: L;
  date: string;
  published: boolean;
}

export async function createDocument(meta: NewDocument, fileName: string, bytes: Uint8Array, by: string): Promise<DocumentMeta> {
  const check = validateUpload(bytes);
  if (!check.ok) throw new Error(check.message);
  const id = newId();
  await writeFileAtomic(["documents", "files", id], bytes);
  const doc: DocumentMeta = {
    id,
    ...meta,
    fileName: sanitizeFileName(fileName),
    size: bytes.length,
    sha256: sha256(bytes),
    uploadedBy: by,
    uploadedAt: new Date().toISOString(),
  };
  try {
    await mutateIndex(async (docs) => ({ docs: [...docs, doc], result: null }));
  } catch (e) {
    await removePath(["documents", "files", id]);
    throw e;
  }
  return doc;
}

type DocumentPatch = Partial<Pick<DocumentMeta, "scope" | "type" | "lang" | "title" | "date" | "published">>;

export async function updateDocument(id: string, patch: DocumentPatch): Promise<DocumentMeta | null> {
  if (!isDocumentId(id)) return null;
  return mutateIndex(async (docs) => {
    const i = docs.findIndex((d) => d.id === id);
    if (i < 0) return { docs, result: null };
    const next = { ...docs[i], ...patch, id: docs[i].id };
    const out = [...docs];
    out[i] = next;
    return { docs: out, result: next };
  });
}

export async function replaceDocumentFile(id: string, fileName: string, bytes: Uint8Array, by: string): Promise<DocumentMeta | null> {
  if (!isDocumentId(id)) return null;
  const check = validateUpload(bytes);
  if (!check.ok) throw new Error(check.message);
  return mutateIndex(async (docs) => {
    const i = docs.findIndex((d) => d.id === id);
    if (i < 0) return { docs, result: null };
    await writeFileAtomic(["documents", "files", id], bytes);
    const next: DocumentMeta = {
      ...docs[i],
      fileName: sanitizeFileName(fileName),
      size: bytes.length,
      sha256: sha256(bytes),
      uploadedBy: by,
      uploadedAt: new Date().toISOString(),
    };
    const out = [...docs];
    out[i] = next;
    return { docs: out, result: next };
  });
}

export async function deleteDocument(id: string): Promise<DocumentMeta | null> {
  if (!isDocumentId(id)) return null;
  return mutateIndex(async (docs) => {
    const d = docs.find((x) => x.id === id);
    if (!d) return { docs, result: null };
    await removePath(["documents", "files", id]);
    return { docs: docs.filter((x) => x.id !== id), result: d };
  });
}

/** Absolute path + size of a document file, or null (bad id / missing file). */
export async function documentFileStat(id: string): Promise<{ path: string; size: number; mtimeMs: number } | null> {
  if (!isDocumentId(id)) return null;
  const file = p("documents", "files", id);
  try {
    const st = await fs.stat(file);
    return st.isFile() ? { path: file, size: st.size, mtimeMs: st.mtimeMs } : null;
  } catch {
    return null;
  }
}

/**
 * Parse a `Range` header for a single byte range (RFC 9110 §14). Returns the inclusive range, "none" (no / ignored
 * header: serve the full body), or "unsatisfiable" (416). Multi-range requests are served in full (ignored).
 */
export function parseRange(header: string | null, size: number): { start: number; end: number } | "none" | "unsatisfiable" {
  if (!header) return "none";
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return "none";
  const [, a, b] = m;
  if (a === "" && b === "") return "none";
  if (size === 0) return "unsatisfiable";
  let start: number;
  let end: number;
  if (a === "") {
    const n = Number(b);
    if (!Number.isSafeInteger(n) || n === 0) return "unsatisfiable";
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(a);
    end = b === "" ? size - 1 : Math.min(Number(b), size - 1);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return "none";
    if (start >= size || end < start) return "unsatisfiable";
  }
  return { start, end };
}

/** Public projection of a document for the public pages (no uploader, hash or publication flag). */
export interface PublicDocument {
  id: string;
  scope: DocumentMeta["scope"];
  type: DocType;
  lang: DocumentMeta["lang"];
  title: L;
  date: string;
  fileName: string;
  size: number;
}

export const toPublicDocument = (d: DocumentMeta): PublicDocument => ({
  id: d.id, scope: d.scope, type: d.type, lang: d.lang, title: d.title, date: d.date, fileName: sanitizeFileName(d.fileName), size: d.size,
});

/** File bytes of a document, or null (bad id / missing file). */
export async function readDocumentFile(id: string): Promise<Uint8Array | null> {
  if (!isDocumentId(id)) return null;
  try {
    return new Uint8Array(await fs.readFile(p("documents", "files", id)));
  } catch {
    return null;
  }
}
