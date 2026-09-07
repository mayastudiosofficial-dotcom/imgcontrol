import type { Metadata } from "next";
import OptimizerClient from "@/components/OptimizerClient";

export const metadata: Metadata = {
  title: "Image Optimizer Online – Optimize JPG, PNG, WebP, AVIF | ImgControl",
  description:
    "Optimize JPG, PNG, WebP, GIF, BMP and AVIF images online for free. Reduce image file size, improve web performance and maintain excellent image quality with ImgControl.",
  alternates: {
    canonical: "/image-optimizer",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Image Optimizer Online – Optimize JPG, PNG, WebP, AVIF | ImgControl",
    description:
      "Optimize images online for free. Reduce image file size and prepare JPG, PNG, WebP and AVIF images for faster web use.",
    url: "https://imgcontrol.com/image-optimizer",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · Optimize</div>

          <h1>Image Optimizer</h1>

          <p>Optimize images for faster sharing and web delivery.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <OptimizerClient mode="optimize" />
      </section>
    </>
  );
}