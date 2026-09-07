"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import LibRaw from "libraw-wasm";

type Output = {
  name: string;
  blob: Blob;
  original: number;
  width: number;
  height: number;
  url: string;
};

const RAW_EXTENSIONS = [
  ".cr2", ".cr3", ".crw",
  ".nef", ".nrw",
  ".arw", ".srf", ".sr2",
  ".dng",
  ".raf",
  ".orf",
  ".rw2", ".rwl",
  ".pef",
  ".srw",
  ".3fr", ".fff", ".x3f",
];

function fmt(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(3, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 2 : 0)} ${units[i]}`;
}

function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

function pixelTo8(value: number, bits: number) {
  if (bits > 8) return Math.min(255, Math.max(0, Math.round(value / 257)));
  return Math.min(255, Math.max(0, value));
}

async function rawToJpeg(file: File, maxBytes?: number) {
  const raw = new LibRaw();

  try {
    const buffer = await file.arrayBuffer();
    await raw.open(new Uint8Array(buffer), {
      useCameraWb: true,
      useCameraMatrix: 1,
      outputColor: 1,
      outputBps: 8,
      userFlip: -1,
      userQual: 3,
    });

    const decoded = await raw.imageData();
    if (!decoded) throw new Error("RAW decoder returned no image data.");

    const width = decoded.width;
    const height = decoded.height;
    const colors = decoded.colors || 3;
    const bits = decoded.bits || 8;
    const source = decoded.data;

    if (!width || !height || !source?.length) {
      throw new Error("The RAW image could not be decoded.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");

    const rgba = new Uint8ClampedArray(width * height * 4);

    for (let i = 0, pixel = 0; pixel < width * height; pixel += 1, i += colors) {
      const r = pixelTo8(source[i] ?? 0, bits);
      const g = pixelTo8(source[i + 1] ?? source[i] ?? 0, bits);
      const b = pixelTo8(source[i + 2] ?? source[i] ?? 0, bits);

      const out = pixel * 4;
      rgba[out] = r;
      rgba[out + 1] = g;
      rgba[out + 2] = b;
      rgba[out + 3] = 255;
    }

    context.putImageData(new ImageData(rgba, width, height), 0, 0);

    const render = (w: number, h: number, q: number) =>
      new Promise<Blob>((resolve, reject) => {
        const output = document.createElement("canvas");
        output.width = w;
        output.height = h;
        const outCtx = output.getContext("2d");
        if (!outCtx) {
          reject(new Error("Canvas is not available in this browser."));
          return;
        }
        outCtx.drawImage(canvas, 0, 0, w, h);
        output.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Unable to create JPG output."))),
          "image/jpeg",
          q,
        );
      });

    let outWidth = width;
    let outHeight = height;

    // Keep original dimensions whenever possible. The user does not
    // control JPEG quality on this dedicated page; we optimize it internally.
    const findBestQualityUnderTarget = async (w: number, h: number) => {
      const minimumQuality = 0.20;
      const maximumQuality = 0.96;

      const highBlob = await render(w, h, maximumQuality);
      if (highBlob.size <= maxBytes!) {
        return highBlob;
      }

      const lowBlob = await render(w, h, minimumQuality);
      if (lowBlob.size > maxBytes!) {
        return lowBlob;
      }

      let low = minimumQuality;
      let high = maximumQuality;
      let best = lowBlob;

      for (let i = 0; i < 10; i += 1) {
        const mid = (low + high) / 2;
        const test = await render(w, h, mid);

        if (test.size <= maxBytes!) {
          best = test;
          low = mid;
        } else {
          high = mid;
        }
      }

      return best;
    };

    if (!maxBytes) {
      const blob = await render(outWidth, outHeight, 0.92);
      return { blob, width: outWidth, height: outHeight };
    }

    let blob = await findBestQualityUnderTarget(outWidth, outHeight);

    // If the target is too small to achieve at the original dimensions,
    // reduce resolution gradually and then maximize JPEG quality under the target.
    for (let attempt = 0; attempt < 12 && blob.size > maxBytes; attempt += 1) {
      const ratio = Math.sqrt(maxBytes / Math.max(1, blob.size));
      const scale = Math.max(0.42, Math.min(0.92, ratio * 0.96));

      const nextWidth = Math.max(1, Math.floor(outWidth * scale));
      const nextHeight = Math.max(1, Math.floor(outHeight * scale));

      if (nextWidth >= outWidth && nextHeight >= outHeight) {
        break;
      }

      outWidth = nextWidth;
      outHeight = nextHeight;
      blob = await findBestQualityUnderTarget(outWidth, outHeight);
    }

    return { blob, width: outWidth, height: outHeight };
  } finally {
    raw.dispose();
  }
}

export default function RawToJpgClient() {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [previewMap, setPreviewMap] = useState<Map<File, string>>(new Map());
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [target, setTarget] = useState(5);
  const [unit, setUnit] = useState<"KB" | "MB">("MB");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function selectFiles(list: FileList | File[]) {
    const accepted = Array.from(list).filter((file) => {
      const name = file.name.toLowerCase();
      return RAW_EXTENSIONS.some((ext) => name.endsWith(ext));
    });

    if (!accepted.length) {
      setError("Please select supported camera RAW files such as CR2, CR3, NEF, ARW, DNG or RAF.");
      return;
    }

    const nextFiles = accepted.slice(0, Math.max(0, 20 - files.length));

    if (!nextFiles.length) {
      setError("You can add up to 20 RAW files at a time.");
      return;
    }

    setFiles((prev) => [...prev, ...nextFiles]);
    setOutputs([]);
    setError("");

    // Generate lightweight local previews for the selected RAW files.
    // RAW files cannot be previewed directly by the browser, so we decode
    // a small JPG preview using the same browser-side RAW decoder.
    (async () => {
      for (const file of nextFiles) {
        try {
          const preview = await rawToJpeg(file, 350 * 1024);
          const previewUrl = URL.createObjectURL(preview.blob);

          setPreviewMap((current) => {
            const next = new Map(current);
            const oldUrl = next.get(file);
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            next.set(file, previewUrl);
            return next;
          });
        } catch {
          // Keep the file usable even if a preview cannot be generated.
        }
      }
    })();
  }

  async function convertAll() {
    if (!files.length || busy) return;

    setBusy(true);
    setProgress(0);
    setError("");

    try {
      const next: Output[] = [];
      const maxBytes = targetEnabled
        ? (unit === "MB" ? target * 1024 * 1024 : target * 1024)
        : undefined;

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const converted = await rawToJpeg(file, maxBytes);
        next.push({
          name: `${stripExt(file.name)}.jpg`,
          blob: converted.blob,
          original: file.size,
          width: converted.width,
          height: converted.height,
          url: URL.createObjectURL(converted.blob),
        });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setOutputs(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "RAW conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  function downloadOne(output: Output) {
    const a = document.createElement("a");
    a.href = output.url;
    a.download = output.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadAll() {
    if (!outputs.length) return;
    const zip = new JSZip();
    outputs.forEach((item) => zip.file(item.name, item.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imgcontrol-raw-to-jpg.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearAll() {
    outputs.forEach((item) => URL.revokeObjectURL(item.url));

    previewMap.forEach((url) => URL.revokeObjectURL(url));

    setPreviewMap(new Map());
    setFiles([]);
    setOutputs([]);
    setProgress(0);
    setError("");
    if (input.current) input.current.value = "";
  }

  useEffect(() => {
    return () => {
      previewMap.forEach((url) => URL.revokeObjectURL(url));
      outputs.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const originalTotal = outputs.reduce((sum, item) => sum + item.original, 0);
  const outputTotal = outputs.reduce((sum, item) => sum + item.blob.size, 0);
  const saved = originalTotal
    ? Math.max(0, Math.round((1 - outputTotal / originalTotal) * 100))
    : 0;

  return (
    <div className="toolShell">
      <div className="card toolPanel">
        <input
          ref={input}
          hidden
          type="file"
          multiple
          accept={RAW_EXTENSIONS.join(",")}
          onChange={(e) => e.target.files && selectFiles(e.target.files)}
        />

        <div className="dropzone" onClick={() => input.current?.click()}>
          <div className="premiumUploadIcon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7.5 9.5L12 5l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <strong>Drop RAW photos here or tap to browse</strong>
          <span>CR2 · CR3 · NEF · ARW · DNG · RAF · ORF · RW2 and more</span>
        </div>

        <div className="rawFormatRow">
          <div className="rawFormatCard">
            <span className="rawFormatLabel">INPUT</span>
            <strong>RAW</strong>
          </div>

          <div className="rawFormatArrow" aria-hidden="true">→</div>

          <div className="rawFormatCard">
            <span className="rawFormatLabel">OUTPUT</span>
            <strong>JPG</strong>
          </div>
        </div>

        {files.length > 0 && (
          <div className="fileList">
            {files.map((file, index) => (
              <div className="fileRow rawFileRow" key={`${file.name}-${file.lastModified}-${index}`}>
                <div className="rawFileMeta">
                  {previewMap.get(file) ? (
                    <img
                      className="rawFileThumb"
                      src={previewMap.get(file)}
                      alt={`Preview of ${file.name}`}
                    />
                  ) : (
                    <div className="rawFileThumb rawFileThumbPlaceholder" aria-hidden="true">
                      RAW
                    </div>
                  )}

                  <div>
                    <div className="fileName">{file.name}</div>
                    <div className="fileSize">{fmt(file.size)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btnSecondary btnSmall"
                  onClick={() => {
                    const previewUrl = previewMap.get(file);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);

                    setPreviewMap((current) => {
                      const next = new Map(current);
                      next.delete(file);
                      return next;
                    });

                    setFiles((prev) => prev.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="controls">
          <div className="rawTargetBox">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                fontWeight: 800,
                color: "inherit",
              }}
            >
              <input
                className="premiumCheckbox"
                type="checkbox"
                checked={targetEnabled}
                onChange={(e) => setTargetEnabled(e.target.checked)}
              />
              <span>Set maximum output size</span>
            </label>

            {targetEnabled && (
              <div className="premiumSizeRow" style={{ marginTop: 12 }}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={target}
                  onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as "KB" | "MB")}
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {progress > 0 && progress < 100 && (
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
        )}

        {error && <div className="notice">{error}</div>}

        <div className="actions" style={{ justifyContent: "flex-start", marginTop: 18 }}>
          <button type="button" className="btn btnPrimary" disabled={!files.length || busy} onClick={convertAll}>
            {busy ? `Converting ${progress}%…` : "Convert RAW to JPG"}
          </button>
          <button type="button" className="btn btnSecondary" disabled={!files.length && !outputs.length} onClick={clearAll}>
            Clear All
          </button>
        </div>

        {outputs.length > 0 && (
          <div className="result">
            <div className="resultHeader">
              <strong>Conversion complete</strong>
              <button type="button" className="btn btnPrimary btnSmall" onClick={downloadAll}>
                Download All ZIP
              </button>
            </div>

            <div className="statGrid">
              <div className="stat"><strong>{fmt(originalTotal)}</strong><span>Original total</span></div>
              <div className="stat"><strong>{fmt(outputTotal)}</strong><span>JPG total</span></div>
              <div className="stat"><strong>{saved}%</strong><span>Saved</span></div>
            </div>

            <div className="fileList">
              {outputs.map((output) => (
                <div className="fileRow" key={output.name}>
                  <div>
                    <div className="fileName">{output.name}</div>
                    <div className="fileSize">
                      {fmt(output.original)} → {fmt(output.blob.size)} · {output.width} × {output.height}
                    </div>
                  </div>
                  <button type="button" className="btn btnPrimary btnSmall" onClick={() => downloadOne(output)}>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="notice">
          RAW decoding is performed in the browser using WebAssembly. Large camera RAW files can require substantial memory and processing time.
        </div>
      </div>

      <style jsx global>{`
        .rawFormatRow {
          display: grid;
          grid-template-columns: 1fr 38px 1fr;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        .rawFormatCard {
          min-height: 74px;
          padding: 13px 15px;
          border: 1px solid #cbdceb;
          border-radius: 12px;
          background: linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          color: #17324a;
        }

        .rawFormatCard strong {
          font-size: 16px;
          letter-spacing: 0.01em;
        }

        .rawFormatLabel {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: #1884f0;
        }

        .rawFormatArrow {
          display: grid;
          place-items: center;
          font-size: 24px;
          font-weight: 900;
          color: #1683ef;
        }

        .rawFileRow {
          align-items: center;
        }

        .rawFileMeta {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .rawFileThumb {
          width: 64px;
          height: 52px;
          border-radius: 10px;
          object-fit: cover;
          flex: 0 0 auto;
          border: 1px solid #cbdceb;
          background: linear-gradient(135deg, #eaf5ff, #ffffff);
        }

        .rawFileThumbPlaceholder {
          display: grid;
          place-items: center;
          color: #1884f0;
          font-size: 11px;
          font-weight: 900;
        }

        html.dark .rawFormatCard {
          border-color: #29485f;
          background: linear-gradient(180deg, #102b40 0%, #0d2436 100%);
          color: #eaf4fb;
        }

        html.dark .rawFormatLabel {
          color: #64b4ff;
        }

        html.dark .rawFileThumb {
          border-color: #29485f;
          background: linear-gradient(135deg, #102b40, #0d2436);
        }

        @media (max-width: 640px) {
          .rawFormatRow {
            grid-template-columns: 1fr;
          }

          .rawFormatArrow {
            transform: rotate(90deg);
            height: 18px;
          }

          .rawFileRow {
            gap: 10px;
          }

          .rawFileThumb {
            width: 58px;
            height: 48px;
          }
        }

        .rawTargetBox {
          padding: 14px;
          border: 1px solid #cbdceb;
          border-radius: 12px;
          background: linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
          color: #17324a;
        }

        .rawTargetBox label {
          color: #17324a !important;
        }

        .rawTargetBox .premiumSizeRow input,
        .rawTargetBox .premiumSizeRow select {
          color: #17324a;
          background: #ffffff;
          border-color: #b9d4e8;
        }

        html.dark .rawTargetBox {
          border-color: #29485f;
          background: linear-gradient(180deg, #102b40 0%, #0d2436 100%);
          color: #eaf4fb;
        }

        html.dark .rawTargetBox label {
          color: #eaf4fb !important;
        }

        html.dark .rawTargetBox .premiumSizeRow input,
        html.dark .rawTargetBox .premiumSizeRow select {
          color: #eaf4fb;
          background: #0d2538;
          border-color: #29485f;
        }
      `}</style>
    </div>
  );
}
