/** GET /api/documents/<id> — public download of a published document (see _serve.ts). */
import { serveDocument } from "../_serve";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  return serveDocument(request, (await ctx.params).id);
}

export async function HEAD(request: Request, ctx: Ctx) {
  return serveDocument(request, (await ctx.params).id, true);
}
