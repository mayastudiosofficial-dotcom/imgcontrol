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
  // Pages that were retired. Old links and bookmarks go to the closest working tool.
  async redirects() {
    const moved: [string, string][] = [
      ["pdf-to-eps", "pdf-to-png"],
      ["pdf-to-svg", "pdf-to-png"],
      ["pdf-to-bmp", "pdf-to-png"],
      ["pdf-to-gif", "pdf-to-png"],
      ["pdf-to-heic", "pdf-to-jpg"],
      ["pdf-to-avif", "pdf-to-webp"],
      ["jpg-to-avif", "image-converter"],
      ["png-to-avif", "image-converter"],
      ["webp-to-avif", "image-converter"],
      ["avif-to-webp", "image-converter"],
    ];

    return moved.map(([from, to]) => ({
      source: `/${from}`,
      destination: `/${to}`,
      permanent: true,
    }));
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