#!/usr/bin/env node
// visual-diff.mjs — compare two folders of PNG screenshots pixel by pixel (no dependencies).
//
// Usage: node scripts/visual-diff.mjs <before-dir> <after-dir> [--max-ratio=0] [--tolerance=0] [--out=<dir>]
//   --max-ratio  share of changed pixels (0-1) allowed per image before it counts as changed (default 0: any pixel;
//                refactor proofs use 0)
//   --tolerance  per-channel difference (0-255) ignored when comparing two pixels (default 0: exact)
//   --out        write a diff mask (changed pixels in red over a faded copy) per changed image
// Exit code 1 when an image changed beyond --max-ratio, has a different size, or exists on one side only; 2 on bad usage.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateSync, deflateSync } from "node:zlib";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

/** Decode an 8-bit, non-interlaced PNG into { width, height, rgba }. */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error("not a PNG");
  let width = 0,
    height = 0,
    depth = 0,
    colorType = 0,
    interlace = 0,
    palette = null,
    alpha = null;
  const idat = [];
  for (let at = 8; at < buf.length;) {
    const len = buf.readUInt32BE(at);
    const type = buf.toString("latin1", at + 4, at + 8);
    const data = buf.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "PLTE") palette = data;
    else if (type === "tRNS") {
      if (colorType !== 3) throw new Error(`unsupported PNG (tRNS transparency key on colour type ${colorType})`);
      alpha = data;
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    at += 12 + len;
  }
  if (depth !== 8 || interlace !== 0 || !(colorType in CHANNELS)) {
    throw new Error(`unsupported PNG (bit depth ${depth}, colour type ${colorType}, interlace ${interlace})`);
  }
  const bpp = CHANNELS[colorType];
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw new Error(`corrupt PNG (filter type ${filter} on row ${y})`);
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[dst + x - bpp] : 0;
      const b = y > 0 ? px[dst + x - stride] : 0;
      const c = x >= bpp && y > 0 ? px[dst + x - stride - bpp] : 0;
      let v = raw[src + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c,
          pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[dst + x] = v & 255;
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++, j += bpp) {
    let r,
      g,
      b,
      a = 255;
    if (colorType === 0) r = g = b = px[j];
    else if (colorType === 4) {
      r = g = b = px[j];
      a = px[j + 1];
    } else if (colorType === 2) {
      r = px[j];
      g = px[j + 1];
      b = px[j + 2];
    } else if (colorType === 6) {
      r = px[j];
      g = px[j + 1];
      b = px[j + 2];
      a = px[j + 3];
    } else {
      const k = px[j];
      r = palette[k * 3];
      g = palette[k * 3 + 1];
      b = palette[k * 3 + 2];
      a = alpha && k < alpha.length ? alpha[k] : 255;
    }
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = a;
  }
  return { width, height, rgba };
}

/** Encode RGBA pixels as a PNG (used for the diff masks). */
export function encodePng({ width, height, rgba }) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (b) => {
    let c = 0xffffffff;
    for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, "latin1");
    data.copy(out, 8);
    out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Count the pixels whose channels differ by more than `tolerance`; returns the count and their bounding box. */
export function comparePixels(a, b, tolerance = 0) {
  let changed = 0,
    minX = Infinity,
    minY = Infinity,
    maxX = -1,
    maxY = -1;
  const mask = Buffer.alloc(a.rgba.length);
  for (let i = 0; i < a.width * a.height; i++) {
    const o = i * 4;
    const diff = Math.max(
      Math.abs(a.rgba[o] - b.rgba[o]),
      Math.abs(a.rgba[o + 1] - b.rgba[o + 1]),
      Math.abs(a.rgba[o + 2] - b.rgba[o + 2]),
      Math.abs(a.rgba[o + 3] - b.rgba[o + 3]),
    );
    if (diff > tolerance) {
      changed++;
      const x = i % a.width,
        y = (i / a.width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      mask[o] = 255;
      mask[o + 3] = 255;
    } else {
      const grey = 255 - (255 - (a.rgba[o] + a.rgba[o + 1] + a.rgba[o + 2]) / 3) * 0.25;
      mask[o] = mask[o + 1] = mask[o + 2] = grey;
      mask[o + 3] = 255;
    }
  }
  return { changed, box: changed ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null, mask };
}

function pngFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".png")) out.push(relative(dir, p));
    }
  };
  walk(dir);
  return out.sort();
}

