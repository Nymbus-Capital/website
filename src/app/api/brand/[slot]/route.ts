/**
 * GET / HEAD /api/brand/<slot> — an official third-party brand image uploaded in the admin (src/lib/data/brand-assets.ts).
 * Exact stored type + nosniff + a sandboxing CSP (an SVG opened directly runs nothing), strong ETag. Anything else → 404.
 * Not matched by the proxy (like /api/documents): the response sets its own CSP.
 */
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { brandHeaders, isBrandSlot, uploadedBrandFile } from "@/lib/data/brand-assets";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slot: string }> };

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

async function serve(request: Request, ctx: Ctx, head: boolean): Promise<Response> {
  const { slot } = await ctx.params;
  if (!isBrandSlot(slot)) return notFound();
  const f = await uploadedBrandFile(slot).catch(() => null);
  if (!f) return notFound();
  const headers: Record<string, string> = { ...brandHeaders(f.meta.type, f.meta.sha256), "Content-Length": String(f.size) };
  const inm = request.headers.get("if-none-match");
  if (inm && inm.split(",").map((s) => s.trim().replace(/^W\//, "")).some((t) => t === headers.ETag || t === "*")) return new Response(null, { status: 304, headers });
  if (head) return new Response(null, { status: 200, headers });
  const stream = createReadStream(f.path);
  request.signal?.addEventListener("abort", () => stream.destroy(), { once: true });
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>, { status: 200, headers });
}

export async function GET(request: Request, ctx: Ctx) {
  return serve(request, ctx, false);
}

export async function HEAD(request: Request, ctx: Ctx) {
  return serve(request, ctx, true);
}
