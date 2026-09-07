import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Image & PDF Tools | ImgControl",
  description:
    "Browse ImgControl image tools, dedicated image converters and PDF tools.",
  alternates: { canonical: "/tools" },
};

const imageTools = [
  "image-compressor",
  "image-converter",
  "image-resizer",
  "image-cropper",
  "image-optimizer",
];

const imageConversions = [
  "jpg-to-png",
  "jpg-to-webp",
  "jpg-to-avif",

  "png-to-jpg",
  "png-to-webp",
  "png-to-avif",

  "webp-to-jpg",
  "webp-to-png",
  "webp-to-avif",

  "avif-to-jpg",
  "avif-to-png",
  "avif-to-webp",

  "heic-to-jpg",
  "heic-to-png",

  "raw-to-jpg",
];

const pdfTools = [
  "image-to-pdf",
  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-webp",
  "pdf-to-gif",
  "pdf-to-avif",
  "pdf-to-heic",
  "pdf-to-svg",
  "pdf-to-bmp",
  "pdf-to-eps",
];

function label(slug: string) {
  const special: Record<string, string> = {
    "jpg-to-png": "JPG to PNG",
    "jpg-to-webp": "JPG to WebP",
    "jpg-to-avif": "JPG to AVIF",

    "png-to-jpg": "PNG to JPG",
    "png-to-webp": "PNG to WebP",
    "png-to-avif": "PNG to AVIF",

    "webp-to-jpg": "WebP to JPG",
    "webp-to-png": "WebP to PNG",
    "webp-to-avif": "WebP to AVIF",

    "avif-to-jpg": "AVIF to JPG",
    "avif-to-png": "AVIF to PNG",
    "avif-to-webp": "AVIF to WebP",

    "heic-to-jpg": "HEIC to JPG",
    "heic-to-png": "HEIC to PNG",

    "raw-to-jpg": "RAW to JPG",

    "image-to-pdf": "Image to PDF",
    "pdf-to-jpg": "PDF to JPG",
    "pdf-to-png": "PDF to PNG",
    "pdf-to-webp": "PDF to WebP",
    "pdf-to-gif": "PDF to GIF",
    "pdf-to-avif": "PDF to AVIF",
    "pdf-to-heic": "PDF to HEIC / HEIF",
    "pdf-to-svg": "PDF to SVG",
    "pdf-to-bmp": "PDF to BMP",
    "pdf-to-eps": "PDF to EPS",
  };

  return (
    special[slug] ??
    slug
      .replaceAll("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function ToolCard({ slug }: { slug: string }) {
  return (
    <Link className="toolsPremiumCard" href={`/${slug}`}>
      <div className="toolsPremiumCardContent">
        <strong>{label(slug)}</strong>
        <span>Open dedicated tool</span>
      </div>
    </Link>
  );
}

export default function Page() {
  return (
    <>
      {/* =========================
          PAGE HEADER
         ========================= */}
      <section className="toolsPremiumHead">
        <div className="container">
          <div className="toolsPremiumKicker">✦ TOOLS ✦</div>

          <h1>
            All <span>Image &amp; PDF</span> Tools
          </h1>

          <p>
            Everything you need to work with your images and PDFs in one place.
          </p>

          <div className="toolsPremiumMeta">
            <span>Fast</span>
            <span>•</span>
            <span>Free</span>
            <span>•</span>
            <span>Secure</span>
            <span>•</span>
            <span>Browser Based</span>
          </div>
        </div>
      </section>

      {/* =========================
          TOOL PANELS
         ========================= */}
      <section className="toolsPremiumSection">
        <div className="container">
          <div className="toolsPremiumLayout">
            {/* =========================
                IMAGE TOOLS
               ========================= */}
            <div className="toolsPanel toolsPanelImage">
              <div className="toolsPanelTitle">Image Tools</div>

              <div className="toolsPanelInner imageToolsGrid">
                {imageTools.map((slug) => (
                  <ToolCard key={slug} slug={slug} />
                ))}

                {imageConversions.map((slug) => (
                  <ToolCard key={slug} slug={slug} />
                ))}
              </div>
            </div>

            {/* =========================
                PDF TOOLS
               ========================= */}
            <div className="toolsPanel toolsPanelPdf">
              <div className="toolsPanelTitle">PDF Tools</div>

              <div className="toolsPanelInner pdfToolsGrid">
                {pdfTools.map((slug) => (
                  <ToolCard key={slug} slug={slug} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* =================================================
               TOOLS PAGE — FINAL PREMIUM LAYOUT
               ================================================= */

            .toolsPremiumHead{
              padding:42px 0 32px;
              text-align:center;

              background:
                radial-gradient(
                  circle at 50% 0%,
                  rgba(20,126,245,.11),
                  transparent 48%
                ),
                linear-gradient(
                  180deg,
                  #f3faff 0%,
                  #ffffff 100%
                );
            }

            .toolsPremiumKicker{
              display:inline-flex;
              align-items:center;
              justify-content:center;

              min-height:33px;
              padding:0 15px;

              border-radius:999px;

              border:1px solid rgba(20,126,245,.22);

              background:rgba(20,126,245,.07);

              color:#147ef5;

              font-size:12px;
              font-weight:900;
              letter-spacing:1.5px;

              margin-bottom:12px;
            }

            .toolsPremiumHead h1{
              margin:0;

              font-size:clamp(40px,5vw,60px);
              line-height:1.05;

              letter-spacing:-1.9px;

              color:#102a43;

              font-weight:900;
            }

            .toolsPremiumHead h1 span{
              background:
                linear-gradient(
                  100deg,
                  #0878f2 0%,
                  #00a6da 52%,
                  #22a76d 100%
                );

              -webkit-background-clip:text;
              background-clip:text;

              -webkit-text-fill-color:transparent;
              color:transparent;
            }

            .toolsPremiumHead p{
              max-width:720px;

              margin:13px auto 0;

              color:#657d91;

              font-size:15px;
              line-height:1.6;
            }

            .toolsPremiumMeta{
              display:flex;
              align-items:center;
              justify-content:center;

              gap:7px;

              margin-top:10px;

              color:#7b91a3;

              font-size:12px;
              font-weight:750;
            }

            /* =================================================
               MAIN LAYOUT
               ================================================= */

            .toolsPremiumSection{
              padding:30px 0 72px;
            }

            .toolsPremiumLayout{
              width:min(1120px,100%);

              margin:0 auto;

              display:grid;

              grid-template-columns:
                minmax(0,1.72fr)
                minmax(270px,.72fr);

              gap:24px;

              align-items:start;
            }

            /* =================================================
               PANELS
               ================================================= */

            .toolsPanel{
              position:relative;

              padding:37px 18px 18px;

              border:1px solid rgba(29,164,235,.80);

              border-radius:19px;

              background:
                linear-gradient(
                  180deg,
                  rgba(10,40,63,.20),
                  rgba(5,24,39,.12)
                );

              box-shadow:
                0 0 0 1px rgba(24,171,255,.055),
                0 12px 36px rgba(7,55,85,.08),
                inset 0 1px 0 rgba(255,255,255,.035);
            }

            .toolsPanel::before{
              content:"";

              position:absolute;

              top:-1px;
              left:18%;

              width:64%;
              height:1px;

              background:
                linear-gradient(
                  90deg,
                  transparent,
                  #28bcff,
                  transparent
                );

              opacity:.95;

              pointer-events:none;
            }

            .toolsPanelTitle{
              position:absolute;

              top:-18px;
              left:50%;

              transform:translateX(-50%);

              z-index:2;

              padding:0 16px;

              white-space:nowrap;

              background:#071522;

              color:#f5f9fc;

              font-size:21px;
              font-weight:900;

              line-height:34px;

              letter-spacing:-.25px;
            }

            /* =================================================
               IMAGE TOOLS = 2 COLUMNS
               ================================================= */

            .imageToolsGrid{
              display:grid;

              grid-template-columns:
                repeat(2,minmax(0,1fr));

              gap:10px;
            }

            /* =================================================
               PDF TOOLS = 1 COLUMN
               ================================================= */

            .pdfToolsGrid{
              display:grid;

              grid-template-columns:1fr;

              gap:10px;
            }

            /* =================================================
               CARD
               ================================================= */

            .toolsPremiumCard{
              min-height:68px;

              display:flex;

              align-items:center;

              padding:11px 13px;

              border:1px solid #234e68;

              border-radius:12px;

              background:
                linear-gradient(
                  180deg,
                  #143b56 0%,
                  #0d2c43 100%
                );

              box-shadow:
                inset 0 1px 0
                  rgba(255,255,255,.045),

                0 5px 14px
                  rgba(0,0,0,.10);

              transition:
                transform .17s ease,
                border-color .17s ease,
                box-shadow .17s ease,
                background .17s ease;
            }

            .toolsPremiumCard:hover{
              transform:translateY(-2px);

              border-color:#3aa9ed;

              background:
                linear-gradient(
                  180deg,
                  #184660 0%,
                  #10334c 100%
                );

              box-shadow:
                0 10px 23px
                  rgba(0,0,0,.18),

                inset 0 1px 0
                  rgba(255,255,255,.055);
            }

            .toolsPremiumCardContent{
              min-width:0;
            }

            /* IMPORTANT:
               Keep text readable — not tiny */
            .toolsPremiumCard strong{
              display:block;

              color:#f1f8fc;

              font-size:14px;

              line-height:1.35;

              font-weight:850;

              white-space:nowrap;

              overflow:hidden;

              text-overflow:ellipsis;
            }

            .toolsPremiumCard span{
              display:block;

              margin-top:4px;

              color:#91afc0;

              font-size:11px;

              line-height:1.3;

              font-weight:600;
            }

            /* =================================================
               LIGHT MODE
               ================================================= */

            html:not(.dark) .toolsPremiumHead{
              background:
                radial-gradient(
                  circle at 50% 0%,
                  rgba(20,126,245,.08),
                  transparent 48%
                ),
                linear-gradient(
                  180deg,
                  #f3faff 0%,
                  #ffffff 100%
                );
            }

            html:not(.dark) .toolsPremiumHead h1{
              color:#102a43;
            }

            html:not(.dark) .toolsPanel{
              background:
                linear-gradient(
                  180deg,
                  #f5fbff 0%,
                  #fbfdff 100%
                );

              border-color:#2ca6ee;

              box-shadow:
                0 10px 30px
                  rgba(27,103,153,.08),

                inset 0 1px 0
                  rgba(255,255,255,.98);
            }

            html:not(.dark) .toolsPanelTitle{
              background:#f9fcff;

              color:#17344d;
            }

            html:not(.dark) .toolsPremiumCard{
              border-color:#c4dff0;

              background:
                linear-gradient(
                  180deg,
                  #ffffff 0%,
                  #f3f9fd 100%
                );

              box-shadow:
                0 5px 14px
                  rgba(27,91,134,.055),

                inset 0 1px 0
                  rgba(255,255,255,.98);
            }

            html:not(.dark) .toolsPremiumCard:hover{
              border-color:#58b1e8;

              background:
                linear-gradient(
                  180deg,
                  #ffffff 0%,
                  #eff8ff 100%
                );

              box-shadow:
                0 9px 22px
                  rgba(27,103,153,.11);
            }

            html:not(.dark) .toolsPremiumCard strong{
              color:#17354d;
            }

            html:not(.dark) .toolsPremiumCard span{
              color:#738da1;
            }

            /* =================================================
               DARK MODE
               ================================================= */

            html.dark .toolsPremiumHead{
              background:
                radial-gradient(
                  circle at 50% 0%,
                  rgba(20,126,245,.18),
                  transparent 46%
                ),
                linear-gradient(
                  180deg,
                  #0a2942 0%,
                  #071522 88%,
                  #071522 100%
                );
            }

            html.dark .toolsPremiumKicker{
              background:
                rgba(20,126,245,.12);

              border-color:
                rgba(66,166,241,.25);

              color:#68bcff;
            }

            html.dark .toolsPremiumHead h1{
              color:#f1f8fc;
            }

            html.dark .toolsPremiumHead p{
              color:#9db6c6;
            }

            html.dark .toolsPremiumMeta{
              color:#8ca9ba;
            }

            html.dark .toolsPanel{
              background:
                linear-gradient(
                  180deg,
                  rgba(8,35,56,.78),
                  rgba(6,26,42,.84)
                );

              border-color:
                rgba(34,164,232,.78);

              box-shadow:
                0 0 0 1px
                  rgba(24,171,255,.06),

                0 12px 36px
                  rgba(0,0,0,.22),

                inset 0 1px 0
                  rgba(255,255,255,.025);
            }

            html.dark .toolsPanelTitle{
              background:#071522;

              color:#f4f9fc;
            }

            html.dark .toolsPremiumCard{
              border-color:#24506a;

              background:
                linear-gradient(
                  180deg,
                  #143a54 0%,
                  #0d2c43 100%
                );

              box-shadow:
                inset 0 1px 0
                  rgba(255,255,255,.045),

                0 6px 15px
                  rgba(0,0,0,.16);
            }

            html.dark .toolsPremiumCard:hover{
              border-color:#38a5e8;

              background:
                linear-gradient(
                  180deg,
                  #18445e 0%,
                  #10334b 100%
                );
            }

            html.dark .toolsPremiumCard strong{
              color:#f2f8fc;
            }

            html.dark .toolsPremiumCard span{
              color:#91adbd;
            }

            /* =================================================
               MOBILE
               ================================================= */

            @media(max-width:860px){

              .toolsPremiumLayout{
                grid-template-columns:1fr;

                gap:32px;
              }

              .toolsPanelPdf{
                width:min(100%,560px);

                margin:0 auto;
              }
            }

            @media(max-width:620px){

              .toolsPremiumHead{
                padding:31px 0 24px;
              }

              .toolsPremiumHead h1{
                font-size:39px;

                letter-spacing:-1.35px;
              }

              .toolsPremiumHead p{
                padding:0 13px;

                font-size:13px;
              }

              .toolsPremiumMeta{
                flex-wrap:wrap;

                padding:0 12px;

                font-size:10px;
              }

              .toolsPremiumSection{
                padding:22px 12px 52px;
              }

              .toolsPanel{
                padding:33px 11px 12px;

                border-radius:16px;
              }

              .toolsPanelTitle{
                top:-16px;

                font-size:18px;

                line-height:30px;

                padding:0 13px;
              }

              .imageToolsGrid{
                grid-template-columns:
                  1fr 1fr;

                gap:8px;
              }

              .toolsPremiumCard{
                min-height:62px;

                padding:9px 10px;

                border-radius:10px;
              }

              .toolsPremiumCard strong{
                font-size:12px;
              }

              .toolsPremiumCard span{
                font-size:9px;
              }
            }

            @media(max-width:420px){

              .toolsPremiumCard{
                min-height:58px;

                padding:8px 9px;
              }

              .toolsPremiumCard strong{
                font-size:11px;
              }

              .toolsPremiumCard span{
                font-size:8.5px;
              }
            }
          `,
        }}
      />
    </>
  );
}