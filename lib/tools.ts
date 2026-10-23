export const SITE_URL = "https://imgcontrol.com";

export type Faq = { q: string; a: string };

export type ToolContent = {
  slug: string;
  name: string;
  description: string;
  intro: string[];
  stepsTitle: string;
  steps: string;
  extraTitle: string;
  extra: string[];
  faqs: Faq[];
  related: string[];
  articles: string[];
};

type Fmt = {
  name: string;
  size: number;
  alpha: boolean;
  lossy: boolean;
  use: string;
  plus: string;
  minus: string;
};

const FMT: Record<string, Fmt> = {
  jpg: {
    name: "JPG",
    size: 2,
    alpha: false,
    lossy: true,
    use: "photographs, social media posts and email attachments",
    plus: "almost every phone, app, website and printer can open it",
    minus: "it cannot store transparency and loses a little detail each time it is re-saved",
  },
  png: {
    name: "PNG",
    size: 4,
    alpha: true,
    lossy: false,
    use: "screenshots, logos, icons and graphics with sharp edges",
    plus: "it keeps every pixel exactly as it is and supports transparency",
    minus: "photographs saved as PNG become very large files",
  },
  webp: {
    name: "WebP",
    size: 1.5,
    alpha: true,
    lossy: true,
    use: "website images that need to load quickly",
    plus: "it is usually smaller than JPG or PNG at similar visual quality and supports transparency",
    minus: "some older desktop editors, print services and email clients still cannot open it",
  },
  avif: {
    name: "AVIF",
    size: 1,
    alpha: true,
    lossy: true,
    use: "modern websites that want the smallest possible image files",
    plus: "it offers excellent compression and is often the smallest of the common formats",
    minus: "older software and some devices cannot open it yet",
  },
  heic: {
    name: "HEIC",
    size: 1.2,
    alpha: false,
    lossy: true,
    use: "photos taken on iPhone and iPad",
    plus: "it stores good-looking photos in compact files",
    minus: "Windows, many websites and many upload forms do not accept it",
  },
};

const PAIR_NOTES: Record<string, string> = {
  "jpg-to-png":
    "Converting JPG to PNG is common when an image has to be edited again without further compression artifacts, or when a platform asks for PNG uploads.",
  "jpg-to-webp":
    "This is one of the most popular conversions for website owners, because switching photos from JPG to WebP usually trims page weight and helps pages load faster.",
  "jpg-to-avif":
    "JPG to AVIF is aimed at performance work: AVIF can shrink photographs noticeably further than WebP, which helps image-heavy pages.",
  "png-to-jpg":
    "PNG to JPG is the usual way to shrink a screenshot or exported graphic for email, forms and uploads that only accept JPG.",
  "png-to-webp":
    "PNG to WebP keeps transparency while cutting file size, which makes it a good fit for logos, UI graphics and product cut-outs on websites.",
  "png-to-avif":
    "PNG to AVIF is useful when you want transparency and the smallest possible file for a web graphic, as long as your audience uses modern browsers.",
  "webp-to-jpg":
    "WebP to JPG solves the classic problem of a downloaded web image that your editor, printer or upload form refuses to open.",
  "webp-to-png":
    "WebP to PNG gives you a lossless, widely supported copy that is easy to edit, and it keeps any transparent areas intact.",
  "webp-to-avif":
    "WebP to AVIF is a step for sites that already serve WebP and want to test even smaller files for modern browsers.",
  "avif-to-jpg":
    "AVIF to JPG makes a modern web image usable everywhere, including older editors, print shops and messaging apps.",
  "avif-to-png":
    "AVIF to PNG produces an editable, lossless copy that keeps transparency, which is handy before retouching or resizing.",
  "avif-to-webp":
    "AVIF to WebP is a compatibility step: WebP is understood by more software and browsers while remaining compact.",
  "heic-to-jpg":
    "HEIC to JPG is the standard fix for iPhone photos that will not open on Windows or will not upload to a website.",
  "heic-to-png":
    "HEIC to PNG turns an iPhone photo into a lossless file, which is useful when you plan to edit it further before sharing.",
};

