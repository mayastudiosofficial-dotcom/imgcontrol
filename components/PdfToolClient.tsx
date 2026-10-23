"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import JSZip from "jszip";
import FilePreview from "@/components/FilePreview";
import PdfPreview from "@/components/PdfPreview";
import type { PdfToolSlug } from "@/lib/moreTools";
import { creep } from "@/lib/progress";
import { loadPdfjs } from "@/lib/pdfjs";
import {
  compressPdf,
  compressToSize,
  countPages,
  deletePages,
  extractPages,
  extractText,
  mergePdfs,
  parsePageRanges,
  rotatePdf,
  splitEveryPage,
  type CompressLevel,
} from "@/lib/pdfOps";

type Item = { id: string; file: File; pages: number };

type Result =
  | { kind: "pdf"; blob: Blob; name: string; before: number; pages: number; note?: string }
  | { kind: "zip"; blob: Blob; name: string; count: number }
  | { kind: "text"; text: string; name: string; pages: number; empty: number }
  | { kind: "nogain"; before: number; after: number }
  | { kind: "small"; before: number; target: number };

const MAX_MERGE = 30;

const SIZE_PRESETS: [string, string][] = [
  ["100", "100 KB"],
  ["200", "200 KB"],
  ["500", "500 KB"],
  ["1024", "1 MB"],
  ["2048", "2 MB"],
  ["5120", "5 MB"],
  ["custom", "Custom size…"],
];

const COPY: Record<PdfToolSlug, { drop: string; hint: string; run: string }> = {
  "merge-pdf": { drop: "Drop PDF files here or tap to browse", hint: "Add two or more PDFs, up to 30 files.", run: "Merge PDF" },
  "split-pdf": { drop: "Drop a PDF here or tap to browse", hint: "Take out some pages, or split it into one file per page.", run: "Split PDF" },
  "rotate-pdf": { drop: "Drop a PDF here or tap to browse", hint: "Turn every page, or only the pages you choose.", run: "Rotate PDF" },
  "compress-pdf": { drop: "Drop a PDF here or tap to browse", hint: "Make a large PDF smaller for email and uploads.", run: "Compress PDF" },
  "delete-pdf-pages": { drop: "Drop a PDF here or tap to browse", hint: "Remove the pages you do not need.", run: "Delete pages" },
  "pdf-to-text": { drop: "Drop a PDF here or tap to browse", hint: "Copy the text out of a PDF.", run: "Extract text" },
};

