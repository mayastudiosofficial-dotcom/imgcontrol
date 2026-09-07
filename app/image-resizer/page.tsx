import type { Metadata } from "next";
import OptimizerClient from "@/components/OptimizerClient";

export const metadata: Metadata = {
  title: "Image Resizer Online – Resize JPG, PNG, WebP | ImgControl",
  description:
    "Resize JPG, PNG, WebP, GIF, BMP and AVIF images online for free. Change image width and height by exact dimensions or percentage while keeping the aspect ratio.",
  alternates: {
    canonical: "/image-resizer",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Image Resizer Online – Resize JPG, PNG, WebP | ImgControl",
    description:
      "Resize images online for free by exact width and height or percentage. Fast, simple and browser-based image resizing.",
    url: "https://imgcontrol.com/image-resizer",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · Resize</div>

          <h1>Image Resizer</h1>

          <p>
            Enter exact width and height, preserve aspect ratio, and choose
            your output format.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <OptimizerClient mode="resize" />
      </section>
    </>
  );
}