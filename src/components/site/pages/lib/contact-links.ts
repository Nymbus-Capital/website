/**
 * Turns a contact line ("514-985-1138 or 1-833-227-2656 (toll-free)", "Email: compliance@nymbus.ca") into
 * text parts and links (tel:, mailto:). Pure, unit tested.
 */
export type Part = { text: string; href?: string };

// North American numbers written as 514-985-1138, 514 985-1138, 514‑985‑1138 (non-breaking hyphens) or 1-833-227-2656
const PHONE = /(?:1[\s‑-])?\d{3}[\s‑-]\d{3}[‑-]\d{4}/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

/** tel: href of a North American number in any of the written forms above. */
export function telHref(num: string): string {
  const d = num.replace(/\D/g, "");
  return `tel:+${d.length === 10 ? `1${d}` : d}`;
}

export function contactParts(line: string): Part[] {
  const hits: { start: number; end: number; href: string }[] = [];
  for (const m of line.matchAll(PHONE))
    hits.push({ start: m.index!, end: m.index! + m[0].length, href: telHref(m[0]) });
  for (const m of line.matchAll(EMAIL))
    hits.push({ start: m.index!, end: m.index! + m[0].length, href: `mailto:${m[0]}` });
  hits.sort((a, b) => a.start - b.start);
  const parts: Part[] = [];
  let at = 0;
  for (const h of hits) {
    if (h.start < at) continue;
    if (h.start > at) parts.push({ text: line.slice(at, h.start) });
    parts.push({ text: line.slice(h.start, h.end), href: h.href });
    at = h.end;
  }
  if (at < line.length) parts.push({ text: line.slice(at) });
  return parts;
}
