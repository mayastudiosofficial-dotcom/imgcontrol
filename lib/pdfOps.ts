import { PDFDocument, degrees } from "pdf-lib";
import { loadPdfjs } from "@/lib/pdfjs";

/**
 * The work behind Merge, Split, Rotate, Compress, Delete pages and PDF to Text.
 * Every function runs in the visitor's browser; no file is sent anywhere.
 * Page numbers in and out of this file are 1-based, like the numbers people type.
 */

type Progress = (fraction: number) => void;

function friendly(error: unknown): Error {
  const text = String((error as Error)?.message ?? error);

  if (/encrypt|password/i.test(text)) {
    return new Error("This PDF is password protected. Remove the password in the program that made it, then try again.");
  }

  return new Error("This file could not be read as a PDF. It may be damaged.");
}

async function open(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    throw friendly(error);
  }
}

/** Turns "1-3, 7" into [1, 2, 3, 7]. Pages come out in the order typed, without repeats. */
export function parsePageRanges(text: string, pageCount: number): number[] {
  const parts = text
    .replace(/\s*[-–—]\s*/g, "-")
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) throw new Error("Type the pages you mean, for example 1-3, 7.");

  const pages: number[] = [];
  const seen = new Set<number>();

  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`"${part}" is not a page or a range. Use numbers like 3 or 2-5.`);

    const from = Number(match[1]);
    const to = match[2] ? Number(match[2]) : from;

    if (from < 1 || to < 1) throw new Error("Pages start at 1.");
    if (to < from) throw new Error(`The range ${part} goes backwards. Write it as ${to}-${from}.`);
    if (to > pageCount) {
      throw new Error(`Page ${to} does not exist. This PDF has ${pageCount} ${pageCount === 1 ? "page" : "pages"}.`);
    }

    for (let page = from; page <= to; page += 1) {
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
    }
  }

  return pages;
}

export async function countPages(bytes: Uint8Array): Promise<number> {
  return (await open(bytes)).getPageCount();
}

export async function mergePdfs(files: Uint8Array[], onProgress?: Progress): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (let index = 0; index < files.length; index += 1) {
    const source = await open(files[index]);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
    onProgress?.((index + 1) / files.length);
  }

  return merged.save();
}

export async function extractPages(bytes: Uint8Array, pages: number[]): Promise<Uint8Array> {
  const source = await open(bytes);
  const result = await PDFDocument.create();
  const copied = await result.copyPages(source, pages.map((page) => page - 1));
  copied.forEach((page) => result.addPage(page));
  return result.save();
}

export async function splitEveryPage(bytes: Uint8Array, onProgress?: Progress): Promise<Uint8Array[]> {
  const source = await open(bytes);
  const total = source.getPageCount();
  const files: Uint8Array[] = [];

  for (let index = 0; index < total; index += 1) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(source, [index]);
    single.addPage(page);
    files.push(await single.save());
    onProgress?.((index + 1) / total);
  }

  return files;
}

/** Turns the chosen pages (all of them when `pages` is null) clockwise by `clockwiseDegrees`. */
export async function rotatePdf(
  bytes: Uint8Array,
  pages: number[] | null,
  clockwiseDegrees: number,
): Promise<Uint8Array> {
  const doc = await open(bytes);
  const chosen = new Set(pages ?? doc.getPageIndices().map((index) => index + 1));

  doc.getPages().forEach((page, index) => {
    if (!chosen.has(index + 1)) return;
    const next = (((page.getRotation().angle + clockwiseDegrees) % 360) + 360) % 360;
    page.setRotation(degrees(next));
  });

  return doc.save();
}

export async function deletePages(bytes: Uint8Array, pages: number[]): Promise<Uint8Array> {
  const doc = await open(bytes);

  if (pages.length >= doc.getPageCount()) {
    throw new Error("That would delete every page. Keep at least one page.");
  }

  [...pages]
    .sort((a, b) => b - a)
    .forEach((page) => doc.removePage(page - 1));

  return doc.save();
}

export type CompressLevel = "light" | "balanced" | "strong";

const LEVELS: Record<CompressLevel, { scale: number; quality: number }> = {
  light: { scale: 1.6, quality: 0.78 },
  balanced: { scale: 1.25, quality: 0.62 },
  strong: { scale: 1, quality: 0.45 },
};

/**
 * Draws every page as a JPEG picture and builds a new PDF from the pictures.
 * Text in the result is no longer selectable; the page says so.
 */
export async function compressPdf(file: File, level: CompressLevel, onProgress?: Progress): Promise<Uint8Array> {
  const { getDocument } = await loadPdfjs();
  const { scale, quality } = LEVELS[level];

  let pdf;
  try {
    pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (error) {
    throw friendly(error);
  }

  const out = await PDFDocument.create();

  try {
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });

      // Very large pages are capped so one page cannot use up the browser's memory.
      const safeScale = Math.min(scale, 4000 / Math.max(base.width, base.height));
      const viewport = page.getViewport({ scale: safeScale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not available in this browser.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: context, viewport } as never).promise;

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not draw a page."))), "image/jpeg", quality),
      );

      const image = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const target = out.addPage([base.width, base.height]);
      target.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });

      page.cleanup();
      onProgress?.(number / pdf.numPages);
    }
  } finally {
    await pdf.destroy();
  }

  return out.save();
}

export type ExtractedText = { text: string; pages: number; pagesWithoutText: number };

export async function extractText(file: File, onProgress?: Progress): Promise<ExtractedText> {
  const { getDocument } = await loadPdfjs();

  let pdf;
  try {
    pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (error) {
    throw friendly(error);
  }

  const chunks: string[] = [];
  let pagesWithoutText = 0;

  try {
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();

      let text = "";
      for (const item of content.items) {
        if ("str" in item) text += item.str + (item.hasEOL ? "\n" : "");
      }

      text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      if (!text) pagesWithoutText += 1;
      chunks.push(text);

      page.cleanup();
      onProgress?.(number / pdf.numPages);
    }
  } finally {
    await pdf.destroy();
  }

  return {
    text: chunks.filter(Boolean).join("\n\n"),
    pages: chunks.length,
    pagesWithoutText,
  };
}
