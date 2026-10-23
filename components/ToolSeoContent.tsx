import Link from "next/link";
import RecentTools from "@/components/RecentTools";
import {
  ARTICLES,
  SITE_URL,
  getExtrasRelated,
  getToolContent,
  toolName,
} from "@/lib/tools";

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function schemas(slug: string, name: string, description: string, withFaq?: { q: string; a: string }[]) {
  const url = `${SITE_URL}/${slug}`;
  const list: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      url,
      description,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "All Tools", item: `${SITE_URL}/tools` },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
  ];
  if (withFaq) {
    list.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: withFaq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return list;
}

function RelatedLinks({ slugs, articles }: { slugs: string[]; articles?: string[] }) {
  return (
    <>
      <h3>Related tools</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
        {slugs.map((s) => (
          <Link key={s} href={`/${s}`} className="chip" style={{ textDecoration: "none" }}>
            {toolName(s)}
          </Link>
        ))}
      </div>
      {articles && articles.length > 0 && (
        <>
          <h3>Learn more</h3>
          <p>
            {articles.map((a, i) => (
              <span key={a}>
                {i > 0 && " · "}
                <Link href={`/blog/${a}`}>{ARTICLES[a]}</Link>
              </span>
            ))}
          </p>
        </>
      )}
    </>
  );
}

/**
 * Server-rendered SEO content for a tool page. Reuses the existing
 * `jpgPng*` card classes, so no visual design is introduced.
 */
export default function ToolSeoContent({ slug }: { slug: string }) {
  const content = getToolContent(slug);

  if (!content) {
    const related = getExtrasRelated(slug);
    if (!related) return null;
    const name = toolName(slug);
    return (
      <>
        <JsonLd data={schemas(slug, name, `Free browser-based ${name} tool.`)} />
        <section className="section jpgPngSeoSection">
          <div className="jpgPngSeoWrap">
            <div className="card jpgPngSeoCard">
              <RelatedLinks slugs={related} />
              <RecentTools current={slug} />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <JsonLd data={schemas(slug, content.name, content.description, content.faqs)} />
      <section className="section jpgPngSeoSection">
        <div className="jpgPngSeoWrap">
          <div className="card jpgPngSeoCard">
            <h2>{content.name}</h2>
            {content.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h3>{content.stepsTitle}</h3>
            <p>{content.steps}</p>

            <h3>{content.extraTitle}</h3>
            {content.extra.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h3>Frequently Asked Questions</h3>
            <div className="jpgPngFaq">
              {content.faqs.map((f) => (
                <details className="jpgPngFaqItem" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>

            <RelatedLinks slugs={content.related} articles={content.articles} />
            <RecentTools current={slug} />
          </div>
        </div>
      </section>
    </>
  );
}
