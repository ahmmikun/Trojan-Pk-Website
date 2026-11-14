import type { NextConfig } from "next";

/**
 * Security headers applied to every response. The CSP allows 'unsafe-inline'
 * for scripts and styles because Next.js inlines hydration data. Everything
 * else is limited to the site's own origin. If you add third-party scripts
 * (analytics, embeds), extend this policy.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    // Served by the Next.js image optimizer (Vercel Image Optimization in production).
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    // Optimized images are immutable per URL, so cache them for a year at the edge/browser.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Only optimize files that live in /public. Add `remotePatterns` here when
    // images start coming from a CDN or storage bucket.
    localPatterns: [{ pathname: "/**" }],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
