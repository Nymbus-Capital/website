/**
 * PUT /api/admin/content/funds/<key> { version, fund } — replace the admin content of one fund
 * (optimistic concurrency: 409 when `version` is not the stored version).
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateContent } from "@/lib/data/content";
import { audit } from "@/lib/data/store";
import type { FundContent, FundKey } from "@/lib/data/types";
import { getRun } from "@/lib/pipeline";
import { fail, isResponse, ok, parseJson } from "../../../_lib/http";
import { fundKeySchema, saveFundSchema } from "../../../_lib/schemas";
import { contentError } from "../../../_lib/save";
import { isPinnable } from "@/components/admin/summary";

export const dynamic = "force-dynamic";

/** Drop empty strings / empty L10n so the public page falls back to the registry defaults. */
function clean(f: FundContent): FundContent {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined) continue;
    if (typeof v === "string" && v === "") continue;
    if (v && typeof v === "object" && !Array.isArray(v) && "en" in v && "fr" in v) {
      const l = v as { en: string; fr: string };
      if (!l.en && !l.fr) continue;
    }
    if (Array.isArray(v) && v.length === 0) continue;
    if (k === "hide" && v && typeof v === "object") {
      const h = Object.fromEntries(Object.entries(v).filter(([, b]) => b === true));
      if (Object.keys(h).length === 0) continue;
      out[k] = h;
      continue;
    }
    out[k] = v;
  }
  return out as FundContent;
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const { key: rawKey } = await ctx.params;
  const k = fundKeySchema.safeParse(rawKey);
  if (!k.success) return fail(404, "not_found", "Unknown fund.");
  const key: FundKey = k.data as FundKey;
  const body = await parseJson(request, saveFundSchema);
  if (isResponse(body)) return body;

  const fund = clean(body.fund as FundContent);
  if (fund.pinnedSnapshot) {
    const run = await getRun(fund.pinnedSnapshot).catch(() => null);
    if (!run) return fail(400, "invalid_input", "fund.pinnedSnapshot: no such run.");
    if (!isPinnable(run.report, run.data)) {
      return fail(400, "invalid_input", "fund.pinnedSnapshot: only runs that were published (live data) can be pinned.");
    }
    if (!run.data.funds?.[key]) return fail(400, "invalid_input", "fund.pinnedSnapshot: this run has no data for the fund.");
  } else {
    delete fund.pinnedSnapshot;
  }
  try {
    let previous: FundContent | undefined;
    const saved = await updateContent(
      body.version,
      (cur) => {
        previous = cur.funds[key];
        return { ...cur, funds: { ...cur.funds, [key]: fund } };
      },
      user.email,
    );
    await audit({ by: user.email, action: "content.fund.save", target: key, detail: { version: saved.version, before: previous ?? null, after: fund } });
    return ok({ content: saved });
  } catch (e) {
    return contentError("content.fund", e);
  }
}
