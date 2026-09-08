import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false, // Vercel-কে WASM কোড ভাঙতে বাধা দেবে
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;