function sizeSentence(from: Fmt, to: Fmt): string {
  if (to.size < from.size) {
    return `${to.name} files are usually smaller than ${from.name} files, so the converted image often takes less storage and loads faster.`;
  }
  if (to.size > from.size) {
    return `${to.name} files are usually larger than ${from.name} files, so expect the converted image to take more space in exchange for ${
      to.lossy ? "wider compatibility" : "lossless storage"
    }.`;
  }
  return `${to.name} and ${from.name} files are usually of a similar size.`;
}

function alphaSentence(from: Fmt, to: Fmt): string {
  if (from.alpha && !to.alpha) {
    return `${from.name} images can contain transparent areas, but ${to.name} cannot store transparency, so transparent pixels are filled with white during conversion.`;
  }
  if (from.alpha && to.alpha) {
    return `Both ${from.name} and ${to.name} support transparency, so transparent areas stay transparent in the converted file.`;
  }
  return `${from.name} images do not use transparency, so the ${to.name} result is a normal opaque image.`;
}

function qualitySentence(from: Fmt, to: Fmt): string {
  if (from.lossy && !to.lossy) {
    return `Saving a ${from.name} image as ${to.name} does not bring back detail that ${from.name} compression already removed; it simply stores the current pixels without losing more.`;
  }
  if (!from.lossy && to.lossy) {
    return `${to.name} uses lossy compression, so the converted file is smaller but is not a pixel-perfect copy. Keep your ${from.name} original if you may need to edit it later.`;
  }
  return `Both formats use lossy compression, so avoid converting the same image back and forth, which would slowly reduce quality.`;
}

function buildConversion(slug: string): ToolContent | null {
  const m = slug.match(/^(jpg|png|webp|avif|heic)-to-(jpg|png|webp|avif)$/);
  if (!m) return null;
  const from = FMT[m[1]];
  const to = FMT[m[2]];
  const pair = `${from.name} to ${to.name}`;

  const others = (list: string[]) =>
    list.filter((s) => s !== slug && PAIR_NOTES[s] !== undefined);
  const sameSource = others(Object.keys(PAIR_NOTES).filter((s) => s.startsWith(`${m[1]}-to-`)));
  const sameTarget = others(Object.keys(PAIR_NOTES).filter((s) => s.endsWith(`-to-${m[2]}`)));

  return {
    slug,
    name: `${pair} Converter`,
    description: `Convert ${from.name} images to ${to.name} in your browser.`,
    intro: [
      `${PAIR_NOTES[slug]} ImgControl converts ${from.name} files to ${to.name} directly in your browser, so there is nothing to install and no account to create.`,
      `${from.name} is best known for ${from.use}: ${from.plus}, but ${from.minus}. ${to.name} is better suited to ${to.use}: ${to.plus}, although ${to.minus}.`,
    ],
    stepsTitle: `How to convert ${pair}`,
    steps: `Drop your ${from.name} files onto the converter above or click to browse, optionally set a maximum output size, and press the convert button. Each ${to.name} result appears below the converter and can be downloaded one by one or as a single ZIP file when you convert several images together.`,
    extraTitle: `What to expect from ${pair} conversion`,
    extra: [sizeSentence(from, to), alphaSentence(from, to), qualitySentence(from, to)],
    faqs: [
      {
        q: `Does ${pair} conversion change the pixel dimensions?`,
        a: `No. The converted ${to.name} keeps the width and height of the original ${from.name}. The only exception is when you set a maximum output size and the file is still too large; the converter may then reduce dimensions to get closer to your target.`,
      },
      {
        q: `What happens to transparency when I convert ${from.name} to ${to.name}?`,
        a: alphaSentence(from, to),
      },
      {
        q: `When should I use ${to.name} instead of ${from.name}?`,
        a: `Choose ${to.name} when you need an image for ${to.use}. Stay with ${from.name} when compatibility with ${from.use} matters more than the benefits of ${to.name}.`,
      },
      {
        q: `Are my ${from.name} files uploaded to a server?`,
        a: `No. The conversion runs inside your browser on your own device, and ImgControl does not need your files to leave your computer or phone.`,
      },
      {
        q: `How many ${from.name} files can I convert at once?`,
        a: `You can add up to 30 files in one batch. When you convert several images, you can download them individually or together in a ZIP archive.`,
      },
    ],
    related: [
      ...sameSource.slice(0, 3),
      ...sameTarget.slice(0, 3),
      "image-compressor",
      "image-resizer",
    ].filter((v, i, a) => a.indexOf(v) === i),
    articles: [articleFor(m[1], m[2])],
  };
}

