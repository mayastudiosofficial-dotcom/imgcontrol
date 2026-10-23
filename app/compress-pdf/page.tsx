import type { Metadata } from "next";
import PdfToolClient from "@/components/PdfToolClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "Compress PDF Online – Reduce File Size Free",
  description:
    "Make a PDF smaller for email and uploads, free and in your browser. Choose light, balanced or strong compression and check the result before you download.",
  alternates: {
    canonical: "/compress-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Compress PDF Online – Reduce File Size Free | ImgControl",
    description:
      "Make a PDF smaller for email and uploads, free and in your browser.",
    url: "https://imgcontrol.com/compress-pdf",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · PDF Tools</div>

          <h1>Compress PDF</h1>

          <p>
            Make a large PDF smaller. Pages are saved as pictures, so scans shrink the most.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <PdfToolClient tool="compress-pdf" />
      </section>

      <ToolSeoContent slug="compress-pdf" />
    </>
  );
}
