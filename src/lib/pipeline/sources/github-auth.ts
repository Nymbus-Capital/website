/**
 * Module 1: read-only GitHub App authentication for the deployed website pipeline.
 * Other consumers use the same GITHUB_AUTH_MODE/App ID/installation ID/private-key contract;
 * writers and release controllers require separate App identities and permission sets.
 */
import { createPrivateKey, sign } from "node:crypto";
import type { FetchImpl } from "./http.ts";

type Env = Record<string, string | undefined>;

function positiveId(value: string | undefined, name: string): string {
  if (!value || !/^[1-9][0-9]{0,19}$/.test(value)) throw new Error(`${name} must be a positive decimal ID`);
  return value;
}

function appJwt(appId: string, pem: string): string {
  try {
    const key = createPrivateKey(pem.replace(/\\n/g, "\n"));
    if (key.asymmetricKeyType !== "rsa" || (key.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
      throw new Error("Invalid key");
    }
    const now = Math.floor(Date.now() / 1000);
    const encode = (data: object): string => Buffer.from(JSON.stringify(data)).toString("base64url");
    const body = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iat: now - 60, exp: now + 540, iss: appId })}`;
    return `${body}.${sign("RSA-SHA256", Buffer.from(body), key).toString("base64url")}`;
  } catch {
    throw new Error("GITHUB_APP_PRIVATE_KEY must contain a valid RSA private key of at least 2048 bits");
  }
}

/** Mint per refresh so a running service never depends on an hour-old installation token. */
export async function githubToken(env: Env, repo: string, fetchImpl: FetchImpl): Promise<string | null> {
  const mode = env.GITHUB_AUTH_MODE || "pat";
  if (mode === "pat") return env.GITHUB_TOKEN || null;
  if (mode !== "app") throw new Error("GITHUB_AUTH_MODE must be pat or app");
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repo) || [".", ".."].includes(repo.split("/")[1])) throw new Error("Invalid GitHub repository");
  const appId = positiveId(env.GITHUB_APP_ID, "GITHUB_APP_ID");
  const installationId = positiveId(env.GITHUB_APP_INSTALLATION_ID, "GITHUB_APP_INSTALLATION_ID");
  if (!env.GITHUB_APP_PRIVATE_KEY) throw new Error("GITHUB_APP_PRIVATE_KEY is required in app mode");
  const jwt = appJwt(appId, env.GITHUB_APP_PRIVATE_KEY);
  let response: Response;
  try {
    response = await fetchImpl(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "nymbus-web-pipeline/1.0" },
      body: JSON.stringify({ repositories: [repo.split("/")[1]], permissions: { contents: "read" } }),
    });
  } catch {
    throw new Error("GitHub App token request failed or timed out");
  }
  if (response.status !== 201) throw new Error(`GitHub App token request failed (HTTP ${response.status})`);
  let data: { token?: unknown; expires_at?: unknown; permissions?: { contents?: unknown }; repositories?: { full_name?: unknown }[] };
  try { data = await response.json(); } catch { throw new Error("GitHub App returned invalid JSON"); }
  const expires = typeof data?.expires_at === "string" ? Date.parse(data.expires_at) : NaN;
  if (typeof data?.token !== "string" || !data.token || /[\r\n]/.test(data.token) ||
      !Number.isFinite(expires) || expires - Date.now() < 300_000 || data.permissions?.contents !== "read") {
    throw new Error("GitHub App returned an invalid, expiring, or incorrectly scoped token");
  }
  if (data.repositories !== undefined && (!Array.isArray(data.repositories) || data.repositories.length !== 1 || data.repositories[0]?.full_name !== repo)) {
    throw new Error("GitHub App token repository scope does not match the requested repository");
  }
  return data.token;
}
