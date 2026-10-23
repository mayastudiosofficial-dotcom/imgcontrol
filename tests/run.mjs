/**
 * Regression tests for ImgControl.
 *
 *   npm run build && npx next start -p 3100     (in one terminal)
 *   npm run test:tools                          (in another)
 *
 * Every converter is driven in a real Chrome with a real file, and the
 * downloaded bytes are checked by their file signature, so a tool that
 * silently saves the wrong format fails here. SEO checks cover titles,
 * canonical tags, structured data, content length and the sitemap.
 *
 * Env: BASE_URL (default http://localhost:3100), CHROME_PATH (optional).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge found. Set CHROME_PATH.");
  process.exit(2);
}

/* ---------- helpers that run inside the page ---------- */

const PAGE_HELPERS = `
window.__blobs = [];
(() => {
  const original = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (b) => { window.__blobs.push(b); return original(b); };
})();
window.__sig = async (b) => {
  const u = new Uint8Array(await b.slice(0, 16).arrayBuffer());
  const t = String.fromCharCode(...u);
  const h = [...u].map((x) => x.toString(16).padStart(2, "0")).join("");
  if (h.startsWith("ffd8ff")) return "jpg";
  if (h.startsWith("89504e47")) return "png";
  if (t.startsWith("RIFF") && t.slice(8, 12) === "WEBP") return "webp";
  if (/^ftyp(avif|avis)/.test(t.slice(4, 12))) return "avif";
  if (/^ftyp(heic|heix|mif1|msf1|hevc)/.test(t.slice(4, 12))) return "heic";
  if (t.startsWith("%PDF")) return "pdf";
  if (t.startsWith("GIF8")) return "gif";
  if (t.startsWith("BM")) return "bmp";
  if (t.startsWith("PK")) return "zip";
  if (t.startsWith("%!PS")) return "eps";
  if (t.startsWith("<")) return "svg";
  return "unknown";
};
window.__waitFor = async (kind, ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    for (const b of window.__blobs) {
      if ((await window.__sig(b)) === kind) return { ok: true, size: b.size };
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  const seen = [];
  for (const b of window.__blobs) seen.push(await window.__sig(b));
  return { ok: false, seen };
};
`;

/* ---------- harness ---------- */

const results = [];
let browser;

async function newPage() {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(PAGE_HELPERS);
  return page;
}

async function test(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - started });
    console.log(`  ok    ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error: String(error.message || error) });
    console.log(`  FAIL  ${name}\n        ${String(error.message || error).split("\n")[0]}`);
  }
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)),
  ]);
}

/* ---------- fixtures (built once, in the browser) ---------- */

const fixtures = {};

async function buildFixtures() {
  const page = await newPage();
  await page.goto(`${BASE}/about`);

  for (const [key, mime] of [["jpg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"]]) {
    const b64 = await page.evaluate(async (type) => {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 200;
      const x = c.getContext("2d");
      x.fillStyle = "#fff";
      x.fillRect(0, 0, 320, 200);
      const g = x.createLinearGradient(0, 0, 320, 200);
      g.addColorStop(0, "#e33");
      g.addColorStop(1, "#36f");
      x.fillStyle = g;
      x.fillRect(20, 20, 200, 120);
      x.fillStyle = "#0a0";
      x.beginPath();
      x.arc(240, 120, 50, 0, 7);
      x.fill();
      const blob = await new Promise((r) => c.toBlob(r, type, 0.9));
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = "";
      bytes.forEach((v) => (s += String.fromCharCode(v)));
      return btoa(s);
    }, mime);
    fixtures[key] = Buffer.from(b64, "base64");
  }

  // HEIC is produced with the raw icodec encoder (served from node_modules for this page only).
  await page.context().route("**/_t/**", async (route) => {
    const rel = new URL(route.request().url()).pathname.replace(/^\/_t\//, "");
    const file = path.join(ROOT, "node_modules", "icodec", rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404 });
    route.fulfill({
      body: fs.readFileSync(file),
      contentType: file.endsWith(".wasm") ? "application/wasm" : "text/javascript",
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  });

  const heicB64 = await withTimeout(page.evaluate(async (origin) => {
    const m = await import(origin + "/_t/lib/index.js");
    await m.heic.loadEncoder(origin + "/_t/dist/heic-enc.wasm");
    const w = 320;
    const h = 200;
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        d[i] = (x * 255) / w;
        d[i + 1] = (y * 255) / h;
        d[i + 2] = 180;
        d[i + 3] = 255;
      }
    }
    const out = m.heic.encode(new ImageData(d, w, h), { quality: 80 });
    let s = "";
    new Uint8Array(out).forEach((v) => (s += String.fromCharCode(v)));
    return btoa(s);
  }, BASE), 45000, "HEIC fixture generation");
  fixtures.heic = Buffer.from(heicB64, "base64");

  // A phone-sized photo, so the conversion lasts long enough to watch its progress bar.
  const bigB64 = await withTimeout(page.evaluate(async (origin) => {
    const m = await import(origin + "/_t/lib/index.js");
    const w = 4000;
    const h = 3000;
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        d[i] = (x * 255) / w + ((x * y) % 29);
        d[i + 1] = (y * 255) / h + ((x ^ y) % 31);
        d[i + 2] = ((x + y) * 255) / (w + h);
        d[i + 3] = 255;
      }
    }
    const out = m.heic.encode(new ImageData(d, w, h), { quality: 60, preset: "ultrafast" });
    let s = "";
    new Uint8Array(out).forEach((v) => (s += String.fromCharCode(v)));
    return btoa(s);
  }, BASE), 90000, "large HEIC fixture generation");
  fixtures.heicBig = Buffer.from(bigB64, "base64");

  const avifB64 = await withTimeout(page.evaluate(async (origin) => {
    const m = await import(origin + "/_t/lib/index.js");
    await m.avif.loadEncoder(origin + "/_t/dist/avif-enc.wasm");
    const w = 320;
    const h = 200;
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        d[i] = (x * 255) / w;
        d[i + 1] = 90;
        d[i + 2] = (y * 255) / h;
        d[i + 3] = 255;
      }
    }
    const out = m.avif.encode(new ImageData(d, w, h), { quality: 60 });
    let s = "";
    new Uint8Array(out).forEach((v) => (s += String.fromCharCode(v)));
    return btoa(s);
  }, BASE), 45000, "AVIF fixture generation");
  fixtures.avif = Buffer.from(avifB64, "base64");
  await page.context().close();
}

/* ---------- conversions ---------- */

const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", heic: "image/heic", pdf: "application/pdf" };

async function uploadAndConvert(page, key, buttonRegex) {
  await page.locator("input[type=file]").first().setInputFiles({
    name: `sample.${key.replace(/\d+$/, "")}`,
    mimeType: MIME[key.replace(/\d+$/, "")],
    buffer: fixtures[key],
  });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: buttonRegex }).first().click();
}

async function convertTest(slug, from, to, buttonRegex, beforeClick) {
  await test(`${slug}: ${from} -> ${to}`, async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/${slug}`);
      if (beforeClick) await beforeClick(page);
      await uploadAndConvert(page, from, buttonRegex);
      const res = await page.evaluate(([kind]) => window.__waitFor(kind, 30000), [to]);
      expect(res.ok, `no real ${to} output (saw: ${(res.seen || []).join(", ") || "nothing"})`);
      expect(res.size > 100, `${to} output is only ${res.size} bytes`);
      if (to !== "png" && slug.includes("-to-")) {
        const text = await page.locator("body").innerText();
        expect(!/^\s*PNG:\s*[\d.]+\s*(KB|MB|B)\b/m.test(text), "result card shows a wrong PNG label");
      }
    } finally {
      await page.context().close();
    }
  });
}

