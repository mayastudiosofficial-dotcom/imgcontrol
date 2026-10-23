import type { Metadata } from "next";
import PdfToolClient from "@/components/PdfToolClient";
import ToolSeoContent from "@/components/ToolSeoContent";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online – Free",
  description:
    "Rotate a whole PDF or only some pages by 90, 180 or 270 degrees online for free. The turn is saved in the new file. It runs in your browser.",
  alternates: {
    canonical: "/rotate-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Rotate PDF Pages Online – Free | ImgControl",
    description:
      "Rotate a whole PDF or only some pages by 90, 180 or 270 degrees online for free.",
    url: "https://imgcontrol.com/rotate-pdf",
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

          <h1>Rotate PDF</h1>

          <p>
            Turn pages that were scanned sideways or upside down.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <PdfToolClient tool="rotate-pdf" />
      </section>

      <ToolSeoContent slug="rotate-pdf" />
    </>
  );
}
