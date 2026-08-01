import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const minioOrigin = process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000";

const CSP = [
  "default-src 'self'",
  // 'unsafe-eval' is required by Next.js dev mode (HMR/fast refresh); tighten in production if you disable dev tooling.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${minioOrigin}`,
  "font-src 'self' data:",
  // blob: is how Ask Nyx plays TTS audio (a Blob built from the fetched WAV bytes, played via a
  // blob: object URL) — without this, the browser silently drops the load and <audio> reports
  // "NotSupportedError: no supported source" even though the bytes themselves are perfectly valid.
  "media-src 'self' blob:",
  `connect-src 'self' ws: wss: ${minioOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Required by the Dockerfile's production stage, which copies .next/standalone — without this,
  // that directory is never emitted and the container image build fails at the COPY step.
  output: 'standalone',
  // dockerode pulls in ssh2 (for SSH-based Docker hosts, unused here) whose native crypto asset
  // Turbopack can't place in a server bundle. Keeping these external makes Next `require()` them
  // via plain Node instead of bundling.
  serverExternalPackages: ['dockerode', 'ssh2', 'docker-modem'],
  experimental: {
    // Default-on since Next 16.1. Re-enabled: without it, every route recompiles from scratch on
    // each dev server restart (observed 1-4 min per first-visit route), which dominates page load
    // time far more than the cache's own write/compaction cost once warm.
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // microphone=(self) — not (): Ask Nyx's voice input needs getUserMedia({audio: true})
          // on this very origin. An empty allowlist blocks the mic even for the site itself.
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(self), camera=()" },
          { key: "Content-Security-Policy", value: CSP },
          ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
