import type { ToolContent } from "@/lib/tools";

/* ------------------------------------------------------------------ */
/* Compress image to a target size                                     */
/* ------------------------------------------------------------------ */

export const KB_SIZES = [20, 50, 100, 200] as const;

export function kbSlug(kb: number) {
  return `compress-image-to-${kb}kb`;
}

const KB_FACTS: Record<number, { uses: string; look: string; tip: string }> = {
  20: {
    uses: "signature scans, small stamp-style photos and the tight upload fields some application forms and portals still use",
    look: "At 20 KB a photograph is small. Expect roughly a few hundred pixels across, which is fine for a signature or a thumbnail but not for printing.",
    tip: "A signature on a white background compresses far better than a photograph, so scan or photograph it on plain white paper first.",
  },
  50: {
    uses: "passport-style photos, ID pictures and the 50 KB limit that many application and registration forms set",
    look: "At 50 KB a head-and-shoulders photo stays clear on screen, because the tool reduces quality first and only shrinks the picture when it has to.",
    tip: "Crop the photo tightly around the face before compressing. A smaller picture area needs fewer bytes, so more of your 50 KB goes to quality.",
  },
  100: {
    uses: "profile pictures, document scans for online forms and email attachments that must stay light",
    look: "At 100 KB most photographs keep good detail at screen size, and simple graphics or text scans look sharp.",
    tip: "If the result is still larger than the form allows, lower the number in the size box slightly. The tool aims at the limit you set.",
  },
  200: {
    uses: "document pages, product pictures, blog images and uploads with a 200 KB limit",
    look: "At 200 KB there is room for a full-size look on most web pages, with only a small loss of detail compared with the original.",
    tip: "For web pages, a WebP file of the same size usually looks better than a JPG. You can switch the output format in the tool.",
  },
};

export function buildKb(slug: string): ToolContent | null {
  const m = slug.match(/^compress-image-to-(\d+)kb$/);
  if (!m) return null;

  const kb = Number(m[1]);
  const f = KB_FACTS[kb];
  if (!f) return null;

  const others = KB_SIZES.filter((s) => s !== kb).map(kbSlug);

  return {
    slug,
    name: `Compress Image to ${kb} KB`,
    description: `Reduce a photo or scan to ${kb} KB or less in your browser.`,
    intro: [
      `This page shrinks a picture to ${kb} KB or less. The target is already set, so you only add your image and press the button. Everything happens in your browser, so the picture is not uploaded anywhere.`,
      `A ${kb} KB limit is common for ${f.uses}. The tool tries to keep the highest quality that still fits, and reduces the pixel size only when the quality alone cannot get under ${kb} KB.`,
    ],
    stepsTitle: `How to get an image under ${kb} KB`,
    steps: `Add your JPG, PNG, WebP or AVIF image, check that the maximum size shows ${kb} KB, and press Process Images. The result appears below with its real size, and you can compare the preview with your original before you download it.`,
    extraTitle: `What a ${kb} KB image looks like`,
    extra: [
      f.look,
      f.tip,
      `If the form you are filling needs an exact pixel size as well, run the picture through the Image Resizer first and then compress it here.`,
    ],
    faqs: [
      {
        q: `How do I reduce a photo to ${kb} KB?`,
        a: `Add the photo to the tool above and press Process Images. The size limit is already set to ${kb} KB, and the tool lowers quality and, if needed, dimensions until the file fits.`,
      },
      {
        q: `Will the image still look good at ${kb} KB?`,
        a: `That depends on the picture. ${f.look}`,
      },
      {
        q: `Can I use a different size than ${kb} KB?`,
        a: `Yes. Change the number in the "Maximum output size" box, or use the other pages for 20, 50, 100 and 200 KB. The Image Compressor also lets you pick any size in KB or MB.`,
      },
      {
        q: `Is my picture uploaded to a server?`,
        a: `No. The compression runs in your browser on your own device, so your photo, signature or ID picture stays with you.`,
      },
      {
        q: `Why is my result a little smaller than ${kb} KB?`,
        a: `The tool stops at the best quality that is under the limit, so the result is usually just below ${kb} KB rather than exactly ${kb} KB.`,
      },
    ],
    related: [...others, "image-compressor", "image-resizer", "jpg-to-webp"],
    articles: ["how-to-compress-images-without-losing-quality"],
  };
}

