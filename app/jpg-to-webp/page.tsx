import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "JPG to WebP — Free Online Converter | ImgControl",
  description: "Convert JPG and JPEG images to WebP format online for free.",
  alternates: { canonical: "/jpg-to-webp" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="JPG / JPEG"
      outputLabel="WebP"
      outputMime="image/webp"
      accept=".jpg,.jpeg,image/jpeg"
      title="JPG to WebP online"
      description="Convert JPG and JPEG images to WebP format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
