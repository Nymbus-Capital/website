/**
 * POST /api/admin/upload/brand (multipart: slot + file) — upload an official third-party brand image (PNG, WebP or a
 * plain SVG, ≤ 512 KB) for a slot of src/lib/data/brand-assets.ts. Under /api/admin/upload/ (not matched by the proxy):
 * requireAdmin() does session + policy + CSRF before the body is read.
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { isBrandSlot, MAX_BRAND_BYTES, saveBrandAsset, validateBrandImage } from "@/lib/data/brand-assets";
import { audit } from "@/lib/data/store";
import { fail, internalError, ok, readBodyCapped } from "../../_lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const ct = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(ct)) return fail(415, "unsupported_media_type", "Expected multipart/form-data.");
  const buf = await readBodyCapped(request, MAX_BRAND_BYTES + 16 * 1024);
  if (!buf) return fail(413, "too_large", "The image is larger than 512 KB.");
  let form: FormData;
  try {
    form = await new Response(buf as BodyInit, { headers: { "content-type": ct } }).formData();
  } catch {
    return fail(400, "invalid_form", "Malformed multipart body.");
  }
  const slot = form.get("slot");
  if (!isBrandSlot(slot)) return fail(400, "invalid_input", "slot: unknown brand asset slot.");
  const file = form.get("file");
  if (!file || typeof file === "string") return fail(400, "invalid_input", "file: an image is required.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = validateBrandImage(bytes);
  if (!check.ok) return fail(check.status, check.status === 413 ? "too_large" : check.status === 415 ? "unsupported_image" : "invalid_input", check.message);
  try {
    const meta = await saveBrandAsset(slot, bytes, check.type, user.email);
    await audit({ by: user.email, action: "brand.upload", target: slot, detail: { type: meta.type, size: meta.size, sha256: meta.sha256 } });
    return ok({ asset: meta }, 201);
  } catch (e) {
    return internalError("brand.upload", e);
  }
}
