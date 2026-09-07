import { heic } from "icodec";

type RequestMessage = {
  buffer: ArrayBuffer;
  width: number;
  height: number;
};

self.onmessage = async (event: MessageEvent<RequestMessage>) => {
  try {
    const { buffer, width, height } = event.data;
    const rgba = new Uint8ClampedArray(buffer);
    const image = new ImageData(rgba, width, height);

    await heic.loadEncoder();
const encoded = heic.encode(image as any, { width, height } as any);

    const output = encoded.slice().buffer;

(self as any).postMessage(
      { ok: true, buffer: output },
      [output]
    );
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : "HEIC encoding failed.",
    });
  }
};
