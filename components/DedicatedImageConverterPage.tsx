import { FixedConverterClient } from "@/components/FixedConverterClient";

type Props = {
  sourceLabel: string;
  outputLabel: string;
  outputMime: string;
  accept: string;
  title: string;
  description: string;
};

export default function DedicatedImageConverterPage({
  sourceLabel,
  outputLabel,
  outputMime,
  accept,
  title,
  description,
}: Props) {
  return (
    <>
      <FixedConverterClient
        sourceLabel={sourceLabel}
        outputLabel={outputLabel}
        outputMime={outputMime}
        accept={accept}
        inputText={sourceLabel}
        outputText={outputLabel}
      />

      <section className="section jpgPngSeoSection">
        <div className="jpgPngSeoWrap">
          <div className="card jpgPngSeoCard">
            <h2>{title}</h2>
            <p>{description}</p>

            <h3>How to convert {sourceLabel} to {outputLabel}</h3>
            <p>
              Upload one or more {sourceLabel} images, optionally enable the maximum output size setting, and click “Convert to {outputLabel}”. Your converted files will appear below the converter and can be downloaded individually or together as a ZIP file.
            </p>

            <h3>Frequently Asked Questions</h3>

            <div className="jpgPngFaq">
              <details className="jpgPngFaqItem">
                <summary>Can I convert multiple images at once?</summary>
                <p>Yes. ImgControl supports batch conversion of up to 30 files at a time.</p>
              </details>

              <details className="jpgPngFaqItem">
                <summary>Can I set a maximum output size?</summary>
                <p>Yes. Enable “Set maximum output size” and enter a target in KB or MB. The converter tries to approach that target without artificially enlarging the output.</p>
              </details>

              <details className="jpgPngFaqItem">
                <summary>Do my images get uploaded?</summary>
                <p>The core conversion workflow runs directly in your browser, so your selected images are processed locally for the conversion.</p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
