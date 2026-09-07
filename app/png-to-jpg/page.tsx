import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "PNG to JPG Converter Online – Free | ImgControl",
  description:
    "Convert PNG images to JPG online for free. Quickly convert PNG to JPEG, create smaller and widely compatible JPG files, and process your images directly in your browser.",
  alternates: {
    canonical: "https://imgcontrol.com/png-to-jpg",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PNG to JPG Converter Online – Free | ImgControl",
    description:
      "Convert PNG images to JPG online for free. Create smaller, web-friendly JPG files with a fast and simple browser-based converter.",
    url: "https://imgcontrol.com/png-to-jpg",
    siteName: "ImgControl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PNG to JPG Converter Online – Free | ImgControl",
    description:
      "Convert PNG to JPG online for free with ImgControl. Fast, simple and browser-based.",
  },
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