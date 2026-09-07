import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage";

export const metadata: Metadata = {
  title: "PDF to SVG Converter — Free Online Tool | ImgControl",
  description: "Convert every PDF page into separate SVG files online with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/pdf-to-svg",
  },
};

export default function Page() {
  return <PdfToImage format="svg" />;
}
