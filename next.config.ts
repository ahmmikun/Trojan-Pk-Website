import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: no backend, database or server runtime. `next build`
  // writes the deployable site to ./out and works on any static host.
  output: "export",
  images: {
    // The default image optimizer needs a server. Compress images before adding them to /public.
    unoptimized: true,
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
