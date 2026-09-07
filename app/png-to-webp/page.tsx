import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "PNG to WebP — Free Online Converter | ImgControl",
  description: "Convert PNG images to WebP format online for free.",
  alternates: { canonical: "/png-to-webp" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="PNG"
      outputLabel="WebP"
      outputMime="image/webp"
      accept=".png,image/png"
      title="PNG to WebP online"
      description="Convert PNG images to WebP format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
