import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
  webpack: (config, { isServer }) => {
    // WASM ফাইলগুলোর সঠিক হ্যান্ডেলিংয়ের জন্য
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // কোড মিনিফিকেশন এবং ট্রি-শেকিন বন্ধ রাখা যাতে WASM ফাংশন না ভাঙে
    if (!isServer) {
      config.optimization.minimize = false;
    }

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