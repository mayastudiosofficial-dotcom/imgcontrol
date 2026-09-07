import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "HEIC to JPG — Free Online Converter | ImgControl",
  description: "Convert HEIC photos to JPG format online for free.",
  alternates: { canonical: "/heic-to-jpg" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="HEIC"
      outputLabel="JPG"
      outputMime="image/jpeg"
      accept=".heic,.heif,image/heic,image/heif"
      title="HEIC to JPG online"
      description="Convert HEIC photos to JPG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
