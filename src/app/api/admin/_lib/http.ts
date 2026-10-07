/**
 * Shared helpers for the /api/admin route handlers: JSON responses, bounded body reading, zod validation.
 * (Folder prefixed with `_` so it is not routed.)
 */
import type { NextRequest } from "next/server";
import type { z } from "zod";

export const NO_STORE = { "Cache-Control": "no-store" } as const;

export const ok = (body: unknown, status = 200) => Response.json(body, { status, headers: NO_STORE });

export const fail = (status: number, error: string, message: string, details?: unknown) =>
  Response.json(details === undefined ? { error, message } : { error, message, details }, {
    status,
    headers: NO_STORE,
  });

/** Read at most `max` bytes of the request body; null when larger (without buffering the rest). */
export async function readBodyCapped(req: Request, max: number): Promise<Uint8Array | null> {
  const declared = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > max) return null;
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

/** Parse a JSON body (application/json, ≤ max bytes) against a zod schema. Returns the data or an error Response. */
export async function parseJson<S extends z.ZodType>(
  req: NextRequest,
  schema: S,
  max = 256 * 1024,
): Promise<z.infer<S> | Response> {
  const ct = (req.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  if (ct !== "application/json") return fail(415, "unsupported_media_type", "Expected application/json.");
  const buf = await readBodyCapped(req, max);
  if (!buf) return fail(413, "too_large", "Request body too large.");
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(buf));
  } catch {
    return fail(400, "invalid_json", "Malformed JSON body.");
  }
  return validate(schema, raw);
}

export function validate<S extends z.ZodType>(schema: S, raw: unknown): z.infer<S> | Response {
  const r = schema.safeParse(raw);
  if (!r.success) {
    const details = r.error.issues
      .slice(0, 20)
      .map((i) => ({ path: i.path.map(String).join("."), message: i.message }));
    return fail(
      400,
      "invalid_input",
      details.map((d) => (d.path ? `${d.path}: ${d.message}` : d.message)).join("; "),
      details,
    );
  }
  return r.data as z.infer<S>;
}

export const isResponse = (v: unknown): v is Response => v instanceof Response;

/** Log an unexpected error without leaking internals to the client. */
export function internalError(where: string, e: unknown): Response {
  console.error(`[admin] ${where}:`, e instanceof Error ? e.message : e);
  return fail(500, "internal_error", "Something went wrong on the server. The error was logged.");
}
