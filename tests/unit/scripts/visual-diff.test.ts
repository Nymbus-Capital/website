// visual-diff.test.ts — the dependency-free PNG decoder and the option checks of scripts/visual-diff.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateSync, deflateSync } from "node:zlib";
import { comparePixels, decodePng, encodePng, main } from "../../../scripts/visual-diff.mjs";

const image = (w: number, h: number, f: (x: number, y: number) => number[]) => {
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) rgba.set(f(x, y), (y * w + x) * 4);
  return { width: w, height: h, rgba };
};

/** Rewrite the IDAT of a PNG produced by encodePng (single IDAT) and recompute nothing but the payload. */
function withChunk(png: Buffer, type: string, edit: (data: Buffer) => Buffer): Buffer {
  const out: Buffer[] = [png.subarray(0, 8)];
  for (let at = 8; at < png.length;) {
    const len = png.readUInt32BE(at);
    const t = png.toString("latin1", at + 4, at + 8);
    let data = png.subarray(at + 8, at + 8 + len);
    if (t === type) data = edit(Buffer.from(data));
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(t, 4, "latin1");
    out.push(head, data, Buffer.alloc(4)); // the decoder does not check CRCs
    at += 12 + len;
  }
  return Buffer.concat(out);
}

test("decode(encode(x)) gives back the same pixels", () => {
  const img = image(7, 5, (x, y) => [x * 30, y * 50, (x + y) * 10, 255 - x]);
  const back = decodePng(encodePng(img));
  assert.equal(back.width, 7);
  assert.equal(back.height, 5);
  assert.ok(back.rgba.equals(img.rgba));
  assert.equal(comparePixels(img, back).changed, 0);
});

test("one changed pixel is counted with its box", () => {
  const a = image(4, 4, () => [10, 20, 30, 255]);
  const b = image(4, 4, (x, y) => (x === 2 && y === 1 ? [11, 20, 30, 255] : [10, 20, 30, 255]));
  const r = comparePixels(a, b);
  assert.equal(r.changed, 1);
  assert.deepEqual(r.box, { x: 2, y: 1, w: 1, h: 1 });
  assert.equal(comparePixels(a, b, 1).changed, 0, "within the per-channel tolerance");
});

test("a filter byte above 4 is a corrupt file, not a silent mis-decode", () => {
  const png = encodePng(image(2, 2, () => [1, 2, 3, 255]));
  const bad = withChunk(png, "IDAT", (d) => {
    const raw = inflateSync(d);
    raw[0] = 7;
    return deflateSync(raw);
  });
  assert.throws(() => decodePng(bad), /filter type 7/);
});

test("a tRNS key on a truecolour image is refused (its transparency would be ignored)", () => {
  const png = encodePng(image(1, 1, () => [0, 0, 0, 255]));
  const ihdrEnd = 8 + 12 + 13;
  const trns = Buffer.alloc(12 + 6);
  trns.writeUInt32BE(6, 0);
  trns.write("tRNS", 4, "latin1");
  const rgb = withChunk(png, "IHDR", (d) => {
    d[9] = 2;
    return d;
  }); // colour type 2 (RGB) before the tRNS
  assert.throws(() => decodePng(Buffer.concat([rgb.subarray(0, ihdrEnd), trns, rgb.subarray(ihdrEnd)])), /tRNS/);
});

test("options: invalid values exit 2, identical folders exit 0, a changed pixel exits 1 at the default ratio 0", () => {
  const dir = mkdtempSync(join(tmpdir(), "vdiff-"));
  const [a, b] = [join(dir, "a"), join(dir, "b")];
  mkdirSync(a);
  mkdirSync(b);
  writeFileSync(join(a, "p.png"), encodePng(image(3, 3, () => [5, 5, 5, 255])));
  writeFileSync(join(b, "p.png"), encodePng(image(3, 3, (x) => (x === 0 ? [6, 5, 5, 255] : [5, 5, 5, 255]))));
  const quiet = console.log,
    err = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    assert.equal(main([a, a]), 0);
    assert.equal(main([a, b]), 1);
    assert.equal(main([a, b, "--max-ratio=0.5"]), 0);
    for (const bad of [
      "--max-ratio=abc",
      "--max-ratio",
      "--max-ratio=2",
      "--tolerance=1.5",
      "--tolerance=-1",
      "--out=",
      "--nope=1",
    ])
      assert.equal(main([a, b, bad]), 2, bad);
    assert.equal(main([a]), 2);
  } finally {
    console.log = quiet;
    console.error = err;
  }
});
