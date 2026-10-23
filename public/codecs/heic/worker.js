/*
 * HEIC encoder worker.
 *
 * This is deliberately a plain, unbundled module: the encoder starts its own
 * pthread workers from heic-enc.js, which only works when that file is served
 * as-is (a bundler rewrites the URL and the threads never start).
 * Files in ./lib and ./dist are copied unchanged from the icodec package.
 */
import * as heic from "./lib/heic.js";

globalThis._icodec_ImageData = (data, width, height, depth) => ({
  data,
  width,
  height,
  depth,
  colorSpace: "srgb",
});

let ready = null;

self.onmessage = async (event) => {
  const { id, buffer, width, height, quality, preset } = event.data;

  try {
    ready ??= heic.loadEncoder(new URL("./dist/heic-enc.wasm", import.meta.url).href);
    await ready;

    const image = new ImageData(new Uint8ClampedArray(buffer), width, height);
    const out = heic.encode(image, { quality, preset });
    const copy = out.slice().buffer;

    self.postMessage({ id, ok: true, buffer: copy }, [copy]);
  } catch (error) {
    self.postMessage({ id, ok: false, error: String((error && error.message) || error) });
  }
};
