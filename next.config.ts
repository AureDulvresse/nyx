import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  // 'unsafe-eval' is required by Next.js dev mode (HMR/fast refresh); tighten in production if you disable dev tooling.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' ws: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // dockerode pulls in ssh2 (for SSH-based Docker hosts, unused here) whose native crypto asset
  // Turbopack can't place in a server bundle. Keeping these external makes Next `require()` them
  // via plain Node instead of bundling.
  serverExternalPackages: ['dockerode', 'ssh2', 'docker-modem'],
  experimental: {
    // Default-on since Next 16.1. Re-enabled: without it, every route recompiles from scratch on
    // each dev server restart (observed 1-4 min per first-visit route), which dominates page load
    // time far more than the cache's own write/compaction cost once warm.
    turbopackFileSystemCacheForDev: true,
    // hugeicons-react's entry is a barrel re-exporting ~4,000 icon modules. Not in Next's built-in
    // list, so without this every named import makes the bundler walk the whole barrel (slow dev
    // compiles, larger dev bundles). recharts and date-fns are already optimized by default.
    optimizePackageImports: ['hugeicons-react'],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          { key: "Content-Security-Policy", value: CSP },
          ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
        ],
      },
      {
        // Fichiers uploadés (dont SVG) : jamais de script exécutable. Déclaré après l'entrée
        // globale pour que ce CSP l'emporte sur celui de l'application.
        source: "/uploads/:path*",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox" }],
      },
    ];
  },
};

export default nextConfig;
