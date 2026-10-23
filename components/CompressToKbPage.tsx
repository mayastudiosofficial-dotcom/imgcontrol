import OptimizerClient from "@/components/OptimizerClient";
import ToolSeoContent from "@/components/ToolSeoContent";
import { kbSlug } from "@/lib/moreTools";

/** The page body shared by the "Compress image to N KB" tools. */
export default function CompressToKbPage({ kb }: { kb: number }) {
  return (
    <>
      <section className="pageHead">
        <div className="container">
          <div className="kicker">ImgControl · Compress</div>

          <h1>Compress Image to {kb} KB</h1>

          <p>
            Add a photo, signature or scan and get it down to {kb} KB or less. The size is already set for you.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <OptimizerClient mode="compress" presetKb={kb} />
      </section>

      <ToolSeoContent slug={kbSlug(kb)} />
    </>
  );
}
