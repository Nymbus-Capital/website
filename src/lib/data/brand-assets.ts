/**
 * Official third-party brand assets (Morningstar logo and star-rating images, provider logos). We never draw look-alikes:
 * an asset is used only when the official file is present, either
 *
 *   - shipped with the build:   public/brand/third-party/<slot>.svg | .png | .webp   (served by Next as a static file)
 *   - uploaded in the admin:     brand/index.json + brand/files/<slot>.<ext> on the data volume (served by /api/brand/<slot>)
 *
 * The upload wins over the shipped file. When neither exists the pages render the rating / provider name as plain text.
 * Dependency-free (Node built-ins + relative `.ts` imports): validation and resolution are unit tested under plain Node.
 */
import crypto from "node:crypto";
import { promises as fs, readdirSync } from "node:fs";
import path from "node:path";
import { p, readJson, removePath, withLock, writeFileAtomic, writeJson } from "./store.ts";

export const BRAND_SLOTS = [
  "morningstar-logo",
  "morningstar-stars-1",
  "morningstar-stars-2",
  "morningstar-stars-3",
  "morningstar-stars-4",
  "morningstar-stars-5",
  "rbc-logo",
  "evestment-logo",
  "lseg-lipper-logo",
  "gmr-logo",
  "fundata-logo",
] as const;
type BrandSlot = (typeof BRAND_SLOTS)[number];
export const isBrandSlot = (s: unknown): s is BrandSlot =>
  typeof s === "string" && (BRAND_SLOTS as readonly string[]).includes(s);

/**
 * Former slot names (Fund Library is now Fundata, 2026-10-04): an upload stored under the old name keeps working — it is
 * listed, served and replaced as the new slot; its file stays at its old path until it is replaced or removed.
 */
const LEGACY_BRAND_SLOTS: Readonly<Record<string, BrandSlot>> = { "fundlibrary-logo": "fundata-logo" };
/** The current slot for a current or former slot name (null when unknown). */
export const toBrandSlot = (s: unknown): BrandSlot | null =>
  isBrandSlot(s) ? s : typeof s === "string" && Object.hasOwn(LEGACY_BRAND_SLOTS, s) ? LEGACY_BRAND_SLOTS[s] : null;

export const BRAND_SLOT_LABEL: Record<BrandSlot, string> = {
  "morningstar-logo": "Morningstar logo",
  "morningstar-stars-1": "Morningstar rating image, 1 star",
  "morningstar-stars-2": "Morningstar rating image, 2 stars",
  "morningstar-stars-3": "Morningstar rating image, 3 stars",
  "morningstar-stars-4": "Morningstar rating image, 4 stars",
  "morningstar-stars-5": "Morningstar rating image, 5 stars",
  "rbc-logo": "RBC Investor Services logo",
  "evestment-logo": "eVestment logo",
  "lseg-lipper-logo": "LSEG Lipper logo",
  "gmr-logo": "GMR logo",
  "fundata-logo": "Fundata logo (formerly Fund Library)",
};

type BrandType = "image/svg+xml" | "image/png" | "image/webp";
const EXT: Record<BrandType, string> = { "image/svg+xml": "svg", "image/png": "png", "image/webp": "webp" };
const TYPE_OF_EXT: Record<string, BrandType> = { svg: "image/svg+xml", png: "image/png", webp: "image/webp" };

/** slot → public URL of the official file (absent slot = no official asset: render text). */
export type BrandAssets = Partial<Record<BrandSlot, string>>;

export const MAX_BRAND_BYTES = 512 * 1024;

/* ------------------------------------------------------------------ validation (pure) */

const isPng = (b: Uint8Array) =>
  b.length > 8 &&
  b[0] === 0x89 &&
  b[1] === 0x50 &&
  b[2] === 0x4e &&
  b[3] === 0x47 &&
  b[4] === 0x0d &&
  b[5] === 0x0a &&
  b[6] === 0x1a &&
  b[7] === 0x0a;
const isWebp = (b: Uint8Array) =>
  b.length > 12 &&
  String.fromCharCode(...b.subarray(0, 4)) === "RIFF" &&
  String.fromCharCode(...b.subarray(8, 12)) === "WEBP";

/** Elements a plain vector logo needs. Anything else (script, animation, foreignObject, image, a, iframe, …) is refused. */
const SVG_ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "defs",
  "lineargradient",
  "radialgradient",
  "stop",
  "clippath",
  "mask",
  "pattern",
  "symbol",
  "use",
  "title",
  "desc",
  "text",
  "tspan",
  "style",
  "metadata",
]);
/** Attributes a plain vector logo needs (lower case). Event handlers, xml:base, external references are not in the list. */
const SVG_ATTRS = new Set([
  "xmlns",
  "xmlns:xlink",
  "version",
  "id",
  "class",
  "style",
  "viewbox",
  "preserveaspectratio",
  "x",
  "y",
  "width",
  "height",
  "d",
  "points",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x1",
  "y1",
  "x2",
  "y2",
  "fx",
  "fy",
  "dx",
  "dy",
  "offset",
  "transform",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "opacity",
  "clip-path",
  "clip-rule",
  "clippathunits",
  "mask",
  "maskunits",
  "maskcontentunits",
  "stop-color",
  "stop-opacity",
  "gradientunits",
  "gradienttransform",
  "spreadmethod",
  "patternunits",
  "patterncontentunits",
  "patterntransform",
  "href",
  "xlink:href",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-anchor",
  "letter-spacing",
  "word-spacing",
  "dominant-baseline",
  "xml:space",
  "data-name",
  "display",
  "visibility",
  "overflow",
  "enable-background",
  "isolation",
  "mix-blend-mode",
  "role",
  "aria-label",
  "aria-hidden",
  "focusable",
  "type",
  "media",
]);

