/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";

type ToolMode = "compress" | "convert" | "resize" | "optimize";

type Output = {
  name: string;
  blob: Blob;
  original: number;
  width: number;
  height: number;
};

type Props = {
  mode?: ToolMode;
};

const INPUT_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
];

const OUTPUT_FORMATS = [
  ["image/jpeg", "JPG", "Universal photos"],
  ["image/png", "PNG", "Lossless + alpha"],
  ["image/webp", "WebP", "Small for web"],
  ["image/avif", "AVIF", "Modern + compact"],
] as const;

function fmt(bytes: number): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    3,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );

  return `${(bytes / 1024 ** index).toFixed(
    index ? 2 : 0,
  )} ${units[index]}`;
}

function ext(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/avif") return "avif";

  return "webp";
}

function stripExt(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          `"${file.name}" could not be decoded by this browser.`,
        ),
      );
    };

    image.src = url;
  });
}

async function encodeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  mime: string,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error(
              `This browser cannot encode ${mime}. Try JPG, PNG or WebP.`,
            ),
          );
        }
      },
      mime,
      quality,
    );
  });
}

async function createTargetSizeBlob(
  image: HTMLImageElement,
  width: number,
  height: number,
  mime: string,
  targetBytes: number,
  startingQuality: number,
): Promise<Blob> {
  let quality = Math.min(
    1,
    Math.max(0.08, startingQuality),
  );

  let blob = await encodeImage(
    image,
    width,
    height,
    mime,
    quality,
  );

  /*
   * Try to get the output under the requested
   * maximum target size by gradually reducing quality.
   */
  for (
    let attempt = 0;
    attempt < 12 && blob.size > targetBytes;
    attempt += 1
  ) {
    quality = Math.max(0.08, quality - 0.08);

    blob = await encodeImage(
      image,
      width,
      height,
      mime,
      quality,
    );
  }

  return blob;
}

async function createResizeTargetBlob(
  image: HTMLImageElement,
  startingWidth: number,
  startingHeight: number,
  mime: string,
  targetBytes: number,
  startingQuality: number,
  keepAspect: boolean,
): Promise<{ blob: Blob; width: number; height: number }> {
  let outputWidth = Math.max(1, Math.round(startingWidth));
  let outputHeight = Math.max(1, Math.round(startingHeight));
  let quality = Math.min(1, Math.max(0.08, startingQuality));

  let blob = await encodeImage(
    image,
    outputWidth,
    outputHeight,
    mime,
    quality,
  );

  for (let attempt = 0; attempt < 16 && blob.size > targetBytes; attempt += 1) {
    if (mime === "image/jpeg" || mime === "image/webp" || mime === "image/avif") {
      quality = Math.max(0.08, quality - 0.07);
      blob = await encodeImage(
        image,
        outputWidth,
        outputHeight,
        mime,
        quality,
      );

      if (blob.size <= targetBytes) break;
    }

    const ratio = Math.sqrt(targetBytes / Math.max(1, blob.size));
    outputWidth = Math.max(1, Math.floor(outputWidth * ratio * 0.96));

    if (keepAspect) {
      outputHeight = Math.max(
        1,
        Math.round(
          image.naturalHeight *
            (outputWidth / image.naturalWidth),
        ),
      );
    } else {
      outputHeight = Math.max(1, Math.floor(outputHeight * ratio * 0.96));
    }

    blob = await encodeImage(
      image,
      outputWidth,
      outputHeight,
      mime,
      quality,
    );
  }

  return {
    blob,
    width: outputWidth,
    height: outputHeight,
  };
}

