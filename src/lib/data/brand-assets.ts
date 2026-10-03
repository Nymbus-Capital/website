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
  "morningstar-logo", "morningstar-stars-1", "morningstar-stars-2", "morningstar-stars-3", "morningstar-stars-4", "morningstar-stars-5",
  "rbc-logo", "evestment-logo", "lseg-lipper-logo", "gmr-logo", "fundlibrary-logo",
] as const;
export type BrandSlot = (typeof BRAND_SLOTS)[number];
export const isBrandSlot = (s: unknown): s is BrandSlot => typeof s === "string" && (BRAND_SLOTS as readonly string[]).includes(s);

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
  "fundlibrary-logo": "Fund Library logo",
};

export type BrandType = "image/svg+xml" | "image/png" | "image/webp";
const EXT: Record<BrandType, string> = { "image/svg+xml": "svg", "image/png": "png", "image/webp": "webp" };
const TYPE_OF_EXT: Record<string, BrandType> = { svg: "image/svg+xml", png: "image/png", webp: "image/webp" };

/** slot → public URL of the official file (absent slot = no official asset: render text). */
export type BrandAssets = Partial<Record<BrandSlot, string>>;

export const MAX_BRAND_BYTES = 512 * 1024;

/* ------------------------------------------------------------------ validation (pure) */

const isPng = (b: Uint8Array) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a;
const isWebp = (b: Uint8Array) => b.length > 12 && String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP";

/**
 * An SVG is accepted only when it is plain vector artwork: no script, event handler, foreign object, embedded document,
 * external reference (href / url() to anything but a local #id or an inline raster), entity declaration or styles that
 * import. Rejected, never "cleaned": the official file must be uploaded as delivered, or exported as PNG.
 */
export function svgProblem(text: string): string | null {
  const t = text.replace(/^﻿/, "");
  if (!/<svg[\s>]/i.test(t)) return "not an SVG document";
  const rules: [RegExp, string][] = [
    [/<script/i, "contains a script"],
    [/<!ENTITY/i, "declares entities"],
    [/<!DOCTYPE[^>]*\[/i, "has an internal DTD"],
    [/<(foreignObject|iframe|embed|object|audio|video|use\b[^>]*href\s*=\s*["'](?!#))/i, "embeds external or foreign content"],
    [/\son[a-z]+\s*=/i, "has an event handler attribute"],
    [/javascript:/i, "contains a javascript: URL"],
    [/(xlink:)?href\s*=\s*["']\s*(?!#|data:image\/(png|jpeg|webp);base64,)/i, "references an external resource"],
    [/url\(\s*["']?\s*(?!#)/i, "references an external resource in a style"],
    [/@import/i, "imports a stylesheet"],
  ];
  for (const [re, why] of rules) if (re.test(t)) return why;
  return null;
}

export type BrandCheck = { ok: true; type: BrandType } | { ok: false; status: 400 | 413 | 415; message: string };

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
  if (why) return { ok: false, status: 415, message: why === "not an SVG document" ? "Only PNG, WebP or SVG images are accepted." : `SVG refused: ${why}. Upload the official file as delivered, or a PNG export.` };
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

export const STATIC_BRAND_DIR = ["public", "brand", "third-party"];

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

export interface BrandMeta { slot: BrandSlot; type: BrandType; size: number; sha256: string; uploadedBy: string; uploadedAt: string }

const INDEX = ["brand", "index.json"];
const fileRel = (slot: BrandSlot, type: BrandType) => ["brand", "files", `${slot}.${EXT[type]}`];

export async function listUploadedBrand(): Promise<BrandMeta[]> {
  const all = await readJson<BrandMeta[]>(INDEX, []);
  return Array.isArray(all) ? all.filter((m) => isBrandSlot(m?.slot) && !!TYPE_OF_EXT[EXT[m.type] ?? ""]) : [];
}

export async function saveBrandAsset(slot: BrandSlot, bytes: Uint8Array, type: BrandType, by: string): Promise<BrandMeta> {
  const r = await withLock("brand", async () => {
    const all = await listUploadedBrand();
    const prev = all.find((m) => m.slot === slot);
    const meta: BrandMeta = { slot, type, size: bytes.length, sha256: crypto.createHash("sha256").update(bytes).digest("hex"), uploadedBy: by, uploadedAt: new Date().toISOString() };
    await writeFileAtomic(fileRel(slot, type), bytes);
    if (prev && prev.type !== type) await removePath(fileRel(slot, prev.type));
    await writeJson(INDEX, [...all.filter((m) => m.slot !== slot), meta]);
    return meta;
  }, 60_000);
  if ("locked" in r) throw new Error("Another brand upload is in progress; try again.");
  return r;
}

export async function deleteBrandAsset(slot: BrandSlot): Promise<BrandMeta | null> {
  const r = await withLock("brand", async () => {
    const all = await listUploadedBrand();
    const prev = all.find((m) => m.slot === slot) ?? null;
    if (!prev) return null;
    await removePath(fileRel(slot, prev.type));
    await writeJson(INDEX, all.filter((m) => m.slot !== slot));
    return prev;
  }, 60_000);
  if (r && "locked" in r) throw new Error("Another brand upload is in progress; try again.");
  return r as BrandMeta | null;
}

export async function uploadedBrandFile(slot: BrandSlot): Promise<{ meta: BrandMeta; path: string; size: number } | null> {
  const meta = (await listUploadedBrand()).find((m) => m.slot === slot);
  if (!meta) return null;
  try {
    const full = p(...fileRel(slot, meta.type));
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

/** The asset slots a Morningstar rating of `stars` needs: logo + the matching rating image. */
export const morningstarSlots = (stars: number): BrandSlot[] => ["morningstar-logo", `morningstar-stars-${stars}` as BrandSlot];
