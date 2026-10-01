/**
 * Startup diagnostics for the admin sign-in: says which settings are present and why sign-in is off, without ever
 * printing a value (only names, "set"/"missing", and the validation message). Dependency-free (unit tested).
 */
import fs from "node:fs";
import path from "node:path";
import { loadAuthConfig } from "./config.ts";
import { withAuthSecret } from "./volume-secret.ts";

type Env = Record<string, string | undefined>;

export const AUTH_ENV_KEYS = ["AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AUTH_SECRET", "PUBLIC_URL", "ADMIN_ALLOWED_DOMAINS"] as const;

/** "writable" or the error code (EACCES, EROFS …) for the data directory. */
export function dataDirStatus(env: Env): string {
  const dir = path.resolve(env.SITE_DATA_DIR || "./var");
  const probe = path.join(dir, `.write-probe-${process.pid}`);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(probe, "");
    fs.rmSync(probe, { force: true });
    return "writable";
  } catch (e: unknown) {
    return (e as NodeJS.ErrnoException).code || "not writable";
  }
}

export const PIPELINE_ENV_KEYS = ["DATAPLATFORM_URL", "GRAPH_TENANT_ID", "GRAPH_CLIENT_ID", "GRAPH_CLIENT_SECRET", "GRAPH_DRIVE_ID", "GITHUB_TOKEN", "PIPELINE_ALERT_WEBHOOK"] as const;

/** Which data-pipeline settings are present (names only). */
export function pipelineDiagnostics(env: Env): string {
  const present = PIPELINE_ENV_KEYS.map((k) => `${k}=${(env[k] || "").trim() ? "set" : "missing"}`).join(" ");
  // env names are case-sensitive: flag a lowercase/mixed-case twin, the usual copy-paste slip
  const twins = PIPELINE_ENV_KEYS.filter((k) => !(env[k] || "").trim() && Object.keys(env).some((e) => e !== k && e.toUpperCase() === k));
  return `[pipeline] settings: ${present}${twins.length ? ` (wrong letter case for: ${twins.join(", ")})` : ""}`;
}

/** Reachability of the dataplatform from this container: HTTP status of the fund register, or the error kind. */
export async function dataplatformProbe(env: Env, fetchImpl: typeof fetch = fetch, timeoutMs = 8000): Promise<string> {
  const base = (env.DATAPLATFORM_URL || "").trim().replace(/\/+$/, "");
  if (!base) return "[pipeline] dataplatform: not probed (DATAPLATFORM_URL missing)";
  try {
    const res = await fetchImpl(`${base}/api/apex/funds`, { signal: AbortSignal.timeout(timeoutMs) });
    return `[pipeline] dataplatform: HTTP ${res.status}${res.ok ? " (reachable)" : ""}`;
  } catch (e: unknown) {
    const err = e as { name?: string; cause?: { code?: string } };
    return `[pipeline] dataplatform: unreachable (${err.cause?.code || err.name || "error"})`;
  }
}

/** One log line per concern; safe to print (no values). */
export function authDiagnostics(env: Env): string[] {
  const present = AUTH_ENV_KEYS.map((k) => `${k}=${(env[k] || "").trim() ? "set" : "missing"}`).join(" ");
  const withSecret = withAuthSecret(env);
  const generated = !(env.AUTH_SECRET || "").trim() && !!withSecret.AUTH_SECRET;
  const r = loadAuthConfig(withSecret);
  return [
    `[admin] settings: ${present}${generated ? " (AUTH_SECRET generated on the data volume)" : ""}`,
    r.ok ? "[admin] sign-in configured" : `[admin] sign-in NOT configured: ${r.error}`,
    `[data] ${path.resolve(env.SITE_DATA_DIR || "./var")}: ${dataDirStatus(env)}`,
  ];
}
