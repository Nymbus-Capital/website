/**
 * Minimal standalone HTML error page for the admin gate (403 / 503 / sign-in errors). No user input is echoed
 * except through escapeHtml; no tokens or claims are ever shown.
 */
const NO_STORE = { "Cache-Control": "no-store" };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function denyPage(status: number, title: string, message: string): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${escapeHtml(title)}</title>
<style>@font-face{font-family:Poppins;font-weight:400;font-display:swap;src:url(/fonts/poppins-400.woff) format("woff")}@font-face{font-family:Poppins;font-weight:500;font-display:swap;src:url(/fonts/poppins-500.woff) format("woff")}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0c;color:#fff;font:15px/1.6 Poppins,system-ui,sans-serif}
main{max-width:520px;margin:16px;padding:40px;border-radius:28px;background:#000;box-shadow:0 0 0 1px #2c313a}
h1{font-weight:500;letter-spacing:-.04em;text-transform:lowercase;margin:0 0 12px;font-size:34px}
p{color:#aeb6c3}.mark{display:inline-block;width:22px;height:4px;border-radius:4px;background:linear-gradient(90deg,#1a73e8,#4c8dff 55%,#4fd1ff);box-shadow:0 0 14px rgba(79,209,255,.6);margin-bottom:18px}
button,a.b{display:inline-flex;align-items:center;height:40px;padding:0 18px;border-radius:99px;border:0;font:500 14px Poppins,system-ui;color:#fff;cursor:pointer;background:linear-gradient(100deg,#8ab4ff,#4c8dff 45%,#4fd1ff);text-transform:lowercase}
form{display:inline}a.l{color:#6ea2ff;margin-left:14px}</style></head>
<body><main><span class="mark"></span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>
<form method="post" action="/api/auth/logout"><button type="submit">sign out and use another account</button></form><a class="l" href="/">nymbus.ca</a></main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", ...NO_STORE } });
}
