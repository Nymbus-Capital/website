/**
 * Tiny mock of the WordPress content endpoint for the CMS e2e tests (e2e/cms.spec.ts). Dependency-free.
 *
 *   GET  /wp-json/nymbus/v1/site-content   the fixture (needs the shared secret header, like a protected WordPress)
 *   GET  /wp-content/uploads/<name>.png    a 1x1 PNG
 *   POST /__mode/<name>                    ok | down | badschema | hostile | edited   (what the endpoint answers next)
 *   GET  /__health
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT = Number(process.env.MOCK_WP_PORT || 3199);
const SECRET = process.env.MOCK_WP_SECRET || "e2e-content-secret";
const fixture = () =>
  JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixtures", "wp-site-content.json"), "utf8"));
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

let mode = "ok";

function body() {
  const d = fixture();
  if (mode === "edited") d.news[0].title.en = "CMS test: EDITED title";
  if (mode === "badschema") return { schemaVersion: 99, news: [], team: [] };
  if (mode === "hostile") {
    d.news[0].title.en = "<img src=x onerror=alert('xss')>Hostile title";
    d.news[0].summary.en = "&lt;script&gt;alert('xss')&lt;/script&gt;Hostile summary";
    d.news[0].body.en =
      "Safe paragraph.\n\n<script>alert('xss')</script><a href=\"javascript:alert(1)\">bad link text</a>";
    d.news[0].image = "https://evil.example/pixel.png";
    d.news[0].link = "javascript:alert('xss')";
    d.news[1].link = "http://insecure.example/page";
    d.team[0].photo = "https://evil.example/face.png";
    d.team[0].linkedin = "https://evil.example/in/x";
    d.texts.banner = { en: "<b>Hostile</b> banner", fr: "" };
  }
  return d;
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const send = (status, type, data, extra = {}) => {
    res.writeHead(status, { "content-type": type, "cache-control": "no-store", ...extra });
    res.end(data);
  };
  if (url.pathname === "/__health") return send(200, "text/plain", "ok");
  if (req.method === "POST" && url.pathname.startsWith("/__mode/")) {
    mode = url.pathname.slice("/__mode/".length);
    return send(200, "text/plain", mode);
  }
  if (url.pathname.startsWith("/wp-content/uploads/")) return send(200, "image/png", PNG);
  if (url.pathname === "/wp-json/nymbus/v1/site-content") {
    if (req.headers["x-nymbus-content-secret"] !== SECRET)
      return send(401, "application/json", JSON.stringify({ code: "nymbus_forbidden" }));
    if (mode === "down") return send(503, "text/plain", "maintenance");
    return send(200, "application/json; charset=UTF-8", JSON.stringify(body()));
  }
  send(404, "text/plain", "not found");
}).listen(PORT, () => console.log(`mock WordPress on :${PORT}`));
