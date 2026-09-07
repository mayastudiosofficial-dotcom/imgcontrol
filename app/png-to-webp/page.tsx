import type { Metadata } from "next";
import DedicatedImageConverterPage from "@/components/DedicatedImageConverterPage";

export const metadata: Metadata = {
  title: "PNG to WebP Converter Online – Free | ImgControl",
  description:
    "Convert PNG images to WebP online for free. Create smaller, web-friendly WebP images with good visual quality. Fast and easy PNG to WebP conversion with ImgControl.",
  alternates: {
    canonical: "https://imgcontrol.com/png-to-webp",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PNG to WebP Converter Online – Free | ImgControl",
    description:
      "Convert PNG images to WebP online for free. Create modern, web-friendly WebP images with a fast and simple converter.",
    url: "https://imgcontrol.com/png-to-webp",
    siteName: "ImgControl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PNG to WebP Converter Online – Free | ImgControl",
    description:
      "Convert PNG to WebP online for free with ImgControl. Fast, simple and easy to use.",
  },
};

export default function Page() {
  return (
    <>
      <DedicatedImageConverterPage
        sourceLabel="PNG"
        outputLabel="WebP"
        outputMime="image/webp"
        accept=".png,image/png"
        title="PNG to WebP online"
        description="Convert PNG images to WebP format online for free. ImgControl keeps this conversion on a dedicated URL with a consistent workflow."
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
            <h2>PNG to WebP Converter</h2>

            <p>
              Convert PNG images to WebP online with ImgControl. WebP is a
              modern image format designed for efficient web delivery, making
              it useful when you want web-friendly images with a smaller file
              size while maintaining good visual quality.
            </p>

            <h2>How to Convert PNG to WebP?</h2>

            <p>
              To convert PNG to WebP, upload your PNG image to the converter,
              choose the WebP output option, and start the conversion. Once the
              conversion is complete, download your WebP image.
            </p>

            <h2>How to Convert PNG to WebP Without Losing Quality?</h2>

            <p>
              WebP can provide efficient image compression while maintaining
              good visual quality. The final result depends on the original
              PNG image and the conversion settings used. For the best result,
              use a suitable quality level for your intended web or design
              use.
            </p>

            <h2>Why Convert PNG to WebP?</h2>

            <p>
              Converting PNG to WebP can be useful for websites, blogs,
              online stores and other web projects where image file size and
              loading performance matter. WebP is widely used for modern web
              images and can help create more efficient image assets.
            </p>

            <h2>PNG to WebP Online</h2>

            <p>
              ImgControl provides a simple online way to convert PNG images to
              WebP without requiring desktop image-editing software. The tool
              is designed for quick and straightforward image format
              conversion.
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
                  How to convert PNG to WebP online?
                </summary>

                <p>
                  Upload your PNG image to the ImgControl PNG to WebP
                  converter, start the conversion, and then download the
                  resulting WebP file.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Why should I convert PNG to WebP?
                </summary>

                <p>
                  WebP is designed for efficient web delivery and can provide
                  smaller image files while maintaining good visual quality,
                  depending on the image and conversion settings.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Can I use WebP images on a website?
                </summary>

                <p>
                  Yes. WebP is commonly used for website images and is suitable
                  for many modern web projects.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Does PNG to WebP conversion change the image dimensions?
                </summary>

                <p>
                  The conversion itself is intended to change the image format
                  from PNG to WebP. The output dimensions depend on the
                  converter's actual processing settings.
                </p>
              </details>

              <details>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Is PNG to WebP conversion free?
                </summary>

                <p>
                  Yes. ImgControl provides this PNG to WebP conversion as a
                  free online tool.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}