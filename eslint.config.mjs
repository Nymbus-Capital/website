// eslint.config.mjs — Next.js core web vitals + TypeScript rules (flat config); `npm run lint` is blocking in CI.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // regexes that strip or refuse control characters say so with a disable comment
      "no-control-regex": "error",
      // `_`-prefixed names are deliberately unused (destructuring something away, placeholder parameters)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      // React Compiler readiness rules: the compiler is not enabled. The flagged patterns are deliberate (window state read
      // after hydration in an effect, the last shown value kept in a ref, chart hosts measured by a hook) and are kept as
      // warnings until a refactor can prove the same rendering
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // plain <img>: official third-party brand files shown exactly as supplied (served under their own sandbox CSP) and
    // portraits with an initials fallback on error; next/image would re-encode or proxy them
    files: [
      "src/components/admin/BrandAssetsManager.tsx",
      "src/components/fund/Awards.tsx",
      "src/components/fund/Morningstar.tsx",
      "src/components/fund/Overview.tsx",
      "src/components/site/pages/Portrait.tsx",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
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
