import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the production build (`next start`) with an empty data volume, so the
 * pages render the illustrative sample data (SHOW_SAMPLE_DATA=1) and the admin runs with test-only
 * Entra settings. Tests that need an admin session mint one with AUTH_SECRET (see e2e/helpers.ts):
 * no authentication bypass exists in the application.
 */
const PORT = Number(process.env.E2E_PORT || 3100);

export const E2E_ENV = {
  SITE_DATA_DIR: "./var-e2e",
  SHOW_SAMPLE_DATA: "1",
  PUBLIC_URL: `http://localhost:${PORT}`,
  AZURE_TENANT_ID: "00000000-0000-0000-0000-00000000e2e0",
  AZURE_CLIENT_ID: "11111111-1111-1111-1111-11111111e2e1",
  AZURE_CLIENT_SECRET: "e2e-not-a-secret",
  AUTH_SECRET: "e2e-auth-secret-0123456789abcdef0123456789abcdef",
  ADMIN_ALLOWED_DOMAINS: "nymbus.ca",
  PIPELINE_SCHEDULE: "off",
  // cookies are Secure in production; the e2e server is plain http on localhost
  AUTH_INSECURE_COOKIES_FOR_LOCALHOST: "1",
};

/** Ports of the CMS test server and of the mock WordPress (e2e/mock-wp.mjs). */
const CMS_PORT = Number(process.env.E2E_CMS_PORT || 3101);
const MOCK_WP_PORT = Number(process.env.MOCK_WP_PORT || 3199);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", testIgnore: /admin\.spec|cms\.spec/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", testIgnore: /admin\.spec|cms\.spec/, use: { ...devices["Pixel 7"] } },
    // headless WordPress: its own server of the same build (own data volume and port) wired to a mock WordPress
    // (e2e/mock-wp.mjs); serial, because the tests flip the mock's mode
    { name: "cms", testMatch: /cms\.spec/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, baseURL: `http://localhost:${CMS_PORT}` } },
    // the admin tests write content (taglines, documents) to the shared data volume: they run after the public
    // page tests so no public screenshot or assertion ever sees test content
    { name: "admin-desktop", testMatch: /admin\.spec/, dependencies: ["desktop", "mobile"], use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "admin-mobile", testMatch: /admin\.spec/, dependencies: ["desktop", "mobile"], use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `rm -rf ./var-e2e && npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: E2E_ENV,
    },
    {
      command: "node e2e/mock-wp.mjs",
      url: `http://localhost:${MOCK_WP_PORT}/__health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { MOCK_WP_PORT: String(MOCK_WP_PORT) },
    },
    {
      command: `rm -rf ./var-e2e-cms && npx next start -p ${CMS_PORT}`,
      url: `http://localhost:${CMS_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...E2E_ENV,
        SITE_DATA_DIR: "./var-e2e-cms",
        PUBLIC_URL: `http://localhost:${CMS_PORT}`,
        WP_BASE_URL: `http://localhost:${MOCK_WP_PORT}`,
        WP_CONTENT_SECRET: "e2e-content-secret",
        WP_REVALIDATE_SECRET: "e2e-revalidate-secret",
        CMS_REVALIDATE_SECONDS: "3600",
      },
    },
  ],
});
