/** DELETE /api/admin/brand/<slot> — remove an uploaded brand image (the page falls back to the shipped file, else text). */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { deleteBrandAsset, isBrandSlot } from "@/lib/data/brand-assets";
import { audit } from "@/lib/data/store";
import { fail, internalError, ok } from "../../_lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slot: string }> };

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { slot } = await ctx.params;
  if (!isBrandSlot(slot)) return fail(400, "invalid_input", "Unknown brand asset slot.");
  try {
    const d = await deleteBrandAsset(slot);
    if (!d) return fail(404, "not_found", "No uploaded image for this slot.");
    await audit({ by: user.email, action: "brand.delete", target: slot, detail: { sha256: d.sha256 } });
    return ok({ deleted: slot });
  } catch (e) {
    return internalError("brand.delete", e);
  }
}
