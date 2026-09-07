import type { Metadata } from "next";
import OptimizerClient from "@/components/OptimizerClient";

export const metadata: Metadata = {
  title: "Image Converter Online – JPG, PNG, WebP, AVIF | ImgControl",
  description:
    "Convert JPG, PNG, WebP and AVIF images online for free. Quickly change image formats in your browser with ImgControl. Fast, simple and privacy-focused.",
  alternates: {
    canonical: "/image-converter",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Image Converter Online – JPG, PNG, WebP, AVIF | ImgControl",
    description:
      "Convert JPG, PNG, WebP and AVIF images online for free. Fast, simple and browser-based image conversion.",
    url: "https://imgcontrol.com/image-converter",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · Convert</div>

          <h1>Image Converter</h1>

          <p>
            Convert supported images between JPG, PNG, WebP and AVIF.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <OptimizerClient mode="convert" />
      </section>
    </>
  );
}