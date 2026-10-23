import type { Metadata } from "next";
import PdfToolClient from "@/components/PdfToolClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "Split PDF Online – Extract Pages for Free",
  description:
    "Split a PDF or extract the pages you need online for free. Get one PDF with chosen pages, or one file per page. It runs in your browser and nothing is uploaded.",
  alternates: {
    canonical: "/split-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Split PDF Online – Extract Pages for Free | ImgControl",
    description:
      "Split a PDF or extract the pages you need online for free.",
    url: "https://imgcontrol.com/split-pdf",
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

          <h1>Split PDF</h1>

          <p>
            Take pages out of a PDF, or split it into one file per page.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <PdfToolClient tool="split-pdf" />
      </section>

      <ToolSeoContent slug="split-pdf" />
    </>
  );
}
