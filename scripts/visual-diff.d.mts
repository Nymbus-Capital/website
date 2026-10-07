// visual-diff.d.mts — types of scripts/visual-diff.mjs for the unit tests
export interface Pixels {
  width: number;
  height: number;
  rgba: Buffer;
}
export function decodePng(buf: Buffer): Pixels;
export function encodePng(img: Pixels): Buffer;
export function comparePixels(
  a: Pixels,
  b: Pixels,
  tolerance?: number,
): { changed: number; box: { x: number; y: number; w: number; h: number } | null; mask: Buffer };
export function main(argv: string[]): number;
