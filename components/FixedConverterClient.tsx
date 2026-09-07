"use client";

import JSZip from "jszip";
import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

type FixedConverterClientProps = {
  sourceLabel: string;
  outputLabel: string;
  outputMime: string;
  accept: string;
  inputText: string;
  outputText: string;
};

type ResultItem = {
  id: string;
  name: string;
  originalSize: number;
  outputSize: number;
  width: number;
  height: number;
  originalUrl: string;
  outputUrl: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function savedPercent(
  original: number,
  output: number
) {
  if (!original) return 0;

  return Math.max(
    0,
    ((original - output) / original) * 100
  );
}

function loadImage(
  file: File
): Promise<HTMLImageElement> {
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
          `Unable to read ${file.name}`
        )
      );
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Unable to create output image."
            )
          );

          return;
        }

        resolve(blob);
      },
      mimeType
    );
  });
}

async function convertImage(
  file: File,
  outputMime: string,
  maxBytes?: number
) {
  const image = await loadImage(file);

  let width = image.naturalWidth;
  let height = image.naturalHeight;

  async function render() {
    const canvas =
      document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Canvas is not supported."
      );
    }

    context.clearRect(
      0,
      0,
      width,
      height
    );

    if (outputMime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    return canvasToBlob(
      canvas,
      outputMime
    );
  }

  let blob = await render();

  /*
   * PNG is lossless and does not provide
   * browser quality control.
   *
   * When a maximum size is requested,
   * dimensions are reduced only when needed.
   */
  if (
    maxBytes &&
    blob.size > maxBytes
  ) {
    let attempts = 0;

    while (
      blob.size > maxBytes &&
      attempts < 12
    ) {
      const ratio = Math.sqrt(
        maxBytes / blob.size
      );

      width = Math.max(
        1,
        Math.floor(width * ratio)
      );

      height = Math.max(
        1,
        Math.floor(height * ratio)
      );

      blob = await render();

      attempts++;
    }
  }

  return {
    blob,
    width,
    height,
  };
}

function outputExtension(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/avif") return "avif";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/bmp") return "bmp";
  if (mimeType === "image/tiff") return "tiff";
  if (mimeType === "image/svg+xml") return "svg";
  if (mimeType === "image/x-icon") return "ico";
  return "img";
}

function isAcceptedFile(file: File, accept: string) {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  const tokens = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return name.endsWith(token);
    }

    if (token.endsWith("/*")) {
      return mime.startsWith(token.slice(0, -1));
    }

    return mime === token;
  });
}