/** A CSS value / stylesheet is refused when it could fetch, escape or execute anything. */
function cssProblem(css: string): string | null {
  if (/\\/.test(css)) return "uses an escape sequence in a style";
  if (/@import|@font-face|@namespace/i.test(css)) return "imports a stylesheet or font";
  if (/image-set\(|expression\(|-moz-binding|behavior\s*:/i.test(css)) return "uses an unsafe style function";
  if (/url\(\s*["']?\s*(?!#)/i.test(css)) return "references an external resource in a style";
  if (/javascript:/i.test(css)) return "contains a javascript: URL";
  return null;
}

/**
 * An SVG is accepted only when it is plain vector artwork, checked against an allow-list of elements and attributes:
 * no DOCTYPE / entities / CDATA, no script, animation, foreign or embedded content, no event handler, no reference
 * outside the file (href only to a local #id), no style that imports, escapes or fetches. A file that fails is refused,
 * never modified: the official file must be uploaded as delivered, or exported as PNG.
 */
export function svgProblem(text: string): string | null {
  let t = text.replace(/^﻿/, "");
  if (!/<svg[\s>]/i.test(t)) return "not an SVG document";
  if (/<!(?!--)/.test(t)) return "has a DOCTYPE, entity or CDATA section";
  if (/javascript:/i.test(t)) return "contains a javascript: URL";
  t = t.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*<\?xml[^?]*\?>/, "");
  if (/<\?/.test(t)) return "has a processing instruction";
  // style sheets: checked as CSS, then removed so their text is not parsed as markup
  for (const m of t.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) {
    const why = cssProblem(m[1]);
    if (why) return why;
    if (/</.test(m[1])) return "has markup inside a style";
  }
  t = t.replace(/(<style\b[^>]*>)[\s\S]*?(<\/style\s*>)/gi, "$1$2");
  const tag =
    /<\s*(\/?)\s*([A-Za-z][\w:.-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)\s*>/g;
  let rest = "";
  let last = 0;
  for (const m of t.matchAll(tag)) {
    rest += t.slice(last, m.index);
    last = (m.index ?? 0) + m[0].length;
    const name = m[2].toLowerCase();
    if (!SVG_ELEMENTS.has(name)) return `uses the element <${m[2]}>`;
    if (m[1]) continue;
    for (const a of m[3].matchAll(/([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      const attr = a[1].toLowerCase();
      const value = a[3] ?? a[4] ?? a[5] ?? "";
      if (!SVG_ATTRS.has(attr)) return `uses the attribute ${a[1]}`;
      if ((attr === "href" || attr === "xlink:href") && !/^\s*#[\w.-]+\s*$/.test(value))
        return "references an external resource";
      if (attr === "style") {
        const why = cssProblem(value);
        if (why) return why;
      }
      if (/url\(\s*["']?\s*(?!#)/i.test(value)) return "references an external resource";
    }
  }
  rest += t.slice(last);
  if (/[<>]/.test(rest)) return "has malformed markup";
  return null;
}

type BrandCheck = { ok: true; type: BrandType } | { ok: false; status: 400 | 413 | 415; message: string };

export function validateBrandImage(bytes: Uint8Array): BrandCheck {
  if (bytes.length === 0) return { ok: false, status: 400, message: "The file is empty." };
  if (bytes.length > MAX_BRAND_BYTES) return { ok: false, status: 413, message: "The image is larger than 512 KB." };
  if (isPng(bytes)) return { ok: true, type: "image/png" };
  if (isWebp(bytes)) return { ok: true, type: "image/webp" };
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, status: 415, message: "Only PNG, WebP or SVG images are accepted." };
  }
  const why = svgProblem(text);
  if (why)
    return {
      ok: false,
      status: 415,
      message:
        why === "not an SVG document"
          ? "Only PNG, WebP or SVG images are accepted."
          : `SVG refused: ${why}. Upload the official file as delivered, or a PNG export.`,
    };
  return { ok: true, type: "image/svg+xml" };
}

/** Headers of a served brand image: exact type, no sniffing, an SVG cannot run anything even when opened directly. */
export function brandHeaders(type: BrandType, sha: string): Record<string, string> {
  return {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cache-Control": "public, no-cache",
    ETag: `"${sha}"`,
  };
}

/* ------------------------------------------------------------------ shipped files (public/brand/third-party) */

const STATIC_BRAND_DIR = ["public", "brand", "third-party"];

/** slot → URL of the shipped files in `dir` (first match in svg, png, webp order). */
export function staticBrandAssets(dir: string = path.join(process.cwd(), ...STATIC_BRAND_DIR)): BrandAssets {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return {};
  }
  const out: BrandAssets = {};
  for (const slot of BRAND_SLOTS) {
    for (const ext of ["svg", "png", "webp"]) {
      if (names.includes(`${slot}.${ext}`)) {
        out[slot] = `/brand/third-party/${slot}.${ext}`;
        break;
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ uploaded files (data volume) */

interface BrandMeta {
  slot: BrandSlot;
  type: BrandType;
  size: number;
  sha256: string;
  uploadedBy: string;
  uploadedAt: string;
  /** former slot name the file was stored under (LEGACY_BRAND_SLOTS); absent for current uploads */
  storedAs?: string;
}

const INDEX = ["brand", "index.json"];
const fileRel = (slot: string, type: BrandType) => ["brand", "files", `${slot}.${EXT[type]}`];
const metaFile = (m: BrandMeta) => fileRel(m.storedAs ?? m.slot, m.type);

/** Uploaded assets, former slot names mapped to the current slot (a current upload wins over a legacy one). */
export async function listUploadedBrand(): Promise<BrandMeta[]> {
  const all = await readJson<BrandMeta[]>(INDEX, []);
  if (!Array.isArray(all)) return [];
  const valid = all.filter((m) => m && !!TYPE_OF_EXT[EXT[m.type] ?? ""]);
  const current = valid.filter((m) => isBrandSlot(m.slot));
  const legacy = valid
    .filter((m) => !isBrandSlot(m.slot) && toBrandSlot(m.slot))
    .map((m) => ({ ...m, slot: toBrandSlot(m.slot) as BrandSlot, storedAs: m.slot as string }))
    .filter((m) => !current.some((c) => c.slot === m.slot));
  return [...current, ...legacy];
}

/** An index entry as written back to disk: a legacy entry keeps its former slot name (its file's name). */
const stored = (m: BrandMeta): BrandMeta | (Omit<BrandMeta, "slot" | "storedAs"> & { slot: string }) => {
  if (!m.storedAs) return m;
  const { storedAs, ...rest } = m;
  return { ...rest, slot: storedAs };
};

export async function saveBrandAsset(
  slot: BrandSlot,
  bytes: Uint8Array,
  type: BrandType,
  by: string,
): Promise<BrandMeta> {
  const r = await withLock(
    "brand",
    async () => {
      const all = await listUploadedBrand();
      const prev = all.find((m) => m.slot === slot);
      const meta: BrandMeta = {
        slot,
        type,
        size: bytes.length,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
        uploadedBy: by,
        uploadedAt: new Date().toISOString(),
      };
      // new file, then the index pointing at it, and only then the old file of another type: a reader never sees an
      // index entry without its file
      await writeFileAtomic(fileRel(slot, type), bytes);
      await writeJson(INDEX, [...all.filter((m) => m.slot !== slot).map(stored), meta]);
      if (prev && (prev.storedAs || prev.type !== type)) await removePath(metaFile(prev)).catch(() => undefined);
      return meta;
    },
    60_000,
  );
  if ("locked" in r) throw new Error("Another brand upload is in progress; try again.");
  return r;
}

export async function deleteBrandAsset(slot: BrandSlot): Promise<BrandMeta | null> {
  const r = await withLock(
    "brand",
    async () => {
      const all = await listUploadedBrand();
      const prev = all.find((m) => m.slot === slot) ?? null;
      if (!prev) return null;
      await removePath(metaFile(prev));
      await writeJson(INDEX, all.filter((m) => m.slot !== slot).map(stored));
      return prev;
    },
    60_000,
  );
  if (r && "locked" in r) throw new Error("Another brand upload is in progress; try again.");
  return r as BrandMeta | null;
}

export async function uploadedBrandFile(
  slot: BrandSlot,
): Promise<{ meta: BrandMeta; path: string; size: number } | null> {
  const meta = (await listUploadedBrand()).find((m) => m.slot === slot);
  if (!meta) return null;
  try {
    const full = p(...metaFile(meta));
    const st = await fs.stat(full);
    return st.isFile() ? { meta, path: full, size: st.size } : null;
  } catch {
    return null;
  }
}

/** Every available official asset: uploaded (versioned URL) over shipped. Never throws (assets are optional). */
export async function resolveBrandAssets(): Promise<BrandAssets> {
  const out: BrandAssets = { ...staticBrandAssets() };
  try {
    for (const m of await listUploadedBrand()) out[m.slot] = `/api/brand/${m.slot}?v=${m.sha256.slice(0, 12)}`;
  } catch {
    /* a broken index only loses the uploads */
  }
  return out;
}
