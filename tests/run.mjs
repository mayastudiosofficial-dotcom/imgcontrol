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
      const keep = to === "avif" && from === "jpg" ? "avif" : to === "heic" && from === "pdf" ? "heic2" : null;
      if (keep) {
        // later tests use this real file (made by the site itself) as their input
        const b64 = await page.evaluate(async (kind) => {
          for (const b of window.__blobs) {
            if ((await window.__sig(b)) === kind) {
              const u = new Uint8Array(await b.arrayBuffer());
              let s = "";
              u.forEach((v) => (s += String.fromCharCode(v)));
              return btoa(s);
            }
          }
          return "";
        }, to === "avif" ? "avif" : "heic");
        fixtures[keep] = Buffer.from(b64, "base64");
      }
    } finally {
      await page.context().close();
    }
  });
}

const FIXED = [
  ["jpg", "png"], ["jpg", "webp"], ["jpg", "avif"],
  ["png", "jpg"], ["png", "webp"], ["png", "avif"],
  ["webp", "jpg"], ["webp", "png"], ["webp", "avif"],
  ["avif", "jpg"], ["avif", "png"], ["avif", "webp"],
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

  for (const to of ["jpg", "png", "webp", "avif", "heic", "gif", "bmp", "svg", "eps"]) {
    await convertTest(`pdf-to-${to}`, "pdf", to, new RegExp(`Convert to ${to}`, "i"));
  }

  await test("pdf-to-heic keeps the page responsive while encoding", async () => {
    const page = await newPage();
    try {
      await page.goto(`${BASE}/pdf-to-heic`);
      await page.evaluate(() => {
        window.__maxGap = 0;
        let last = performance.now();
        setInterval(() => {
          const now = performance.now();
          window.__maxGap = Math.max(window.__maxGap, now - last);
          last = now;
        }, 50);
      });
      await uploadAndConvert(page, "pdf", /Convert to heic/i);
      const res = await page.evaluate(() => window.__waitFor("heic", 60000));
      expect(res.ok, "no real heic output");
      const gap = await page.evaluate(() => window.__maxGap);
      expect(gap < 1500, `page was blocked for ${Math.round(gap)} ms while encoding`);
    } finally {
      await page.context().close();
    }
  });

  // The HEIC made by pdf-to-heic must be a valid HEIC that the site can read back.
  if (fixtures.heic2) {
    await convertTest("heic-to-png", "heic2", "png", /Convert to PNG/i);
  } else {
    results.push({ name: "pdf-to-heic round trip", ok: false, error: "no HEIC was produced" });
    console.log("  FAIL  pdf-to-heic round trip\n        no HEIC was produced");
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
  await runSeo();
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
