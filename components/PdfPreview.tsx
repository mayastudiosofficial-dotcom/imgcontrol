"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PAGES = 8;

/**
 * Draws the pages of a finished PDF so the visitor can check the result before
 * downloading. The PDF library is only loaded once a PDF actually exists.
 */
export default function PdfPreview({ blob }: { blob: Blob }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const pdf = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
        if (cancelled) return;
        setPageCount(pdf.numPages);

        const container = host.current;
        if (!container) return;
        container.innerHTML = "";

        for (let n = 1; n <= Math.min(pdf.numPages, MAX_PAGES); n += 1) {
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: 220 / base.width });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.setAttribute("aria-label", `PDF page ${n}`);
          canvas.style.cssText =
            "display:block;width:100%;height:auto;border:1px solid var(--border);border-radius:8px;background:#fff";

          const context = canvas.getContext("2d");
          if (!context) continue;
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport } as never).promise;
          if (cancelled) return;

          const cell = document.createElement("figure");
          cell.style.cssText = "margin:0;display:grid;gap:6px;min-width:0";
          const caption = document.createElement("figcaption");
          caption.textContent = `Page ${n}`;
          caption.style.cssText = "font-size:12px;opacity:.75;text-align:center";
          cell.append(canvas, caption);
          container.append(cell);
          page.cleanup();
        }

        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blob]);

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>
        Preview of your PDF{pageCount ? ` (${pageCount} ${pageCount === 1 ? "page" : "pages"})` : ""}
      </div>

      {state === "loading" && <div style={{ fontSize: 13, opacity: 0.75 }}>Preparing preview…</div>}
      {state === "failed" && (
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          The preview could not be drawn in this browser. Your PDF is ready to download.
        </div>
      )}

      <div
        ref={host}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}
      />

      {pageCount > MAX_PAGES && (
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 10 }}>
          Showing the first {MAX_PAGES} pages. The downloaded PDF has all {pageCount}.
        </div>
      )}
    </div>
  );
}
