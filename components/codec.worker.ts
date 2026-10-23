import { avif, heic } from "icodec";

type Fmt = "avif" | "heic";

type Req =
  | { id: number; op: "encode"; fmt: Fmt; buffer: ArrayBuffer; width: number; height: number; quality: number }
  | { id: number; op: "decode"; fmt: Fmt; buffer: ArrayBuffer };

const WASM: Record<string, string> = {
  "avif-enc": "/codecs/avif-enc.wasm",
  "avif-dec": "/codecs/avif-dec.wasm",
  "heic-enc": "/codecs/heic-enc.wasm",
  "heic-dec": "/codecs/heic-dec.wasm",
};

function origin() {
  return self.location.origin;
}

self.onmessage = async (event: MessageEvent<Req>) => {
  const msg = event.data;

  try {
    const codec = msg.fmt === "avif" ? avif : heic;

    if (msg.op === "encode") {
      await codec.loadEncoder(origin() + WASM[`${msg.fmt}-enc`]);
      const rgba = new Uint8ClampedArray(msg.buffer);
      const image = new ImageData(rgba, msg.width, msg.height);
      const out = codec.encode(image as never, { quality: msg.quality } as never);
      const copy = out.slice().buffer;

      (self as unknown as Worker).postMessage({ id: msg.id, ok: true, buffer: copy }, [copy]);
      return;
    }

    await codec.loadDecoder(origin() + WASM[`${msg.fmt}-dec`]);
    const decoded = codec.decode(new Uint8Array(msg.buffer)) as {
      data: Uint8ClampedArray | Uint16Array;
      width: number;
      height: number;
      depth?: number;
    };

    let rgba: Uint8ClampedArray;

    if (decoded.depth && decoded.depth !== 8) {
      const src = new Uint16Array(decoded.data.buffer, decoded.data.byteOffset, decoded.width * decoded.height * 4);
      const max = (1 << decoded.depth) - 1;
      rgba = new Uint8ClampedArray(src.length);
      for (let i = 0; i < src.length; i += 1) rgba[i] = (src[i] / max) * 255 + 0.5;
    } else {
      rgba = new Uint8ClampedArray(decoded.data as Uint8ClampedArray);
    }

    (self as unknown as Worker).postMessage(
      { id: msg.id, ok: true, buffer: rgba.buffer, width: decoded.width, height: decoded.height },
      [rgba.buffer],
    );
  } catch (error) {
    (self as unknown as Worker).postMessage({
      id: msg.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
