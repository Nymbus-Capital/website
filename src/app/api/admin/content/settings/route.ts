/** PUT /api/admin/content/settings { version, firm, publishMode } — firm-wide texts and the pipeline publish mode. */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateContent } from "@/lib/data/content";
import { audit } from "@/lib/data/store";
import type { L10n, SiteContent } from "@/lib/data/types";
import { isResponse, ok, parseJson } from "../../_lib/http";
import { saveSettingsSchema } from "../../_lib/schemas";
import { contentError } from "../../_lib/save";

export const dynamic = "force-dynamic";

const empty = (l: L10n | null | undefined) => !l || (!l.en && !l.fr);

export async function PUT(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const body = await parseJson(request, saveSettingsSchema);
  if (isResponse(body)) return body;
  const firm: SiteContent["firm"] = {};
  if (!empty(body.firm.aumLabel)) firm.aumLabel = body.firm.aumLabel;
  firm.announcement = empty(body.firm.announcement) ? null : body.firm.announcement!;
  if (!empty(body.firm.disclaimer)) firm.disclaimer = body.firm.disclaimer;
  try {
    let before: unknown;
    const saved = await updateContent(
      body.version,
      (cur) => {
        before = { firm: cur.firm, pipeline: cur.pipeline };
        return { ...cur, firm, pipeline: { ...cur.pipeline, publishMode: body.publishMode } };
      },
      user.email,
    );
    await audit({ by: user.email, action: "content.settings.save", detail: { version: saved.version, before, after: { firm, pipeline: saved.pipeline } } });
    return ok({ content: saved });
  } catch (e) {
    return contentError("content.settings", e);
  }
}
