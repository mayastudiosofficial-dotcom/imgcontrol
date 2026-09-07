import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage";

export const metadata: Metadata = {
  title: "PDF to BMP Converter — Free Online Tool | ImgControl",
  description: "Convert every PDF page into separate BMP files online with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/pdf-to-bmp",
  },
};

export default function Page() {
  return <PdfToImage format="bmp" />;
}
