import type { Metadata } from "next";
import PdfToolClient from "@/components/PdfToolClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "Merge PDF Files Online – Free",
  description:
    "Combine several PDF files into one online for free. Put them in order, merge and download. It runs in your browser and your files are never uploaded.",
  alternates: {
    canonical: "/merge-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Merge PDF Files Online – Free | ImgControl",
    description:
      "Combine several PDF files into one online for free.",
    url: "https://imgcontrol.com/merge-pdf",
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

          <h1>Merge PDF</h1>

          <p>
            Combine two or more PDFs into a single file, in the order you choose.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <PdfToolClient tool="merge-pdf" />
      </section>

      <ToolSeoContent slug="merge-pdf" />
    </>
  );
}
