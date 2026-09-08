import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

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
            value: "require-corp", // <-- ঠিক এই জায়গাটিতে পরিবর্তন করা হয়েছে
          },
        ],
      },
    ];
  },
};

export default nextConfig;