import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage";

export const metadata: Metadata = {
  title: "PDF to EPS Converter — Free Online Tool | ImgControl",
  description: "Convert every PDF page into separate EPS files online with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/pdf-to-eps",
  },
};

export default function Page() {
  return <PdfToImage format="eps" />;
}
