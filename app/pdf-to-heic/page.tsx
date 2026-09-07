import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage";

export const metadata: Metadata = {
  title: "PDF to HEIC Converter — Free Online Tool | ImgControl",
  description: "Convert every PDF page into separate HEIC files online with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/pdf-to-heic",
  },
};

export default function Page() {
  return <PdfToImage format="heic" />;
}
