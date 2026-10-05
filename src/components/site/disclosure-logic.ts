/**
 * Pure logic of the collapsible disclosure box (src/components/site/Disclosure.tsx): which blocks collapse, the state
 * shown, the control's labels and which URL hashes open a box. Dependency-free, unit tested
 * (tests/unit/site/disclosure.test.ts).
 *
 * The decision to collapse is taken on the server from the text length (so the collapsed box is the server-rendered
 * default and nothing moves on hydration); the browser then only measures whether the text actually overflows the
 * collapsed height (wide screens), and drops the fade and the arrow when it does not — without changing any height.
 */

export type Lang = "en" | "fr";

/**
 * Below this many characters (of the ENGLISH text, so both languages behave the same) a block is a short note: rendered
 * as before, no box, no fade, no arrow. The blocks that use the box today are far above it (fund boilerplate ≥ 1,200,
 * footer ≈ 3,500), so none can fit the collapsed height even on the widest screen (≈ 7 lines × ≈ 170 characters):
 * the "fits" state is a fallback only (tests/unit/site/disclosure.test.ts).
 */
export const DISCLOSURE_MIN_CHARS = 600;

/**
 * Visible text length of a React node tree (strings and numbers; elements through their children). Each string is
 * whitespace-collapsed and trimmed on its own, so separators between elements are not counted: an estimate, used
 * only for the collapse decision, never for layout.
 */
export function textLength(node: unknown): number {
  if (node == null || typeof node === "boolean") return 0;
  if (typeof node === "string") return node.replace(/\s+/g, " ").trim().length;
  if (typeof node === "number" || typeof node === "bigint") return String(node).length;
  if (Array.isArray(node)) return node.reduce((n: number, c) => n + textLength(c), 0);
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return props ? textLength(props.children) : 0;
  }
  return 0;
}

/** Total length of a block's English texts (falsy entries = paragraphs not shown). */
export function enLength(texts: readonly (string | null | undefined | false)[]): number {
  return texts.reduce((n: number, t) => n + (t ? textLength(t) : 0), 0);
}

/** True when a block is a "wall of text" that gets the collapsed box. */
export function isCollapsible(length: number, minChars: number = DISCLOSURE_MIN_CHARS): boolean {
  return length >= minChars;
}

/**
 * State shown (the `data-disc` attribute): `plain` = short note (no box), `collapsed` = clipped with the fade and the
 * arrow, `fits` = the box at its collapsed height but the text fits (no fade, no arrow), `expanded` = full height.
 */
export type DiscState = "plain" | "collapsed" | "fits" | "expanded";

export function discState(collapsible: boolean, expanded: boolean, overflows: boolean): DiscState {
  if (!collapsible) return "plain";
  if (expanded) return "expanded";
  return overflows ? "collapsed" : "fits";
}

const LABELS: Record<Lang, { more: string; less: string }> = {
  en: { more: "Show full text", less: "Show less" },
  fr: { more: "Afficher le texte complet", less: "Réduire" },
};

/** Accessible name of the toggle button. */
export function toggleLabel(lang: Lang, expanded: boolean): string {
  const l = LABELS[lang] ?? LABELS.en;
  return expanded ? l.less : l.more;
}

/** The element id a URL hash points at ("#disclosure" → "disclosure"), or null. */
export function hashId(hash: string | null | undefined): string | null {
  if (!hash || hash.length < 2 || hash[0] !== "#") return null;
  try {
    return decodeURIComponent(hash.slice(1)) || null;
  } catch {
    return hash.slice(1);
  }
}

/** True when the hash names one of the box's own anchors (e.g. the fund page's "#disclosure" section around it). */
export function hashOpens(hash: string | null | undefined, anchors: readonly string[]): boolean {
  const id = hashId(hash);
  return id != null && anchors.includes(id);
}
