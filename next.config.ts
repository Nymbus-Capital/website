import type { NextConfig } from "next";

/**
 * The site runs as a Node server (standalone output) so it can:
 *  - read the data the pipeline publishes to the volume at request time (no rebuild per data refresh),
 *  - run the daily pipeline inside the private network that reaches the dataplatform,
 *  - serve the Microsoft-authenticated admin.
 */
const legacy: [string, string][] = [
  ["/strategies/sustainable-enhanced-short-term-bonds", "/strategies/monthly-income"],
  ["/sustainable-enhanced-short-term-bonds.html", "/strategies/monthly-income"],
  ["/sustainable-enhanced-bonds.html", "/strategies/sustainable-enhanced-bonds"],
  ["/core-bond.html", "/strategies/sustainable-enhanced-bonds"],
  ["/multi-strategy.html", "/strategies/multi-strategy"],
  ["/global-minimum-volatility.html", "/strategies/global-minimum-volatility"],
  ["/strategies.html", "/strategies"],
  ["/team.html", "/team"],
  ["/contact.html", "/contact"],
  ["/legal.html", "/legal"],
  ["/solutions.html", "/solutions"],
  ["/sustainability.html", "/sustainability"],
  ["/index.html", "/"],
];

const csp = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; no third-party scripts are loaded
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://www.nymbus.ca",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://login.microsoftonline.com",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: { unoptimized: true },
  async redirects() {
    return legacy.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
