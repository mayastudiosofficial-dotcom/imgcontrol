import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
  webpack: (config) => {
    // Vercel-কে কোড ভাঙতে এবং রিনেম করতে পুরোপুরি বাধা দেবে
    config.optimization.minimize = false;
    return config;
  },
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