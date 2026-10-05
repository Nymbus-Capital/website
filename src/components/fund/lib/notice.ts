/**
 * The sentence a fund page shows instead of figures for the selected series: a young series (regulatory minimum of
 * months since its inception), a non-CAD series without distribution-aware returns, or "coming soon". Pure.
 */
import { T, tr, type L } from "../copy.ts";
import { dateLabel, type Lang } from "./format.ts";
import type { ClassNotice } from "./select.ts";

export function noticeText(notice: ClassNotice, lang: Lang): string {
  if (notice.kind === "young") {
    return tr(T.classes.young, lang).replace("{x}", notice.display).replace("{date}", dateLabel(notice.inception, lang, true)).replace("{n}", String(notice.minMonths));
  }
  return tr(T.classes.currency, lang).replace("{x}", notice.display).replace("{cur}", notice.currency);
}

/** What to say when the selected series shows no figure (`fallback` when nothing more specific is known). */
export function noFiguresText(ctx: { returnsSoon?: boolean; notice?: ClassNotice | null; options?: { fundserv: string; display: string }[]; selected?: string | null } | undefined, lang: Lang, fallback: L): string {
  if (ctx?.notice) return noticeText(ctx.notice, lang);
  const sel = ctx?.options?.find((o) => o.fundserv === ctx.selected) ?? null;
  return ctx?.returnsSoon && sel ? tr(T.classes.soon, lang).replace("{x}", sel.display) : tr(fallback, lang);
}
