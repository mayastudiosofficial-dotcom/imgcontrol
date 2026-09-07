# ImgControl Final Pro

Professional Next.js App Router starter for imgcontrol.com.

## Included
- Mobile + desktop responsive design consistent across all pages
- Image Compressor: Quality mode OR Target File Size
- Original dimensions preserved by default in compression
- JPG / PNG / WebP / AVIF output selectors
- Batch processing + progress + before/after size stats + percentage saved + per-file preview/download + Download All ZIP
- Image Resizer with manual width/height + aspect ratio lock
- Visual Cropper foundation with crop readout, aspect ratio and export size
- PDF → JPG / PNG / WebP: every PDF page rendered as a separate image + individual download + ZIP
- Image → PDF: multiple images → multi-page PDF + optional target size field
- Dedicated SEO-friendly conversion routes for many common searches
- Per-page metadata + canonical URLs
- Sitemap + robots

## Setup
Node.js 20+ recommended.

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Production
```bash
npm run build
npm start
```

## Notes
- pdfjs-dist uses a CDN worker URL in the PDF→image component. For strict self-hosting/CSP, move the worker into public/ and point GlobalWorkerOptions.workerSrc to that local asset.
- HEIC/TIFF and some advanced formats need browser codec support or an additional WASM/server codec for full production coverage.
- Target-size compression is a maximum/approximate target, not an exact-byte guarantee.
- Target-size on Image→PDF reports when the generated PDF exceeds the selected target; exact compression below arbitrary targets requires iterative image re-encoding/downsampling and is not universally possible without quality loss.
- Review Privacy Policy, Terms, contact form, analytics and advertising configuration before launch.
