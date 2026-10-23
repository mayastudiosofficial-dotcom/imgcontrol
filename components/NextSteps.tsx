import Link from "next/link";

type Step = { href: string; label: string };

function stepsFor(output: string): Step[] {
  const out = output.toLowerCase();
  const steps: Step[] = [
    { href: "/image-compressor", label: "Compress it further" },
    { href: "/image-resizer", label: "Resize it" },
    { href: "/image-cropper", label: "Crop it" },
  ];

  if (out !== "pdf") steps.push({ href: "/image-to-pdf", label: "Combine into a PDF" });
  if (out !== "webp" && out !== "avif") steps.push({ href: "/jpg-to-webp", label: "Convert to WebP" });
  if (out === "webp" || out === "avif") steps.push({ href: "/webp-to-jpg", label: "Make a JPG copy" });

  return steps;
}

/** Links shown under a finished conversion. No state, so it is cheap to render. */
export default function NextSteps({ outputLabel }: { outputLabel: string }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>What next?</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {stepsFor(outputLabel).map((s) => (
          <Link key={s.href} href={s.href} className="chip" style={{ textDecoration: "none" }}>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
