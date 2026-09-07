"use client";

import { useEffect, useRef, useState } from "react";

type CropRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export default function AdvancedCrop() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });
  const [ratio, setRatio] = useState("free");
  const [outputWidth, setOutputWidth] = useState(0);
  const [outputHeight, setOutputHeight] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const imageRef = useRef<HTMLImageElement>(null);

  type CropInteraction =
    | {
        type: "move";
        startClientX: number;
        startClientY: number;
        startCrop: CropRect;
      }
    | {
        type: "resize";
        handle: "nw" | "ne" | "sw" | "se";
        startClientX: number;
        startClientY: number;
        startCrop: CropRect;
      }
    | null;

  const interactionRef = useRef<CropInteraction>(null);

  const [targetEnabled, setTargetEnabled] = useState(false);
  const [targetSize, setTargetSize] = useState(500);
  const [targetUnit, setTargetUnit] = useState<"KB" | "MB">("KB");

  useEffect(() => {
    if (!file) {
      setSourceUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!result) {
      setResultUrl("");
      return;
    }

    const url = URL.createObjectURL(result);
    setResultUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [result]);

  function chooseFile(nextFile: File | null) {
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/") && !/\.(heic|heif|avif|tiff?|bmp|svg)$/i.test(nextFile.name)) {
      setError("Please select a supported image file.");
      return;
    }

    setFile(nextFile);
    setResult(null);
    setError("");
  }

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    setImageSize({ w, h });

    const cropW = Math.max(1, Math.round(w * 0.8));
    const cropH = Math.max(1, Math.round(h * 0.8));

    setCrop({ x: 0, y: 0, w: cropW, h: cropH });
    setOutputWidth(cropW);
    setOutputHeight(cropH);
  }

  function updateCrop(partial: Partial<CropRect>) {
    setCrop((current) => {
      const next = { ...current, ...partial };

      next.x = Math.max(0, Math.min(next.x, Math.max(0, imageSize.w - 1)));
      next.y = Math.max(0, Math.min(next.y, Math.max(0, imageSize.h - 1)));
      next.w = Math.max(1, Math.min(next.w, imageSize.w - next.x));
      next.h = Math.max(1, Math.min(next.h, imageSize.h - next.y));

      return next;
    });
  }

  function applyRatio(nextRatio: string) {
    setRatio(nextRatio);

    if (nextRatio === "free" || !imageSize.w || !imageSize.h) return;

    const [ratioW, ratioH] = nextRatio.split(":").map(Number);
    if (!ratioW || !ratioH) return;

    let width = crop.w;
    let height = Math.round((width * ratioH) / ratioW);

    if (height > imageSize.h - crop.y) {
      height = Math.max(1, imageSize.h - crop.y);
      width = Math.max(1, Math.round((height * ratioW) / ratioH));
    }

    if (width > imageSize.w - crop.x) {
      width = Math.max(1, imageSize.w - crop.x);
      height = Math.max(1, Math.round((width * ratioH) / ratioW));
    }

    updateCrop({ w: width, h: height });
    setOutputWidth(width);
    setOutputHeight(height);
  }

  function clampCropRect(next: CropRect): CropRect {
    const maxX = Math.max(0, imageSize.w - 1);
    const maxY = Math.max(0, imageSize.h - 1);

    const x = Math.max(0, Math.min(next.x, maxX));
    const y = Math.max(0, Math.min(next.y, maxY));

    return {
      x,
      y,
      w: Math.max(1, Math.min(next.w, imageSize.w - x)),
      h: Math.max(1, Math.min(next.h, imageSize.h - y)),
    };
  }

  function ratioValue(): number | null {
    if (ratio === "free") return null;

    const [ratioW, ratioH] = ratio.split(":").map(Number);
    if (!ratioW || !ratioH) return null;

    return ratioW / ratioH;
  }

  function applyPointerCrop(
    interaction: NonNullable<CropInteraction>,
    event: PointerEvent,
  ) {
    const imageElement = imageRef.current;
    if (!imageElement || !imageSize.w || !imageSize.h) return;

    const rect = imageElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = imageSize.w / rect.width;
    const scaleY = imageSize.h / rect.height;

    const dx =
      (event.clientX - interaction.startClientX) * scaleX;
    const dy =
      (event.clientY - interaction.startClientY) * scaleY;

    if (interaction.type === "move") {
      const next = clampCropRect({
        ...interaction.startCrop,
        x: interaction.startCrop.x + dx,
        y: interaction.startCrop.y + dy,
      });

      setCrop(next);
      setOutputWidth(Math.round(next.w));
      setOutputHeight(Math.round(next.h));
      return;
    }

    const start = interaction.startCrop;
    const handle = interaction.handle;

    let left = start.x;
    let right = start.x + start.w;
    let top = start.y;
    let bottom = start.y + start.h;

    if (handle.includes("w")) {
      left = start.x + dx;
    }
    if (handle.includes("e")) {
      right = start.x + start.w + dx;
    }
    if (handle.includes("n")) {
      top = start.y + dy;
    }
    if (handle.includes("s")) {
      bottom = start.y + start.h + dy;
    }

    const fixedLeft = handle.includes("w") ? right : left;
    const fixedRight = handle.includes("w") ? right : left;
    const fixedTop = handle.includes("n") ? bottom : top;
    const fixedBottom = handle.includes("n") ? bottom : top;

    if (ratioValue()) {
      const ratio = ratioValue() as number;

      let nextWidth = Math.abs(right - left);
      let nextHeight = Math.abs(bottom - top);

      if (Math.abs(dx) >= Math.abs(dy)) {
        nextWidth = Math.max(1, nextWidth);
        nextHeight = Math.max(1, Math.round(nextWidth / ratio));
      } else {
        nextHeight = Math.max(1, nextHeight);
        nextWidth = Math.max(1, Math.round(nextHeight * ratio));
      }

      if (handle.includes("w")) {
        left = fixedRight - nextWidth;
        right = fixedRight;
      } else {
        left = fixedLeft;
        right = fixedLeft + nextWidth;
      }

      if (handle.includes("n")) {
        top = fixedBottom - nextHeight;
        bottom = fixedBottom;
      } else {
        top = fixedTop;
        bottom = fixedTop + nextHeight;
      }

      if (left < 0) {
        left = 0;
        right = Math.min(imageSize.w, nextWidth);
      }

      if (right > imageSize.w) {
        right = imageSize.w;
        left = Math.max(0, right - nextWidth);
      }

      if (top < 0) {
        top = 0;
        bottom = Math.min(imageSize.h, nextHeight);
      }

      if (bottom > imageSize.h) {
        bottom = imageSize.h;
        top = Math.max(0, bottom - nextHeight);
      }

      nextWidth = Math.max(1, right - left);
      nextHeight = Math.max(1, bottom - top);

      // Reconcile one last time so the selected aspect ratio is exact.
      if (Math.abs(nextWidth / nextHeight - ratio) > 0.01) {
        if (handle.includes("w") || handle.includes("e")) {
          nextHeight = Math.max(1, Math.round(nextWidth / ratio));
        } else {
          nextWidth = Math.max(1, Math.round(nextHeight * ratio));
        }

        if (handle.includes("n")) top = bottom - nextHeight;
        else bottom = top + nextHeight;

        if (handle.includes("w")) left = right - nextWidth;
        else right = left + nextWidth;

        if (left < 0) {
          left = 0;
          right = Math.min(imageSize.w, nextWidth);
        }

        if (right > imageSize.w) {
          right = imageSize.w;
          left = Math.max(0, right - nextWidth);
        }

        if (top < 0) {
          top = 0;
          bottom = Math.min(imageSize.h, nextHeight);
        }

        if (bottom > imageSize.h) {
          bottom = imageSize.h;
          top = Math.max(0, bottom - nextHeight);
        }
      }
    } else {
      left = Math.max(0, Math.min(left, imageSize.w - 1));
      top = Math.max(0, Math.min(top, imageSize.h - 1));
      right = Math.max(left + 1, Math.min(right, imageSize.w));
      bottom = Math.max(top + 1, Math.min(bottom, imageSize.h));
    }

    const next = clampCropRect({
      x: Math.round(Math.min(left, right - 1)),
      y: Math.round(Math.min(top, bottom - 1)),
      w: Math.round(Math.max(1, right - left)),
      h: Math.round(Math.max(1, bottom - top)),
    });

    setCrop(next);
    setOutputWidth(Math.round(next.w));
    setOutputHeight(Math.round(next.h));
  }

  function startCropInteraction(
    event: React.PointerEvent<HTMLDivElement>,
    interaction: NonNullable<CropInteraction>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    interactionRef.current = interaction;

    const handleMove = (nativeEvent: PointerEvent) => {
      nativeEvent.preventDefault();

      const activeInteraction = interactionRef.current;
      if (activeInteraction) {
        applyPointerCrop(activeInteraction, nativeEvent);
      }
    };

    const handleUp = () => {
      interactionRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };

    window.addEventListener("pointermove", handleMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handleUp, {
      passive: true,
    });
    window.addEventListener("pointercancel", handleUp, {
      passive: true,
    });
  }

  function handleCropBoxPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    startCropInteraction(event, {
      type: "move",
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCrop: { ...crop },
    });
  }

  function handleCropHandlePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    handle: "nw" | "ne" | "sw" | "se",
  ) {
    startCropInteraction(event, {
      type: "resize",
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCrop: { ...crop },
    });
  }

  async function createTargetSizeBlob(
    image: HTMLImageElement,
    sourceX: number,
    sourceY: number,
    sourceW: number,
    sourceH: number,
    targetBytes: number,
    exportW: number,
    exportH: number,
  ): Promise<{
    blob: Blob;
    width: number;
    height: number;
  }> {
    let width = Math.max(1, Math.round(exportW));
    let height = Math.max(1, Math.round(exportH));

    const render = async (
      outputWidth: number,
      outputHeight: number,
    ): Promise<Blob> =>
      new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(
            new Error("Canvas is not supported in this browser."),
          );
          return;
        }

        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceW,
          sourceH,
          0,
          0,
          outputWidth,
          outputHeight,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error(
                  "Unable to create the cropped image.",
                ),
              );
            }
          },
          "image/png",
        );
      });

    let blob = await render(width, height);

    for (
      let attempt = 0;
      attempt < 16 && blob.size > targetBytes;
      attempt += 1
    ) {
      const scale =
        Math.sqrt(
          targetBytes / Math.max(1, blob.size),
        ) * 0.96;

      const nextWidth = Math.max(
        1,
        Math.floor(width * scale),
      );
      const nextHeight = Math.max(
        1,
        Math.floor(height * scale),
      );

      if (
        nextWidth === width &&
        nextHeight === height
      ) {
        break;
      }

      width = nextWidth;
      height = nextHeight;

      blob = await render(width, height);
    }

    return {
      blob,
      width,
      height,
    };
  }

  function exportCrop() {
    if (!sourceUrl || !imageSize.w || !imageSize.h) return;

    setError("");

    const image = new Image();

    image.onload = () => {
      const sourceX = Math.max(0, Math.round(crop.x));
      const sourceY = Math.max(0, Math.round(crop.y));
      const sourceW = Math.max(
        1,
        Math.min(Math.round(crop.w), imageSize.w - sourceX),
      );
      const sourceH = Math.max(
        1,
        Math.min(Math.round(crop.h), imageSize.h - sourceY),
      );

      const exportW = Math.max(
        1,
        Math.round(outputWidth || sourceW),
      );
      const exportH = Math.max(
        1,
        Math.round(outputHeight || sourceH),
      );

      if (targetEnabled) {
        const targetBytes =
          targetUnit === "MB"
            ? targetSize * 1024 * 1024
            : targetSize * 1024;

        createTargetSizeBlob(
          image,
          sourceX,
          sourceY,
          sourceW,
          sourceH,
          targetBytes,
          exportW,
          exportH,
        )
          .then((targetOutput) => {
            setOutputWidth(targetOutput.width);
            setOutputHeight(targetOutput.height);
            setResult(targetOutput.blob);
          })
          .catch((caught) => {
            setError(
              caught instanceof Error
                ? caught.message
                : "Unable to create the cropped image.",
            );
          });

        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = exportW;
      canvas.height = exportH;

      const context = canvas.getContext("2d");
      if (!context) {
        setError("Canvas is not supported in this browser.");
        return;
      }

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        exportW,
        exportH,
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Unable to create the cropped image.");
          return;
        }

        setResult(blob);
      }, "image/png");
    };

    image.onerror = () => {
      setError("Unable to read the selected image.");
    };

    image.src = sourceUrl;
  }

  function reset() {
    setFile(null);
    setSourceUrl("");
    setImageSize({ w: 0, h: 0 });
    setCrop({ x: 0, y: 0, w: 100, h: 100 });
    setRatio("free");
    setOutputWidth(0);
    setOutputHeight(0);
    setTargetEnabled(false);
    setTargetSize(500);
    setTargetUnit("KB");
    setResult(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const cropStyle = imageSize.w
    ? {
        left: `${(crop.x / imageSize.w) * 100}%`,
        top: `${(crop.y / imageSize.h) * 100}%`,
        width: `${(crop.w / imageSize.w) * 100}%`,
        height: `${(crop.h / imageSize.h) * 100}%`,
      }
    : undefined;

  return (
    <div className="toolShell">
      <div className="card toolPanel">
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*,.heic,.heif,.avif,.tif,.tiff,.bmp,.svg"
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        />

        <div
          className="dropzone"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              inputRef.current?.click();
            }
          }}
        >
          <div className="premiumUploadIcon">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 5H18M5 9H19M4 13H20M7 19H17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <strong>Drop an image here</strong>
          <span>or click to browse from your device</span>

          <div className="formatChips">
            <span className="chip">JPG</span>
            <span className="chip">PNG</span>
            <span className="chip">WebP</span>
            <span className="chip">Up to 30 files</span>
          </div>
        </div>

        {file && sourceUrl && (
          <div className="fileList" style={{ marginTop: 16 }}>
            <div className="fileRow">
              <div className="fileMeta">
                <div className="thumbnailWrap">
                  <img
                    src={sourceUrl}
                    alt={file.name}
                    className="selectedThumb"
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div className="fileName" title={file.name}>
                    {file.name}
                  </div>
                  <div className="fileSize">Ready to crop</div>
                </div>
              </div>

              <button
                type="button"
                className="btn btnSecondary btnSmall"
                onClick={reset}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {sourceUrl && (
          <>
            <div className="editorStage" style={{ marginTop: 18 }}>
              <div className="editorInner">
                <img
                  ref={imageRef}
                  className="editorImage"
                  src={sourceUrl}
                  onLoad={handleImageLoad}
                  alt="Crop source"
                />

                <div
                  className="cropBox"
                  style={{
                    ...cropStyle,
                    touchAction: "none",
                    userSelect: "none",
                  }}
                  onPointerDown={handleCropBoxPointerDown}
                >
                  <div
                    className="cropHandle nw"
                    style={{ cursor: "nwse-resize" }}
                    onPointerDown={(event) =>
                      handleCropHandlePointerDown(
                        event,
                        "nw",
                      )
                    }
                  />
                  <div
                    className="cropHandle ne"
                    style={{ cursor: "nesw-resize" }}
                    onPointerDown={(event) =>
                      handleCropHandlePointerDown(
                        event,
                        "ne",
                      )
                    }
                  />
                  <div
                    className="cropHandle sw"
                    style={{ cursor: "nesw-resize" }}
                    onPointerDown={(event) =>
                      handleCropHandlePointerDown(
                        event,
                        "sw",
                      )
                    }
                  />
                  <div
                    className="cropHandle se"
                    style={{ cursor: "nwse-resize" }}
                    onPointerDown={(event) =>
                      handleCropHandlePointerDown(
                        event,
                        "se",
                      )
                    }
                  />
                  <div className="cropReadout">
                    {Math.round(crop.w)} × {Math.round(crop.h)} px
                  </div>
                </div>
              </div>
            </div>

            <div className="controls">
              <div className="controlGrid">
                <div className="field">
                  <label htmlFor="crop-x">Crop X</label>
                  <input
                    id="crop-x"
                    type="number"
                    min="0"
                    value={Math.round(crop.x)}
                    onChange={(event) =>
                      updateCrop({ x: Number(event.target.value) })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="crop-y">Crop Y</label>
                  <input
                    id="crop-y"
                    type="number"
                    min="0"
                    value={Math.round(crop.y)}
                    onChange={(event) =>
                      updateCrop({ y: Number(event.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="controlGrid">
                <div className="field">
                  <label htmlFor="crop-width">Crop width</label>
                  <input
                    id="crop-width"
                    type="number"
                    min="1"
                    value={Math.round(crop.w)}
                    onChange={(event) =>
                      updateCrop({ w: Number(event.target.value) })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="crop-height">Crop height</label>
                  <input
                    id="crop-height"
                    type="number"
                    min="1"
                    value={Math.round(crop.h)}
                    onChange={(event) =>
                      updateCrop({ h: Number(event.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="crop-ratio">Aspect ratio</label>
                <select
                  id="crop-ratio"
                  value={ratio}
                  onChange={(event) => applyRatio(event.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="1:1">1:1</option>
                  <option value="4:3">4:3</option>
                  <option value="3:2">3:2</option>
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                </select>
              </div>

              <div
                style={{
                  marginTop: 2,
                  padding: 14,
                  border: "1px solid rgba(130, 130, 130, 0.3)",
                  borderRadius: 12,
                  background: "rgba(130, 130, 130, 0.05)",
                }}
              >
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
                    checked={targetEnabled}
                    onChange={(event) =>
                      setTargetEnabled(
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

                {targetEnabled && (
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
                      value={targetSize}
                      onChange={(event) =>
                        setTargetSize(
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
                      value={targetUnit}
                      onChange={(event) =>
                        setTargetUnit(
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

              <div className="controlGrid">
                <div className="field">
                  <label htmlFor="export-width">Export width</label>
                  <input
                    id="export-width"
                    type="number"
                    min="1"
                    value={outputWidth}
                    onChange={(event) =>
                      setOutputWidth(Math.max(1, Number(event.target.value)))
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="export-height">Export height</label>
                  <input
                    id="export-height"
                    type="number"
                    min="1"
                    value={outputHeight}
                    onChange={(event) =>
                      setOutputHeight(Math.max(1, Number(event.target.value)))
                    }
                  />
                </div>
              </div>
            </div>

            {error && <div className="notice">{error}</div>}

            <div className="actions" style={{ justifyContent: "stretch", marginTop: 18 }}>
              <button
                type="button"
                className="btn btnPrimary"
                style={{ width: "100%" }}
                onClick={exportCrop}
              >
                Crop & Export
              </button>

              <button
                type="button"
                className="btn btnSecondary"
                style={{ width: "100%" }}
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </>
        )}

        {result && resultUrl && (
          <div className="result" style={{ marginTop: 18 }}>
            <div className="resultHeader">
              <div>
                <strong>Crop complete</strong>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
                  {Math.round(outputWidth)} × {Math.round(outputHeight)} px
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <img
                src={resultUrl}
                alt="Cropped result"
                style={{
                  maxWidth: "100%",
                  maxHeight: 360,
                  display: "block",
                  margin: "0 auto",
                  borderRadius: 12,
                  background: "#f5f7fa",
                }}
              />
            </div>

            <div className="actions" style={{ justifyContent: "stretch", marginTop: 12 }}>
              <button
                type="button"
                className="btn btnPrimary"
                style={{ width: "100%" }}
                onClick={() => downloadBlob(result, "imgcontrol-cropped.png")}
              >
                Download PNG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
