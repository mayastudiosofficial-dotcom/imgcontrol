import type { Metadata } from "next";
import PdfToolClient from "@/components/PdfToolClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "PDF to Text Converter – Copy Text from PDF",
  description:
    "Copy the text out of a PDF or save it as a .txt file online for free. It runs in your browser, so your document is never uploaded.",
  alternates: {
    canonical: "/pdf-to-text",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PDF to Text Converter – Copy Text from PDF | ImgControl",
    description:
      "Copy the text out of a PDF or save it as a .txt file online for free.",
    url: "https://imgcontrol.com/pdf-to-text",
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

          <h1>PDF to Text</h1>

          <p>
            Copy or download the text stored in a PDF.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <PdfToolClient tool="pdf-to-text" />
      </section>

      <ToolSeoContent slug="pdf-to-text" />
    </>
  );
}
