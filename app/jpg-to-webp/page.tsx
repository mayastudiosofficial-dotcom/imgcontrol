import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "JPG to WebP Converter Online – Free | ImgControl",
  description:
    "Convert JPG and JPEG images to WebP online for free. Reduce image file size with the modern WebP format while keeping excellent image quality. Fast, secure and browser-based.",
  alternates: {
    canonical: "/jpg-to-webp",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JPG to WebP Converter Online – Free | ImgControl",
    description:
      "Convert JPG and JPEG images to WebP online for free. Create smaller, web-friendly images directly in your browser.",
    url: "https://imgcontrol.com/jpg-to-webp",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <DedicatedImageConverterPage
      sourceLabel="JPG / JPEG"
      outputLabel="WebP"
      outputMime="image/webp"
      accept=".jpg,.jpeg,image/jpeg"
      title="JPG to WebP online"
      description="Convert JPG and JPEG images to WebP format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
    />
  );
}