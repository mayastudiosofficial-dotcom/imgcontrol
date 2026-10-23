import type { Metadata } from "next";
import { FixedConverterClient } from "@/components/FixedConverterClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "JPG to PNG Converter Online – Free",
  description:
    "Convert JPG and JPEG images to PNG online for free. Convert multiple images at once, keep original dimensions, and download high-quality PNG files directly in your browser.",
  alternates: {
    canonical: "/jpg-to-png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JPG to PNG Converter Online – Free | ImgControl",
    description:
      "Convert JPG and JPEG images to PNG online for free. Batch convert images while keeping dimensions with a fast browser-based tool.",
    url: "https://imgcontrol.com/jpg-to-png",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <FixedConverterClient
        sourceLabel="JPG / JPEG"
        outputLabel="PNG"
        outputMime="image/png"
        accept=".jpg,.jpeg,image/jpeg"
        inputText="JPG / JPEG"
        outputText="PNG"
      />

      <ToolSeoContent slug="jpg-to-png" />
    </>
  );
}