export default function OptimizerClient({
  mode = "compress",
}: Props) {
  const input = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);

  const [quality, setQuality] = useState(72);

  const [target, setTarget] = useState(500);

  const [unit, setUnit] = useState<"KB" | "MB">(
    "KB",
  );

  const [sizeMode, setSizeMode] = useState(false);

  const [convertTargetEnabled, setConvertTargetEnabled] =
    useState(false);

  const [convertTarget, setConvertTarget] =
    useState(500);

  const [convertUnit, setConvertUnit] =
    useState<"KB" | "MB">("KB");

  const [format, setFormat] =
    useState("image/jpeg");

  const [width, setWidth] =
    useState(1200);

  const [height, setHeight] =
    useState(1200);

  const [keepAspect, setKeepAspect] =
    useState(true);

  const [resizePreset, setResizePreset] =
    useState("custom");

  const [resizeTargetEnabled, setResizeTargetEnabled] =
    useState(false);

  const [resizeTarget, setResizeTarget] =
    useState(500);

  const [resizeUnit, setResizeUnit] =
    useState<"KB" | "MB">("KB");

  const [outputs, setOutputs] =
    useState<Output[]>([]);

  const [busy, setBusy] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [drag, setDrag] =
    useState(false);

  const [error, setError] =
    useState("");

  function addFiles(
    list: FileList | File[],
  ) {
    const accepted = Array.from(list).filter(
      (file) =>
        file.type.startsWith("image/") ||
        INPUT_EXTENSIONS.some((extension) =>
          file.name
            .toLowerCase()
            .endsWith(extension),
        ),
    );

    if (!accepted.length) {
      setError(
        "No supported image files were found.",
      );
      return;
    }

    setFiles((previous) =>
      [...previous, ...accepted].slice(0, 30),
    );

    setOutputs([]);
    setError("");
  }

  function chooseFiles(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (event.target.files) {
      addFiles(event.target.files);
    }
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDrag(false);
    addFiles(event.dataTransfer.files);
  }

  async function run() {
    if (!files.length) {
      setError(
        "Please choose at least one image.",
      );
      return;
    }

    setBusy(true);
    setProgress(0);
    setError("");

    const processed: Output[] = [];

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file = files[index];

        const image =
          await loadImage(file);

        let outputWidth =
          image.naturalWidth;

        let outputHeight =
          image.naturalHeight;

        let outputMime =
          format;

        let outputQuality =
          quality / 100;

        let outputSuffix: string =
          mode;

        /*
         * CONVERTER MAXIMUM OUTPUT SIZE
         */
        if (mode === "convert" && convertTargetEnabled) {
          const targetBytes =
            convertUnit === "MB"
              ? convertTarget * 1024 * 1024
              : convertTarget * 1024;

          const blob = await createTargetSizeBlob(
            image,
            outputWidth,
            outputHeight,
            outputMime,
            targetBytes,
            outputQuality,
          );

          processed.push({
            name: `${stripExt(
              file.name,
            )}-${outputSuffix}.${ext(
              outputMime,
            )}`,

            blob,

            original: file.size,

            width: outputWidth,

            height: outputHeight,
          });

          setProgress(
            Math.round(
              ((index + 1) /
                files.length) *
                100,
            ),
          );

          continue;
        }

        /*
         * RESIZE
         */
        if (mode === "resize") {
          outputWidth = Math.max(
            1,
            width,
          );

          outputHeight = keepAspect
            ? Math.max(
                1,
                Math.round(
                  image.naturalHeight *
                    (outputWidth /
                      image.naturalWidth),
                ),
              )
            : Math.max(
                1,
                height,
              );

          outputSuffix =
            "resized";

          if (resizeTargetEnabled) {
            const targetBytes =
              resizeUnit === "MB"
                ? resizeTarget * 1024 * 1024
                : resizeTarget * 1024;

            const targetOutput =
              await createResizeTargetBlob(
                image,
                outputWidth,
                outputHeight,
                outputMime,
                targetBytes,
                outputQuality,
                keepAspect,
              );

            outputWidth = targetOutput.width;
            outputHeight = targetOutput.height;

            processed.push({
              name: `${stripExt(
                file.name,
              )}-${outputSuffix}.${ext(
                outputMime,
              )}`,

              blob: targetOutput.blob,

              original: file.size,

              width: outputWidth,

              height: outputHeight,
            });

            setProgress(
              Math.round(
                ((index + 1) /
                  files.length) *
                  100,
              ),
            );

            continue;
          }
        }

        /*
         * COMPRESS / OPTIMIZE
         */
        if (
          mode === "compress" ||
          mode === "optimize"
        ) {
          outputSuffix =
            "compressed";

          /*
           * TARGET SIZE MODE
           */
          if (sizeMode) {
            const targetBytes =
              unit === "MB"
                ? target *
                  1024 *
                  1024
                : target *
                  1024;

            const blob =
              await createTargetSizeBlob(
                image,
                outputWidth,
                outputHeight,
                outputMime,
                targetBytes,
                outputQuality,
              );

            processed.push({
              name: `${stripExt(
                file.name,
              )}-${outputSuffix}.${ext(
                outputMime,
              )}`,

              blob,

              original:
                file.size,

              width:
                outputWidth,

              height:
                outputHeight,
            });

            setProgress(
              Math.round(
                ((index + 1) /
                  files.length) *
                  100,
              ),
            );

            continue;
          }
        }

        /*
         * NORMAL PROCESSING
         */
        const blob =
          await encodeImage(
            image,
            outputWidth,
            outputHeight,
            outputMime,
            outputQuality,
          );

        processed.push({
          name: `${stripExt(
            file.name,
          )}-${outputSuffix}.${ext(
            outputMime,
          )}`,

          blob,

          original:
            file.size,

          width:
            outputWidth,

          height:
            outputHeight,
        });

        setProgress(
          Math.round(
            ((index + 1) /
              files.length) *
              100,
          ),
        );
      }

      setOutputs(processed);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Processing failed.";

      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    if (!outputs.length) return;

    const zip = new JSZip();

    outputs.forEach(
      (output) => {
        zip.file(
          output.name,
          output.blob,
        );
      },
    );

    const blob =
      await zip.generateAsync({
        type: "blob",
      });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "imgcontrol-results.zip";

    anchor.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function downloadOne(
    output: Output,
  ) {
    const url =
      URL.createObjectURL(
        output.blob,
      );

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      output.name;

    anchor.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  const totalOriginal =
    outputs.reduce(
      (sum, output) =>
        sum + output.original,
      0,
    );

  const totalOutput =
    outputs.reduce(
      (sum, output) =>
        sum + output.blob.size,
      0,
    );

  const savedPercent =
    totalOriginal
      ? Math.max(
          0,
          Math.round(
            (1 -
              totalOutput /
                totalOriginal) *
              100,
          ),
        )
      : 0;

  return (
    <>
      <style>{`
        /* আমরা চেকবক্সের অপশনগুলোর জন্য ডাইনামিক ক্লাস যোগ করেছি, 
          যাতে লাইট মোডে পরিষ্কার ও ডার্ক মোডে গাঢ় নীল রঙের দেখায় 
        */
        .premiumOptionBox {
          margin-top: 4px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
          color: #334155;
        }

        html.dark .premiumOptionBox {
          border-color: #29485f;
          background: linear-gradient(180deg, #102b40 0%, #0d2436 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
          color: #e2e8f0;
        }

        .premiumCheckbox {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }

        .premiumCheckbox:checked {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: #2563eb;
        }

        html.dark .premiumCheckbox {
          background: #102b40;
          border-color: #31536b;
        }

        html.dark .premiumCheckbox:checked {
          background: linear-gradient(135deg, #1785ff, #0868da);
          border-color: #147ef5;
        }

        html.dark .field input:disabled {
          background: #091b2a !important;
          color: #6f899b !important;
          border-color: #203b4e !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.02) !important;
        }
      `}</style>

      <div className="toolShell">
      <div className="card toolPanel">

        {/* FILE INPUT */}
        <input
          ref={input}
          hidden
          type="file"
          accept={`image/*,${INPUT_EXTENSIONS.join(
            ",",
          )}`}
          multiple
          onChange={chooseFiles}
        />

        {/* DROPZONE */}
        <div
          className={`dropzone ${
            drag ? "drag" : ""
          }`}
          onClick={() =>
            input.current?.click()
          }
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() =>
            setDrag(false)
          }
          onDrop={handleDrop}
        >
          <div className="uploadIcon">
            ☁️
          </div>

          <strong>
            Drop images here or tap to browse
          </strong>

          <span>
            Up to 30 images per batch
          </span>

          <div className="formatChips">
            {[
              "JPG",
              "PNG",
              "WebP",
              "AVIF",
              "GIF",
              "BMP",
              "SVG",
              "TIFF",
              "HEIC",
            ].map((label) => (
              <span
                className="chip"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* COMPRESSOR */}
        {(mode === "compress" ||
          mode === "optimize") && (
          <div className="controls">

            <div className="tabs">

              <button
                type="button"
                className={`tab ${
                  !sizeMode
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSizeMode(false)
                }
              >
                Quality mode
              </button>

              <button
                type="button"
                className={`tab ${
                  sizeMode
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSizeMode(true)
                }
              >
                Target file size
              </button>

            </div>

            {!sizeMode ? (
              <div className="field">

                <label htmlFor="quality">
                  Compression quality
                </label>

                <div className="rangeRow">

                  <span>
                    Smaller file
                  </span>

                  <strong>
                    {quality}%
                  </strong>

                  <span>
                    Higher quality
                  </span>

                </div>

                <input
                  id="quality"
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(event) =>
                    setQuality(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                />

              </div>
            ) : (
              <div className="controlGrid">

                <div className="field">

                  <label htmlFor="target">
                    Maximum output size
                  </label>

                  <input
                    id="target"
                    type="number"
                    min="1"
                    value={target}
                    onChange={(event) =>
                      setTarget(
                        Math.max(
                          1,
                          Number(
                            event.target
                              .value,
                          ),
                        ),
                      )
                    }
                  />

                </div>

                <div className="field">

                  <label htmlFor="unit">
                    Unit
                  </label>

                  <select
                    id="unit"
                    value={unit}
                    onChange={(event) =>
                      setUnit(
                        event.target
                          .value as
                          | "KB"
                          | "MB",
                      )
                    }
                  >
                    <option value="KB">
                      KB
                    </option>

                    <option value="MB">
                      MB
                    </option>
                  </select>

                </div>

              </div>
            )}

            {/* OUTPUT FORMAT */}
            <div className="field">

              <label>
                Output format
              </label>

              <div className="formatGrid">

                {OUTPUT_FORMATS.map(
                  ([
                    id,
                    label,
                    description,
                  ]) => (
                    <button
                      type="button"
                      key={id}
                      className={`formatOption ${
                        format === id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setFormat(id)
                      }
                    >
                      <strong>
                        {label}
                      </strong>

                      <span>
                        {description}
                      </span>
                    </button>
                  ),
                )}

              </div>

            </div>

          </div>
        )}

        {/* CONVERTER */}
        {mode === "convert" && (
          <div className="controls">

            <div className="field">

              <label>
                Convert to
              </label>

              <div className="formatGrid">

                {OUTPUT_FORMATS.map(
                  ([
                    id,
                    label,
                    description,
                  ]) => (
                    <button
                      type="button"
                      key={id}
                      className={`formatOption ${
                        format === id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setFormat(id)
                      }
                    >
                      <strong>
                        {label}
                      </strong>

                      <span>
                        {description}
                      </span>
                    </button>
                  ),
                )}

              </div>

            </div>

            {/* MAXIMUM OUTPUT SIZE */}
            <div className="premiumOptionBox">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  margin: 0,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                <input
                  className="premiumCheckbox"
                  type="checkbox"
                  checked={convertTargetEnabled}
                  onChange={(event) =>
                    setConvertTargetEnabled(
                      event.target.checked,
                    )
                  }
                  style={{
                    width: 18,
                    height: 18,
                    margin: 0,
                    flex: "0 0 auto",
                  }}
                />
                <span>Set maximum output size</span>
              </label>

              {convertTargetEnabled && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    value={convertTarget}
                    onChange={(event) =>
                      setConvertTarget(
                        Math.max(
                          1,
                          Number(
                            event.target.value,
                          ),
                        ),
                      )
                    }
                  />

                  <select
                    value={convertUnit}
                    onChange={(event) =>
                      setConvertUnit(
                        event.target.value as
                          | "KB"
                          | "MB",
                      )
                    }
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        )}

        {/* RESIZER */}
        {mode === "resize" && (
          <div className="controls">

            <div className="field">

              <label htmlFor="resize-preset">
                Preset size
              </label>

              <select
                id="resize-preset"
                value={resizePreset}
                onChange={(event) => {
                  const value = event.target.value;
                  setResizePreset(value);

                  if (value === "custom") return;

                  const [presetWidth, presetHeight] =
                    value.split("x").map(Number);

                  if (!presetWidth || !presetHeight) return;

                  setWidth(presetWidth);
                  setHeight(presetHeight);
                  setKeepAspect(false);
                }}
              >
                <option value="custom">Custom size</option>
                <option value="320x240">320 × 240</option>
                <option value="640x480">640 × 480</option>
                <option value="800x600">800 × 600</option>
                <option value="1024x768">1024 × 768</option>
                <option value="1280x720">1280 × 720</option>
                <option value="1280x800">1280 × 800</option>
                <option value="1920x1080">1920 × 1080</option>
                <option value="1080x1080">1080 × 1080</option>
                <option value="1080x1350">1080 × 1350</option>
                <option value="1080x1920">1080 × 1920</option>
                <option value="2048x2048">2048 × 2048</option>
              </select>

            </div>

            <div className="controlGrid">

              <div className="field">

                <label htmlFor="width">
                  Width (px)
                </label>

                <input
                  id="width"
                  type="number"
                  min="1"
                  value={width}
                  disabled={keepAspect}
                  style={{
                    opacity: keepAspect ? 0.45 : 1,
                    cursor: keepAspect ? "not-allowed" : "text",
                  }}
                  onChange={(event) => {
                    const nextWidth = Math.max(
                      1,
                      Number(event.target.value),
                    );

                    setWidth(nextWidth);

                    setResizePreset("custom");

                    if (keepAspect) {
                      setHeight(
                        Math.max(
                          1,
                          Math.round(
                            nextWidth *
                              (height / Math.max(1, width)),
                          ),
                        ),
                      );
                    }
                  }}
                />

              </div>

              <div className="field">

                <label htmlFor="height">
                  Height (px)
                </label>

                <input
                  id="height"
                  type="number"
                  min="1"
                  value={height}
                  disabled={keepAspect}
                  style={{
                    opacity: keepAspect ? 0.45 : 1,
                    cursor: keepAspect ? "not-allowed" : "text",
                  }}
                  onChange={(event) => {
                    const nextHeight = Math.max(
                      1,
                      Number(event.target.value),
                    );

                    setHeight(nextHeight);
                    setResizePreset("custom");

                    if (keepAspect) return;
                  }}
                />

              </div>

            </div>

            {/* KEEP ASPECT RATIO */}
            <div className="premiumOptionBox" style={{ marginTop: 4, padding: "11px 13px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  margin: 0,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                <input
                  className="premiumCheckbox"
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(event) =>
                    setKeepAspect(event.target.checked)
                  }
                  style={{
                    width: 18,
                    height: 18,
                    margin: 0,
                    flex: "0 0 auto",
                  }}
                />
                <span>Keep aspect ratio</span>
              </label>
            </div>

            {/* MAXIMUM OUTPUT SIZE */}
            <div className="premiumOptionBox" style={{ marginTop: 14 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  margin: 0,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                <input
                  className="premiumCheckbox"
                  type="checkbox"
                  checked={resizeTargetEnabled}
                  onChange={(event) =>
                    setResizeTargetEnabled(event.target.checked)
                  }
                  style={{
                    width: 18,
                    height: 18,
                    margin: 0,
                    flex: "0 0 auto",
                  }}
                />
                <span>Set maximum output size</span>
              </label>

              {resizeTargetEnabled && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    value={resizeTarget}
                    onChange={(event) =>
                      setResizeTarget(
                        Math.max(1, Number(event.target.value)),
                      )
                    }
                  />

                  <select
                    value={resizeUnit}
                    onChange={(event) =>
                      setResizeUnit(
                        event.target.value as "KB" | "MB",
                      )
                    }
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
              )}
            </div>

            <div className="field">

              <label htmlFor="resize-format">
                Export format
              </label>

              <select
                id="resize-format"
                value={format}
                onChange={(event) =>
                  setFormat(
                    event.target.value,
                  )
                }
              >
                <option value="image/jpeg">
                  JPG
                </option>

                <option value="image/png">
                  PNG
                </option>

                <option value="image/webp">
                  WebP
                </option>

                <option value="image/avif">
                  AVIF
                </option>
              </select>

            </div>

          </div>
        )}

        {/* SELECTED FILES */}
        {files.length > 0 && (
          <div className="fileList">

            {files.map(
              (file, index) => {
                const previewUrl =
                  URL.createObjectURL(
                    file,
                  );

                return (
                  <div
                    className="fileRow"
                    key={`${file.name}-${index}`}
                  >

                    <div className="fileMeta">

                      <img
                        className="thumb"
                        src={previewUrl}
                        alt={`Preview of ${file.name}`}
                        onLoad={() =>
                          URL.revokeObjectURL(
                            previewUrl,
                          )
                        }
                      />

                      <div>

                        <div className="fileName">
                          {file.name}
                        </div>

                        <div className="fileSize">
                          {fmt(file.size)}
                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="btn btnSecondary btnSmall"
                      onClick={() =>
                        setFiles(
                          (current) =>
                            current.filter(
                              (
                                _,
                                currentIndex,
                              ) =>
                                currentIndex !==
                                index,
                            ),
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                );
              },
            )}

          </div>
        )}

        {/* PROGRESS */}
        {busy && (
          <div
            className="progress"
            aria-label={`Progress ${progress}%`}
          >
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="notice"
            style={{
              background:
                "#fff1f1",
              borderColor:
                "#ffd1d1",
              color:
                "#8b1b1b",
            }}
          >
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div
          className="actions"
          style={{
            justifyContent:
              "flex-start",
            marginTop: 18,
          }}
        >

          <button
            type="button"
            className="btn btnPrimary"
            onClick={run}
            disabled={busy}
          >
            {busy
              ? `Processing ${progress}%…`
              : "Process Images"}
          </button>

          <button
            type="button"
            className="btn btnSecondary"
            onClick={() => {
              setFiles([]);
              setOutputs([]);
              setError("");
              setProgress(0);

              if (input.current) {
                input.current.value =
                  "";
              }
            }}
          >
            Clear All
          </button>

        </div>

        {/* RESULTS */}
        {outputs.length > 0 && (
          <div className="result">

            <div className="resultHeader">

              <strong>
                Processing complete
              </strong>

              <div
                className="smallActions"
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 10,
                  flexWrap:
                    "wrap",
                }}
              >

                <span>
                  {outputs.length} file
                  {outputs.length > 1
                    ? "s"
                    : ""}
                </span>

                <button
                  type="button"
                  className="btn btnPrimary btnSmall"
                  onClick={
                    downloadAll
                  }
                >
                  Download All
                </button>

              </div>

            </div>

            <div className="statGrid">

              <div className="stat">
                <strong>
                  {fmt(
                    totalOriginal,
                  )}
                </strong>

                <span>
                  Original total
                </span>
              </div>

              <div className="stat">
                <strong>
                  {fmt(
                    totalOutput,
                  )}
                </strong>

                <span>
                  Output total
                </span>
              </div>

              <div className="stat">
                <strong>
                  {savedPercent}%
                </strong>

                <span>
                  Saved
                </span>
              </div>

            </div>

            <div className="fileList">

              {outputs.map(
                (output) => (
                  <div
                    className="fileRow"
                    key={output.name}
                  >

                    <div>

                      <div className="fileName">
                        {output.name}
                      </div>

                      <div className="fileSize">
                        {fmt(
                          output.original,
                        )}{" "}
                        →{" "}
                        {fmt(
                          output.blob.size,
                        )}{" "}
                        ·{" "}
                        {
                          output.width
                        }
                        ×
                        {
                          output.height
                        }{" "}
                        ·{" "}
                        {output.original
                          ? Math.max(
                              0,
                              Math.round(
                                (1 -
                                  output.blob
                                    .size /
                                    output.original) *
                                  100,
                              ),
                            )
                          : 0}
                        % saved
                      </div>

                    </div>

                    <button
                      type="button"
                      className="btn btnPrimary btnSmall"
                      onClick={() =>
                        downloadOne(
                          output,
                        )
                      }
                    >
                      Download
                    </button>

                  </div>
                ),
              )}

            </div>

          </div>
        )}

        {/* INFO */}
        <div className="notice">
          Core browser processing works best
          with JPG, PNG, WebP and supported
          AVIF images. HEIC, TIFF and PDF
          workflows may require additional
          codecs or dedicated processing.
        </div>

      </div>
    </div>
    </>
  );
}