const FIXED = [
  ["jpg", "png"], ["jpg", "webp"],
  ["png", "jpg"], ["png", "webp"],
  ["webp", "jpg"], ["webp", "png"],
  ["avif", "jpg"], ["avif", "png"],
  ["heic", "jpg"], ["heic", "png"],
];

async function runConverters() {
  console.log("\nImage converters");
  for (const [from, to] of FIXED) {
    await convertTest(`${from}-to-${to}`, from, to, new RegExp(`Convert to ${to === "jpg" ? "JPG" : to === "png" ? "PNG" : to === "webp" ? "WebP" : "AVIF"}`, "i"));
  }

  console.log("\nOptimizer family");
  async function optimizerTest(slug, from, to, label) {
    await test(`${slug}: ${from} -> ${to}`, async () => {
      const page = await newPage();
      try {
        await page.goto(`${BASE}/${slug}`);
        await page.locator("input[type=file]").first().setInputFiles({
          name: `sample.${from}`,
          mimeType: MIME[from],
          buffer: fixtures[from],
        });
        await page.waitForTimeout(600);
        if (label) await page.getByRole("button", { name: new RegExp(`^${label}`) }).first().click();
        await page.getByRole("button", { name: /Process Images/i }).click();
        await page.getByRole("button", { name: /^Download$/ }).first().waitFor({ timeout: 30000 });
        // The result row must show the real output before it is downloaded.
        await page.waitForFunction(() => {
          const el = document.querySelector("img.resultThumb");
          return el && el.complete && el.naturalWidth > 50;
        }, null, { timeout: 10000 });
        await page.evaluate(() => {
          window.__blobs.length = 0;
          const original = HTMLAnchorElement.prototype.click;
          HTMLAnchorElement.prototype.click = function () { window.__lastName = this.download; };
          window.__restore = () => (HTMLAnchorElement.prototype.click = original);
        });
        await page.getByRole("button", { name: /^Download$/ }).first().click();
        const res = await page.evaluate(([kind]) => window.__waitFor(kind, 8000), [to]);
        const name = await page.evaluate(() => window.__lastName);
        expect(res.ok, `no real ${to} output (saw: ${(res.seen || []).join(", ") || "nothing"})`);
        expect(String(name).endsWith(`.${to}`), `file is named ${name}, expected .${to}`);
      } finally {
        await page.context().close();
      }
    });
  }

  await optimizerTest("image-converter", "png", "webp", "WebP");
  await optimizerTest("image-converter", "jpg", "avif", "AVIF");
  await optimizerTest("image-converter", "heic", "png", "PNG");
  await optimizerTest("image-compressor", "jpg", "jpg", "JPG");
  await optimizerTest("image-compressor", "png", "avif", "AVIF");
  await optimizerTest("image-optimizer", "png", "avif", "AVIF");
  await optimizerTest("image-resizer", "jpg", "jpg", null);
}

/* ---------- PDF ---------- */

async function runPdf() {
  console.log("\nImage to PDF and PDF to image");

  for (const slug of ["image-to-pdf", "jpg-to-pdf", "png-to-pdf", "webp-to-pdf"]) {
    const from = slug === "image-to-pdf" ? "jpg" : slug.split("-")[0];
    await test(`${slug}: ${from} -> pdf`, async () => {
      const page = await newPage();
      try {
        await page.goto(`${BASE}/${slug}`);
        await page.locator("input[type=file]").first().setInputFiles({
          name: `sample.${from}`,
          mimeType: MIME[from],
          buffer: fixtures[from],
        });
        await page.getByRole("button", { name: /Create PDF/i }).click();
        const dl = page.getByRole("button", { name: /Download PDF/i });
        await dl.waitFor({ timeout: 30000 });
        // The finished PDF is drawn on the page before it is downloaded.
        await page.locator('canvas[aria-label="PDF page 1"]').waitFor({ timeout: 20000 });
        await page.evaluate(() => {
          window.__blobs.length = 0;
          HTMLAnchorElement.prototype.click = function () {};
        });
        await dl.click();
        const res = await page.evaluate(() => window.__waitFor("pdf", 8000));
        expect(res.ok, `no real pdf output (saw: ${(res.seen || []).join(", ") || "nothing"})`);
        if (slug === "image-to-pdf") {
          const bytes = await page.evaluate(async () => {
            const b = window.__blobs.find(() => true);
            const buf = new Uint8Array(await b.arrayBuffer());
            let s = "";
            buf.forEach((v) => (s += String.fromCharCode(v)));
            return btoa(s);
          });
          fixtures.pdf = Buffer.from(bytes, "base64");
        }
      } finally {
        await page.context().close();
      }
    });
  }

  if (!fixtures.pdf) {
    console.log("  skip  PDF to image tests (no PDF fixture)");
    return;
  }

  for (const to of ["jpg", "png", "webp"]) {
    await convertTest(`pdf-to-${to}`, "pdf", to, new RegExp(`Convert to ${to}`, "i"));
  }
}

