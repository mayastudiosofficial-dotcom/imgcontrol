import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "WebP to JPG — Free Online Converter | ImgControl",
  description: "Convert WebP images to JPG format online for free.",
  alternates: { canonical: "/webp-to-jpg" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="WebP"
      outputLabel="JPG"
      outputMime="image/jpeg"
      accept=".webp,image/webp"
      title="WebP to JPG online"
      description="Convert WebP images to JPG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
