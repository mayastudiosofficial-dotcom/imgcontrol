import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "JPG to AVIF Converter Online – Free | ImgControl",
  description:
    "Convert JPG and JPEG images to AVIF online for free. Create smaller, modern image files for the web while maintaining excellent visual quality. Fast, secure and browser-based.",
  alternates: {
    canonical: "/jpg-to-avif",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JPG to AVIF Converter Online – Free | ImgControl",
    description:
      "Convert JPG and JPEG images to AVIF online for free. Create modern, web-friendly AVIF images directly in your browser.",
    url: "https://imgcontrol.com/jpg-to-avif",
    siteName: "ImgControl",
    type: "website",
  },
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