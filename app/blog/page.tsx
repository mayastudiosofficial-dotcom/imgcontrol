import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import blogImage from "./jpg-vs-png.png";

export const metadata: Metadata = {
  title: "ImgControl Blog – Image & PDF Guides, Tips and Tutorials",
  description:
    "Learn practical image and PDF tips with ImgControl guides covering image compression, JPG, PNG, WebP, AVIF, PDF conversion, resizing, optimization and file formats.",
  alternates: {
    canonical: "/blog",
  },
};

const posts = [
  {
    category: "IMAGE COMPRESSION",
    title: "How to Compress Images Without Losing Too Much Quality",
    description:
      "Learn how image compression works, what affects file size, and how to balance image quality with practical file sizes for websites, social media and everyday use.",
    article: "/blog/how-to-compress-images-without-losing-quality",
    tool: "/image-compressor",
    toolLabel: "Image Compressor",
  },
  {
    category: "IMAGE FORMATS",
    title: "JPG vs PNG: Which Image Format Should You Use?",
    description:
      "Understand the practical differences between JPG and PNG, including compression, transparency, photographs, screenshots, graphics, websites and file size.",
    article: "/blog/jpg-vs-png",
    tool: "/jpg-to-png",
    toolLabel: "JPG to PNG",
  },
  {
    category: "MODERN IMAGE FORMATS",
    title: "What Is WebP and Why Is It Used on Websites?",
    description:
      "Learn what WebP is, why it is popular for modern websites, how it compares with JPG and PNG, and when WebP may be useful.",
    article: "/blog/what-is-webp",
    tool: "/jpg-to-webp",
    toolLabel: "JPG to WebP",
  },
  {
    category: "PDF CONVERSION",
    title: "How to Convert PDF to JPG Easily",
    description:
      "A practical guide to converting PDF pages into JPG images for sharing, publishing, editing, previews and everyday document workflows.",
    article: "/blog/how-to-convert-pdf-to-jpg",
    tool: "/pdf-to-jpg",
    toolLabel: "PDF to JPG",
  },
  {
    category: "PDF & IMAGE TOOLS",
    title: "How to Convert Images to PDF",
    description:
      "Learn how to combine JPG, PNG and other images into a PDF document for printing, sharing, archiving and professional document workflows.",
    article: "/blog/how-to-convert-images-to-pdf",
    tool: "/image-to-pdf",
    toolLabel: "Image to PDF",
  },
  {
    category: "IMAGE RESIZING",
    title: "How to Resize Images Before Publishing",
    description:
      "Understand image dimensions, width, height, aspect ratio and why resizing photographs before publishing can improve page speed and presentation.",
    article: "/blog/resize-images-before-publishing",
    tool: "/image-resizer",
    toolLabel: "Image Resizer",
  },
  {
    category: "WEB IMAGE OPTIMIZATION",
    title: "How to Optimize Images for a Website",
    description:
      "Discover practical ways to prepare images for websites by considering dimensions, formats, compression, file size and browser-friendly delivery.",
    article: "/blog/how-to-optimize-images-for-a-website",
    tool: "/image-optimizer",
    toolLabel: "Image Optimizer",
  },
  {
    category: "IMAGE FORMAT GUIDE",
    title: "JPG vs PNG vs WebP vs AVIF",
    description:
      "Compare popular image formats and learn how compression, transparency, quality and browser support affect the best format for different situations.",
    article: "/blog/jpg-png-webp-avif-guide",
    tool: "/jpg-to-webp",
    toolLabel: "JPG to WebP",
  },
  {
    category: "DOCUMENT FORMATS",
    title: "PDF vs JPG: When Should You Use Each?",
    description:
      "Explore the differences between PDF and JPG files and learn which format may be more practical for documents, photographs, printing and sharing.",
    article: "/blog/pdf-vs-jpg",
    tool: "/pdf-to-jpg",
    toolLabel: "PDF to JPG",
  },
  {
    category: "IMAGE FORMATS",
    title: "HEIC vs JPG: What Is the Difference?",
    description:
      "Learn how HEIC and JPG differ in image quality, compression, compatibility, storage and everyday use across phones, computers and websites.",
    article: "/blog/heic-vs-jpg",
    tool: "/heic-to-jpg",
    toolLabel: "HEIC to JPG",
  },
];

