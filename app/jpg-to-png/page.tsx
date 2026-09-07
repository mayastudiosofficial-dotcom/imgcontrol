import type { Metadata } from "next";
import { FixedConverterClient } from "@/components/FixedConverterClient";

export const metadata: Metadata = {
  title: "JPG to PNG Converter Online – Free | ImgControl",
  description:
    "Convert JPG and JPEG images to PNG online for free. Convert multiple images at once, keep original dimensions, and download high-quality PNG files directly in your browser.",
  alternates: {
    canonical: "/jpg-to-png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JPG to PNG Converter Online – Free | ImgControl",
    description:
      "Convert JPG and JPEG images to PNG online for free. Batch convert images while keeping dimensions with a fast browser-based tool.",
    url: "https://imgcontrol.com/jpg-to-png",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <FixedConverterClient
        sourceLabel="JPG / JPEG"
        outputLabel="PNG"
        outputMime="image/png"
        accept=".jpg,.jpeg,image/jpeg"
        inputText="JPG / JPEG"
        outputText="PNG"
      />

      <section className="section jpgPngSeoSection">
        <div className="jpgPngSeoWrap">
          <div className="card jpgPngSeoCard">
            <h2>JPG to PNG Converter</h2>

            <p>
              ImgControl lets you convert JPG and JPEG images to PNG format
              directly in your browser. You can process multiple images at
              once, keep the original dimensions, and optionally set a maximum
              output size in KB or MB.
            </p>

            <h3>How to convert JPG to PNG</h3>

            <p>
              Upload one or more JPG or JPEG images, optionally enable the
              maximum output size setting, and click “Convert to PNG”. Your
              converted PNG files will appear below the converter and can be
              downloaded individually or together as a ZIP file.
            </p>

            <h3>Frequently Asked Questions</h3>

            <div className="jpgPngFaq">
              <details className="jpgPngFaqItem">
                <summary>
                  Does converting JPG to PNG reduce image dimensions?
                </summary>

                <p>
                  Normally, no. ImgControl keeps the original image dimensions.
                  When a maximum output size is requested and the PNG is still
                  larger than that target, dimensions may be reduced to get
                  closer to the requested size.
                </p>
              </details>

              <details className="jpgPngFaqItem">
                <summary>
                  Can I convert multiple JPG files at once?
                </summary>

                <p>
                  Yes. You can select multiple JPG or JPEG files in one batch,
                  with support for up to 30 files at a time.
                </p>
              </details>

              <details className="jpgPngFaqItem">
                <summary>
                  Can I set a maximum PNG file size?
                </summary>

                <p>
                  Yes. Enable “Set maximum output size” and enter your target
                  size in KB or MB. The converter will try to approach that
                  target without artificially enlarging the image.
                </p>
              </details>

              <details className="jpgPngFaqItem">
                <summary>
                  Do my images get uploaded to a server?
                </summary>

                <p>
                  The conversion is designed to run directly in your browser,
                  so the core conversion workflow does not require uploading
                  your images to a remote server.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}