import type { Metadata } from "next";
import RawToJpgClient from "@/components/RawToJpgClient";

export const metadata: Metadata = {
  title: "RAW to JPG Converter — Free Online Tool | ImgControl",
  description:
    "Convert RAW camera images such as CR2, CR3, NEF, ARW and DNG to JPG online. Process multiple RAW photos and optionally set a maximum output size.",
  alternates: {
    canonical: "/raw-to-jpg",
  },
};

export default function Page() {
  return (
    <>
      <main className="section">
        <div className="container">
          <div className="pageHead">
            <div
              style={{
                width: "fit-content",
                margin: "0 auto 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                border: "1px solid #76bfff",
                borderRadius: 999,
                background:
                  "linear-gradient(180deg, rgba(24,132,240,.13), rgba(24,132,240,.06))",
                color: "#1785ef",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".12em",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>‹</span>
              <span>IMAGE CONVERTER</span>
              <span style={{ fontSize: 16, lineHeight: 1 }}>›</span>
            </div>

            <h1>
              RAW <span>→</span> JPG
            </h1>

            <p>
              Convert camera RAW photos to JPG online for free. Fast, simple
              and privacy-focused.
            </p>
          </div>

          <RawToJpgClient />

          <section
            style={{
              width: "min(860px, 92%)",
              margin: "24px auto 0",
            }}
          >
            <div className="card" style={{ padding: 28 }}>
              <h2>RAW to JPG Converter</h2>

              <p>
                ImgControl lets you convert supported camera RAW photos such
                as CR2, CR3, NEF, ARW, DNG, RAF, ORF and RW2 into JPG directly
                in your browser. You can process multiple RAW images at once
                and optionally set a maximum output size in KB or MB.
              </p>

              <h3>How to convert RAW to JPG</h3>

              <p>
                Add one or more RAW photos, optionally enable “Set maximum
                output size”, choose KB or MB, and click “Convert RAW to JPG”.
                Converted JPG files can be downloaded individually or together
                as a ZIP file.
              </p>

              <h3>Frequently Asked Questions</h3>

              <details>
                <summary>Can I convert large 25–50 MB RAW photos?</summary>
                <p>
                  Yes. Large RAW files can be processed in the browser, though
                  they may require more memory and processing time.
                </p>
              </details>

              <details>
                <summary>Can I set a maximum JPG file size?</summary>
                <p>
                  Yes. Enable “Set maximum output size” and enter a target such
                  as 2 MB, 5 MB or 10 MB. ImgControl tries to keep the JPG at
                  or below the requested maximum.
                </p>
              </details>

              <details>
                <summary>Can I convert multiple RAW files?</summary>
                <p>
                  Yes. You can add multiple supported RAW files in one batch
                  and download the converted JPG files together as a ZIP.
                </p>
              </details>

              <details>
                <summary>Are my RAW photos uploaded to a server?</summary>
                <p>
                  The RAW decoding and conversion workflow is designed to run
                  locally in your browser, so the image data does not need to
                  be uploaded to a remote conversion server.
                </p>
              </details>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
