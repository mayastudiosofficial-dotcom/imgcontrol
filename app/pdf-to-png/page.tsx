import type { Metadata } from "next";
import PdfToImage from "@/components/PdfToImage"; // এখানে সঠিক ফাইলটি দেওয়া হলো

export const metadata: Metadata = {
  title: "PDF to PNG — Convert PDF Pages to PNG Images",
  description: "Convert PDF pages to separate PNG images online.",
  alternates: { 
    canonical: "/pdf-to-png" 
  },
};

export default function Page() {
  return <PdfToImage format="png" />;
}