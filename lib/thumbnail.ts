import { decodeToCanvas, isHeicFile } from "@/lib/codecs";

/**
 * Small preview images for files a visitor has just selected.
 *
 * Browsers cannot show HEIC and cannot preview a PDF, so those are decoded
 * here (on the visitor's own device) and shrunk to a thumbnail. The result is
 * cached per File, so a re-render never repeats the work.
 */

const SIZE = 256;
const cache = new WeakMap<File, Promise<Blob>>();

// HEIC decoding shares one worker with the conversion itself, so only the
// first few photos get a thumbnail and a long list cannot delay the conversion.
const HEIC_THUMBNAIL_LIMIT = 12;
let heicThumbnails = 0;

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function makeThumbnail(file: File): Promise<Blob> {
  let promise = cache.get(file);

  if (!promise) {
    promise = build(file);
    cache.set(file, promise);
  }

  return promise;
}

async function build(file: File): Promise<Blob> {
  if (isPdfFile(file)) return pdfFirstPage(file);

  if (isHeicFile(file)) {
    if (heicThumbnails >= HEIC_THUMBNAIL_LIMIT) throw new Error("No thumbnail for this file.");
    heicThumbnails += 1;
    return shrink(await decodeToCanvas(file, "heic"));
  }

  try {
    return shrink(await createImageBitmap(file));
  } catch {
    // Some formats (AVIF in older browsers) are not decodable by the browser.
    if (/\.avif$/i.test(file.name) || file.type === "image/avif") {
      return shrink(await decodeToCanvas(file, "avif"));
    }
    return shrink(await loadWithImageElement(file));
  }
}

function loadWithImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The browser cannot show this image."));
    };
    image.src = url;
  });
}

type Drawable = ImageBitmap | HTMLCanvasElement | HTMLImageElement;

function dimensions(source: Drawable) {
  if (source instanceof HTMLImageElement) return { w: source.naturalWidth, h: source.naturalHeight };
  return { w: source.width, h: source.height };
}

async function shrink(source: Drawable): Promise<Blob> {
  const { w, h } = dimensions(source);
  const scale = Math.min(1, SIZE / Math.max(w, h));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");

  // A white base keeps transparent images readable as a JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  if ("close" in source && typeof source.close === "function") source.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No thumbnail."))), "image/jpeg", 0.82),
  );
}

async function pdfFirstPage(file: File): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;

  try {
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: SIZE / Math.max(base.width, base.height) });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport } as never).promise;

    return await new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No thumbnail."))), "image/jpeg", 0.85),
    );
  } finally {
    await pdf.destroy();
  }
}
