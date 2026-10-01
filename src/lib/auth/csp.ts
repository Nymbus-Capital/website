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

export function buildCsp(nonce: string, opts: { dev?: boolean; upgradeInsecure?: boolean } = {}): string {
  if (!/^[A-Za-z0-9+/=]{16,64}$/.test(nonce)) throw new Error("invalid nonce");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${opts.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https://www.nymbus.ca",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://login.microsoftonline.com",
    "object-src 'none'",
    ...(opts.upgradeInsecure ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