function fmt(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(3, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 2 : 0)} ${units[i]}`;
}

function baseName(name: string) {
  return name.replace(/\.pdf$/i, "") || "document";
}

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function toBlob(bytes: Uint8Array, type = "application/pdf") {
  return new Blob([bytes as BlobPart], { type });
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Page count that also copes with PDFs the editing library is strict about. */
async function readPageCount(file: File): Promise<number> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    return await countPages(bytes);
  } catch (error) {
    if (/password/i.test(String((error as Error).message))) throw error;

    const { getDocument } = await loadPdfjs();
    const pdf = await getDocument({ data: bytes }).promise;
    const count = pdf.numPages;
    await pdf.destroy();
    return count;
  }
}

export default function PdfToolClient({ tool }: { tool: PdfToolSlug }) {
  const input = useRef<HTMLInputElement>(null);
  const copy = COPY[tool];
  const many = tool === "merge-pdf";

  const [items, setItems] = useState<Item[]>([]);
  const [ranges, setRanges] = useState("");
  const [splitMode, setSplitMode] = useState<"extract" | "every">("extract");
  const [angle, setAngle] = useState(90);
  const [level, setLevel] = useState<CompressLevel>("balanced");
  const [compressBy, setCompressBy] = useState<"level" | "size">("level");
  const [sizePreset, setSizePreset] = useState("500");
  const [customSize, setCustomSize] = useState("300");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function addFiles(list: FileList | File[]) {
    const pdfs = Array.from(list).filter(isPdf);

    if (!pdfs.length) {
      setError("Please choose a PDF file.");
      return;
    }

    setError("");
    setResult(null);

    const chosen = many ? pdfs.slice(0, MAX_MERGE - items.length) : pdfs.slice(0, 1);
    const added: Item[] = [];

    for (const file of chosen) {
      try {
        added.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, pages: await readPageCount(file) });
      } catch (problem) {
        setError(`${file.name}: ${(problem as Error).message}`);
      }
    }

    if (!added.length) return;

    if (many) {
      setItems((current) => [...current, ...added].slice(0, MAX_MERGE));
      if (items.length + pdfs.length > MAX_MERGE) setError(`You can merge up to ${MAX_MERGE} files at a time. The extra files were skipped.`);
    } else {
      setItems(added);
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
  }

  function onZoneKey(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.current?.click();
    }
  }

  function move(index: number, by: number) {
    setResult(null);
    setItems((current) => {
      const next = [...current];
      const target = index + by;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setResult(null);
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function wantedBytes(): number {
    if (sizePreset !== "custom") return Number(sizePreset) * 1024;

    const value = Number(customSize);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Type the size you want, for example 300 KB.");
    }

    const bytes = value * (customUnit === "MB" ? 1024 * 1024 : 1024);
    if (bytes < 5 * 1024) throw new Error("That size is too small for a PDF. Try 10 KB or more.");
    return bytes;
  }

  async function run() {
    if (busy) return;

    if (!items.length || (many && items.length < 2)) {
      setError(many ? "Add at least two PDF files to merge." : "Add a PDF first.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    setProgress(0);

    const report = (fraction: number) => setProgress(Math.round(Math.min(fraction, 0.99) * 100));
    const first = items[0];
    const sizeMb = first.file.size / 1048576;
    const stop = creep(report, 0.02, 0.9, 400 + sizeMb * 200);
    const bytes = async (file: File) => new Uint8Array(await file.arrayBuffer());

    try {
      if (tool === "merge-pdf") {
        stop();
        const all = await Promise.all(items.map((item) => bytes(item.file)));
        const merged = await mergePdfs(all, report);
        const before = items.reduce((sum, item) => sum + item.file.size, 0);
        setResult({ kind: "pdf", blob: toBlob(merged), name: "merged.pdf", before, pages: items.reduce((s, i) => s + i.pages, 0) });
      } else if (tool === "split-pdf") {
        if (splitMode === "every") {
          stop();
          const files = await splitEveryPage(await bytes(first.file), report);
          const zip = new JSZip();
          const width = String(files.length).length;
          files.forEach((data, index) => zip.file(`${baseName(first.file.name)}-page-${String(index + 1).padStart(width, "0")}.pdf`, data));
          setResult({ kind: "zip", blob: await zip.generateAsync({ type: "blob" }), name: `${baseName(first.file.name)}-pages.zip`, count: files.length });
        } else {
          const pages = parsePageRanges(ranges, first.pages);
          const out = await extractPages(await bytes(first.file), pages);
          setResult({ kind: "pdf", blob: toBlob(out), name: `${baseName(first.file.name)}-pages.pdf`, before: first.file.size, pages: pages.length });
        }
      } else if (tool === "rotate-pdf") {
        const pages = ranges.trim() ? parsePageRanges(ranges, first.pages) : null;
        const out = await rotatePdf(await bytes(first.file), pages, angle);
        setResult({ kind: "pdf", blob: toBlob(out), name: `${baseName(first.file.name)}-rotated.pdf`, before: first.file.size, pages: first.pages });
      } else if (tool === "delete-pdf-pages") {
        const pages = parsePageRanges(ranges, first.pages);
        const out = await deletePages(await bytes(first.file), pages);
        setResult({ kind: "pdf", blob: toBlob(out), name: `${baseName(first.file.name)}-edited.pdf`, before: first.file.size, pages: first.pages - pages.length });
      } else if (tool === "compress-pdf") {
        if (compressBy === "size") {
          const target = wantedBytes();
          stop();
          const sized = await compressToSize(first.file, target, report);

          if (sized.alreadySmall) {
            setResult({ kind: "small", before: first.file.size, target });
          } else {
            setResult({
              kind: "pdf",
              blob: toBlob(sized.bytes),
              name: `${baseName(first.file.name)}-compressed.pdf`,
              before: first.file.size,
              pages: first.pages,
              note: sized.reached
                ? undefined
                : `This is the smallest the tool could make: ${fmt(sized.bytes.length)}. A PDF with these pages cannot get under ${fmt(target)} without becoming unreadable. Try a larger size.`,
            });
          }
        } else {
          stop();
          const out = await compressPdf(first.file, level, report);
          if (out.length >= first.file.size) {
            setResult({ kind: "nogain", before: first.file.size, after: out.length });
          } else {
            setResult({ kind: "pdf", blob: toBlob(out), name: `${baseName(first.file.name)}-compressed.pdf`, before: first.file.size, pages: first.pages });
          }
        }
      } else {
        stop();
        const extracted = await extractText(first.file, report);
        setResult({ kind: "text", text: extracted.text, name: `${baseName(first.file.name)}.txt`, pages: extracted.pages, empty: extracted.pagesWithoutText });
      }

      setProgress(100);
    } catch (problem) {
      setError((problem as Error).message || "Something went wrong. Please try again.");
    } finally {
      stop();
      setBusy(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* the text is selectable in the box above */
    }
  }

  const needsRanges = tool === "delete-pdf-pages" || (tool === "split-pdf" && splitMode === "extract") || tool === "rotate-pdf";

  return (
    <div className="toolShell">
      <div className="card toolPanel">
        <input
          ref={input}
          hidden
          type="file"
          accept=".pdf,application/pdf"
          multiple={many}
          onChange={(event) => {
            if (event.target.files) void addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div
          className="dropzone"
          role="button"
          tabIndex={0}
          aria-label={copy.drop}
          onClick={() => input.current?.click()}
          onKeyDown={onZoneKey}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{ cursor: "pointer", outline: dragging ? "2px dashed var(--blue)" : undefined }}
        >
          <div className="uploadIcon" style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 3h8l5 5v13H6V3z" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(59,130,246,.08)" />
              <path d="M14 3v5h5" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round" />
              <text x="8" y="17" fontSize="5.5" fontWeight="800" fill="#3b82f6">PDF</text>
            </svg>
          </div>
          <strong>{copy.drop}</strong>
          <span>{copy.hint}</span>
        </div>

        {error && (
          <div className="notice" role="alert" style={{ background: "#fff1f1", borderColor: "#ffd1d1", color: "#8b1b1b", marginTop: 12 }}>
            {error}
          </div>
        )}

        {items.length > 0 && (
          <div className="reorderList">
            {items.map((item, index) => (
              <div className="reorderItem" key={item.id} style={{ flexWrap: "wrap", rowGap: 10 }}>
                <FilePreview className="reorderThumb" file={item.file} alt={`First page of ${item.file.name}`} />
                <div style={{ flex: "1 1 150px", minWidth: 0 }}>
                  <strong style={{ overflowWrap: "break-word", wordBreak: "break-word" }}>
                    {many ? `${index + 1}. ` : ""}
                    {item.file.name}
                  </strong>
                  <div className="fileSize">
                    {fmt(item.file.size)} · {item.pages} {item.pages === 1 ? "page" : "pages"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                  {many && items.length > 1 && (
                    <>
                      <button type="button" className="btn btnSecondary btnSmall" aria-label={`Move ${item.file.name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                        ↑
                      </button>
                      <button type="button" className="btn btnSecondary btnSmall" aria-label={`Move ${item.file.name} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                        ↓
                      </button>
                    </>
                  )}

                  <button type="button" className="btn btnSecondary btnSmall" onClick={() => remove(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (tool === "split-pdf" || tool === "rotate-pdf" || tool === "delete-pdf-pages" || tool === "compress-pdf") && (
          <div className="controls">
            <div className="controlGrid">
              {tool === "split-pdf" && (
                <div className="field">
                  <label htmlFor="pdf-split-mode">What do you want?</label>
                  <select id="pdf-split-mode" value={splitMode} onChange={(event) => setSplitMode(event.target.value as "extract" | "every")}>
                    <option value="extract">Extract pages into one PDF</option>
                    <option value="every">Every page as its own file (ZIP)</option>
                  </select>
                </div>
              )}

              {tool === "rotate-pdf" && (
                <div className="field">
                  <label htmlFor="pdf-angle">Turn</label>
                  <select id="pdf-angle" value={angle} onChange={(event) => setAngle(Number(event.target.value))}>
                    <option value={90}>90° to the right</option>
                    <option value={180}>180° (upside down)</option>
                    <option value={270}>90° to the left</option>
                  </select>
                </div>
              )}

              {tool === "compress-pdf" && (
                <>
                  <div className="field">
                    <label htmlFor="pdf-compress-by">Compress by</label>
                    <select id="pdf-compress-by" value={compressBy} onChange={(event) => setCompressBy(event.target.value as "level" | "size")}>
                      <option value="level">Quality level</option>
                      <option value="size">Target size (KB / MB)</option>
                    </select>
                  </div>

                  {compressBy === "level" ? (
                    <div className="field">
                      <label htmlFor="pdf-level">Compression</label>
                      <select id="pdf-level" value={level} onChange={(event) => setLevel(event.target.value as CompressLevel)}>
                        <option value="light">Light (sharper pages, smaller saving)</option>
                        <option value="balanced">Balanced (recommended)</option>
                        <option value="strong">Strong (smallest file, softer pages)</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="field">
                        <label htmlFor="pdf-size-preset">Make it at most</label>
                        <select id="pdf-size-preset" value={sizePreset} onChange={(event) => setSizePreset(event.target.value)}>
                          {SIZE_PRESETS.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {sizePreset === "custom" && (
                        <div className="field">
                          <label htmlFor="pdf-size-custom">Your size</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              id="pdf-size-custom"
                              type="number"
                              min="1"
                              step="any"
                              inputMode="decimal"
                              value={customSize}
                              onChange={(event) => setCustomSize(event.target.value)}
                              style={{ flex: "1 1 0", width: "auto", minWidth: 0 }}
                            />
                            <select
                              id="pdf-size-unit"
                              aria-label="Unit"
                              value={customUnit}
                              onChange={(event) => setCustomUnit(event.target.value as "KB" | "MB")}
                              style={{ flex: "none", width: 96 }}
                            >
                              <option value="KB">KB</option>
                              <option value="MB">MB</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {needsRanges && (
                <div className="field">
                  <label htmlFor="pdf-ranges">
                    {tool === "rotate-pdf" ? "Pages (leave empty for all)" : tool === "delete-pdf-pages" ? "Pages to delete" : "Pages to keep"}
                  </label>
                  <input
                    id="pdf-ranges"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    placeholder={tool === "rotate-pdf" ? "e.g. 2-4, 7" : "e.g. 1-3, 7"}
                    value={ranges}
                    onChange={(event) => setRanges(event.target.value)}
                  />
                  <div className="fileSize" style={{ marginTop: 4 }}>
                    This PDF has {items[0].pages} {items[0].pages === 1 ? "page" : "pages"}.
                  </div>
                </div>
              )}
            </div>

            {tool === "compress-pdf" && (
              <div className="notice">
                Pages are saved as pictures to make the file smaller, so the text in the new file can no longer be selected or searched. Your original is not changed.
              </div>
            )}
          </div>
        )}

        <div className="actions" style={{ justifyContent: "flex-start", marginTop: 18 }}>
          <button type="button" className="btn btnPrimary" disabled={busy || items.length === 0} onClick={run}>
            {busy ? `Working ${progress}%…` : copy.run}
          </button>
          {items.length > 0 && (
            <button
              type="button"
              className="btn btnSecondary"
              disabled={busy}
              onClick={() => {
                setItems([]);
                setResult(null);
                setError("");
                setRanges("");
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {busy && (
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        {result?.kind === "pdf" && (
          <div className="result">
            <div className="resultHeader">
              <strong>Your PDF is ready</strong>
              <button type="button" className="btn btnPrimary btnSmall" onClick={() => save(result.blob, result.name)}>
                Download PDF
              </button>
            </div>

            <div className="statGrid">
              <div className="stat">
                <strong>{fmt(result.before)}</strong>
                <span>{many ? "Files together" : "Original"}</span>
              </div>
              <div className="stat">
                <strong>{fmt(result.blob.size)}</strong>
                <span>New PDF</span>
              </div>
              <div className="stat">
                <strong>{result.pages}</strong>
                <span>{result.pages === 1 ? "Page" : "Pages"}</span>
              </div>
            </div>

            {result.note && (
              <div className="notice" role="status" style={{ marginTop: 12 }}>
                {result.note}
              </div>
            )}

            <PdfPreview blob={result.blob} />
          </div>
        )}

        {result?.kind === "small" && (
          <div className="notice" role="status">
            Your PDF is already {fmt(result.before)}, which fits within {fmt(result.target)}. Nothing was changed, so the text stays selectable.
          </div>
        )}

        {result?.kind === "zip" && (
          <div className="result">
            <div className="resultHeader">
              <strong>{result.count} separate PDFs are ready</strong>
              <button type="button" className="btn btnPrimary btnSmall" onClick={() => save(result.blob, result.name)}>
                Download ZIP
              </button>
            </div>
            <div className="fileSize">One file per page, {fmt(result.blob.size)} in total.</div>
          </div>
        )}

        {result?.kind === "nogain" && (
          <div className="notice" role="status">
            The compressed file would be {fmt(result.after)}, which is not smaller than your original ({fmt(result.before)}). This usually means the PDF is mostly text and graphics, which are already small, so nothing was changed. Try the Strong level, or keep your original.
          </div>
        )}

        {result?.kind === "text" && (
          <div className="result">
            <div className="resultHeader">
              <strong>
                {result.text ? `Text from ${result.pages} ${result.pages === 1 ? "page" : "pages"}` : "No text found"}
              </strong>
              {result.text && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" className="btn btnSecondary btnSmall" onClick={() => copyText(result.text)}>
                    {copied ? "Copied" : "Copy text"}
                  </button>
                  <button type="button" className="btn btnPrimary btnSmall" onClick={() => save(new Blob([result.text], { type: "text/plain;charset=utf-8" }), result.name)}>
                    Download .txt
                  </button>
                </div>
              )}
            </div>

            {result.text ? (
              <textarea
                readOnly
                aria-label="Extracted text"
                value={result.text}
                rows={12}
                style={{ width: "100%", marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "inherit", font: "inherit", resize: "vertical" }}
              />
            ) : (
              <div className="notice" style={{ marginTop: 12 }}>
                This PDF has no text that can be copied. It is probably a scan, which is only a picture of each page. A program that reads pictures (OCR) is needed for that.
              </div>
            )}

            {result.text && result.empty > 0 && (
              <div className="fileSize" style={{ marginTop: 8 }}>
                {result.empty} {result.empty === 1 ? "page has" : "pages have"} no text (for example pictures or scans).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
