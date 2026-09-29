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
