import type { Metadata } from "next";
import ImageToPdf from "@/components/ImageToPdf";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "WebP to PDF Converter Online – Free",
  description:
    "Convert WebP images to PDF online for free. Combine one or many WebP images into a single PDF directly in your browser, with no upload and no sign-up.",
  alternates: {
    canonical: "/webp-to-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "WebP to PDF Converter Online – Free | ImgControl",
    description:
      "Turn WebP images into a PDF online for free. Fast, private and browser-based.",
    url: "https://imgcontrol.com/webp-to-pdf",
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

          <h1>WebP to PDF</h1>

          <p>
            Convert WebP images to a single or multi-page PDF directly in your
            browser.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <ImageToPdf />
      </section>

      <ToolSeoContent slug="webp-to-pdf" />
    </>
  );
}
