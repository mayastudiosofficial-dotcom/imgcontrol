import type { Metadata } from "next";
import ImageToPdf from "@/components/ImageToPdf";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "JPG to PDF Converter Online – Free",
  description:
    "Convert JPG and JPEG images to PDF online for free. Combine one or many JPG images into a single PDF directly in your browser, with no upload and no sign-up.",
  alternates: {
    canonical: "/jpg-to-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JPG to PDF Converter Online – Free | ImgControl",
    description:
      "Turn JPG images into a PDF online for free. Fast, private and browser-based.",
    url: "https://imgcontrol.com/jpg-to-pdf",
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

          <h1>JPG to PDF</h1>

          <p>
            Convert JPG and JPEG images to a single or multi-page PDF directly in your
            browser.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <ImageToPdf />
      </section>

      <ToolSeoContent slug="jpg-to-pdf" />
    </>
  );
}
