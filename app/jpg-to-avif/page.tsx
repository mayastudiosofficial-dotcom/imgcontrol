import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "JPG to AVIF — Free Online Converter | ImgControl",
  description: "Convert JPG and JPEG images to AVIF format online for free.",
  alternates: { canonical: "/jpg-to-avif" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="JPG / JPEG"
      outputLabel="AVIF"
      outputMime="image/avif"
      accept=".jpg,.jpeg,image/jpeg"
      title="JPG to AVIF online"
      description="Convert JPG and JPEG images to AVIF format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