function articleFor(a: string, b: string): string {
  if (a === "heic") return "heic-to-jpg-without-losing-quality";
  if (a === "avif" || b === "avif") return "jpg-png-webp-avif-guide";
  if (a === "webp" || b === "webp") return "what-is-webp";
  return "jpg-vs-png";
}

function buildPdfFromImage(slug: string): ToolContent | null {
  const m = slug.match(/^(jpg|png|webp)-to-pdf$/);
  if (!m) return null;
  const from = FMT[m[1]];
  const pair = `${from.name} to PDF`;
  return {
    slug,
    name: `${pair} Converter`,
    description: `Turn ${from.name} images into a PDF in your browser.`,
    intro: [
      `ImgControl turns ${from.name} images into a PDF document directly in your browser. Add one image for a single-page PDF or several to build a multi-page document, with no installation and no account.`,
      `${from.name} is best known for ${from.use}. A PDF is a better choice when you need to send, print or archive pictures as one tidy file, because every device shows it the same way.`,
    ],
    stepsTitle: `How to convert ${pair}`,
    steps: `Add your ${from.name} images to the converter above, arrange them in the order you want, adjust the available PDF options and create the PDF. When it is ready you can save the document to your device.`,
    extraTitle: `Tips for ${pair} conversion`,
    extra: [
      `Rename and order your ${from.name} files before adding them, since pages follow the order of the list.`,
      `Large photographs make large PDFs. If the document is too big for an email or upload form, use the output-size option or compress the images first with the Image Compressor.`,
      `Scanned pages and receipts usually look best when each image is a clean, well-lit photo with the edges visible.`,
    ],
    faqs: [
      {
        q: `Can I combine several ${from.name} files into one PDF?`,
        a: `Yes. Add multiple images and they are placed in the PDF as separate pages in the order shown.`,
      },
      {
        q: `Are my ${from.name} images uploaded anywhere?`,
        a: `No. The PDF is created inside your browser on your own device.`,
      },
      {
        q: `Will the ${from.name} quality be reduced in the PDF?`,
        a: `The images are placed in the document without extra processing unless you choose an output-size limit, which can reduce quality to reach a smaller file.`,
      },
      {
        q: `Can I use other image types too?`,
        a: `Yes. The same tool accepts JPG, PNG, WebP and other supported images, so you can mix formats in one PDF.`,
      },
    ],
    related: ["image-to-pdf", "pdf-to-jpg", "image-compressor", "image-resizer", "jpg-to-pdf", "png-to-pdf", "webp-to-pdf"].filter(
      (s) => s !== slug,
    ),
    articles: ["how-to-convert-images-to-pdf"],
  };
}

