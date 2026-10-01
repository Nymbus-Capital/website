/**
 * AUTH_SECRET fallback: when the environment does not provide one, the server generates a random secret
 * once and keeps it on the data volume (`<SITE_DATA_DIR>/secrets/auth-secret`, mode 0600), so nobody has to
 * create or paste it. Creation is race-safe (exclusive create; a loser reads the winner's file).
 * Dependency-free, Node only (unit tested).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type Env = Record<string, string | undefined>;

let cached: { file: string; value: string } | null = null;

export function volumeAuthSecret(env: Env = process.env): string {
  const dir = path.resolve(env.SITE_DATA_DIR || "./var", "secrets");
  const file = path.join(dir, "auth-secret");
  if (cached?.file === file) return cached.value;
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  let value = crypto.randomBytes(48).toString("base64url");
  try {
    fs.writeFileSync(file, value, { flag: "wx", mode: 0o600 });
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    value = "";
    // the winner may still be writing: read until the full secret is there
    for (let i = 0; i < 50 && value.length < 32; i++) {
      value = fs.readFileSync(file, "utf8").trim();
      if (value.length < 32) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
    }
  }
  cached = { file, value };
  return value;
}

/** The environment with AUTH_SECRET filled from the volume when it is not set. */
export function withAuthSecret(env: Env): Env {
  if ((env.AUTH_SECRET || "").trim()) return env;
  try {
    return { ...env, AUTH_SECRET: volumeAuthSecret(env) };
  } catch {
    return env; // unreadable volume: auth stays unconfigured (fails closed)
  }
}
