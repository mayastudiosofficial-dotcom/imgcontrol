"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs";

type OutputFormat = "jpg" | "png" | "webp";

type PageResult = {
  n: number;
  url: string;
  blob: Blob;
  width: number;
  height: number;
};

type Props = {
  format: OutputFormat;
};

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );

  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PdfToImage({ format }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageResult[]>([]);
  const [scale, setScale] = useState(1.5);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const outputLabel = format.toUpperCase();

  function revokePages(items = pages) {
    items.forEach((page) => URL.revokeObjectURL(page.url));
  }

  function clearResults() {
    revokePages();
    setPages([]);
  }

  useEffect(() => {
    return () => revokePages();
    // Cleanup is only needed when this tool unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectFile(nextFile: File | null) {
    if (!nextFile) return;

    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    clearResults();
    setFile(nextFile);
    setError("");
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function removeFile() {
    clearResults();
    setFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function convertPdf() {
    if (!file || busy) return;

    setBusy(true);
    setError("");
    clearResults();

    try {
      const data = await file.arrayBuffer();
      const pdf = await getDocument({ data }).promise;
      const outputPages: PageResult[] = [];

      const mime =
        format === "jpg"
          ? "image/jpeg"
          : format === "png"
            ? "image/png"
            : "image/webp";

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const pdfPage = await pdf.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale });
        const canvas = document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas is not supported in this browser.");
        }

        context.save();
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        await pdfPage.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => {
              if (result) resolve(result);
              else reject(new Error(`Unable to create ${outputLabel} output.`));
            },
            mime,
            format === "png" ? undefined : 0.92,
          );
        });

        outputPages.push({
          n: pageNumber,
          url: URL.createObjectURL(blob),
          blob,
          width: canvas.width,
          height: canvas.height,
        });
      }

      setPages(outputPages);
    } catch (conversionError) {
      const message =
        conversionError instanceof Error
          ? conversionError.message
          : "PDF processing failed. Please try another PDF.";

      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    if (!pages.length) return;

    try {
      const zip = new JSZip();

      pages.forEach((page) => {
        zip.file(`page-${page.n}.${format}`, page.blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `imgcontrol-pdf-pages-${format}.zip`);
    } catch {
      setError("Unable to create the ZIP download.");
    }
  }

  return (
    <main className="section pdfToImageSection">
      <div className="container">
        {/* =========================================
            PREMIUM PDF PAGE HEADER
        ========================================== */}
        <div className="pageHead pdfPremiumHead">
          <div className="premiumKicker">
            <span className="premiumKickerStar">✦</span>
            PDF CONVERTER
            <span className="premiumKickerStar">✦</span>
          </div>

          <h1 className="premiumPageTitle">
            <span className="headingSource">PDF</span>
            <span className="headingArrow">→</span>
            <span className="headingOutput">{outputLabel}</span>
          </h1>

          <p>
            Convert every PDF page into a separate {outputLabel} image.
            Fast, simple and privacy-focused.
          </p>

          <div className="pdfPremiumBadges">
            <span>✓ Every page</span>
            <span>✓ High quality</span>
            <span>✓ Download ZIP</span>
          </div>
        </div>

        {/* =========================================
            MAIN PDF TOOL
        ========================================== */}
        <div className="toolShell pdfToolShell">
          <section className="card toolPanel pdfToolPanel">
            <div
              className={`dropzone ${dragging ? "drag" : ""} pdfDropzone`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  inputRef.current?.click();
                }
              }}
            >
              <div className="premiumUploadIcon pdfUploadIcon">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 16V4"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 9L12 4L17 9"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 20H19"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <strong>Drop your PDF here</strong>
              <span>or click to browse from your device</span>

              <div className="formatChips pdfFormatChips">
                <span className="chip">PDF</span>
                <span className="chip">{outputLabel}</span>
                <span className="chip">All pages</span>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  selectFile(event.target.files?.[0] ?? null)
                }
                hidden
              />
            </div>

            {file && (
              <div className="fileList pdfSelectedFileList">
                <div className="fileRow pdfSelectedFile">
                  <div className="fileMeta">
                    <div className="pdfFileIcon">PDF</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="fileName" title={file.name}>
                        {file.name}
                      </div>
                      <div className="fileSize">
                        {formatBytes(file.size)} · Ready to convert
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btnSecondary btnSmall"
                    onClick={removeFile}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="controls pdfControls">
              <div className="card pdfQualityCard">
                <div className="field">
                  <label htmlFor="pdf-render-quality">
                    Render quality
                  </label>

                  <div className="rangeRow">
                    <span>Standard</span>
                    <strong>{scale}×</strong>
                    <span>High quality</span>
                  </div>

                  <input
                    id="pdf-render-quality"
                    type="range"
                    min="1"
                    max="3"
                    step="0.25"
                    value={scale}
                    onChange={(event) =>
                      setScale(Number(event.target.value))
                    }
                  />

                  <div className="pdfQualityNote">
                    Higher render quality produces sharper pages but larger files.
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="notice pdfErrorNotice">{error}</div>
            )}

            <div
              className="actions"
              style={{
                justifyContent: "stretch",
                marginTop: 18,
              }}
            >
              <button
                type="button"
                className="btn btnPrimary"
                style={{ width: "100%" }}
                disabled={!file || busy}
                onClick={convertPdf}
              >
                {busy ? "Converting…" : `Convert to ${outputLabel}`}
              </button>

              {pages.length > 0 && (
                <button
                  type="button"
                  className="btn btnSecondary"
                  style={{ width: "100%" }}
                  onClick={downloadAll}
                >
                  Download All ZIP
                </button>
              )}
            </div>
          </section>
        </div>

        {/* =========================================
            RESULT PAGES
        ========================================== */}
        {pages.length > 0 && (
          <section className="pdfResultsSection">
            <div className="pdfResultsHeader">
              <div>
                <div className="pdfResultsKicker">CONVERTED PAGES</div>
                <h2>
                  {pages.length} page{pages.length === 1 ? "" : "s"} ready
                </h2>
              </div>

              <button
                type="button"
                className="btn btnPrimary btnSmall"
                onClick={downloadAll}
              >
                Download All ZIP
              </button>
            </div>

            <div className="pdfResultsGrid">
              {pages.map((page) => (
                <article className="card pdfResultCard" key={page.n}>
                  <div className="pdfResultPreviewWrap">
                    <span className="pdfResultPageBadge">Page {page.n}</span>
                    <img
                      src={page.url}
                      alt={`Converted PDF page ${page.n}`}
                      className="pdfResultImage"
                    />
                  </div>

                  <div className="pdfResultContent">
                    <div className="premiumResultName">
                      page-{page.n}.{format}
                    </div>

                    <div className="premiumResultStats">
                      <div>
                        {page.width} × {page.height}px
                      </div>
                      <div>{formatBytes(page.blob.size)}</div>
                    </div>

                    <button
                      type="button"
                      className="btn btnPrimary btnSmall pdfResultDownload"
                      onClick={() =>
                        downloadBlob(page.blob, `page-${page.n}.${format}`)
                      }
                    >
                      Download
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