export function FixedConverterClient({
  sourceLabel,
  outputLabel,
  outputMime,
  accept,
  inputText,
  outputText,
}: FixedConverterClientProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [files, setFiles] =
    useState<File[]>([]);

  const [results, setResults] =
    useState<ResultItem[]>([]);

  const [dragging, setDragging] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    targetEnabled,
    setTargetEnabled,
  ] = useState(false);

  const [targetSize, setTargetSize] =
    useState("500");

  const [targetUnit, setTargetUnit] =
    useState<"KB" | "MB">("KB");

  function selectFiles(
    selectedFiles: File[]
  ) {
    const validFiles = selectedFiles.filter((file) =>
      isAcceptedFile(file, accept),
    );

    if (validFiles.length === 0) {
      setError(
        `Please select ${sourceLabel} files only.`,
      );

      return;
    }

    setError("");

    setFiles((previous) => {
      const combined = [
        ...previous,
        ...validFiles,
      ];

      const unique =
        combined.filter(
          (file, index, array) =>
            array.findIndex(
              (item) =>
                item.name === file.name &&
                item.size === file.size &&
                item.lastModified ===
                  file.lastModified
            ) === index
        );

      return unique.slice(0, 30);
    });

    setResults([]);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    selectFiles(
      Array.from(
        event.target.files || []
      )
    );

    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragging(false);

    selectFiles(
      Array.from(
        event.dataTransfer.files || []
      )
    );
  }

  function removeFile(index: number) {
    setFiles((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setResults([]);
  }

  function clearAll() {
    setFiles([]);
    setResults([]);
    setError("");
  }

  function getMaximumBytes() {
    const value = Number(
      targetSize
    );

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return undefined;
    }

    return targetUnit === "MB"
      ? value * 1024 * 1024
      : value * 1024;
  }

  async function convertAll() {
    if (!files.length) {
      setError(
        `Please select ${sourceLabel} files first.`
      );

      return;
    }

    setProcessing(true);
    setError("");
    setResults([]);

    try {
      const maxBytes =
        targetEnabled
          ? getMaximumBytes()
          : undefined;

      const converted: ResultItem[] =
        [];

      for (const file of files) {
        const originalUrl =
          URL.createObjectURL(file);

        const convertedData =
          await convertImage(
            file,
            outputMime,
            maxBytes
          );

        const outputName =
          file.name.replace(/\.[^.]+$/i, "") +
          `.${outputExtension(outputMime)}`;

        const outputUrl =
          URL.createObjectURL(
            convertedData.blob
          );

        converted.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: outputName,
          originalSize: file.size,
          outputSize:
            convertedData.blob.size,
          width: convertedData.width,
          height: convertedData.height,
          originalUrl,
          outputUrl,
        });
      }

      setResults(converted);
    } catch (conversionError) {
      console.error(
        conversionError
      );

      setError(
        "Something went wrong while converting the images. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  }

  function downloadOne(
    item: ResultItem
  ) {
    const link =
      document.createElement("a");

    link.href = item.outputUrl;
    link.download = item.name;

    document.body.appendChild(link);

    link.click();

    link.remove();
  }

  async function downloadAll() {
    if (!results.length) return;

    try {
      const zip = new JSZip();

      for (const item of results) {
        const response =
          await fetch(
            item.outputUrl
          );

        const blob =
          await response.blob();

        zip.file(
          item.name,
          blob
        );
      }

      const zipBlob =
        await zip.generateAsync({
          type: "blob",
        });

      const zipUrl =
        URL.createObjectURL(
          zipBlob
        );

      const link =
        document.createElement("a");

      link.href = zipUrl;

      link.download =
        `imgcontrol-${inputText.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-to-${outputText.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(zipUrl);
    } catch (zipError) {
      console.error(zipError);

      setError(
        "Unable to create the ZIP file."
      );
    }
  }

  const originalTotal =
    files.reduce(
      (total, file) =>
        total + file.size,
      0
    );

  const outputTotal =
    results.reduce(
      (total, item) =>
        total + item.outputSize,
      0
    );

  const totalSaved =
    results.length
      ? savedPercent(
          originalTotal,
          outputTotal
        )
      : 0;

  return (
    <main className="section">
      <div className="container">

        {/* =========================
            PREMIUM PAGE HEADING
        ========================= */}

        <div className="pageHead">

          <div className="premiumKicker">
            <span className="premiumKickerStar">
              ✦
            </span>

            IMAGE CONVERTER
          </div>

          <h1 className="premiumPageTitle">
            <span className="headingSource">
              {inputText}
            </span>

            <span className="headingArrow">
              →
            </span>

            <span className="headingOutput">
              {outputText}
            </span>
          </h1>

          <p>
            Convert {sourceLabel} images to {outputLabel} online for free.
            Fast, simple and privacy-focused.
          </p>
        </div>

        {/* =========================
            MAIN CONVERTER
        ========================= */}

        <div className="toolShell">
          <section className="card toolPanel">

            {/* UPLOAD */}

            <div
              className={`dropzone ${
                dragging ? "drag" : ""
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => {
                setDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => {
                inputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
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
                >
                  <path
                    d="M12 16V4"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M7 9L12 4L17 9"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M5 20H19"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <strong>
                Drop {sourceLabel} images here
              </strong>

              <span>
                or click to browse from
                your device
              </span>

              <div className="formatChips">
                <span className="chip">
                  {sourceLabel}
                </span>

                <span className="chip">
                  Up to 30 files
                </span>
              </div>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={
                  handleInputChange
                }
                style={{
                  display: "none",
                }}
              />
            </div>

            {/* INPUT / OUTPUT */}

            <div className="controls">
              <div className="controlGrid">

                <div className="card">
                  <div className="kicker">
                    INPUT
                  </div>

                  <strong>
                    {sourceLabel}
                  </strong>
                </div>

                <div className="card">
                  <div className="kicker">
                    OUTPUT
                  </div>

                  <strong>
                    {outputLabel}
                  </strong>
                </div>

              </div>

              {/* MAXIMUM SIZE */}

              <div className="card">

                <div className="field">

                  <label>
                    Maximum Output Size
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "9px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        targetEnabled
                      }
                      onChange={(
                        event
                      ) => {
                        setTargetEnabled(
                          event.target.checked
                        );
                      }}
                      className="premiumCheckbox"
                    />

                    Set maximum
                    output size
                  </label>
                </div>

                {targetEnabled && (
                  <div className="premiumSizeRow">

                    <input
                      type="number"
                      min="1"
                      value={targetSize}
                      onChange={(
                        event
                      ) => {
                        setTargetSize(
                          event.target.value
                        );
                      }}
                      placeholder="500"
                    />

                    <select
                      value={targetUnit}
                      onChange={(
                        event
                      ) => {
                        setTargetUnit(
                          event.target
                            .value as
                            | "KB"
                            | "MB"
                        );
                      }}
                    >
                      <option value="KB">
                        KB
                      </option>

                      <option value="MB">
                        MB
                      </option>
                    </select>

                  </div>
                )}

                {targetEnabled && (
                  <div className="notice">
                    The converter keeps the original dimensions by default.
                    When a maximum size is enabled and the generated file is
                    larger than the target, dimensions may be reduced to
                    approach the requested size.
                  </div>
                )}

              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="notice"
                style={{
                  background:
                    "#FFF0F0",
                  borderColor:
                    "#F2C5C5",
                  color: "#A12626",
                }}
              >
                {error}
              </div>
            )}

            {/* SELECTED FILES */}

            {files.length > 0 && (
              <div className="fileList">

                {files.map(
                  (file, index) => (
                    <div
                      className="fileRow"
                      key={`${file.name}-${index}`}
                    >

                      <div className="fileMeta">

                        <div className="thumbnailWrap">
                          <img
                            src={URL.createObjectURL(
                              file
                            )}
                            alt={file.name}
                            className="selectedThumb"
                          />
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >

                          <div className="fileName">
                            {file.name}
                          </div>

                          <div className="fileSize">
                            {formatBytes(
                              file.size
                            )}
                          </div>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="btn btnSecondary btnSmall"
                        onClick={() => {
                          removeFile(
                            index
                          );
                        }}
                      >
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

            {/* ACTIONS */}

            <div
              className="actions"
              style={{
                justifyContent:
                  "stretch",
                marginTop: "18px",
              }}
            >

              <button
                type="button"
                className="btn btnPrimary"
                style={{
                  width: "100%",
                }}
                disabled={
                  processing ||
                  files.length === 0
                }
                onClick={convertAll}
              >
                {processing
                  ? "Converting..."
                  : `Convert to ${outputLabel}`}
              </button>

              {files.length > 0 && (
                <button
                  type="button"
                  className="btn btnSecondary"
                  onClick={clearAll}
                  style={{
                    width: "100%",
                  }}
                >
                  Clear All
                </button>
              )}

            </div>

          </section>
        </div>

        {/* =========================
            RESULTS
        ========================= */}

        {results.length > 0 && (
          <div
            className="toolShell"
            style={{
              marginTop: "24px",
            }}
          >

            <section className="result">

              <div className="resultHeader">

                <div>
                  <strong>
                    Conversion complete
                  </strong>

                  <div
                    style={{
                      color:
                        "var(--muted)",
                      fontSize: "13px",
                      marginTop:
                        "4px",
                    }}
                  >
                    {results.length}{" "}
                    file
                    {results.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    converted
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btnPrimary btnSmall"
                  onClick={
                    downloadAll
                  }
                >
                  Download All ZIP
                </button>

              </div>

              <div className="statGrid">

                <div className="stat">
                  <strong>
                    {formatBytes(
                      originalTotal
                    )}
                  </strong>

                  <span>
                    Original Total
                  </span>
                </div>

                <div className="stat">
                  <strong>
                    {formatBytes(
                      outputTotal
                    )}
                  </strong>

                  <span>
                    {outputLabel} Total
                  </span>
                </div>

                <div className="stat">
                  <strong>
                    {totalSaved.toFixed(
                      1
                    )}
                    %
                  </strong>

                  <span>
                    Saved
                  </span>
                </div>

              </div>

            </section>

            <div
              className="fileList"
              style={{
                marginTop: "18px",
              }}
            >

              {results.map(
                (item) => {
                  const saved =
                    savedPercent(
                      item.originalSize,
                      item.outputSize
                    );

                  return (
                    <div
                      className="card"
                      key={item.id}
                    >

                      <div className="premiumResultGrid">

                        <img
                          src={
                            item.outputUrl
                          }
                          alt={item.name}
                          className="premiumResultImage"
                        />

                        <div>

                          <div className="premiumResultName">
                            {item.name}
                          </div>

                          <div className="premiumResultStats">

                            <div>
                              Original:{" "}
                              {formatBytes(
                                item.originalSize
                              )}
                            </div>

                            <div>
                              PNG:{" "}
                              {formatBytes(
                                item.outputSize
                              )}
                            </div>

                            <div>
                              Dimensions:{" "}
                              {item.width}{" "}
                              ×{" "}
                              {item.height}
                            </div>

                            <div>
                              Saved:{" "}
                              {saved.toFixed(
                                1
                              )}
                              %
                            </div>

                          </div>

                          <div
                            className="actions"
                            style={{
                              justifyContent:
                                "flex-start",
                              marginTop:
                                "12px",
                            }}
                          >

                            <button
                              type="button"
                              className="btn btnPrimary btnSmall"
                              onClick={() => {
                                downloadOne(
                                  item
                                );
                              }}
                            >
                              Download
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>
        )}

      </div>

      {/* =========================
          PREMIUM HEADING STYLES
      ========================= */}

      <style jsx>{`

        .premiumKicker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          padding: 7px 14px;

          border-radius: 999px;

          background:
            linear-gradient(
              135deg,
              rgba(20,126,245,.10),
              rgba(10,174,235,.07)
            );

          border: 1px solid
            rgba(20,126,245,.18);

          color: #147ef5;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: .14em;

          box-shadow:
            0 6px 18px
              rgba(20,126,245,.08),
            inset 0 1px 0
              rgba(255,255,255,.9);
        }

        .premiumKickerStar {
          font-size: 12px;
          line-height: 1;

          background:
            linear-gradient(
              135deg,
              #147ef5,
              #36c96a
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .premiumPageTitle {
          margin-top: 14px !important;

          font-size: 46px !important;

          line-height: 1.08 !important;

          letter-spacing: -1.8px !important;

          font-weight: 900 !important;
        }

        .headingSource {
          color: #102a43;

          font-weight: 900;

          letter-spacing: -1.8px;
        }

        .headingArrow {
          display: inline-block;

          margin: 0 13px;

          color: #147ef5;

          font-weight: 800;

          text-shadow:
            0 5px 12px
            rgba(20,126,245,.14);
        }

        .headingOutput {
          font-weight: 900;

          letter-spacing: -1.8px;

          background:
            linear-gradient(
              135deg,
              #147ef5 0%,
              #08aeeB 45%,
              #36c96a 100%
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          filter:
            drop-shadow(
              0 5px 12px
              rgba(20,126,245,.10)
            );
        }

        .premiumUploadIcon {
          width: 76px;
          height: 76px;

          margin: 0 auto 17px;

          display: grid;
          place-items: center;

          border-radius: 23px;

          background:
            linear-gradient(
              145deg,
              #2d91ff 0%,
              #0968d8 100%
            );

          box-shadow:
            0 14px 32px
              rgba(20,126,245,.30),
            inset 0 1px 0
              rgba(255,255,255,.42);

          border: 1px solid
            rgba(255,255,255,.42);

          position: relative;

          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .premiumUploadIcon::after {
          content: "";

          position: absolute;

          inset: 5px;

          border-radius: 18px;

          border: 1px solid
            rgba(255,255,255,.17);

          pointer-events: none;
        }

        .dropzone {
          min-height: 255px;

          display: flex;
          flex-direction: column;

          justify-content: center;
          align-items: center;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(20,126,245,.11),
              transparent 52%
            ),
            linear-gradient(
              180deg,
              #fbfdff 0%,
              #f2f8ff 100%
            );

          border: 1.5px dashed #91c7ff;

          transition:
            background .18s ease,
            border-color .18s ease,
            box-shadow .18s ease,
            transform .18s ease;
        }

        .dropzone:hover,
        .dropzone.drag {
          border-color: #147ef5;

          box-shadow:
            0 15px 34px
              rgba(20,126,245,.13),
            inset 0 1px 0
              rgba(255,255,255,.92);

          transform: translateY(-1px);
        }

        .dropzone:hover
          .premiumUploadIcon,
        .dropzone.drag
          .premiumUploadIcon {
          transform: translateY(-2px);

          box-shadow:
            0 17px 36px
              rgba(20,126,245,.34),
            inset 0 1px 0
              rgba(255,255,255,.44);
        }

        .formatChips {
          display: flex;

          flex-wrap: wrap;

          justify-content: center;

          gap: 8px;

          margin-top: 14px;
        }

        .formatChips .chip {
          background:
            rgba(255,255,255,.88);

          border: 1px solid #cfe4f8;

          color: #315776;

          box-shadow:
            0 4px 12px
              rgba(25,87,135,.07);

          backdrop-filter: blur(8px);
        }

        .btnPrimary {
          background:
            linear-gradient(
              135deg,
              #1785ff 0%,
              #0868da 100%
            );

          box-shadow:
            0 10px 24px
              rgba(20,126,245,.24),
            inset 0 1px 0
              rgba(255,255,255,.25);

          border: 1px solid
            rgba(255,255,255,.18);

          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .btnPrimary:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 14px 30px
              rgba(20,126,245,.30),
            inset 0 1px 0
              rgba(255,255,255,.25);
        }

        .btnSecondary {
          background:
            linear-gradient(
              180deg,
              #ffffff,
              #f6faff
            );

          border: 1px solid #d2e3f3;

          box-shadow:
            0 5px 14px
              rgba(30,80,120,.06);
        }

        .premiumCheckbox {
          appearance: none;

          width: 20px !important;
          height: 20px;

          border-radius: 6px;

          border: 1.5px solid
            #b9d4eb;

          background: #ffffff;

          display: grid;
          place-items: center;

          cursor: pointer;

          transition: .18s ease;

          flex: 0 0 auto;

          margin: 0;
        }

        .premiumCheckbox:hover {
          border-color: #6db0ef;

          box-shadow:
            0 0 0 3px
              rgba(20,126,245,.07);
        }

        .premiumCheckbox:checked {
          background:
            linear-gradient(
              135deg,
              #1785ff,
              #0868da
            );

          border-color: #147ef5;

          box-shadow:
            0 5px 12px
              rgba(20,126,245,.22);
        }

        .premiumCheckbox:checked::after {
          content: "✓";

          color: #fff;

          font-size: 13px;

          font-weight: 900;

          line-height: 1;
        }

        .premiumSizeRow {
          display: grid;

          grid-template-columns:
            1fr 120px;

          gap: 10px;

          margin-top: 12px;
        }

        .premiumSizeRow input,
        .premiumSizeRow select {
          width: 100%;

          padding: 12px 13px;

          border: 1px solid
            var(--border);

          border-radius: 12px;

          background: #fff;

          color: var(--navy);

          outline: none;
        }

        .premiumSizeRow input:focus,
        .premiumSizeRow select:focus {
          border-color: #76b8fa;

          box-shadow:
            0 0 0 3px
              #e9f4ff;
        }

        .thumbnailWrap {
          width: 52px;
          height: 52px;

          flex: 0 0 auto;

          overflow: hidden;

          border-radius: 12px;

          border: 1px solid #cfe4f8;

          background: #f4f8fc;

          box-shadow:
            inset 0 1px 0
              rgba(255,255,255,.9),
            0 5px 13px
              rgba(26,102,159,.08);
        }

        .selectedThumb {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
        }

        .premiumResultGrid {
          display: grid;

          grid-template-columns:
            180px 1fr;

          gap: 18px;

          align-items: center;
        }

        .premiumResultImage {
          width: 100%;
          height: 150px;

          object-fit: contain;

          border-radius: 14px;

          background: #f4f8fc;

          border: 1px solid
            var(--border);

          padding: 8px;
        }

        .premiumResultName {
          font-weight: 850;

          color: var(--navy);

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .premiumResultStats {
          margin-top: 10px;

          display: grid;

          gap: 5px;

          color: var(--muted);

          font-size: 13px;
        }

        /* =========================
           DARK MODE
        ========================= */

        html.dark .premiumKicker {
          background:
            linear-gradient(
              135deg,
              rgba(20,126,245,.15),
              rgba(10,174,235,.08)
            );

          border-color:
            rgba(72,168,240,.24);

          color: #64b6ff;

          box-shadow:
            0 6px 18px
              rgba(0,0,0,.18),
            inset 0 1px 0
              rgba(255,255,255,.04);
        }

        html.dark .headingSource {
          color: #f0f8fc;
        }

        html.dark .headingArrow {
          color: #58a9ff;

          text-shadow:
            0 5px 14px
            rgba(20,126,245,.25);
        }

        html.dark .headingOutput {
          background:
            linear-gradient(
              135deg,
              #58a9ff 0%,
              #31c7ed 45%,
              #52d979 100%
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        html.dark .premiumSizeRow input,
        html.dark .premiumSizeRow select {
          background: #0d2538;

          color: #eaf4fb;

          border-color: #29485f;
        }

        html.dark .premiumCheckbox {
          background: #10283b;

          border-color: #41627b;
        }

        html.dark .thumbnailWrap {
          background: #112f46;

          border-color: #2a536d;
        }

        html.dark .premiumResultName {
          color: #edf6fb;
        }

        html.dark .premiumResultStats {
          color: #91a9ba;
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 700px) {

          .premiumPageTitle {
            font-size: 34px !important;

            letter-spacing:
              -1.2px !important;
          }

          .headingSource,
          .headingOutput {
            letter-spacing:
              -1.2px;
          }

          .headingArrow {
            margin: 0 8px;
          }

          .premiumKicker {
            font-size: 10px;

            padding: 6px 11px;

            letter-spacing:
              .12em;
          }

          .premiumSizeRow {
            grid-template-columns: 1fr;
          }

          .premiumResultGrid {
            grid-template-columns: 1fr;
          }

          .premiumResultImage {
            height: 220px;
          }

          .premiumUploadIcon {
            width: 70px;
            height: 70px;
          }

        }

      `}</style>
    </main>
  );
}