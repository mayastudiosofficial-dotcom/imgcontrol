import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "AVIF to WebP — Free Online Converter | ImgControl",
  description: "Convert AVIF images to WebP format online for free.",
  alternates: { canonical: "/avif-to-webp" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="AVIF"
      outputLabel="WebP"
      outputMime="image/webp"
      accept=".avif,image/avif"
      title="AVIF to WebP online"
      description="Convert AVIF images to WebP format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
