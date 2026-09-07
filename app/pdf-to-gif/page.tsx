import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage";

export const metadata: Metadata = {
  title: "PDF to GIF Converter — Free Online Tool | ImgControl",
  description: "Convert every PDF page into separate GIF files online with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/pdf-to-gif",
  },
};

export default function Page() {
  return <PdfToImage format="gif" />;
}