/* ---------- SEO ---------- */

async function runSeo() {
  console.log("\nSEO");

  const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  await test("sitemap lists every page route", async () => {
    const routes = [];
    const walk = (dir, rel = "") => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        const next = path.join(dir, e.name);
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (fs.existsSync(path.join(next, "page.tsx"))) routes.push(r);
        walk(next, r);
      }
    };
    walk(path.join(ROOT, "app"));
    const missing = routes.filter((r) => !urls.some((u) => u.endsWith(`/${r}`)));
    expect(missing.length === 0, `missing from sitemap: ${missing.join(", ")}`);
  });

  await test("robots.txt points to the sitemap", async () => {
    const t = await (await fetch(`${BASE}/robots.txt`)).text();
    expect(/Sitemap:\s*https:\/\/imgcontrol\.com\/sitemap\.xml/i.test(t), "no sitemap line");
  });

  const stripped = (html) =>
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ");

  for (const url of urls) {
    const route = new URL(url).pathname;
    await test(`seo ${route}`, async () => {
      const html = await (await fetch(`${BASE}${route}`)).text();
      const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
      expect(title.length > 0, "no <title>");
      const plainTitle = title.replace(/&amp;/g, "&");
      expect(!/\| ImgControl \| ImgControl/.test(plainTitle), `brand repeated in title: ${plainTitle}`);
      expect(!/ImgControl.*\| ImgControl$/.test(plainTitle), `brand already in the page name, drop the suffix: ${plainTitle}`);
      expect(title.length <= 75, `title too long (${title.length}): ${title}`);
      expect((html.match(/<link rel="canonical"/g) || []).length === 1, "need exactly one canonical");
      expect(!/noindex/i.test(html), "page is noindex");
      expect(/<meta name="description"/.test(html), "no meta description");
      expect((html.match(/<h1[ >]/g) || []).length === 1, "need exactly one <h1>");
      if (route !== "/" && !/^\/(privacy|terms|contact|tools)$/.test(route)) {
        expect(html.includes("application/ld+json"), "no structured data");
        const words = stripped(html).split(/\s+/).filter(Boolean).length;
        expect(words >= 350, `only ${words} words of text`);
      }
    });
  }

  await test("tool pages do not share the same body text", async () => {
    const tools = urls.filter((u) => /\/(jpg|png|webp|avif|heic)-to-(jpg|png|webp|avif)$/.test(u));
    const seen = new Map();
    for (const u of tools) {
      const html = await (await fetch(u.replace("https://imgcontrol.com", BASE))).text();
      const intro = (html.match(/<h2>[^<]*Converter<\/h2><p>([^<]{80})/) || [])[1];
      expect(intro, `no intro found on ${u}`);
      expect(!seen.has(intro), `${u} repeats the intro of ${seen.get(intro)}`);
      seen.set(intro, u);
    }
  });
}

/* ---------- cropper, batches, size limit, RAW ---------- */

// Reads the percentage shown on the "Converting NN%" button while a conversion runs.
function sampleProgress(page, maxMs) {
  return page.evaluate(async (maxMs) => {
    const seen = [];
    const end = Date.now() + maxMs;
    while (Date.now() < end) {
      const button = [...document.querySelectorAll("button")].find((b) => /Converting\s*\d+%/.test(b.textContent));
      if (button) seen.push(Number(button.textContent.match(/(\d+)%/)[1]));
      else if (seen.length) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    return seen;
  }, maxMs);
}

function checkSteadyProgress(seen, { minSteps, maxJump }) {
  expect(seen.length > 0, "no progress percentage was ever shown");
  for (let i = 1; i < seen.length; i++) {
    expect(seen[i] >= seen[i - 1], `progress went backwards: ${seen[i - 1]}% -> ${seen[i]}%`);
  }
  const distinct = [...new Set(seen)].filter((v) => v > 0 && v < 100);
  expect(distinct.length >= minSteps, `progress only showed ${distinct.length} steps (${[...new Set(seen)].join(", ")}%)`);
  const jumps = [...new Set(seen)].map((v, i, a) => (i ? v - a[i - 1] : v));
  expect(Math.max(...jumps) <= maxJump, `progress jumped by ${Math.max(...jumps)} points (${[...new Set(seen)].join(", ")}%)`);
}

async function noisyJpeg(page, w, h) {
  const b64 = await page.evaluate(async ([w, h]) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    const img = x.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = Math.random() * 255;
      img.data[i + 1] = Math.random() * 255;
      img.data[i + 2] = Math.random() * 255;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.95));
    const u = new Uint8Array(await blob.arrayBuffer());
    let s = "";
    u.forEach((v) => (s += String.fromCharCode(v)));
    return btoa(s);
  }, [w, h]);
  return Buffer.from(b64, "base64");
}