export default function BlogPage() {
  return (
    <main>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl Blog</div>

          <h1>Image &amp; PDF Guides, Tips and Tutorials</h1>

          <p>
            Learn practical ways to work with digital images and PDF files.
            Our guides explain image formats, compression, resizing,
            conversion, optimization and everyday file-processing workflows
            in simple language.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* INTRO */}
          <div
            className="card"
            style={{
              maxWidth: 900,
              margin: "0 auto 34px",
            }}
          >
            <h2>Learn More About Images and PDF Files</h2>

            <p>
              Digital images and PDF documents are part of everyday work,
              education, business, publishing and personal projects. Tasks
              such as reducing image file size, converting between formats,
              resizing photographs, preparing website images or converting
              PDF pages into images can seem simple, but choosing the right
              workflow often requires a little knowledge.
            </p>

            <p>
              The ImgControl Blog provides practical articles designed to
              help you understand these tasks before you process your files.
              Our guides explain image formats, compression, file size,
              dimensions, PDF conversion and other common digital file
              workflows in clear language.
            </p>

            <p style={{ marginBottom: 0 }}>
              Each article is written around a real question or practical
              problem so that you can understand not only how to do something,
              but also why a particular format or workflow may be appropriate.
            </p>
          </div>

          {/* BLOG GRID */}
          <div
            className="blog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {posts.map((post, index) => (
              <article
                key={post.title}
                className="card blog-card"
                style={{
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                }}
              >

                {/* IMAGE */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    overflow: "hidden",
                    borderRadius: 14,
                    marginBottom: 14,
                    background: "#eaf2f8",
                  }}
                >
                  <Image
                    src={blogImage}
                    alt={post.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* CATEGORY */}
                <div
                  style={{
                    display: "inline-flex",
                    alignSelf: "flex-start",
                    padding: "5px 9px",
                    borderRadius: 999,
                    background:
                      "linear-gradient(145deg, #1687f5, #0668c9)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.35px",
                    marginBottom: 10,
                    boxShadow:
                      "0 3px 7px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.3)",
                  }}
                >
                  {post.category}
                </div>

                {/* TITLE */}
                <h2
                  style={{
                    fontSize: 18,
                    lineHeight: 1.2,
                    margin: "0 0 10px",
                  }}
                >
                  {post.title}
                </h2>

                {/* DESCRIPTION */}
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    margin: "0 0 16px",
                    opacity: 0.82,
                  }}
                >
                  {post.description}
                </p>

                {/* BUTTONS */}
                <div
                  className="blog-buttons"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: "auto",
                    paddingTop: 4,
                  }}
                >
                  {/* READ GUIDE */}
                  <Link
                    href={post.article}
                    className="blog-premium-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 42,
                      padding: "9px 10px",
                      borderRadius: 12,
                      background:
                        "linear-gradient(145deg, #279bff 0%, #0873d8 55%, #055eb7 100%)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      textDecoration: "none",
                      textAlign: "center",
                      border:
                        "1px solid rgba(255,255,255,.24)",
                      boxShadow:
                        "0 5px 0 #044f99, 0 8px 15px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.42)",
                    }}
                  >
                    Read Guide
                  </Link>

                  {/* TOOL */}
                  <Link
                    href={post.tool}
                    className="blog-premium-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 42,
                      padding: "9px 10px",
                      borderRadius: 12,
                      background:
                        "linear-gradient(145deg, #173b57 0%, #0d293d 55%, #081c2b 100%)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      textDecoration: "none",
                      textAlign: "center",
                      border:
                        "1px solid rgba(255,255,255,.16)",
                      boxShadow:
                        "0 5px 0 #04121c, 0 8px 15px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.16)",
                    }}
                  >
                    {post.toolLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* BOTTOM INFORMATION */}
          <div
            className="card"
            style={{
              maxWidth: 900,
              margin: "38px auto 0",
            }}
          >
            <h2>Practical Information, Not Just Keywords</h2>

            <p>
              ImgControl focuses on useful information rather than simply
              repeating technical terms. Image and PDF workflows depend on
              many factors, including source file characteristics, dimensions,
              compression settings, browser capabilities, device performance
              and the requirements of the destination platform.
            </p>

            <p>
              Our goal is therefore to provide understandable guidance that
              helps you make better decisions about your images and documents.
              Articles can cover subjects such as image compression, file
              conversion, image dimensions, modern image formats, PDF
              workflows and practical file-processing questions.
            </p>

            <p style={{ marginBottom: 0 }}>
              As ImgControl grows, this section can continue to include more
              original guides, format comparisons, tutorials, troubleshooting
              information and practical examples for everyday image and PDF
              tasks.
            </p>
          </div>
        </div>
      </section>

      {/* PREMIUM BUTTON HOVER + RESPONSIVE CSS */}
      <style>{`
        .blog-premium-btn {
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            filter 0.18s ease;
          will-change: transform;
        }

        .blog-premium-btn:hover {
          transform: translateY(-5px) scale(1.04);
          filter: brightness(1.1);
        }

        .blog-premium-btn:active {
          transform: translateY(-1px) scale(0.99);
        }

        .blog-grid {
          width: 100%;
        }

        @media (max-width: 900px) {
          .blog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 600px) {
          .blog-grid {
            grid-template-columns: 1fr !important;
          }

          .blog-premium-btn {
            min-height: 44px !important;
          }
        }
      `}</style>
    </main>
  );
}