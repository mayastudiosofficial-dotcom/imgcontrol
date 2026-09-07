import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "WebP to PNG — Free Online Converter | ImgControl",
  description: "Convert WebP images to PNG format online for free.",
  alternates: { canonical: "/webp-to-png" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="WebP"
      outputLabel="PNG"
      outputMime="image/png"
      accept=".webp,image/webp"
      title="WebP to PNG online"
      description="Convert WebP images to PNG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
