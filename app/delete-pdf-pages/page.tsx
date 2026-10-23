import type { Metadata } from "next";
import PdfToolClient from "@/components/PdfToolClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "Delete Pages from a PDF Online – Free",
  description:
    "Remove unwanted pages from a PDF online for free. Type the pages to delete, check the result and download. It runs in your browser and nothing is uploaded.",
  alternates: {
    canonical: "/delete-pdf-pages",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Delete Pages from a PDF Online – Free | ImgControl",
    description:
      "Remove unwanted pages from a PDF online for free.",
    url: "https://imgcontrol.com/delete-pdf-pages",
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

          <h1>Delete PDF Pages</h1>

          <p>
            Remove the pages you do not need and keep the rest in order.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <PdfToolClient tool="delete-pdf-pages" />
      </section>

      <ToolSeoContent slug="delete-pdf-pages" />
    </>
  );
}
