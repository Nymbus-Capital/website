/** GET /api/documents/<id>/<name> — same as /api/documents/<id>; the name is cosmetic (nice URLs / save-as). */
import { serveDocument } from "../../_serve";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; name: string }> };

export async function GET(request: Request, ctx: Ctx) {
  return serveDocument(request, (await ctx.params).id);
}

export async function HEAD(request: Request, ctx: Ctx) {
  return serveDocument(request, (await ctx.params).id, true);
}
