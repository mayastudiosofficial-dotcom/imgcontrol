import type { Metadata } from "next";
import OptimizerClient from "@/components/OptimizerClient";

export const metadata: Metadata = {
  title: "Image Compressor Online – Compress JPG, PNG, WebP | ImgControl",
  description:
    "Compress JPG, PNG, WebP, GIF, BMP and AVIF images online for free. Reduce image file size while keeping good quality. Fast, secure and browser-based.",
  alternates: {
    canonical: "/image-compressor",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Image Compressor Online – Compress JPG, PNG, WebP | ImgControl",
    description:
      "Compress JPG, PNG, WebP, GIF, BMP and AVIF images online for free. Reduce image file size while keeping good quality.",
    url: "https://imgcontrol.com/image-compressor",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · Compress</div>

          <h1>Image Compressor</h1>

          <p>
            Compress any supported image without changing its dimensions unless
            you choose a different tool.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <OptimizerClient mode="compress" />
      </section>
    </>
  );
}