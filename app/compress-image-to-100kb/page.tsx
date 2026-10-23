import type { Metadata } from "next";
import CompressToKbPage from "@/components/CompressToKbPage";

export const metadata: Metadata = {
  title: "Compress Image to 100KB Online – Free",
  description:
    "Reduce a photo, signature or scan to 100 KB or less online for free. The size is already set, it runs in your browser and your picture is never uploaded.",
  alternates: {
    canonical: "/compress-image-to-100kb",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Compress Image to 100KB Online – Free | ImgControl",
    description:
      "Get a photo, signature or scan under 100 KB in your browser. Fast, private and free.",
    url: "https://imgcontrol.com/compress-image-to-100kb",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return <CompressToKbPage kb={100} />;
}