/* ------------------------------------------------------------------ */
/* PDF tools that run in the browser                                   */
/* ------------------------------------------------------------------ */

export const PDF_TOOL_SLUGS = [
  "merge-pdf",
  "split-pdf",
  "rotate-pdf",
  "compress-pdf",
  "delete-pdf-pages",
  "pdf-to-text",
] as const;

export type PdfToolSlug = (typeof PDF_TOOL_SLUGS)[number];

const LOCAL = "Everything runs in your browser, so your PDF is never uploaded.";

const PDF_TOOLS: Record<PdfToolSlug, ToolContent> = {
  "merge-pdf": {
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine several PDF files into one in your browser.",
    intro: [
      `Merge PDF joins two or more PDF files into a single document. Add your files, put them in the order you want and download one PDF. ${LOCAL}`,
      "It is handy for sending an application with all its attachments in one file, combining scanned pages that came as separate PDFs, or putting a report together from several parts.",
    ],
    stepsTitle: "How to merge PDF files",
    steps:
      "Add two or more PDF files, use the arrows to move them into the right order, press Merge PDF and download the result. The first page of every file is shown so you can check the order.",
    extraTitle: "Tips for a clean merged file",
    extra: [
      "The pages keep their original size and content; nothing is re-drawn or reduced.",
      "Name your files with numbers (01, 02, 03) before adding them if you have many, so they are easy to put in order.",
      "A merged file can get large. If it is too big to email, run it through Compress PDF afterwards.",
    ],
    faqs: [
      { q: "How many PDF files can I merge?", a: "You can add up to 30 files at a time. Very large files need more memory, so merge in smaller groups if your browser slows down." },
      { q: "Can I change the order of the files?", a: "Yes. Use the up and down arrows next to each file before you merge." },
      { q: "Is my PDF uploaded to a server?", a: "No. The files are combined inside your browser on your own device." },
      { q: "Will merging change the quality or fonts?", a: "No. The pages are copied as they are, so text, images and fonts stay exactly the same." },
      { q: "What if a PDF is password protected?", a: "Protected files cannot be read here. Remove the password in the program that created it, then try again." },
    ],
    related: ["split-pdf", "compress-pdf", "delete-pdf-pages", "rotate-pdf", "image-to-pdf"],
    articles: ["how-to-convert-images-to-pdf"],
  },
  "split-pdf": {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Extract pages or split a PDF into single pages in your browser.",
    intro: [
      `Split PDF lets you take certain pages out of a document, or break it into one file per page. ${LOCAL}`,
      "Use it to send only the pages someone needs, to pull a single form out of a long file, or to hand out separate pages from a scanned bundle.",
    ],
    stepsTitle: "How to split a PDF",
    steps:
      "Add your PDF. To keep some pages, choose \"Extract pages\" and type a range such as 1-3, 7, 10-12. To get a separate PDF for every page, choose \"Every page as its own file\" and download the ZIP.",
    extraTitle: "Page ranges that work",
    extra: [
      "Write single pages and ranges separated by commas: 2, 4-6, 9. The pages come out in the order you type them.",
      "Page numbers start at 1 for the first page. If a number is larger than the document, you are told which one.",
      "To remove pages instead of keeping them, use Delete PDF Pages.",
    ],
    faqs: [
      { q: "How do I extract pages from a PDF?", a: "Add the file, choose Extract pages, type the pages you want (for example 1-3, 7) and press Split PDF. You get one new PDF with just those pages." },
      { q: "Can I get every page as a separate PDF?", a: "Yes. Choose \"Every page as its own file\" and you download a ZIP with one PDF per page." },
      { q: "Does splitting reduce the quality?", a: "No. Pages are copied without being re-drawn, so quality and text stay the same." },
      { q: "Is my file uploaded?", a: "No. Splitting happens in your browser on your own device." },
    ],
    related: ["merge-pdf", "delete-pdf-pages", "rotate-pdf", "compress-pdf", "pdf-to-jpg"],
    articles: ["how-to-convert-pdf-to-jpg"],
  },
  "rotate-pdf": {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    description: "Turn PDF pages by 90, 180 or 270 degrees in your browser.",
    intro: [
      `Rotate PDF turns pages that were scanned sideways or upside down so they read the right way. You can rotate the whole file or only the pages you choose. ${LOCAL}`,
      "The rotation is saved in the new file, so it looks right in every PDF viewer, not only on your screen.",
    ],
    stepsTitle: "How to rotate a PDF",
    steps:
      "Add your PDF, choose how far to turn it (90° right, 180° or 90° left), leave the pages box empty for all pages or type a range such as 2-4, and press Rotate PDF. Check the preview and download the result.",
    extraTitle: "Rotating only some pages",
    extra: [
      "Type pages the same way as in Split PDF: 1, 3-5, 8. Leave the box empty to turn every page.",
      "Rotating adds to the turn a page already has, so a page that was already turned 90° and rotated 90° again ends up at 180°.",
      "The text and images are not re-drawn, so there is no loss of quality.",
    ],
    faqs: [
      { q: "How do I rotate one page of a PDF?", a: "Type the page number in the pages box, for example 3, choose the angle and press Rotate PDF. Only that page is turned." },
      { q: "Is the rotation permanent?", a: "Yes. The new file stores the rotation, so it opens the same way in any viewer." },
      { q: "Does rotating reduce quality?", a: "No. Only the page rotation setting changes; content is untouched." },
      { q: "Is my PDF uploaded?", a: "No. Everything happens in your browser." },
    ],
    related: ["merge-pdf", "split-pdf", "delete-pdf-pages", "compress-pdf", "image-to-pdf"],
    articles: [],
  },
  "compress-pdf": {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Make a PDF smaller in your browser by lowering the picture quality of its pages.",
    intro: [
      `Compress PDF makes a PDF smaller so it fits an email or an upload limit. ${LOCAL}`,
      "It works by drawing every page as a picture at a lower quality and building a new PDF from those pictures. This shrinks scanned documents and photo-heavy files a lot.",
    ],
    stepsTitle: "How to compress a PDF",
    steps:
      "Add your PDF, then choose how to compress it. Pick a quality level (Light, Balanced or Strong), or choose Target size and select a limit such as 200 KB or 1 MB, or type your own number in KB or MB. Press Compress PDF, check the preview and the new size, and download. If the result is not smaller, you keep your original.",
    extraTitle: "What to know before you compress",
    extra: [
      "Because pages become pictures, the text in the compressed file can no longer be selected or searched. Keep your original if you need that.",
      "Scanned documents and files full of photographs shrink the most. PDFs that are mostly text can come out larger, and in that case the tool tells you so.",
      "Strong gives the smallest file with visible softness; Light keeps pages sharper with a smaller saving.",
      "When you choose a target size, the tool tries the sharpest setting first and only softens the pages as far as it has to, so you get the best-looking file that fits your limit.",
    ],
    faqs: [
      { q: "How can I reduce the size of a PDF?", a: "Add it to the tool, pick a level and press Compress PDF. Scanned PDFs often become several times smaller." },
      { q: "Can I make a PDF a specific size, like 200 KB?", a: "Yes. Choose Target size, select 100 KB, 200 KB, 500 KB, 1 MB, 2 MB or 5 MB, or pick Custom and type your own size in KB or MB. The tool aims for the sharpest file at or under that size." },
      { q: "What if the PDF cannot reach the size I typed?", a: "Then the tool gives you the smallest file it could make and tells you its size, so you can decide whether to use it or try a larger limit. Very small limits on a PDF with many pages are usually not possible." },
      { q: "Can I still select text after compressing?", a: "No. The pages are saved as pictures, so text is no longer selectable. Keep the original if you need searchable text." },
      { q: "Why did my PDF get bigger?", a: "A PDF made of real text and vector graphics can be smaller than pictures of its pages. The tool then keeps your original instead of a bigger file." },
      { q: "Is my PDF uploaded?", a: "No. The compression runs in your browser." },
      { q: "Which level should I choose?", a: "Balanced suits most files. Choose Strong when you must hit a small size and can accept softer pages." },
    ],
    related: ["merge-pdf", "split-pdf", "pdf-to-jpg", "image-compressor", "image-to-pdf"],
    articles: ["how-to-compress-images-without-losing-quality"],
  },
  "delete-pdf-pages": {
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages",
    description: "Remove unwanted pages from a PDF in your browser.",
    intro: [
      `Delete PDF Pages removes the pages you do not need and keeps the rest in the original order. ${LOCAL}`,
      "Use it to drop a blank page from a scan, remove a cover sheet or take private pages out before you share a file.",
    ],
    stepsTitle: "How to delete pages from a PDF",
    steps:
      "Add your PDF, look at the first page preview, type the pages to remove (for example 2, 5-7) and press Delete pages. The new PDF is shown before you download it.",
    extraTitle: "Before you delete",
    extra: [
      "Your original file is not changed. You download a new PDF without the pages.",
      "You cannot delete every page; at least one has to remain.",
      "To keep only certain pages instead, Split PDF with Extract pages does the opposite.",
      "Deleting pages also makes the file smaller, because the removed pages and the pictures on them are not copied to the new PDF.",
    ],
    faqs: [
      { q: "How do I remove a page from a PDF?", a: "Add the file, type the page number (for example 4) in the box and press Delete pages. Download the new PDF." },
      { q: "Can I delete the first or last page only?", a: "Yes. Type 1 for the first page, or the last page number shown under the box. The page count of your file is displayed there so you do not have to count." },
      { q: "Can I delete several pages at once?", a: "Yes. Separate pages and ranges with commas, like 1, 3-5, 9." },
      { q: "Is the original file changed?", a: "No. The tool creates a new PDF and leaves your file alone." },
      { q: "Is my file uploaded?", a: "No. It all happens in your browser." },
    ],
    related: ["split-pdf", "merge-pdf", "rotate-pdf", "compress-pdf", "pdf-to-jpg"],
    articles: [],
  },
  "pdf-to-text": {
    slug: "pdf-to-text",
    name: "PDF to Text",
    description: "Copy the text out of a PDF into a .txt file in your browser.",
    intro: [
      `PDF to Text pulls the readable text out of a PDF so you can copy it or save it as a plain .txt file. ${LOCAL}`,
      "It reads the text that is stored in the PDF, which is how most documents created on a computer are saved.",
    ],
    stepsTitle: "How to extract text from a PDF",
    steps:
      "Add your PDF and press Extract text. The text appears on the page, page by page, and you can copy it or download it as a .txt file.",
    extraTitle: "When the text comes out empty",
    extra: [
      "A scanned PDF is just a picture of a page. It contains no text to extract, so the result is empty, and you would need a program that reads pictures (OCR).",
      "Columns, tables and unusual fonts can come out in a different order from how they look on the page.",
      "To work with the pages as pictures instead, use PDF to JPG or PDF to PNG.",
    ],
    faqs: [
      { q: "How do I copy text from a PDF?", a: "Add the PDF and press Extract text. You can then copy the text or download it as a .txt file." },
      { q: "Does it work on scanned PDFs?", a: "No. A scan is only a picture and has no text inside. The tool tells you when no text was found." },
      { q: "Is the layout kept?", a: "Only the text and its line breaks. Tables and columns may not look the same as in the PDF." },
      { q: "Is my PDF uploaded?", a: "No. The text is read in your browser." },
    ],
    related: ["pdf-to-jpg", "pdf-to-png", "split-pdf", "merge-pdf", "compress-pdf"],
    articles: ["pdf-vs-jpg"],
  },
};

export function buildPdfTool(slug: string): ToolContent | null {
  return (PDF_TOOLS as Record<string, ToolContent>)[slug] ?? null;
}

/** Short label for a related-tool chip, for the tools in this file. */
export function moreToolName(slug: string): string | null {
  const kb = slug.match(/^compress-image-to-(\d+)kb$/);
  if (kb) return `Compress to ${kb[1]} KB`;
  const pdf = (PDF_TOOLS as Record<string, ToolContent>)[slug];
  return pdf ? pdf.name : null;
}