async function runExtras() {
  console.log("\nCropper, batches, size limit, RAW");

  await test("image-cropper: crop and export gives the chosen size", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/image-cropper`);
      await page.locator("input[type=file]").first().setInputFiles({ name: "a.png", mimeType: "image/png", buffer: fixtures.png });
      await page.locator("#crop-width").waitFor({ timeout: 10000 });
      await page.locator("#crop-x").fill("10");
      await page.locator("#crop-y").fill("10");
      await page.locator("#crop-width").fill("120");
      await page.locator("#crop-height").fill("80");
      await page.getByRole("button", { name: /Crop & Export/i }).click();
      const res = await page.evaluate(() => window.__waitFor("png", 15000));
      expect(res.ok, `no cropped png (saw: ${(res.seen || []).join(", ") || "nothing"})`);
      const dims = await page.evaluate(async () => {
        for (const b of window.__blobs) {
          if ((await window.__sig(b)) === "png") {
            const bmp = await createImageBitmap(b);
            if (bmp.width === 120 && bmp.height === 80) return [bmp.width, bmp.height];
          }
        }
        return null;
      });
      expect(dims, "no exported image with the 120x80 crop size");
    } finally {
      await page.context().close();
    }
  });

  await test("jpg-to-png: three files at once and a ZIP with all of them", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/jpg-to-png`);
      await page.locator("input[type=file]").first().setInputFiles(
        [1, 2, 3].map((n) => ({ name: `photo${n}.jpg`, mimeType: "image/jpeg", buffer: fixtures.jpg })),
      );
      await page.waitForTimeout(600);
      await page.getByRole("button", { name: /Convert to PNG/i }).click();
      await page.getByRole("button", { name: /Download All ZIP/i }).waitFor({ timeout: 30000 });
      expect((await page.getByRole("button", { name: /^Download$/ }).count()) === 3, "expected three results");
      await page.evaluate(() => {
        window.__blobs.length = 0;
        HTMLAnchorElement.prototype.click = function () {};
      });
      await page.getByRole("button", { name: /Download All ZIP/i }).click();
      const res = await page.evaluate(() => window.__waitFor("zip", 15000));
      expect(res.ok, "no ZIP produced");
      const entries = await page.evaluate(async () => {
        const b = window.__blobs.find((x) => x.size > 0);
        for (const blob of window.__blobs) {
          if ((await window.__sig(blob)) === "zip") {
            const u = new Uint8Array(await blob.arrayBuffer());
            let n = 0;
            for (let i = 0; i < u.length - 3; i++) if (u[i] === 0x50 && u[i + 1] === 0x4b && u[i + 2] === 3 && u[i + 3] === 4) n++;
            return n;
          }
        }
        return b ? -1 : 0;
      });
      expect(entries === 3, `ZIP has ${entries} files, expected 3`);
    } finally {
      await page.context().close();
    }
  });

  await test("jpg-to-webp: maximum output size is respected", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/jpg-to-webp`);
      const noisy = await noisyJpeg(page, 900, 700);
      await page.locator("input[type=file]").first().setInputFiles({ name: "noise.jpg", mimeType: "image/jpeg", buffer: noisy });
      await page.waitForTimeout(600);
      await page.getByText("Set maximum output size").click();
      await page.locator("input[type=number]").first().fill("40");
      await page.getByRole("button", { name: /Convert to WebP/i }).click();
      const res = await page.evaluate(() => window.__waitFor("webp", 30000));
      expect(res.ok, "no webp output");
      expect(noisy.length > 150000, "test image is too small to need shrinking");
      expect(res.size <= 40 * 1024 * 1.1, `output is ${Math.round(res.size / 1024)} KB, the limit was 40 KB`);
    } finally {
      await page.context().close();
    }
  });

  await test("heic-to-jpg: the progress bar moves steadily instead of jumping to 100%", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/heic-to-jpg`);
      await page.locator("input[type=file]").first().setInputFiles({ name: "big.heic", mimeType: "image/heic", buffer: fixtures.heicBig });
      await page.waitForTimeout(600);
      const sampling = sampleProgress(page, 90000);
      await page.getByRole("button", { name: /Convert to JPG/i }).click();
      checkSteadyProgress(await sampling, { minSteps: 4, maxJump: 40 });
      const res = await page.evaluate(() => window.__waitFor("jpg", 30000));
      expect(res.ok, "no jpg output");
    } finally {
      await page.context().close();
    }
  });

  await test("raw-to-jpg: page loads and accepts RAW formats", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/raw-to-jpg`);
      const accept = await page.locator("input[type=file]").first().getAttribute("accept");
      expect(/\.dng/.test(accept) && /\.cr2/.test(accept) && /\.nef/.test(accept), `unexpected accept list: ${accept}`);
      await page.getByRole("button", { name: /Convert RAW to JPG/i }).waitFor({ timeout: 5000 });
    } finally {
      await page.context().close();
    }
  });

  if (process.env.RAW_SAMPLE && fs.existsSync(process.env.RAW_SAMPLE)) {
    await test(`raw-to-jpg: real conversion of ${path.basename(process.env.RAW_SAMPLE)}`, async () => {
      const page = await newPage();
      try {
        await page.goto(`${BASE}/raw-to-jpg`);
        await page.locator("input[type=file]").first().setInputFiles(process.env.RAW_SAMPLE);
        await page.waitForTimeout(600);
        await page.getByRole("button", { name: /Convert RAW to JPG/i }).click();
        const res = await page.evaluate(() => window.__waitFor("jpg", 120000));
        expect(res.ok, `no jpg output (saw: ${(res.seen || []).join(", ") || "nothing"})`);
        // The finished JPG is shown in the result row before it is downloaded.
        await page.waitForFunction(() => {
          const el = document.querySelector("img.resultThumb");
          return el && el.complete && el.naturalWidth > 100;
        }, null, { timeout: 120000 });
      } finally {
        await page.context().close();
      }
    });

    await test("raw-to-jpg: the progress bar moves steadily instead of sitting at 0%", async () => {
      const page = await newPage();
      try {
        await page.goto(`${BASE}/raw-to-jpg`);
        await page.locator("input[type=file]").first().setInputFiles(process.env.RAW_SAMPLE);
        await page.waitForTimeout(600);
        const sampling = sampleProgress(page, 150000);
        await page.getByRole("button", { name: /Convert RAW to JPG/i }).click();
        checkSteadyProgress(await sampling, { minSteps: 8, maxJump: 35 });
      } finally {
        await page.context().close();
      }
    });

    await test("raw-to-jpg: low memory falls back to half size instead of failing", async () => {
      const page = await newPage();
      try {
        // Pretend the browser cannot allocate a full-size image, like a machine that is short on memory.
        await page.addInitScript(() => {
          const original = CanvasRenderingContext2D.prototype.createImageData;
          CanvasRenderingContext2D.prototype.createImageData = function (w, h) {
            if (typeof w === "number" && w * h > 20_000_000) throw new RangeError("Array buffer allocation failed");
            return original.apply(this, arguments);
          };
        });
        await page.goto(`${BASE}/raw-to-jpg`);
        await page.locator("input[type=file]").first().setInputFiles(process.env.RAW_SAMPLE);
        await page.waitForTimeout(600);
        await page.getByRole("button", { name: /Convert RAW to JPG/i }).click();
        const res = await page.evaluate(() => window.__waitFor("jpg", 120000));
        expect(res.ok, `no jpg output (saw: ${(res.seen || []).join(", ") || "nothing"})`);
        await page.getByText(/converted at half resolution/i).waitFor({ timeout: 120000 });
      } finally {
        await page.context().close();
      }
    });
  } else {
    console.log("  skip  raw-to-jpg real conversion (set RAW_SAMPLE=path/to/photo.dng to run it)");
  }
}

/* ---------- preview right after selecting a file ---------- */

async function runSelectionPreviews() {
  console.log("\nPreview right after selecting a file (before converting)");

  async function check(slug, key, ms = 20000) {
    await test(`select ${key} on ${slug}: preview appears`, async () => {
      const page = await newPage();
      try {
        await page.goto(`${BASE}/${slug}`);
        await page.locator("input[type=file]").first().setInputFiles({
          name: `sample.${key}`,
          mimeType: MIME[key],
          buffer: fixtures[key],
        });
        await page.waitForFunction(() => {
          const el = document.querySelector("img.filePreview");
          return el && el.complete && el.naturalWidth > 20;
        }, null, { timeout: ms });
      } finally {
        await page.context().close();
      }
    });
  }

  for (const [from, to] of FIXED) await check(`${from}-to-${to}`, from);

  for (const [slug, key] of [
    ["image-converter", "png"], ["image-converter", "heic"], ["image-compressor", "jpg"], ["image-resizer", "webp"],
    ["image-optimizer", "jpg"], ["image-to-pdf", "jpg"], ["image-to-pdf", "heic"],
    ["jpg-to-pdf", "jpg"], ["png-to-pdf", "png"], ["webp-to-pdf", "webp"],
  ]) {
    await check(slug, key);
  }

  if (fixtures.pdf) {
    for (const to of ["jpg", "png", "webp"]) await check(`pdf-to-${to}`, "pdf");
  }

  await test("select heic on image-cropper: the photo appears", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/image-cropper`);
      await page.locator("input[type=file]").first().setInputFiles({ name: "photo.heic", mimeType: "image/heic", buffer: fixtures.heic });
      await page.waitForFunction(
        () => [...document.images].some((i) => i.src.startsWith("blob:") && i.complete && i.naturalWidth > 100),
        null,
        { timeout: 20000 },
      );
    } finally {
      await page.context().close();
    }
  });

  if (process.env.RAW_SAMPLE && fs.existsSync(process.env.RAW_SAMPLE)) {
    await test("select a RAW file on raw-to-jpg: preview appears", async () => {
      const page = await newPage();
      try {
        await page.goto(`${BASE}/raw-to-jpg`);
        await page.locator("input[type=file]").first().setInputFiles(process.env.RAW_SAMPLE);
        await page.waitForFunction(() => {
          const el = document.querySelector("img.rawFileThumb");
          return el && el.complete && el.naturalWidth > 20;
        }, null, { timeout: 120000 });
      } finally {
        await page.context().close();
      }
    });
  }
}

