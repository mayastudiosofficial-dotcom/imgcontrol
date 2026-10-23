import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/tools";

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
  "compress-image-to-20kb",
  "compress-image-to-50kb",
  "compress-image-to-100kb",
  "compress-image-to-200kb",

  "image-to-pdf",

  "jpg-to-png",
  "jpg-to-webp",
  "jpg-to-pdf",

  "png-to-jpg",
  "png-to-webp",
  "png-to-pdf",

  "webp-to-jpg",
  "webp-to-png",
  "webp-to-pdf",

  "avif-to-jpg",
  "avif-to-png",

  "heic-to-jpg",
  "heic-to-png",

  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-webp",
  "merge-pdf",
  "split-pdf",
  "rotate-pdf",
  "compress-pdf",
  "delete-pdf-pages",
  "pdf-to-text",

  "raw-to-jpg",

  ...Object.keys(ARTICLES).map((slug) => `blog/${slug}`),
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
        : path.startsWith("blog/")
        ? 0.7
        : path === "tools"
        ? 0.9
        : path === "privacy" ||
          path === "terms" ||
          path === "contact"
        ? 0.3
        : 0.8,
  }));
}