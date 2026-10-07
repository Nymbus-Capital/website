/**
 * PATCH  /api/admin/inquiries/<id> { handled: boolean } — mark handled / open again
 * DELETE /api/admin/inquiries/<id>                      — delete the inquiry
 * Audited with the id only (never the sender's details).
 */
import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { deleteInquiry, isInquiryId, setInquiryHandled } from "@/lib/contact/store";
import { audit } from "@/lib/data/store";
import { fail, internalError, isResponse, ok, parseJson } from "../../_lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.strictObject({ handled: z.boolean() });

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!isInquiryId(id)) return fail(400, "invalid_id", "Invalid inquiry id.");
  const body = await parseJson(request, patchSchema, 1024);
  if (isResponse(body)) return body;
  try {
    const r = await setInquiryHandled(id, body.handled, user.email);
    if (!r) return fail(404, "not_found", "No such inquiry.");
    await audit({ by: user.email, action: body.handled ? "inquiry.handled" : "inquiry.reopened", target: id });
    return ok({ inquiry: r });
  } catch (e) {
    return internalError("inquiry.update", e);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!isInquiryId(id)) return fail(400, "invalid_id", "Invalid inquiry id.");
  try {
    const r = await deleteInquiry(id);
    if (!r) return fail(404, "not_found", "No such inquiry.");
    await audit({
      by: user.email,
      action: "inquiry.delete",
      target: id,
      detail: { receivedAt: r.receivedAt, handled: !!r.handled },
    });
    return ok({ deleted: id });
  } catch (e) {
    return internalError("inquiry.delete", e);
  }
}
