import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "AVIF to JPG — Free Online Converter | ImgControl",
  description: "Convert AVIF images to JPG format online for free.",
  alternates: { canonical: "/avif-to-jpg" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="AVIF"
      outputLabel="JPG"
      outputMime="image/jpeg"
      accept=".avif,image/avif"
      title="AVIF to JPG online"
      description="Convert AVIF images to JPG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
