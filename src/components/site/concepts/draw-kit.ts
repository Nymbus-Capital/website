/**
 * draw-kit.ts — small canvas helpers shared by the /core-concepts engines: palette (light v3 keynote), Poppins
 * fonts, measured and fitted text (cached widths), rounded rectangles, glows without shadowBlur, the on-canvas
 * "ILLUSTRATION · generated values" mark. Framework-free.
 */
import { fitText } from "../fx/scan-model.ts";

export const SANS = `"Poppins", ui-sans-serif, system-ui, sans-serif`;

export const COL = {
  ink: "#1f1f1f", ink2: "#444746", mute: "#5f6368",
  blue: "#1a73e8", blueD: "#0b57d0", cyan: "#00a3e0", sky: "#4fd1ff",
  teal: "#0f9d8a", violet: "#6d5bd0", orange: "#c2410c", amber: "#e37400",
  slate: "#8a94a6", slateL: "#c9d2e0", line: "rgba(95,99,104,.16)",
};

export const rgba = (hex: string, a: number): string => {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
};

type Align = "left" | "center" | "right";

export interface Pen {
  font(weight: 400 | 500 | 600 | 700, size: number): void;
  /** sets the largest font size (≤ size, ≥ min, 0.5 px steps) at which `s` fits in `maxW`; returns that size */
  fit(s: string, maxW: number, weight: 400 | 500 | 600 | 700, size: number, min?: number): number;
  measure(s: string): number;
  text(s: string, x: number, y: number, maxW: number, align?: Align, color?: string): number;
  round(x: number, y: number, w: number, h: number, r: number): void;
  glowDot(x: number, y: number, r: number, color: string, k?: number): void;
  watermark(mark: string, W: number, H: number, pad: number): number;
  reset(): void;
}

export function makePen(ctx: CanvasRenderingContext2D): Pen {
  let widths = new Map<string, number>();
  const measure = (s: string): number => {
    const k = `${ctx.font}|${s}`;
    let v = widths.get(k);
    if (v === undefined) {
      if (widths.size > 1200) widths = new Map();
      v = ctx.measureText(s).width;
      widths.set(k, v);
    }
    return v;
  };
  return {
    font(weight, size) { ctx.font = `${weight} ${size}px ${SANS}`; },
    fit(s, maxW, weight, size, min = 8) {
      let z = size;
      ctx.font = `${weight} ${z}px ${SANS}`;
      while (z > min && measure(s) > maxW) {
        z = Math.max(min, z - 0.5);
        ctx.font = `${weight} ${z}px ${SANS}`;
      }
      return z;
    },
    measure,
    text(s, x, y, maxW, align = "left", color) {
      if (color) ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      const fitted = fitText(s, maxW, measure);
      ctx.fillText(fitted, x, y);
      return measure(fitted);
    },
    round(x, y, w, h, r) {
      ctx.beginPath();
      const rr = Math.max(0, Math.min(r, w / 2, h / 2));
      if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), rr); else ctx.rect(x, y, Math.max(0, w), Math.max(0, h));
    },
    glowDot(x, y, r, color, k = 1) {
      for (let h = 0; h < 3; h++) {
        ctx.fillStyle = rgba(color, (0.1 + h * 0.1) * k);
        ctx.beginPath(); ctx.arc(x, y, r * (3.2 - h * 0.9), 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    },
    watermark(mark, W, H, pad) {
      ctx.font = `600 10.5px ${SANS}`;
      ctx.fillStyle = COL.mute;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const s = fitText(mark, W - 2 * pad, measure);
      ctx.fillText(s, pad, H - 13);
      return measure(s);
    },
    reset() { widths = new Map(); },
  };
}

/** A label cut into two balanced lines at a space (null when it has no space). */
export function splitLabel(s: string): [string, string] | null {
  const parts = s.split(" ");
  if (parts.length < 2) return null;
  let best = 1, diff = Infinity;
  for (let k = 1; k < parts.length; k++) {
    const d = Math.abs(parts.slice(0, k).join(" ").length - parts.slice(k).join(" ").length);
    if (d < diff) { diff = d; best = k; }
  }
  return [parts.slice(0, best).join(" "), parts.slice(best).join(" ")];
}
