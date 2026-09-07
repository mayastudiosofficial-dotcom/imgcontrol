import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "PNG to JPG — Free Online Converter | ImgControl",
  description: "Convert PNG images to JPG format online for free.",
  alternates: { canonical: "/png-to-jpg" },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="PNG"
      outputLabel="JPG"
      outputMime="image/jpeg"
      accept=".png,image/png"
      title="PNG to JPG online"
      description="Convert PNG images to JPG format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}
