"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  GlobalWorkerOptions,
getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { avif, heic } from "icodec";

if (typeof window !== "undefined") {
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

type OutputFormat =
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "avif"
  | "heic"
  | "svg"
  | "bmp"
  | "eps";

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

const MAX_SAFE_PAGES = 300;

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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Unable to create ${mime} output.`));
      },
      mime,
      quality,
    );
  });
}

function makeBmpBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  const { width, height } = canvas;
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const offset = 54;
  const fileSize = offset + pixelDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, offset, true);

  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  let p = offset;
  for (let y = height - 1; y >= 0; y -= 1) {
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x += 1) {
      const i = rowStart + x * 4;
      view.setUint8(p++, rgba[i + 2]);
      view.setUint8(p++, rgba[i + 1]);
      view.setUint8(p++, rgba[i]);
    }
    while ((p - offset) % rowSize !== 0) view.setUint8(p++, 0);
  }

  return new Blob([buffer], { type: "image/bmp" });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function makeSvgBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const png = await canvasToBlob(canvas, "image/png");
  const bytes = new Uint8Array(await png.arrayBuffer());
  const base64 = bytesToBase64(bytes);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="data:image/png;base64,${base64}"/></svg>`;
  return new Blob([svg], { type: "image/svg+xml" });
}

function makeEpsBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let hex = "";
  for (let y = 0; y < canvas.height; y += 1) {
    let row = "";
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4;
      row += [rgba[i], rgba[i + 1], rgba[i + 2]]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
    }
    hex += row + "\n";
  }

  const eps = `%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${canvas.width} ${canvas.height}\n%%LanguageLevel: 2\n%%EndComments\n/saveobj save def\n/DeviceRGB setcolorspace\n${canvas.width} ${canvas.height} scale\n${canvas.width} ${canvas.height} 8\n[${canvas.width} 0 0 -${canvas.height} 0 ${canvas.height}]\n{currentfile ${Math.ceil((canvas.width * 3 * 2) / 72)} string readhexstring pop}\nfalse 3 colorimage\n${hex}%%EOF\nrestore\n`;

  return new Blob([eps], { type: "application/postscript" });
}

async function makeGifBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const palette = quantize(image.data, 256);
  const index = applyPalette(image.data, palette);
  const gif = GIFEncoder();
  gif.writeFrame(index, canvas.width, canvas.height, { palette });
  gif.finish();

  return new Blob([gif.bytes()], { type: "image/gif" });
}

async function encodeSpecial(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
): Promise<Blob> {
  if (format === "jpg") return canvasToBlob(canvas, "image/jpeg", 0.92);
  if (format === "png") return canvasToBlob(canvas, "image/png");
  if (format === "webp") return canvasToBlob(canvas, "image/webp", 0.92);
  if (format === "bmp") return makeBmpBlob(canvas);
  if (format === "svg") return makeSvgBlob(canvas);
  if (format === "eps") return makeEpsBlob(canvas);
  if (format === "gif") return makeGifBlob(canvas);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  const image = context.getImageData(0, 0, canvas.width, canvas.height);

if (format === "avif") {
    const encoded = avif.encode(image as any);
    return new Blob([encoded as any], { type: "image/avif" });
  }

  if (format === "heic") {
    const encoded = heic.encode(image as any, {
      width: canvas.width,
      height: canvas.height,
    } as any);
    return new Blob([encoded as any], { type: "image/heic" });
  }

  throw new Error(`Unsupported output format: ${format}`);
}

function flushUI(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 20);
    });
  });
}

