import Image from "next/image";
import Link from "next/link";

const tools = [
  ["/image-compressor", "🗜️", "Image Compressor", "Quality and target-size compression."],
  ["/image-converter", "🔄", "Image Converter", "Convert common image formats."],
  ["/image-resizer", "↔️", "Image Resizer", "Set exact width, height or percentage."],
  ["/image-cropper", "✂️", "Image Cropper", "Visual crop box with live dimensions."],
  ["/image-optimizer", "✨", "Image Optimizer", "Optimize images for web delivery."],
  ["/pdf-to-jpg", "📄", "PDF to JPG", "One PDF page becomes one image."],
  ["/image-to-pdf", "🧾", "Image to PDF", "Create single or multi-page PDFs."],
  ["/tools", "➕", "More Tools", "Browse all image and PDF tools."],
] as const;

const conversions = [
  "jpg-to-png",
  "png-to-jpg",
  "jpg-to-webp",
  "webp-to-jpg",
  "png-to-webp",
  "webp-to-png",
  "pdf-to-jpg",
  "pdf-to-png",
  "image-to-pdf",
  "jpg-to-avif",
  "png-to-avif",
  "heic-to-jpg",
];

function titleFromSlug(slug: string) {
  return slug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Home() {
  return (
    <>
      <section className="homeHero3d">
        <div className="homeHeroGlow homeHeroGlowA" />
        <div className="homeHeroGlow homeHeroGlowB" />
        <div className="homeHeroGrid" />

        <div className="container homeHeroInner">
          <div className="homeBrandStage" aria-label="ImgControl">
            <div className="homeBrandHalo" />
            <div className="homeBrandFloor" />
            <div className="homeBrandLogoWrap">
              <Image
                src="/imgcontrol-logo-dark.png"
                alt="ImgControl"
                width={620}
                height={220}
                priority
                className="homeBrandLogo homeBrandLogoDark"
              />
              <Image
                src="/imgcontrol-logo.png"
                alt="ImgControl"
                width={620}
                height={220}
                priority
                className="homeBrandLogo homeBrandLogoLight"
              />
            </div>
            <div className="homeBrandReflection" />
          </div>

          <div className="homeKicker">✦ ALL-IN-ONE IMAGE &amp; PDF TOOLBOX ✦</div>

          <h1>
            Powerful tools for every
            <br />
            <span className="homeHeroGrad">image &amp; PDF workflow</span>
          </h1>

          <p className="homeHeroText">
            Compress, convert, resize, crop and work with PDFs directly in your
            browser — fast, simple and privacy-focused.
          </p>

          <div className="actions homeHeroActions">
            <Link className="btn btnPrimary homeHeroBtn" href="/tools">
              Explore All Tools
            </Link>
            <Link className="btn btnSecondary homeHeroBtnSecondary" href="/image-compressor">
              Compress Images
            </Link>
          </div>

          <div className="homeHeroTrust">
            <span>✓ Free to use</span>
            <span>✓ Browser-side tools</span>
            <span>✓ Mobile ready</span>
          </div>
        </div>
      </section>

      <section className="section homePopularSection">
        <div className="container">
          <h2 className="sectionTitle">Popular Tools</h2>
          <p className="sectionSub">
            A consistent professional workflow across mobile and desktop.
          </p>

          <div className="toolGrid">
            {tools.map(([href, icon, title, description]) => (
              <Link className="card toolCard" href={href} key={href}>
                <div className="icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section homeTrustSection" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="trust">
            <div className="card trustItem">
              <div className="icon">🔒</div>
              <div>
                <h3>Privacy-focused</h3>
                <p>Core raster tools are designed for browser-side processing.</p>
              </div>
            </div>

            <div className="card trustItem">
              <div className="icon">⚡</div>
              <div>
                <h3>Fast workflow</h3>
                <p>Batch files, compare results and download quickly.</p>
              </div>
            </div>

            <div className="card trustItem">
              <div className="icon">📱</div>
              <div>
                <h3>Mobile ready</h3>
                <p>Responsive controls work on phones, tablets and PCs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Popular Conversions</h2>
          <p className="sectionSub">Dedicated pages for specific conversion searches.</p>

          <div className="linkGrid">
            {conversions.map((slug) => (
              <Link className="linkCard" href={`/${slug}`} key={slug}>
                <strong>{titleFromSlug(slug)}</strong>
                <span>Dedicated ImgControl tool page</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">How it works</h2>

          <div className="steps">
            <div className="card">
              <div className="num">1</div>
              <h3>Choose a tool</h3>
              <p>Open the exact workflow you need.</p>
            </div>

            <div className="card">
              <div className="num">2</div>
              <h3>Set options</h3>
              <p>Choose quality, target size, format or dimensions.</p>
            </div>

            <div className="card">
              <div className="num">3</div>
              <h3>Download</h3>
              <p>Preview results and download one or all files.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
