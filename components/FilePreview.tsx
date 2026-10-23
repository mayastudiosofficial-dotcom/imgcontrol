"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { makeThumbnail } from "@/lib/thumbnail";

/**
 * Preview of a file the visitor has just selected, before anything is converted.
 * Works for HEIC and PDF too, which browsers cannot draw by themselves. While
 * the preview is being prepared (or if none can be made) a small box with the
 * file type is shown in its place, so the row never looks broken.
 */
export default function FilePreview({
  file,
  alt,
  className,
  style,
}: {
  file: File;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "none">("loading");

  useEffect(() => {
    let alive = true;
    let objectUrl = "";
    setState("loading");
    setUrl("");

    makeThumbnail(file)
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setState("ready");
      })
      .catch(() => alive && setState("none"));

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (state === "ready") {
    return <img className={`${className ?? ""} filePreview`} src={url} alt={alt ?? `Preview of ${file.name}`} style={style} />;
  }

  const extension = (file.name.match(/\.([^.]+)$/)?.[1] ?? "file").toUpperCase().slice(0, 5);

  return (
    <div
      className={`${className ?? ""} filePreviewPending`}
      aria-busy={state === "loading"}
      style={{
        ...style,
        display: "grid",
        placeItems: "center",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".04em",
        opacity: state === "loading" ? 0.6 : 0.85,
        background: "rgba(120, 150, 180, .18)",
        overflow: "hidden",
      }}
    >
      {state === "loading" ? "…" : extension}
    </div>
  );
}
