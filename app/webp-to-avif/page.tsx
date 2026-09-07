import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "WebP to AVIF — Free Online Converter | ImgControl",
  description: "Convert WebP images to AVIF format online for free.",
  alternates: { canonical: "/webp-to-avif" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="WebP"
      outputLabel="AVIF"
      outputMime="image/avif"
      accept=".webp,image/webp"
      title="WebP to AVIF online"
      description="Convert WebP images to AVIF format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
