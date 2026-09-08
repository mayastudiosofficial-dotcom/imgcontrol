import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
  webpack: (config) => {
    // Vercel-কে কোনো কোড কাটতে বা ডিলিট করতে (Tree Shaking) সম্পূর্ণ নিষেধ করা হলো
    config.optimization.minimize = false;
    config.optimization.usedExports = false;
    config.optimization.providedExports = false;
    config.optimization.sideEffects = false;
    config.optimization.concatenateModules = false;
    
    // Web Worker-এর জন্য গ্লোবাল অবজেক্ট ফিক্স করা
    config.output.globalObject = "self";

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