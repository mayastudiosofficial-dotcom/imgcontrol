"use client";

import { useEffect, useState } from "react";

/**
 * A preview of a finished image. It is built from the real output blob, so
 * what the visitor sees is exactly what they will download. Click to enlarge.
 */
export default function ResultThumb({
  blob,
  alt,
  size,
}: {
  blob: Blob;
  alt: string;
  size?: number;
}) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!url) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge preview of ${alt}`}
        style={{ padding: 0, border: 0, background: "none", cursor: "zoom-in", flex: "none", lineHeight: 0 }}
      >
        <img
          className="thumb resultThumb"
          src={url}
          alt={alt}
          style={size ? { width: size, height: size } : undefined}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${alt}`}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(5, 12, 20, 0.82)",
            cursor: "zoom-out",
          }}
        >
          <img
            src={url}
            alt={alt}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, background: "#fff" }}
          />
        </div>
      )}
    </>
  );
}
