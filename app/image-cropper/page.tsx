import type { Metadata } from "next";
import AdvancedCrop from "@/components/AdvancedCrop";

export const metadata: Metadata = {
  title: "Image Cropper Online – Crop JPG, PNG, WebP Images | ImgControl",
  description:
    "Crop JPG, PNG, WebP, GIF, BMP and other images online for free. Use a visual crop box, choose aspect ratios, view live dimensions and export your cropped image easily.",
  alternates: {
    canonical: "/image-cropper",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Image Cropper Online – Crop JPG, PNG, WebP Images | ImgControl",
    description:
      "Crop images online for free with a visual crop box, aspect ratios, live dimensions and export options.",
    url: "https://imgcontrol.com/image-cropper",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · Crop</div>

          <h1>Image Cropper</h1>

          <p>
            Drag the crop area visually, see live width and height, choose
            aspect ratio and export size.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <AdvancedCrop />
      </section>
    </>
  );
}