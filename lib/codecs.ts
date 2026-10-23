/**
 * Browser-side AVIF / HEIC support.
 *
 * Browsers cannot encode AVIF or HEIC from a canvas (toBlob silently returns
 * a PNG instead) and most cannot decode HEIC, so those formats go through the
 * icodec WebAssembly codecs in a worker. Everything stays on the user's device.
 */

type Fmt = "avif" | "heic";

type Pending = {
  resolve: (v: { buffer: ArrayBuffer; width?: number; height?: number }) => void;
  reject: (e: Error) => void;
};

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL("../components/codec.worker.ts", import.meta.url), {
    type: "module",
  });

  worker.onmessage = (event: MessageEvent) => {
    const { id, ok, buffer, width, height, error } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (ok) entry.resolve({ buffer, width, height });
    else entry.reject(new Error(error || "Image codec failed."));
  };

  worker.onerror = (event) => {
    const err = new Error(event.message || "Image codec failed to start.");
    pending.forEach((p) => p.reject(err));
    pending.clear();
    worker?.terminate();
    worker = null;
  };

  return worker;
}

function call(message: Record<string, unknown>, transfer: Transferable[]) {
  return new Promise<{ buffer: ArrayBuffer; width?: number; height?: number }>((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ ...message, id }, transfer);
  });
}

function canvasPixels(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function isHeicFile(file: File) {
  return /\.(heic|heif)$/i.test(file.name) || /^image\/(heic|heif)(-sequence)?$/i.test(file.type);
}

export function needsWasmEncoder(mime: string) {
  return mime === "image/avif" || mime === "image/heic";
}

/** Encode a canvas as a real AVIF or HEIC file. quality is 0..1. */
export async function encodeCanvasWithWasm(
  canvas: HTMLCanvasElement,
  mime: "image/avif" | "image/heic",
  quality = 0.6,
): Promise<Blob> {
  const fmt: Fmt = mime === "image/avif" ? "avif" : "heic";
  const image = canvasPixels(canvas);

  if (fmt === "heic") {
    throw new Error("HEIC encoding is not supported in the browser yet.");
  }

  const buffer = image.data.buffer.slice(0) as ArrayBuffer;

  const out = await call(
    { op: "encode", fmt, buffer, width: canvas.width, height: canvas.height, quality: Math.round(quality * 100) },
    [buffer],
  );

  return new Blob([out.buffer], { type: mime });
}

/** Decode HEIC (or AVIF when the browser cannot) into a PNG File the normal pipeline can read. */
export async function decodeWithWasm(file: File, fmt: Fmt = "heic"): Promise<File> {
  const buffer = await file.arrayBuffer();
  const out = await call({ op: "decode", fmt, buffer }, [buffer]);

  const canvas = document.createElement("canvas");
  canvas.width = out.width as number;
  canvas.height = out.height as number;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.putImageData(new ImageData(new Uint8ClampedArray(out.buffer), canvas.width, canvas.height), 0, 0);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Unable to read HEIC image."))), "image/png"),
  );

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", { type: "image/png" });
}

/** HEIC files are decoded with WebAssembly; every other file is returned unchanged. */
export async function normalizeInputFile(file: File): Promise<File> {
  return isHeicFile(file) ? decodeWithWasm(file, "heic") : file;
}
