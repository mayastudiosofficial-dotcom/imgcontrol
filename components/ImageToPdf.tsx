"use client";

import { useRef, useState } from "react";
import { jsPDF } from "jspdf";

function fmt(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(3, Math.floor(Math.log(b) / Math.log(1024)));
  return `${(b / 1024 ** i).toFixed(i ? 2 : 0)} ${u[i]}`;
}

export default function ImageToPdf() {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sizeOn, setSizeOn] = useState(false);
  const [target, setTarget] = useState(2);
  const [unit, setUnit] = useState<"MB" | "KB">("MB");
  const [paper, setPaper] = useState("auto");
  const [margin, setMargin] = useState(10);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [err, setErr] = useState("");

  function add(list: FileList) {
    const rawImages = Array.from(list).filter((f) => f.type.startsWith("image/"));
    
    if (files.length + rawImages.length > 50) {
      setErr("Maximum 50 images can be converted at a time. Extra images were skipped.");
    } else {
      setErr("");
    }

    const combined = [...files, ...rawImages].slice(0, 50);
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    setResult(null);
  }

  function renderImageToJpeg(
    img: HTMLImageElement,
    scale: number,
    quality: number
  ): { data: string; w: number; h: number } {
    const c = document.createElement("canvas");
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    c.width = w;
    c.height = h;

    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    return {
      data: c.toDataURL("image/jpeg", quality),
      w: img.naturalWidth,
      h: img.naturalHeight,
    };
  }

  function buildPdf(
    images: HTMLImageElement[],
    scale: number,
    quality: number
  ): Blob {
    const firstImg = images[0];
    const im0 = renderImageToJpeg(firstImg, scale, quality);
    const p = (paper === "auto" ? "a4" : paper) as any;

    const pdf = new jsPDF({
      orientation: im0.w > im0.h ? "landscape" : "portrait",
      unit: "mm",
      format: p,
      compress: true,
    });

    for (let i = 0; i < images.length; i++) {
      const im = renderImageToJpeg(images[i], scale, quality);
      if (i > 0) {
        pdf.addPage(
          paper === "auto" ? "a4" : paper,
          im.w > im.h ? "landscape" : "portrait"
        );
      }
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(
        (pageW - margin * 2) / im.w,
        (pageH - margin * 2) / im.h
      );
      const w = im.w * ratio;
      const h = im.h * ratio;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;

      pdf.addImage(im.data, "JPEG", x, y, w, h, undefined, "FAST");
    }

    return pdf.output("blob") as Blob;
  }

  async function create() {
    if (!files.length) {
      setErr("Please add at least one image.");
      return;
    }

    setBusy(true);
    setErr("");
    setResult(null);

    try {
      const loadedImages: HTMLImageElement[] = await Promise.all(
        files.map((file) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
              URL.revokeObjectURL(url);
              resolve(img);
            };
            img.onerror = reject;
            img.src = url;
          });
        })
      );

      let finalBlob: Blob;

      if (sizeOn) {
        const targetBytes =
          unit === "MB" ? target * 1024 * 1024 : target * 1024;

        let low = 0.05;
        let high = 1.0;
        let bestBlob: Blob | null = null;

        for (let iteration = 0; iteration < 6; iteration++) {
          const mid = (low + high) / 2;
          const scale = Math.max(0.2, mid);
          const quality = Math.max(0.1, mid * 0.9);

          const currentBlob = buildPdf(loadedImages, scale, quality);

          if (currentBlob.size <= targetBytes) {
            bestBlob = currentBlob;
            low = mid;
            if (currentBlob.size >= targetBytes * 0.88) {
              break;
            }
          } else {
            high = mid;
          }
        }

        finalBlob =
          bestBlob || buildPdf(loadedImages, Math.max(0.15, low), 0.15);
      } else {
        finalBlob = buildPdf(loadedImages, 1.0, 0.9);
      }

      setResult(finalBlob);
    } catch (e: any) {
      setErr(e?.message || "PDF creation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="toolShell">
      <div className="card toolPanel">
        <input
          ref={input}
          hidden
          type="file"
          accept="image/*,.heic,.avif,.tif,.tiff"
          multiple
          onChange={(e) => e.target.files && add(e.target.files)}
        />
        
        <div className="dropzone" onClick={() => input.current?.click()} style={{ cursor: "pointer" }}>
          <div
            className="uploadIcon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg
              width="68"
              height="68"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0px 8px 16px rgba(59, 130, 246, 0.4))",
              }}
            >
              <defs>
                <linearGradient id="imgGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="4"
                stroke="url(#imgGrad)"
                strokeWidth="2"
                fill="rgba(59, 130, 246, 0.08)"
              />
              <circle cx="8.5" cy="8.5" r="2" fill="url(#imgGrad)" />
              <path
                d="M21 15.5L16 10.5L5 21"
                stroke="url(#imgGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 15.5L16.5 12.5L21 17"
                stroke="url(#imgGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.7"
              />
            </svg>
          </div>
          <strong>Drop images here or tap to browse</strong>
          <span>Upload up to 50 images to create a single multi-page PDF.</span>
        </div>

        {files.length > 0 && (
          <div className="reorderList">
            {files.map((f, i) => (
              <div className="reorderItem" key={f.name + i}>
                <span className="dragHandle">☷</span>
                <img className="reorderThumb" src={previews[i]} alt="" />
                <div style={{ flex: 1 }}>
                  <strong>
                    {i + 1}. {f.name}
                  </strong>
                  <div className="fileSize">{fmt(f.size)}</div>
                </div>
                <button
                  type="button"
                  className="btn btnSecondary btnSmall"
                  onClick={() => {
                    const nf = files.filter((_, x) => x !== i);
                    setFiles(nf);
                    setPreviews(nf.map((x) => URL.createObjectURL(x)));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="controls">
          <div className="controlGrid">
            <div className="field">
              <label>Paper size</label>
              <select value={paper} onChange={(e) => setPaper(e.target.value)}>
                <option value="auto">Auto</option>
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div className="field">
              <label>Margin (mm)</label>
              <input
                type="number"
                min="0"
                value={margin}
                onChange={(e) => setMargin(+e.target.value)}
              />
            </div>
          </div>

          <label>
            <input
              type="checkbox"
              checked={sizeOn}
              onChange={(e) => setSizeOn(e.target.checked)}
            />{" "}
            Set maximum output size
          </label>

          {sizeOn && (
            <div className="controlGrid">
              <div className="field">
                <label>Maximum size</label>
                <input
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(+e.target.value)}
                />
              </div>
              <div className="field">
                <label>Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                >
                  <option>MB</option>
                  <option>KB</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {err && (
          <div
            className="notice"
            style={{
              background: "#fff1f1",
              borderColor: "#ffd1d1",
              color: "#8b1b1b",
              marginTop: 12,
            }}
          >
            {err}
          </div>
        )}

        <div
          className="actions"
          style={{ justifyContent: "flex-start", marginTop: 18 }}
        >
          <button
            type="button"
            className="btn btnPrimary"
            disabled={busy}
            onClick={create}
          >
            {busy ? "Creating PDF…" : `Create PDF (${files.length}/50)`}
          </button>
          {result && (
            <button
              type="button"
              className="btn btnSecondary"
              onClick={() => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(result);
                a.download = "imgcontrol-images.pdf";
                a.click();
              }}
            >
              Download PDF · {fmt(result.size)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}