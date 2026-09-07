import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "AVIF to PNG — Free Online Converter | ImgControl",
  description: "Convert AVIF images to PNG format online for free.",
  alternates: { canonical: "/avif-to-png" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="AVIF"
      outputLabel="PNG"
      outputMime="image/png"
      accept=".avif,image/avif"
      title="AVIF to PNG online"
      description="Convert AVIF images to PNG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
