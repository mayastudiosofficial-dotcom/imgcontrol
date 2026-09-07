import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "HEIC to PNG — Free Online Converter | ImgControl",
  description: "Convert HEIC photos to PNG format online for free.",
  alternates: { canonical: "/heic-to-png" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="HEIC"
      outputLabel="PNG"
      outputMime="image/png"
      accept=".heic,.heif,image/heic,image/heif"
      title="HEIC to PNG online"
      description="Convert HEIC photos to PNG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
