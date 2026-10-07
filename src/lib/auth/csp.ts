/**
 * Nonce-based Content-Security-Policy for HTML routes (set by src/proxy.ts). Pure, unit tested.
 * Scripts: only 'self' bundles loaded by nonce'd bootstrap scripts ('strict-dynamic'); no 'unsafe-inline'.
 * Styles keep 'unsafe-inline' (React style attributes, inline <style> in components).
 */

/** 128-bit random nonce, base64. */
export function makeNonce(): string {
  const b = new Uint8Array(16);
  globalThis.crypto.getRandomValues(b);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
}

/** An origin that may be added to `img-src` (a bare https origin, or http on loopback): nothing else can reach the header. */
const IMG_ORIGIN =
  /^(https:\/\/[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?|http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d{1,5})?)$/;

export function buildCsp(
  nonce: string,
  opts: { dev?: boolean; upgradeInsecure?: boolean; imgOrigins?: (string | null | undefined)[] } = {},
): string {
  if (!/^[A-Za-z0-9+/=]{16,64}$/.test(nonce)) throw new Error("invalid nonce");
  // the CMS media origin (src/lib/cms/config.ts) is validated here again before it reaches the header
  const extraImg = [...new Set((opts.imgOrigins ?? []).filter((o): o is string => !!o && IMG_ORIGIN.test(o)))];
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${opts.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob: https://www.nymbus.ca${extraImg.map((o) => ` ${o}`).join("")}`,
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://login.microsoftonline.com",
    "object-src 'none'",
    ...(opts.upgradeInsecure ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
