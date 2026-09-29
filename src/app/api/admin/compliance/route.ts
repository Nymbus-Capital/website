/**
 * POST /api/admin/compliance { version, textsHash, confirm: true } — record that compliance reviewed the current
 * disclaimer texts. `textsHash` must equal the server-computed hash (the reviewer approves what the server shows,
 * not a stale page); content version check → 409 on conflict. Audited.
 */
import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getContent, updateContent } from "@/lib/data/content";
import { audit } from "@/lib/data/store";
import { currentDisclaimersHash } from "@/components/admin/compliance";
import { fail, isResponse, ok, parseJson } from "../_lib/http";
import { contentError } from "../_lib/save";

export const dynamic = "force-dynamic";

const schema = z.strictObject({
  version: z.number().int().min(0),
  textsHash: z.string().regex(/^[0-9a-f]{16}$/),
  confirm: z.literal(true),
});

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const body = await parseJson(request, schema, 1024);
  if (isResponse(body)) return body;
  try {
    const current = currentDisclaimersHash(await getContent());
    if (body.textsHash !== current) return fail(409, "texts_changed", "The disclaimer texts changed since the page was loaded. Reload and review them again.");
    const saved = await updateContent(
      body.version,
      (c) => {
        if (currentDisclaimersHash(c) !== body.textsHash) throw new Error("texts changed");
        return { ...c, compliance: { approvedAt: new Date().toISOString(), approvedBy: user.email, textsHash: body.textsHash } };
      },
      user.email,
    );
    await audit({ by: user.email, action: "compliance.disclaimers.reviewed", detail: { textsHash: body.textsHash, version: saved.version } });
    return ok({ content: saved });
  } catch (e) {
    if (e instanceof Error && e.message === "texts changed") return fail(409, "texts_changed", "The disclaimer texts changed; reload and review again.");
    return contentError("compliance", e);
  }
}
