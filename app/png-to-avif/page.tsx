import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "PNG to AVIF Converter Online – Free | ImgControl",
  description:
    "Convert PNG to AVIF online for free. Create modern, web-friendly AVIF images with support for transparency and high-quality image conversion. Fast and easy to use.",
  alternates: {
    canonical: "https://imgcontrol.com/png-to-avif",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PNG to AVIF Converter Online – Free | ImgControl",
    description:
      "Convert PNG images to AVIF online for free. Create efficient, web-friendly AVIF images with a fast and simple browser-based converter.",
    url: "https://imgcontrol.com/png-to-avif",
    siteName: "ImgControl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PNG to AVIF Converter Online – Free | ImgControl",
    description:
      "Convert PNG to AVIF online for free with ImgControl. Fast, simple and easy to use.",
  },
};

export default function Page() {
  return (
    <>
      <DedicatedImageConverterPage
        sourceLabel="PNG"
        outputLabel="AVIF"
        outputMime="image/avif"
        accept=".png,image/png"
        title="PNG to AVIF online"
        description="Convert PNG images to AVIF format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
      />

      <section className="section">
        <div className="container">
          <div
            className="card"
            style={{
              maxWidth: 900,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            <h2>PNG to AVIF Converter</h2>

            <p>
              Convert PNG images to AVIF online with ImgControl. AVIF is a
              modern image format designed for efficient web delivery and can
              be useful when you want optimized images for websites and other
              digital projects.
            </p>

            <h2>How to Convert PNG to AVIF?</h2>

            <p>
              To convert PNG to AVIF, upload your PNG image to the converter,
              start the conversion, and download the resulting AVIF file.
              ImgControl provides a simple way to convert PNG images online
              without requiring desktop image-editing software.
            </p>

            <h2>How to Convert PNG to AVIF Without Losing Quality?</h2>

            <p>
              Image quality after conversion depends on the original PNG and
              the encoding settings used. AVIF can provide efficient
              compression while maintaining good visual quality when suitable
              settings are used.
            </p>

            <h2>Does PNG to AVIF Keep Transparency?</h2>

            <p>
              PNG can contain transparent areas, and AVIF supports
              transparency. The final result depends on the actual image and
              the conversion process used by the browser.
            </p>

            <h2>Why Convert PNG to AVIF for a Website?</h2>

            <p>
              AVIF is designed for efficient image delivery on the modern web.
              Converting suitable PNG images to AVIF can help create more
              compact web image assets while preserving useful visual quality.
            </p>

            <h2>Batch Convert PNG to AVIF</h2>

            <p>
              When your converter workflow supports multiple files, batch
              conversion can make it easier to prepare several PNG images for
              web use. Upload the supported files and process them through the
              converter.
            </p>

            <h2>Frequently Asked Questions</h2>

            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 18,
              }}
            >
              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  How to convert PNG to AVIF online?
                </summary>

                <p>
                  Upload a PNG image to the ImgControl PNG to AVIF converter,
                  start the conversion, and download the generated AVIF file.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  What are the benefits of converting PNG to AVIF?
                </summary>

                <p>
                  AVIF is designed for efficient web image delivery and can
                  produce compact image files while maintaining good visual
                  quality, depending on the image and encoding settings.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Does AVIF support transparent backgrounds?
                </summary>

                <p>
                  Yes. AVIF supports transparency, although the final output
                  depends on the source image and the conversion process.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Can I use AVIF images on a website?
                </summary>

                <p>
                  Yes. AVIF is a modern format intended for web image delivery
                  and is commonly considered for performance-focused websites.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Is PNG to AVIF conversion free?
                </summary>

                <p>
                  Yes. ImgControl provides a free online PNG to AVIF converter.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}