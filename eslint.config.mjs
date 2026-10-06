// eslint.config.mjs — Next.js core web vitals + TypeScript rules (flat config); `npm run lint` is blocking in CI.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "var/**",
    "var-e2e/**",
    "var-e2e-cms/**",
    "test-results/**",
    "playwright-report/**",
    "ci-out/**",
    // the WordPress plugin is PHP with one plain browser script; it has its own checks (CI: php -l + tests)
    "wordpress/**",
  ]),
]);
