import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage";

export const metadata: Metadata = {
  title: "PDF to JPG Converter — Free Online Tool | ImgControl",
  description: "Convert every PDF page into separate JPG files online with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/pdf-to-jpg",
  },
};

export default function Page() {
  return <PdfToImage format="jpg" />;
}