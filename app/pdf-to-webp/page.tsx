import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage"; // এখানে সঠিক মাস্টার ফাইলটি কল করা হলো

export const metadata: Metadata = {
  title: "PDF to WebP — Convert PDF Pages to WebP",
  description: "Convert PDF pages into separate WebP images online.",
  alternates: { 
    canonical: "/pdf-to-webp" 
  },
};

export default function Page() {
  return <PdfToImage format="webp" />;
}