const UTILITIES: Record<string, ToolContent> = {
  "image-compressor": {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress JPG, PNG, WebP and AVIF images in your browser.",
    intro: [
      "The ImgControl Image Compressor reduces the file size of your pictures right in your browser. It is built for the everyday cases where a photo is too large to email, an upload form has a size limit, or a web page loads slowly because of heavy images.",
      "Because the work happens on your own device, you do not wait for uploads and your pictures are not sent to a server.",
    ],
    stepsTitle: "How to compress an image",
    steps:
      "Add your images, choose a quality level or a target file size, start the compression and download the smaller files. Several images can be processed together and saved as a ZIP.",
    extraTitle: "Getting a smaller file without ruining the picture",
    extra: [
      "Lower quality saves the most space, but the effect is strongest on photographs. Flat graphics and screenshots compress well even at higher quality settings.",
      "If a file is still too big after compression, reduce its dimensions with the Image Resizer; a smaller picture needs far fewer bytes.",
      "Converting to a modern format such as WebP or AVIF often gives a bigger saving than quality changes alone.",
    ],
    faqs: [
      { q: "Does compression change the image dimensions?", a: "No. The width and height stay the same unless you choose a different tool such as the Image Resizer." },
      { q: "Can I set a target file size?", a: "Yes. You can ask for a maximum output size and the compressor tries to get as close to it as possible." },
      { q: "Which formats can I compress?", a: "JPG, PNG, WebP, GIF, BMP and AVIF images are supported." },
      { q: "Are my pictures uploaded?", a: "No. Compression runs in your browser on your own device." },
    ],
    related: ["image-resizer", "image-optimizer", "jpg-to-webp", "png-to-webp", "image-converter"],
    articles: ["how-to-compress-images-without-losing-quality"],
  },
  "image-converter": {
    slug: "image-converter",
    name: "Image Converter",
    description: "Convert images between common formats in your browser.",
    intro: [
      "The ImgControl Image Converter is the general-purpose tool for changing an image from one format to another. Pick your output format, add your files and convert them without leaving the page.",
      "If you already know the exact conversion you need, the dedicated pages such as JPG to PNG or PNG to WebP offer the same engine with advice specific to that pair.",
    ],
    stepsTitle: "How to convert an image",
    steps:
      "Add one or more images, choose the format you want from the list, optionally set a maximum file size, and run the conversion. Download the results individually or as a ZIP.",
    extraTitle: "Choosing the right output format",
    extra: [
      "Use JPG for photographs that need to be opened almost anywhere.",
      "Use PNG for screenshots, logos and graphics where sharp edges or transparency matter.",
      "Use WebP or AVIF for website images when smaller files and faster loading matter more than compatibility with very old software.",
    ],
    faqs: [
      { q: "Is there a difference between this tool and the dedicated converters?", a: "The engine is the same style of browser-based conversion. The dedicated pages simply focus on one pair of formats with extra guidance." },
      { q: "Are my images uploaded?", a: "No. Conversion runs in your browser." },
      { q: "Can I convert many files at once?", a: "Yes. Add several images and download them together as a ZIP." },
    ],
    related: ["jpg-to-png", "png-to-jpg", "jpg-to-webp", "webp-to-jpg", "heic-to-jpg", "image-compressor"],
    articles: ["jpg-png-webp-avif-guide"],
  },
  "image-resizer": {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Resize images by exact pixels or percentage in your browser.",
    intro: [
      "The ImgControl Image Resizer changes the dimensions of your pictures to an exact width and height, or by a percentage. It is useful for profile photos, product images, blog thumbnails and any upload form with size requirements.",
      "Resizing happens locally in your browser, so your pictures stay on your device.",
    ],
    stepsTitle: "How to resize an image",
    steps:
      "Add your images, enter the width and height you need or choose a percentage, apply the change and download the resized files.",
    extraTitle: "Resizing tips",
    extra: [
      "Reducing the dimensions is the most effective way to cut a file's size, because the picture simply contains fewer pixels.",
      "Enlarging a small picture cannot add real detail, so it may look soft; start from the largest original you have.",
      "Keep the proportions locked when you want to avoid stretching the picture.",
    ],
    faqs: [
      { q: "Can I resize by percentage?", a: "Yes. You can scale an image by a percentage or set an exact width and height." },
      { q: "Will resizing reduce quality?", a: "Making an image smaller keeps it sharp at its new size. Making it larger can look soft because no new detail is created." },
      { q: "Are my pictures uploaded?", a: "No. Resizing runs in your browser." },
    ],
    related: ["image-compressor", "image-cropper", "image-optimizer", "jpg-to-webp"],
    articles: ["resize-images-before-publishing"],
  },
  "image-cropper": {
    slug: "image-cropper",
    name: "Image Cropper",
    description: "Crop images with a visual selection box in your browser.",
    intro: [
      "The ImgControl Image Cropper lets you draw a crop box over your picture and see the resulting dimensions as you work. It is a quick way to remove unwanted edges, focus on a subject or prepare a picture for a specific frame.",
      "The crop is done in your browser, so your original never leaves your device.",
      "Typical jobs include trimming empty borders from a screenshot, framing a portrait for a profile picture, cutting a product out of a busy background shot, or preparing a banner image to the proportions a website asks for.",
    ],
    stepsTitle: "How to crop an image",
    steps:
      "Open your picture, drag the crop box to the area you want to keep, check the live dimensions and save the cropped result.",
    extraTitle: "Cropping tips",
    extra: [
      "Crop first and resize afterwards, so you do not throw away detail you may still need.",
      "Leave a little breathing room around the subject; tight crops are hard to reuse for other layouts.",
      "If a platform needs an exact size, crop to the right proportions and then use the Image Resizer.",
      "Cropping does not shrink the file in proportion to the area you remove for every format, so run the result through the Image Compressor when the final file size matters.",
    ],
    faqs: [
      { q: "Do I see the dimensions while cropping?", a: "Yes. The crop area shows its dimensions as you adjust it." },
      { q: "Is the original file changed?", a: "No. Your original stays untouched on your device; you download a new cropped file." },
      { q: "Are my pictures uploaded?", a: "No. Cropping runs in your browser." },
      { q: "Which formats can I crop?", a: "Common image formats such as JPG, PNG, WebP and AVIF work, and HEIC photos from an iPhone are converted in your browser first so they can be cropped too." },
      { q: "Can I crop to a specific shape or ratio?", a: "You choose the area with the crop box. For an exact pixel size, crop to the right proportions first and then resize the result." },
    ],
    related: ["image-resizer", "image-compressor", "image-optimizer", "png-to-jpg"],
    articles: ["resize-images-before-publishing"],
  },
  "image-optimizer": {
    slug: "image-optimizer",
    name: "Image Optimizer",
    description: "Optimize images for fast web delivery in your browser.",
    intro: [
      "The ImgControl Image Optimizer prepares pictures for websites by reducing their weight while keeping them looking good. Smaller images mean faster pages, better user experience and less data used by visitors.",
      "Optimizing runs in your browser, so you can prepare a whole batch without uploading anything.",
    ],
    stepsTitle: "How to optimize an image",
    steps:
      "Add your images, choose the optimization settings, run the process and download the lighter files, individually or as a ZIP.",
    extraTitle: "Optimizing images for a website",
    extra: [
      "Serve images at the size they are displayed; a 4000-pixel photo in a 600-pixel slot wastes bandwidth.",
      "Modern formats such as WebP and AVIF usually give smaller files than JPG and PNG.",
      "Compress after resizing and keep the original files somewhere safe in case you need to export them again.",
    ],
    faqs: [
      { q: "How is optimizing different from compressing?", a: "Compression focuses on file size. Optimizing is the same idea aimed at web delivery, where size, dimensions and format all work together." },
      { q: "Are my images uploaded?", a: "No. Everything runs in your browser." },
      { q: "Can I process several images together?", a: "Yes. Add multiple files and download the results together." },
    ],
    related: ["image-compressor", "image-resizer", "jpg-to-webp", "png-to-webp", "jpg-to-avif"],
    articles: ["how-to-optimize-images-for-a-website"],
  },
};

