import { FixedConverterClient } from "@/components/FixedConverterClient";
import ToolSeoContent from "@/components/ToolSeoContent";

type Props = {
  slug: string;
  sourceLabel: string;
  outputLabel: string;
  outputMime: string;
  accept: string;
  title?: string;
  description?: string;
};

export default function DedicatedImageConverterPage({
  slug,
  sourceLabel,
  outputLabel,
  outputMime,
  accept,
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

      <ToolSeoContent slug={slug} />
    </>
  );
}
