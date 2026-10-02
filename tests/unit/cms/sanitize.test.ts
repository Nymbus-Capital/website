/**
 * Sanitisation of everything that comes from WordPress: plain text only, https only, images only from the media origin.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeEntities, plainLines, plainParagraphs, plainText, safeHttpUrl, safeImageUrl, safeLinkedIn, stripTags } from "../../../src/lib/cms/sanitize.ts";

test("tags are stripped, including script bodies, comments and rebuilt tags", () => {
  assert.equal(plainText("Hello <b>world</b>", 100), "Hello world");
  assert.equal(plainText("a<script>alert(1)</script>b", 100), "ab");
  assert.equal(plainText("a<style>x{}</style>b", 100), "ab");
  assert.equal(plainText("a<!-- hidden -->b", 100), "ab");
  assert.equal(plainText("<<b>script>alert(1)<</b>/script>", 100).includes("<script"), false);
  assert.equal(plainText('<img src=x onerror="alert(1)">text', 100), "text");
  assert.equal(plainText('<a href="javascript:alert(1)">click</a>', 100), "click");
});

test("entities are decoded once, then tags stripped (encoded markup cannot survive as markup)", () => {
  assert.equal(plainText("&lt;script&gt;alert(1)&lt;/script&gt;ok", 100), "ok");
  assert.equal(plainText("&lt;b&gt;x&lt;/b&gt;", 100), "x");
  assert.equal(decodeEntities("&amp;lt;"), "&lt;", "no double decoding");
  assert.equal(plainText("Tom &amp; Jerry &#8217;s &#x41;", 100), "Tom & Jerry ’s A");
  assert.equal(decodeEntities("&#0;&#xD800;&#1114112;"), "", "invalid code points vanish");
});

test("control and bidi characters are removed, whitespace collapsed, length capped", () => {
  assert.equal(plainText("a\u0000b‮c​d", 100), "abcd");
  assert.equal(plainText("  a \n\t b  ", 100), "a b");
  assert.equal(plainText("x".repeat(500), 10).length, 10);
  assert.equal(plainText(42, 10), "");
  assert.equal(plainText(null, 10), "");
  assert.equal(plainText({ toString: () => "x" }, 10), "");
});

test("paragraphs keep blank-line breaks only", () => {
  assert.equal(plainParagraphs("One\nline wrapped.\n\n\n\nTwo <i>x</i>.", 1000), "One line wrapped.\n\nTwo x.");
  assert.equal(plainParagraphs("a\r\n\r\nb", 1000), "a\n\nb");
  assert.equal(plainParagraphs("", 1000), "");
  assert.equal(plainParagraphs("x".repeat(50), 10).length, 10);
});

test("lines: one entry per non-empty line, bounded", () => {
  assert.deepEqual(plainLines("CFA\n\n <b>PhD</b> \r\nMBA", 5, 50), ["CFA", "PhD", "MBA"]);
  assert.deepEqual(plainLines(["a", 3, "<i>b</i>"], 5, 50), ["a", "b"]);
  assert.equal(plainLines("a\nb\nc\nd", 2, 50).length, 2);
  assert.deepEqual(plainLines(undefined, 2, 50), []);
});

test("stripTags never leaves a tag behind on nested input", () => {
  for (const s of ["<scr<script>ipt>alert(1)</scr</script>ipt>", "<<a>a href=x>", "<a<b>>"]) assert.doesNotMatch(stripTags(s), /<[a-z]/i, s);
});

test("URLs: https only, no credentials, no control characters", () => {
  assert.equal(safeHttpUrl("https://example.org/a?b=1"), "https://example.org/a?b=1");
  for (const bad of ["http://example.org", "javascript:alert(1)", "data:text/html,x", "//example.org", "https://u:p@example.org", "https://", "ftp://example.org", "https://exa mple.org", "https://example.org/\u0000", "", "  ", 5, null, "https://" + "a".repeat(3000) + ".org"]) {
    assert.equal(safeHttpUrl(bad), null, String(bad).slice(0, 40));
  }
  assert.equal(safeHttpUrl("http://localhost:3199/x"), null, "http is refused unless loopback is allowed");
  assert.equal(safeHttpUrl("http://localhost:3199/x", { allowLoopbackHttp: true }), "http://localhost:3199/x");
  assert.equal(safeHttpUrl("http://example.org/x", { allowLoopbackHttp: true }), null);
});

test("images: only the exact media origin (scheme, host, port)", () => {
  const origin = "https://cms.example.org";
  assert.equal(safeImageUrl("https://cms.example.org/wp-content/uploads/a.jpg", origin), "https://cms.example.org/wp-content/uploads/a.jpg");
  for (const bad of ["https://evil.example/a.jpg", "https://cms.example.org.evil.example/a.jpg", "https://cms.example.org:8443/a.jpg", "http://cms.example.org/a.jpg", "https://cms.example.org@evil.example/a.jpg", "data:image/png;base64,AAAA", "https://cms.example.org/a.jpg#x"]) {
    assert.equal(safeImageUrl(bad, origin), null, bad);
  }
  assert.equal(safeImageUrl("https://cms.example.org/a.jpg", null), null, "no media origin: no image");
});

test("images: only under /wp-content/uploads/ (no other page, script or endpoint of the WordPress site)", () => {
  const origin = "https://cms.example.org";
  for (const bad of ["https://cms.example.org/a.jpg", "https://cms.example.org/wp-json/nymbus/v1/site-content", "https://cms.example.org/wp-content/plugins/x/a.png", "https://cms.example.org/wp-content/uploads/../plugins/a.png", "https://cms.example.org/wp-content/uploads/%2e%2e/a.png", "https://cms.example.org/wp-content/uploads%2f..%2fa.png", "https://cms.example.org/wp-content/uploadsx/a.png"]) {
    assert.equal(safeImageUrl(bad, origin), null, bad);
  }
  assert.equal(safeImageUrl("https://cms.example.org/wp-content/uploads/2026/09/a.webp", origin), "https://cms.example.org/wp-content/uploads/2026/09/a.webp");
});

test("LinkedIn links: linkedin.com over https only", () => {
  assert.equal(safeLinkedIn("https://www.linkedin.com/in/x"), "https://www.linkedin.com/in/x");
  assert.equal(safeLinkedIn("https://linkedin.com/in/x"), "https://linkedin.com/in/x");
  assert.equal(safeLinkedIn("https://notlinkedin.com/in/x"), null);
  assert.equal(safeLinkedIn("https://linkedin.com.evil.example/in/x"), null);
  assert.equal(safeLinkedIn("http://www.linkedin.com/in/x"), null);
});
