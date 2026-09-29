/**
 * PKCE (RFC 7636, S256) and random tokens — dependency-free (Web Crypto, available in Node ≥ 20).
 */

export function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 32 random bytes, base64url (43 chars): used for state, nonce and the code verifier. */
export function randomToken(bytes = 32): string {
  const b = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(b);
  return base64url(b);
}

/** code_challenge = BASE64URL(SHA256(ASCII(code_verifier))) */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

/** RFC 7636 §4.1: 43..128 chars of [A-Z a-z 0-9 - . _ ~] */
export const isValidVerifier = (v: string): boolean => /^[A-Za-z0-9\-._~]{43,128}$/.test(v);