/* ---------- console errors and phone layout on every page ---------- */

async function runPageHealth() {
  console.log("\nPage health");
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

  for (const route of routes) {
    await test(`health ${route} (no errors, fits a phone screen)`, async () => {
      const context = await browser.newContext({ viewport: { width: 400, height: 800 }, isMobile: true });
      const page = await context.newPage();
      const problems = [];
      page.on("pageerror", (e) => problems.push(`script error: ${e.message}`));
      page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text().slice(0, 120)}`));
      page.on("response", (r) => {
        if (r.status() >= 400 && r.url().startsWith(BASE)) problems.push(`${r.status()} ${r.url().replace(BASE, "")}`);
      });
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 1) problems.push(`page is ${overflow}px wider than a 400px screen`);
        expect(problems.length === 0, problems.join("; "));
      } finally {
        await context.close();
      }
    });
  }
}

/* ---------- phone menu and footer ---------- */

async function runPhoneChrome() {
  console.log("\nPhone menu and footer");

  async function phone(width, fn) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await fn(page);
    } finally {
      await context.close();
    }
  }

  const openMenu = async (page) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    await page.locator("#mobile-menu").waitFor({ timeout: 5000 });
  };

  await test("phone menu: has no extra disclosure triangle", async () => {
    await phone(390, async (page) => {
      expect((await page.locator("header details, header summary").count()) === 0, "the old <details> menu is still there");
    });
  });

  await test("phone menu: closes after choosing a link", async () => {
    await phone(390, async (page) => {
      await openMenu(page);
      await page.locator("#mobile-menu").getByRole("link", { name: "About" }).tap();
      await page.waitForURL(/\/about$/, { timeout: 10000 });
      await page.waitForFunction(() => !document.querySelector("#mobile-menu"), null, { timeout: 5000 });
    });
  });

  await test("phone menu: closes when tapping outside it", async () => {
    await phone(390, async (page) => {
      await openMenu(page);
      await page.touchscreen.tap(60, 700);
      await page.waitForFunction(() => !document.querySelector("#mobile-menu"), null, { timeout: 5000 });
    });
  });

  await test("phone menu: closes with Escape and with the same button", async () => {
    await phone(390, async (page) => {
      await openMenu(page);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("#mobile-menu"), null, { timeout: 5000 });
      await openMenu(page);
      await page.getByRole("button", { name: "Close menu" }).tap();
      await page.waitForFunction(() => !document.querySelector("#mobile-menu"), null, { timeout: 5000 });
    });
  });

  await test("phone menu: the theme switch does not cover the open menu", async () => {
    await phone(390, async (page) => {
      await openMenu(page);
      const opacity = await page.evaluate(() => getComputedStyle(document.querySelector(".themeToggle")).opacity);
      expect(Number(opacity) === 0, `theme switch is still visible over the menu (opacity ${opacity})`);
    });
  });

  for (const width of [320, 360, 390]) {
    await test(`phone footer at ${width}px: Tools, Conversions and Company sit side by side`, async () => {
      await phone(width, async (page) => {
        const boxes = await page.evaluate(() =>
          [...document.querySelectorAll("footer h4")].map((h) => {
            const r = h.getBoundingClientRect();
            return { text: h.textContent, x: Math.round(r.left), y: Math.round(r.top + window.scrollY) };
          }),
        );
        expect(boxes.length === 3, `expected 3 footer headings, found ${boxes.length}`);
        expect(new Set(boxes.map((b) => b.y)).size === 1, `headings are not on one row: ${JSON.stringify(boxes)}`);
        expect(new Set(boxes.map((b) => b.x)).size === 3, `headings overlap: ${JSON.stringify(boxes)}`);

        const clipped = await page.evaluate(() =>
          [...document.querySelectorAll("footer a")]
            .filter((a) => a.scrollWidth > a.clientWidth + 1)
            .map((a) => a.textContent.trim()),
        );
        expect(clipped.length === 0, `footer links cut off: ${clipped.join(", ")}`);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow <= 1, `page is ${overflow}px wider than the screen`);
      });
    });
  }

  for (const width of [360, 390]) {
    await test(`phone home at ${width}px: the three trust points share one row`, async () => {
      await phone(width, async (page) => {
        const tops = await page.evaluate(() =>
          [...document.querySelectorAll(".homeHeroTrust span")].map((s) => Math.round(s.getBoundingClientRect().top)),
        );
        expect(tops.length === 3, `expected 3 trust points, found ${tops.length}`);
        expect(new Set(tops).size === 1, `trust points wrap onto several rows: ${tops.join(", ")}`);
      });
    });
  }
}

/* ---------- new tools: Compress to KB, Merge / Split / Rotate / Compress / Delete PDF, PDF to Text ---------- */

// Test PDFs are built here with pdf-lib so every page has a known size and text.
async function makePdf({ pages, width, height, heightStep = 0, label, image }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const picture = image ? await doc.embedJpg(image) : null;

  for (let i = 1; i <= pages; i++) {
    const h = height + heightStep * i;
    const page = doc.addPage([width, h]);
    if (picture) page.drawImage(picture, { x: 0, y: 0, width, height: h });
    else page.drawText(`${label} page ${i}`, { x: 40, y: h - 80, size: 22, font, color: rgb(0, 0, 0) });
  }

  return Buffer.from(await doc.save());
}

async function pdfPages(bytes) {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((p) => ({ w: Math.round(p.getWidth()), h: Math.round(p.getHeight()), rot: p.getRotation().angle }));
}

async function openTool(slug) {
  const page = await newPage();
  await page.goto(`${BASE}/${slug}`);
  return page;
}

async function addPdfs(page, files) {
  await page.locator("input[type=file]").first().setInputFiles(
    files.map((f) => ({ name: f.name, mimeType: "application/pdf", buffer: f.buffer })),
  );
}

// Clicks a download button and returns the bytes and the file name the page asked for.
async function downloadResult(page, buttonName) {
  await page.evaluate(() => {
    window.__blobs.length = 0;
    HTMLAnchorElement.prototype.click = function () {
      window.__lastName = this.download;
    };
  });
  await page.getByRole("button", { name: buttonName }).click();
  const b64 = await page.evaluate(async () => {
    const blob = window.__blobs[window.__blobs.length - 1];
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let s = "";
    bytes.forEach((v) => (s += String.fromCharCode(v)));
    return btoa(s);
  });
  return { bytes: Buffer.from(b64, "base64"), name: await page.evaluate(() => window.__lastName) };
}

async function runNewTools() {
  console.log("\nNew tools");

  const pdfA = await makePdf({ pages: 3, width: 300, height: 400, heightStep: 10, label: "Alpha" });
  const pdfB = await makePdf({ pages: 2, width: 500, height: 300, label: "Beta" });

  const helper = await newPage();
  await helper.goto(`${BASE}/about`);
  const scanImage = await noisyJpeg(helper, 1400, 1000);
  await helper.context().close();
  const scanPdf = await makePdf({ pages: 2, width: 600, height: 800, image: scanImage });

  /* Compress to a given size */
  for (const kb of [20, 50, 100, 200]) {
    await test(`compress-image-to-${kb}kb: a large photo ends up at ${kb} KB or less`, async () => {
      const page = await openTool(`compress-image-to-${kb}kb`);
      try {
        const noisy = await noisyJpeg(page, 900, 700);
        expect(noisy.length > kb * 1024 * 3, "test photo is too small to need shrinking");
        await page.locator("input[type=file]").first().setInputFiles({ name: "photo.jpg", mimeType: "image/jpeg", buffer: noisy });
        await page.waitForTimeout(500);
        expect((await page.locator("#target").inputValue()) === String(kb), `the size box does not show ${kb}`);
        await page.getByRole("button", { name: /Process Images/i }).click();
        await page.getByRole("button", { name: /^Download$/ }).first().waitFor({ timeout: 60000 });
        await page.evaluate(() => {
          window.__blobs.length = 0;
          HTMLAnchorElement.prototype.click = function () {};
        });
        await page.getByRole("button", { name: /^Download$/ }).first().click();
        const res = await page.evaluate(() => window.__waitFor("jpg", 8000));
        expect(res.ok, "no jpg output");
        expect(res.size <= kb * 1024, `result is ${(res.size / 1024).toFixed(1)} KB, the limit is ${kb} KB`);
      } finally {
        await page.context().close();
      }
    });
  }

  /* Merge */
  await test("merge-pdf: two files become one PDF, in the order chosen", async () => {
    const page = await openTool("merge-pdf");
    try {
      await addPdfs(page, [{ name: "a.pdf", buffer: pdfA }, { name: "b.pdf", buffer: pdfB }]);
      await page.getByRole("button", { name: /Move b\.pdf up/ }).click();
      await page.getByRole("button", { name: "Merge PDF" }).click();
      await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
      await page.locator('canvas[aria-label="PDF page 1"]').waitFor({ timeout: 20000 });
      const { bytes, name } = await downloadResult(page, /Download PDF/);
      expect(name === "merged.pdf", `file is called ${name}`);
      const pages = await pdfPages(bytes);
      expect(pages.length === 5, `expected 5 pages, got ${pages.length}`);
      expect(pages[0].w === 500 && pages[2].w === 300, "the files are not in the order that was chosen");
    } finally {
      await page.context().close();
    }
  });

  await test("merge-pdf: one file is not enough", async () => {
    const page = await openTool("merge-pdf");
    try {
      await addPdfs(page, [{ name: "a.pdf", buffer: pdfA }]);
      await page.getByRole("button", { name: "Merge PDF" }).click();
      await page.getByText(/at least two PDF files/i).waitFor({ timeout: 5000 });
    } finally {
      await page.context().close();
    }
  });

  /* Split */
  await test("split-pdf: extracting pages 3 and 1 gives those pages in that order", async () => {
    const page = await openTool("split-pdf");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.locator("#pdf-ranges").fill("3, 1");
      await page.getByRole("button", { name: "Split PDF" }).click();
      await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
      const { bytes, name } = await downloadResult(page, /Download PDF/);
      expect(name === "doc-pages.pdf", `file is called ${name}`);
      const pages = await pdfPages(bytes);
      expect(pages.length === 2 && pages[0].h === 430 && pages[1].h === 410, `wrong pages: ${JSON.stringify(pages)}`);
    } finally {
      await page.context().close();
    }
  });

  await test("split-pdf: every page as its own file gives a ZIP of three PDFs", async () => {
    const page = await openTool("split-pdf");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.locator("#pdf-split-mode").selectOption("every");
      await page.getByRole("button", { name: "Split PDF" }).click();
      await page.getByText("3 separate PDFs are ready").waitFor({ timeout: 30000 });
      const { bytes, name } = await downloadResult(page, /Download ZIP/);
      expect(name === "doc-pages.zip", `file is called ${name}`);
      let entries = 0;
      for (let i = 0; i < bytes.length - 3; i++) if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 3 && bytes[i + 3] === 4) entries++;
      expect(entries === 3, `ZIP has ${entries} files, expected 3`);
    } finally {
      await page.context().close();
    }
  });

  await test("split-pdf: a page that does not exist is explained", async () => {
    const page = await openTool("split-pdf");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.locator("#pdf-ranges").fill("9");
      await page.getByRole("button", { name: "Split PDF" }).click();
      await page.getByText(/Page 9 does not exist/).waitFor({ timeout: 5000 });
    } finally {
      await page.context().close();
    }
  });

  /* Rotate */
  await test("rotate-pdf: every page turns 90 degrees", async () => {
    const page = await openTool("rotate-pdf");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.getByRole("button", { name: "Rotate PDF" }).click();
      await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
      const { bytes } = await downloadResult(page, /Download PDF/);
      const pages = await pdfPages(bytes);
      expect(pages.length === 3 && pages.every((p) => p.rot === 90), `rotations: ${pages.map((p) => p.rot).join(", ")}`);
    } finally {
      await page.context().close();
    }
  });

  await test("rotate-pdf: only page 2 turns, 90 degrees to the left", async () => {
    const page = await openTool("rotate-pdf");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.locator("#pdf-angle").selectOption("270");
      await page.locator("#pdf-ranges").fill("2");
      await page.getByRole("button", { name: "Rotate PDF" }).click();
      await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
      const { bytes } = await downloadResult(page, /Download PDF/);
      const pages = await pdfPages(bytes);
      expect(pages.map((p) => p.rot).join(",") === "0,270,0", `rotations: ${pages.map((p) => p.rot).join(", ")}`);
    } finally {
      await page.context().close();
    }
  });

  /* Delete pages */
  await test("delete-pdf-pages: removing pages 1 and 3 leaves page 2", async () => {
    const page = await openTool("delete-pdf-pages");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.locator("#pdf-ranges").fill("1, 3");
      await page.getByRole("button", { name: "Delete pages" }).click();
      await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
      const { bytes } = await downloadResult(page, /Download PDF/);
      const pages = await pdfPages(bytes);
      expect(pages.length === 1 && pages[0].h === 420, `wrong result: ${JSON.stringify(pages)}`);
    } finally {
      await page.context().close();
    }
  });

  await test("delete-pdf-pages: deleting every page is refused", async () => {
    const page = await openTool("delete-pdf-pages");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.locator("#pdf-ranges").fill("1-3");
      await page.getByRole("button", { name: "Delete pages" }).click();
      await page.getByText(/every page/i).first().waitFor({ timeout: 5000 });
    } finally {
      await page.context().close();
    }
  });

  /* Compress */
  await test("compress-pdf: a scanned PDF gets smaller and keeps its page size", async () => {
    const page = await openTool("compress-pdf");
    try {
      await addPdfs(page, [{ name: "scan.pdf", buffer: scanPdf }]);
      await page.locator("#pdf-level").selectOption("strong");
      await page.getByRole("button", { name: "Compress PDF" }).click();
      await page.getByText("Your PDF is ready").waitFor({ timeout: 90000 });
      await page.locator('canvas[aria-label="PDF page 1"]').waitFor({ timeout: 20000 });
      const { bytes, name } = await downloadResult(page, /Download PDF/);
      expect(name === "scan-compressed.pdf", `file is called ${name}`);
      expect(bytes.length < scanPdf.length, `${bytes.length} bytes is not smaller than ${scanPdf.length}`);
      const pages = await pdfPages(bytes);
      expect(pages.length === 2 && pages[0].w === 600 && pages[0].h === 800, `wrong pages: ${JSON.stringify(pages)}`);
    } finally {
      await page.context().close();
    }
  });

  await test("compress-pdf: a text-only PDF is left alone and the page says why", async () => {
    const page = await openTool("compress-pdf");
    try {
      await addPdfs(page, [{ name: "text.pdf", buffer: pdfA }]);
      await page.getByRole("button", { name: "Compress PDF" }).click();
      await page.getByText(/not smaller than your original/i).waitFor({ timeout: 60000 });
    } finally {
      await page.context().close();
    }
  });

  /* PDF to text */
  await test("pdf-to-text: the words of the PDF come out", async () => {
    const page = await openTool("pdf-to-text");
    try {
      await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
      await page.getByRole("button", { name: "Extract text" }).click();
      await page.getByLabel("Extracted text").waitFor({ timeout: 30000 });
      const text = await page.getByLabel("Extracted text").inputValue();
      expect(/Alpha page 1/.test(text) && /Alpha page 3/.test(text), `text was: ${text.slice(0, 80)}`);
      const { bytes, name } = await downloadResult(page, /Download \.txt/);
      expect(name === "doc.txt" && /Alpha page 2/.test(bytes.toString("utf8")), "the downloaded .txt is wrong");
    } finally {
      await page.context().close();
    }
  });

  await test("pdf-to-text: a scan with no text says so", async () => {
    const page = await openTool("pdf-to-text");
    try {
      await addPdfs(page, [{ name: "scan.pdf", buffer: scanPdf }]);
      await page.getByRole("button", { name: "Extract text" }).click();
      await page.getByText("No text found").waitFor({ timeout: 30000 });
    } finally {
      await page.context().close();
    }
  });

  /* A preview appears as soon as a file is chosen */
  for (const slug of ["merge-pdf", "split-pdf", "rotate-pdf", "compress-pdf", "delete-pdf-pages", "pdf-to-text"]) {
    await test(`select a PDF on ${slug}: first-page preview appears`, async () => {
      const page = await openTool(slug);
      try {
        await addPdfs(page, [{ name: "doc.pdf", buffer: pdfA }]);
        await page.waitForFunction(() => {
          const el = document.querySelector("img.filePreview");
          return el && el.complete && el.naturalWidth > 20;
        }, null, { timeout: 20000 });
      } finally {
        await page.context().close();
      }
    });
  }

  for (const kb of [20, 50, 100, 200]) {
    await test(`select a photo on compress-image-to-${kb}kb: preview appears`, async () => {
      const page = await openTool(`compress-image-to-${kb}kb`);
      try {
        await page.locator("input[type=file]").first().setInputFiles({ name: "photo.jpg", mimeType: "image/jpeg", buffer: fixtures.jpg });
        await page.waitForFunction(() => {
          const el = document.querySelector("img.filePreview");
          return el && el.complete && el.naturalWidth > 20;
        }, null, { timeout: 20000 });
      } finally {
        await page.context().close();
      }
    });
  }
}

/* ---------- retired pages and the sitemap ---------- */

async function runRedirects() {
  console.log("\nRetired pages");

  const moved = [
    ["pdf-to-eps", "pdf-to-png"],
    ["pdf-to-svg", "pdf-to-png"],
    ["pdf-to-bmp", "pdf-to-png"],
    ["pdf-to-gif", "pdf-to-png"],
    ["pdf-to-heic", "pdf-to-jpg"],
    ["pdf-to-avif", "pdf-to-webp"],
    ["jpg-to-avif", "image-converter"],
    ["png-to-avif", "image-converter"],
    ["webp-to-avif", "image-converter"],
    ["avif-to-webp", "image-converter"],
  ];

  for (const [from, to] of moved) {
    await test(`/${from} moves permanently to /${to}`, async () => {
      const res = await fetch(`${BASE}/${from}`, { redirect: "manual" });
      expect(res.status === 301 || res.status === 308, `status is ${res.status}`);
      const target = new URL(res.headers.get("location"), BASE).pathname;
      expect(target === `/${to}`, `goes to ${target}`);
      expect((await fetch(`${BASE}${target}`)).status === 200, "the target page does not open");
    });
  }

  await test("every URL in the sitemap opens directly (no redirects, no errors)", async () => {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    const bad = [];
    for (const p of paths) {
      const res = await fetch(`${BASE}${p}`, { redirect: "manual" });
      if (res.status !== 200) bad.push(`${p} (${res.status})`);
    }
    expect(bad.length === 0, `not a plain 200: ${bad.join(", ")}`);
  });
}

/* ---------- main ---------- */

async function main() {
  try {
    await fetch(BASE);
  } catch {
    console.error(`Server is not reachable at ${BASE}. Run: npm run build && npx next start -p 3100`);
    process.exit(2);
  }

  browser = await chromium.launch({ executablePath, headless: true });
  await buildFixtures();
  console.log(`Fixtures: ${Object.entries(fixtures).map(([k, v]) => `${k} ${v.length}B`).join(", ")}`);

  await runConverters();
  await runPdf();
  await runExtras();
  await runNewTools();
  await runRedirects();
  await runSelectionPreviews();
  await runSeo();
  await runPageHealth();
  await runPhoneChrome();
  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(` - ${f.name}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
