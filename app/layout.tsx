import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  metadataBase: new URL("https://imgcontrol.com"),

  title: {
    default: "ImgControl — All Image Tools in One Place",
    template: "%s | ImgControl",
  },

  description:
    "Free online image compression, conversion, resizing, cropping and PDF tools.",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "ImgControl — All Image Tools in One Place",
    description:
      "Compress, convert, resize, crop images and work with PDFs online.",
    url: "https://imgcontrol.com",
    siteName: "ImgControl",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* =================================
            HEADER
        ================================= */}
        <header className="header">
          <div className="container nav">
            {/* LOGO */}
            <Link
              href="/"
              className="logo"
              aria-label="ImgControl Home"
            >
              <span className="logoSwap">
                {/* Light Mode Logo */}
                <Image
                  src="/imgcontrol-logo.png"
                  alt="ImgControl"
                  width={205}
                  height={54}
                  priority
                  className="brandLogo logoLight"
                />

                {/* Dark Mode Logo */}
                <Image
                  src="/imgcontrol-logo-dark.png"
                  alt="ImgControl"
                  width={205}
                  height={54}
                  priority
                  className="brandLogo logoDark"
                />
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav
              className="navLinks"
              aria-label="Main navigation"
            >
              <Link href="/">Home</Link>

              <Link href="/tools">
                All Tools
              </Link>

              <Link href="/blog">
                Blog
              </Link>

              <Link href="/about">
                About
              </Link>

              <Link href="/contact">
                Contact
              </Link>
            </nav>

            {/* MOBILE MENU */}
            <div className="menuWrap">
              <details>
                <summary className="menuBtn">
                  ☰
                </summary>

                <div className="mobileLinks">
                  <Link href="/">
                    Home
                  </Link>

                  <Link href="/tools">
                    All Tools
                  </Link>

                  <Link href="/blog">
                    Blog
                  </Link>

                  <Link href="/about">
                    About
                  </Link>

                  <Link href="/contact">
                    Contact
                  </Link>
                </div>
              </details>
            </div>
          </div>
        </header>

        {/* =================================
            PAGE CONTENT
        ================================= */}
        {children}

        {/* =================================
            FOOTER
        ================================= */}
        <footer>
          <div className="container footerGrid">
            {/* BRAND */}
            <div>
              <Link
                href="/"
                className="footerLogo"
                aria-label="ImgControl Home"
              >
                <span className="logoSwap">
                  {/* Light Footer Logo */}
                  <Image
                    src="/imgcontrol-logo.png"
                    alt="ImgControl"
                    width={195}
                    height={52}
                    className="footerBrandLogo logoLight"
                  />

                  {/* Dark Footer Logo */}
                  <Image
                    src="/imgcontrol-logo-dark.png"
                    alt="ImgControl"
                    width={195}
                    height={52}
                    className="footerBrandLogo logoDark"
                  />
                </span>
              </Link>

              <p
                style={{
                  color: "#A9BDCF",
                  maxWidth: 330,
                }}
              >
                Fast, free and privacy-focused image
                and PDF tools.
              </p>
            </div>

            {/* TOOLS */}
            <div>
              <h4>Tools</h4>

              <Link href="/image-compressor">
                Image Compressor
              </Link>

              <Link href="/image-converter">
                Image Converter
              </Link>

              <Link href="/image-resizer">
                Image Resizer
              </Link>

              <Link href="/image-cropper">
                Image Cropper
              </Link>

              <Link href="/image-to-pdf">
                Image to PDF
              </Link>
            </div>

            {/* CONVERSIONS */}
            <div>
              <h4>Conversions</h4>

              <Link href="/jpg-to-png">
                JPG to PNG
              </Link>

              <Link href="/png-to-jpg">
                PNG to JPG
              </Link>

              <Link href="/jpg-to-webp">
                JPG to WebP
              </Link>

              <Link href="/webp-to-jpg">
                WebP to JPG
              </Link>

              <Link href="/pdf-to-jpg">
                PDF to JPG
              </Link>
            </div>

            {/* COMPANY */}
            <div>
              <h4>Company</h4>

              <Link href="/about">
                About
              </Link>

              <Link href="/blog">
                Blog
              </Link>

              <Link href="/contact">
                Contact
              </Link>

              <Link href="/privacy">
                Privacy
              </Link>

              <Link href="/terms">
                Terms
              </Link>
            </div>
          </div>

          <div className="container footerBottom">
            <span>
              © 2026 ImgControl. All rights reserved.
            </span>

            <span>
              Fast · Free · Secure · No Upload
            </span>
          </div>
        </footer>

        {/* =================================
            GLOBAL THEME TOGGLE
        ================================= */}
        <ThemeToggle />
      </body>
    </html>
  );
}