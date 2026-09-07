import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "PNG to AVIF — Free Online Converter | ImgControl",
  description: "Convert PNG images to AVIF format online for free.",
  alternates: { canonical: "/png-to-avif" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="PNG"
      outputLabel="AVIF"
      outputMime="image/avif"
      accept=".png,image/png"
      title="PNG to AVIF online"
      description="Convert PNG images to AVIF format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