export function main(argv) {
  const flagArgs = argv.filter((a) => a.startsWith("--"));
  const flags = Object.fromEntries(
    flagArgs.map((a) =>
      a.includes("=") ? [a.slice(2, a.indexOf("=")), a.slice(a.indexOf("=") + 1)] : [a.slice(2), ""],
    ),
  );
  const [before, after] = argv.filter((a) => !a.startsWith("--"));
  if (!before || !after) {
    console.error(
      "usage: node scripts/visual-diff.mjs <before-dir> <after-dir> [--max-ratio=0] [--tolerance=0] [--out=<dir>]",
    );
    return 2;
  }
  const num = (v, dflt) => (v === undefined ? dflt : v === "" ? NaN : Number(v));
  const maxRatio = num(flags["max-ratio"], 0);
  const tolerance = num(flags.tolerance, 0);
  const known = new Set(["max-ratio", "tolerance", "out"]);
  const unknown = Object.keys(flags).filter((k) => !known.has(k));
  if (
    unknown.length ||
    !Number.isFinite(maxRatio) ||
    maxRatio < 0 ||
    maxRatio > 1 ||
    !Number.isInteger(tolerance) ||
    tolerance < 0 ||
    tolerance > 255 ||
    ("out" in flags && !flags.out)
  ) {
    console.error(
      `invalid options${unknown.length ? ` (unknown: ${unknown.join(", ")})` : ""}: --max-ratio is 0-1, --tolerance an integer 0-255, --out a directory`,
    );
    return 2;
  }
  const a = new Set(pngFiles(before));
  const b = new Set(pngFiles(after));
  let failures = 0;
  const rows = [];
  for (const name of [...new Set([...a, ...b])].sort()) {
    if (!a.has(name) || !b.has(name)) {
      failures++;
      rows.push([name, a.has(name) ? "only in before" : "only in after"]);
      continue;
    }
    const bufA = readFileSync(join(before, name));
    const bufB = readFileSync(join(after, name));
    if (bufA.equals(bufB)) {
      rows.push([name, "identical (same bytes)"]);
      continue;
    }
    const pa = decodePng(bufA);
    const pb = decodePng(bufB);
    if (pa.width !== pb.width || pa.height !== pb.height) {
      failures++;
      rows.push([name, `size ${pa.width}x${pa.height} -> ${pb.width}x${pb.height}`]);
      continue;
    }
    const { changed, box, mask } = comparePixels(pa, pb, tolerance);
    const ratio = changed / (pa.width * pa.height);
    const over = ratio > maxRatio;
    if (over) failures++;
    const where = box ? ` in ${box.w}x${box.h} at (${box.x},${box.y})` : "";
    rows.push([
      name,
      changed
        ? `${over ? "CHANGED" : "within tolerance"}: ${changed} px (${(ratio * 100).toFixed(4)} %)${where}`
        : "identical (pixels)",
    ]);
    if (changed && flags.out) {
      mkdirSync(flags.out, { recursive: true });
      writeFileSync(
        join(flags.out, name.replace(/[\\/]/g, "__")),
        encodePng({ width: pa.width, height: pa.height, rgba: mask }),
      );
    }
  }
  const width = Math.max(...rows.map((r) => r[0].length), 10);
  for (const [name, verdict] of rows) console.log(`${name.padEnd(width)}  ${verdict}`);
  console.log(`\n${rows.length} image(s), ${failures} changed beyond ${maxRatio * 100} % (tolerance ${tolerance})`);
  return failures ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main(process.argv.slice(2));