export default function PdfToImage({ format }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const progressTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const statusLabelRef = useRef<HTMLSpanElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageResult[]>([]);
  const [scale, setScale] = useState(1.25);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const outputLabel = format.toUpperCase();

  function revokePages(items = pages) {
    items.forEach((page) => URL.revokeObjectURL(page.url));
  }

  function clearResults() {
    revokePages();
    setPages([]);
    setZipBlob(null);
  }

  useEffect(() => {
    return () => revokePages();
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
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateProgressUI(percent: number, status: string) {
    if (progressTextRef.current) {
      progressTextRef.current.innerText = `${percent}%`;
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${percent}%`;
    }
    if (statusLabelRef.current) {
      statusLabelRef.current.innerText = status;
    }
  }

  async function convertPdf() {
    if (!file || busy) return;

    setBusy(true);
    setError("");
    clearResults();

    await flushUI();
    updateProgressUI(1, "Loading PDF file…");
    await flushUI();

    try {
      const data = await file.arrayBuffer();
      const pdf = await getDocument({ data }).promise;
      const totalPages = pdf.numPages;

      if (totalPages > MAX_SAFE_PAGES) {
        throw new Error(
          `This PDF has ${totalPages} pages. Files over ${MAX_SAFE_PAGES} pages are restricted to prevent crashing. Please split the PDF and try again.`
        );
      }

      if (format === "avif") await avif.loadEncoder();
      if (format === "heic") await heic.loadEncoder();

      const zip = new JSZip();
      const displayPages: PageResult[] = [];

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas is not supported in this browser.");

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const currentPercent = Math.max(
          1,
          Math.floor(((pageNumber - 1) / totalPages) * 100)
        );
        
        updateProgressUI(
          currentPercent,
          `Converting page ${pageNumber} of ${totalPages}…`
        );

        await flushUI();

        const pdfPage = await pdf.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

await pdfPage.render({
          canvasContext: context,
          viewport,
        } as any).promise;

        const blob = await encodeSpecial(canvas, format);

        zip.file(`page-${pageNumber}.${format}`, blob);

        if (pageNumber <= 20) {
          displayPages.push({
            n: pageNumber,
            url: URL.createObjectURL(blob),
            blob,
            width: canvas.width,
            height: canvas.height,
          });
        }

        pdfPage.cleanup();
      }

      updateProgressUI(98, "Packing files into ZIP…");
      await flushUI();

      const generatedZip = await zip.generateAsync({ type: "blob" });
      setZipBlob(generatedZip);
      setPages(displayPages);

      updateProgressUI(100, "Conversion complete!");
      await flushUI();
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

  function handleDownloadZip() {
    if (!zipBlob) return;
    downloadBlob(zipBlob, `imgcontrol-pdf-pages-${format}.zip`);
  }

  return (
    <main className="section pdfToImageSection">
      <div className="container">
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
            Fast, multi-threaded client-side conversion.
          </p>

          <div className="pdfPremiumBadges">
            <span>✓ Up to {MAX_SAFE_PAGES} pages</span>
            <span>✓ Low Memory Streaming</span>
            <span>✓ Download All ZIP</span>
          </div>
        </div>

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
                if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
              }}
            >
              <div className="premiumUploadIcon pdfUploadIcon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 16V4" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M7 9L12 4L17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 20H19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>

              <strong>Drop your PDF here</strong>
              <span>or click to browse from your device</span>

              <div className="formatChips pdfFormatChips">
                <span className="chip">PDF</span>
                <span className="chip">{outputLabel}</span>
                <span className="chip">Max {MAX_SAFE_PAGES} pages</span>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
                hidden
              />
            </div>

            {file && (
              <div className="fileList pdfSelectedFileList">
                <div className="fileRow pdfSelectedFile">
                  <div className="fileMeta">
                    <div className="pdfFileIcon">PDF</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="fileName" title={file.name}>{file.name}</div>
                      <div className="fileSize">{formatBytes(file.size)} · Ready to convert</div>
                    </div>
                  </div>

                  <button type="button" className="btn btnSecondary btnSmall" onClick={removeFile}>Remove</button>
                </div>
              </div>
            )}

            <div className="controls pdfControls">
              <div className="card pdfQualityCard">
                <div className="field">
                  <label htmlFor="pdf-render-quality">Render resolution</label>
                  <div className="rangeRow">
                    <span>1.0× (Fastest)</span>
                    <strong>{scale}×</strong>
                    <span>2.0× (Ultra HD)</span>
                  </div>
                  <input id="pdf-render-quality" type="range" min="1" max="2" step="0.25" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
                  <div className="pdfQualityNote">1.25× gives high clarity with optimal processing speed.</div>
                </div>
              </div>
            </div>

            {error && (
              <div
                className="notice pdfErrorNotice"
                style={{
                  background: "#fff1f1",
                  borderColor: "#ffd1d1",
                  color: "#8b1b1b",
                  padding: "12px 14px",
                  borderRadius: 8,
                  marginTop: 14,
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: busy ? "block" : "none",
                marginTop: 18,
                padding: "12px 16px",
                background: "rgba(59, 130, 246, 0.08)",
                borderRadius: 10,
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                <span ref={statusLabelRef} style={{ color: "#93c5fd" }}>
                  Preparing pages…
                </span>
                <span
                  ref={progressTextRef}
                  style={{
                    color: "#60a5fa",
                    fontSize: 16,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  1%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  background: "rgba(255, 255, 255, 0.12)",
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  ref={progressBarRef}
                  style={{
                    height: "100%",
                    width: "1%",
                    background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                    borderRadius: 5,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>

            <div className="actions" style={{ justifyContent: "stretch", marginTop: 18 }}>
              <button
                type="button"
                className="btn btnPrimary"
                style={{ width: "100%" }}
                disabled={!file || busy}
                onClick={convertPdf}
              >
                {busy ? "Processing PDF…" : `Convert to ${outputLabel}`}
              </button>

              {zipBlob && (
                <button type="button" className="btn btnSecondary" style={{ width: "100%" }} onClick={handleDownloadZip}>
                  Download All ZIP ({formatBytes(zipBlob.size)})
                </button>
              )}
            </div>
          </section>
        </div>

        {pages.length > 0 && (
          <section className="pdfResultsSection">
            <div className="pdfResultsHeader">
              <div>
                <div className="pdfResultsKicker">CONVERTED PAGES</div>
                <h2>Pages ready</h2>
              </div>
              {zipBlob && (
                <button type="button" className="btn btnPrimary btnSmall" onClick={handleDownloadZip}>
                  Download All ZIP
                </button>
              )}
            </div>

            <div className="pdfResultsGrid">
              {pages.map((page) => (
                <article className="card pdfResultCard" key={page.n}>
                  <div className="pdfResultPreviewWrap">
                    <span className="pdfResultPageBadge">Page {page.n}</span>
                    {format === "svg" || format === "eps" || format === "heic" ? (
                      <div className="pdfResultImage" style={{ display: "grid", placeItems: "center", minHeight: 260, background: "#eef6ff" }}>
                        <span style={{ fontWeight: 900 }}>{outputLabel}</span>
                      </div>
                    ) : (
                      <img src={page.url} alt={`Converted PDF page ${page.n}`} className="pdfResultImage" loading="lazy" />
                    )}
                  </div>

                  <div className="pdfResultContent">
                    <div className="premiumResultName">page-{page.n}.{format}</div>
                    <div className="premiumResultStats">
                      <div>{page.width} × {page.height}px</div>
                      <div>{formatBytes(page.blob.size)}</div>
                    </div>
                    <button type="button" className="btn btnPrimary btnSmall pdfResultDownload" onClick={() => downloadBlob(page.blob, `page-${page.n}.${format}`)}>Download</button>
                  </div>
                </article>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24, opacity: 0.8 }}>
              Showing previews for first 20 pages. Complete collection is ready in the ZIP file.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}