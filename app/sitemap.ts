import type { MetadataRoute } from "next";

const paths = [
  "",
  "tools",
  "about",
  "blog",
  "contact",
  "privacy",
  "terms",

  "image-compressor",
  "image-converter",
  "image-resizer",
  "image-cropper",
  "image-optimizer",

  "image-to-pdf",

  "jpg-to-png",
  "jpg-to-webp",
  "jpg-to-avif",
  "jpg-to-pdf",

  "png-to-jpg",
  "png-to-webp",
  "png-to-avif",
  "png-to-pdf",

  "webp-to-jpg",
  "webp-to-png",
  "webp-to-avif",
  "webp-to-pdf",

  "avif-to-jpg",
  "avif-to-png",
  "avif-to-webp",

  "heic-to-jpg",
  "heic-to-png",

  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-webp",
  "pdf-to-gif",
  "pdf-to-avif",
  "pdf-to-heic",
  "pdf-to-svg",
  "pdf-to-bmp",
  "pdf-to-eps",

  "raw-to-jpg",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: path
      ? `https://imgcontrol.com/${path}`
      : "https://imgcontrol.com",
    changeFrequency:
      path === "privacy" ||
      path === "terms" ||
      path === "contact"
        ? "yearly"
        : "weekly",
    priority:
      path === ""
        ? 1
        : path === "tools"
        ? 0.9
        : path === "privacy" ||
          path === "terms" ||
          path === "contact"
        ? 0.3
        : 0.8,
  }));
}