import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "nymbus-docs-"));
process.env.SITE_DATA_DIR = dir;

const docs = await import("../../../src/lib/data/documents.ts");
const { hasPdfMagic, sanitizeFileName, validateUpload, contentDisposition, isDocumentId, MAX_DOCUMENT_BYTES } = docs;

const PDF = new TextEncoder().encode("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

before(() => undefined);
after(() => rmSync(dir, { recursive: true, force: true }));

test("magic bytes: only %PDF- at offset 0", () => {
  assert.equal(hasPdfMagic(PDF), true);
  assert.equal(hasPdfMagic(new TextEncoder().encode("%PDF")), false);
  assert.equal(hasPdfMagic(new TextEncoder().encode(" %PDF-1.4")), false);
  assert.equal(hasPdfMagic(new TextEncoder().encode("<html>%PDF-")), false);
  assert.equal(hasPdfMagic(new TextEncoder().encode("%pdf-1.4")), false);
  assert.equal(hasPdfMagic(new Uint8Array()), false);
});

test("upload validation: empty, size, type, magic", () => {
  assert.deepEqual(validateUpload(PDF, "application/pdf"), { ok: true });
  assert.deepEqual(validateUpload(PDF, ""), { ok: true });
  assert.equal(validateUpload(new Uint8Array(), "application/pdf").ok, false);
  const big = new Uint8Array(MAX_DOCUMENT_BYTES + 1);
  big.set(PDF);
  const r = validateUpload(big, "application/pdf");
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 413);
  const exact = new Uint8Array(MAX_DOCUMENT_BYTES);
  exact.set(PDF);
  assert.equal(validateUpload(exact).ok, true);
  const html = validateUpload(new TextEncoder().encode("<html><script>alert(1)</script>"), "application/pdf");
  assert.equal(html.ok, false);
  if (!html.ok) assert.equal(html.status, 415);
  assert.equal(validateUpload(PDF, "text/html").ok, false);
});

test("file names are sanitised", () => {
  assert.equal(sanitizeFileName("Fund Facts 2026.pdf"), "Fund Facts 2026.pdf");
  assert.equal(sanitizeFileName("../../etc/passwd"), "passwd.pdf");
  assert.equal(sanitizeFileName("..\\..\\windows\\evil.PDF"), "evil.pdf");
  assert.equal(sanitizeFileName(".hidden.pdf"), "hidden.pdf");
  assert.equal(sanitizeFileName("a\u0000b\r\nc.pdf"), "abc.pdf");
  assert.equal(sanitizeFileName('x"; filename=evil.html'), "x__ filename_evil.html.pdf");
  assert.equal(sanitizeFileName("report.exe"), "report.exe.pdf");
  assert.equal(sanitizeFileName("‮fdp.exe"), "fdp.exe.pdf");
  assert.equal(sanitizeFileName(""), "document.pdf");
  assert.equal(sanitizeFileName("...."), "document.pdf");
  assert.equal(sanitizeFileName("Aperçu du fonds – T3.pdf"), "Aperçu du fonds – T3.pdf");
  assert.ok(sanitizeFileName("x".repeat(500) + ".pdf").length <= 120);
  for (const n of ["a/b.pdf", "a\\b.pdf", "<script>.pdf", "a?b#c%d.pdf"]) {
    const s = sanitizeFileName(n);
    assert.doesNotMatch(s, /[\\/<>?#%]/, s);
    assert.match(s, /\.pdf$/);
  }
});

test("content disposition is inline with an RFC 5987 name", () => {
  const cd = contentDisposition("Aperçu du fonds.pdf");
  assert.match(cd, /^inline; filename="Aper_u du fonds\.pdf"; filename\*=UTF-8''Aper%C3%A7u%20du%20fonds\.pdf$/);
  assert.doesNotMatch(contentDisposition('a";b.pdf'), /";b/);
});

test("document ids reject traversal and garbage", () => {
  assert.equal(isDocumentId("20260929T043000-1a2b3c4d"), true);
  for (const bad of ["../index.json", "..", "index.json", "20260929T043000-1a2b3c4d/../../x", "20260929T043000-1A2B3C4D", "", "files", "%2e%2e"]) {
    assert.equal(isDocumentId(bad), false, bad);
  }
});

test("create, publish filter, update, replace, delete", async () => {
  const d = await docs.createDocument(
    { scope: "monthly-income", type: "fund-facts", lang: "both", title: { en: "Fund facts", fr: "Aperçu" }, date: "2026-09-01", published: false },
    "../x/Fund facts.pdf",
    PDF,
    "alice@nymbus.ca",
  );
  assert.equal(isDocumentId(d.id), true);
  assert.equal(d.fileName, "Fund facts.pdf");
  assert.equal(d.size, PDF.length);
  assert.match(d.sha256, /^[0-9a-f]{64}$/);
  assert.ok(existsSync(path.join(dir, "documents", "files", d.id)));
  assert.deepEqual(await docs.listPublishedDocuments(), []);

  await docs.updateDocument(d.id, { published: true });
  assert.equal((await docs.listPublishedDocuments("monthly-income")).length, 1);
  assert.equal((await docs.listPublishedDocuments("firm")).length, 0);
  assert.equal(docs.documentUrl((await docs.getDocument(d.id))!), `/api/documents/${d.id}/Fund%20facts.pdf`);

  const v2 = new TextEncoder().encode("%PDF-1.7\nnew\n%%EOF");
  const r = await docs.replaceDocumentFile(d.id, "v2.pdf", v2, "bob@nymbus.ca");
  assert.equal(r?.fileName, "v2.pdf");
  assert.deepEqual(await docs.readDocumentFile(d.id), v2);
  await assert.rejects(docs.replaceDocumentFile(d.id, "evil.pdf", new TextEncoder().encode("MZ..."), "x"));

  assert.equal(await docs.readDocumentFile("../documents/index.json"), null);
  assert.equal(await docs.updateDocument("../../x", { published: true }), null);

  const del = await docs.deleteDocument(d.id);
  assert.equal(del?.id, d.id);
  assert.equal(existsSync(path.join(dir, "documents", "files", d.id)), false);
  assert.equal(await docs.getDocument(d.id), null);
});

test("concurrent creates do not lose index entries", async () => {
  const base = { scope: "firm" as const, type: "other" as const, lang: "en" as const, title: { en: "t", fr: "" }, date: "2026-01-01", published: true };
  await Promise.all(Array.from({ length: 8 }, (_, i) => docs.createDocument(base, `f${i}.pdf`, PDF, "x@nymbus.ca")));
  assert.equal((await docs.listPublishedDocuments("firm")).length, 8);
});