const EXTRAS_ONLY = new Set([
  "image-to-pdf",
  "raw-to-jpg",
  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-webp",
  "pdf-to-gif",
  "pdf-to-avif",
  "pdf-to-heic",
  "pdf-to-svg",
  "pdf-to-bmp",
  "pdf-to-eps",
]);

export const TOOL_NAMES: Record<string, string> = {
  "image-compressor": "Image Compressor",
  "image-converter": "Image Converter",
  "image-resizer": "Image Resizer",
  "image-cropper": "Image Cropper",
  "image-optimizer": "Image Optimizer",
  "image-to-pdf": "Image to PDF",
  "raw-to-jpg": "RAW to JPG",
};

export function toolName(slug: string): string {
  if (TOOL_NAMES[slug]) return TOOL_NAMES[slug];
  return slug
    .split("-")
    .map((w) => (["jpg", "png", "pdf", "svg", "eps", "bmp", "gif", "avif", "heic", "raw"].includes(w) ? w.toUpperCase() : w === "webp" ? "WebP" : w === "to" ? "to" : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export function getToolContent(slug: string): ToolContent | null {
  return UTILITIES[slug] ?? buildConversion(slug) ?? buildPdfFromImage(slug);
}

const EXTRAS_RELATED: Record<string, string[]> = {
  "image-to-pdf": ["jpg-to-pdf", "png-to-pdf", "webp-to-pdf", "pdf-to-jpg", "image-compressor"],
  "raw-to-jpg": ["jpg-to-webp", "image-compressor", "image-resizer", "jpg-to-png"],
  "pdf-to-jpg": ["pdf-to-png", "pdf-to-webp", "image-to-pdf", "image-compressor"],
  "pdf-to-png": ["pdf-to-jpg", "pdf-to-webp", "image-to-pdf", "png-to-jpg"],
  "pdf-to-webp": ["pdf-to-jpg", "pdf-to-png", "pdf-to-avif", "image-compressor"],
  "pdf-to-gif": ["pdf-to-png", "pdf-to-jpg", "pdf-to-webp", "image-to-pdf"],
  "pdf-to-avif": ["pdf-to-webp", "pdf-to-jpg", "pdf-to-png", "image-compressor"],
  "pdf-to-heic": ["pdf-to-jpg", "heic-to-jpg", "pdf-to-png", "image-to-pdf"],
  "pdf-to-svg": ["pdf-to-png", "pdf-to-eps", "pdf-to-jpg", "image-to-pdf"],
  "pdf-to-bmp": ["pdf-to-png", "pdf-to-jpg", "pdf-to-gif", "image-to-pdf"],
  "pdf-to-eps": ["pdf-to-svg", "pdf-to-png", "pdf-to-jpg", "image-to-pdf"],
};

export function getExtrasRelated(slug: string): string[] | null {
  return EXTRAS_ONLY.has(slug) ? EXTRAS_RELATED[slug] : null;
}

export const ARTICLES: Record<string, string> = {
  "heic-to-jpg-without-losing-quality": "How to Convert HEIC to JPG Without Losing Quality",
  "heic-vs-jpg": "HEIC vs JPG: What Is the Difference?",
  "how-to-compress-images-without-losing-quality": "How to Compress Images Without Losing Too Much Quality",
  "how-to-convert-images-to-pdf": "How to Convert Images to PDF Easily",
  "how-to-convert-pdf-to-jpg": "How to Convert PDF to JPG Easily",
  "how-to-optimize-images-for-a-website": "How to Optimize Images for a Website",
  "jpg-png-webp-avif-guide": "JPG vs PNG vs WebP vs AVIF: Which Image Format Is Best?",
  "jpg-vs-png": "JPG vs PNG: Which Image Format Should You Use?",
  "pdf-vs-jpg": "PDF vs JPG: When Should You Use Each?",
  "raw-to-jpg-without-losing-details": "How to Convert RAW to JPG Without Losing Important Details",
  "resize-images-before-publishing": "How to Resize Images Before Publishing",
  "what-is-webp": "What Is WebP and Why Is It Used on Websites?",
};
