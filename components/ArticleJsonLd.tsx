import { ARTICLES, SITE_URL } from "@/lib/tools";

export default function ArticleJsonLd({ slug }: { slug: string }) {
  const url = `${SITE_URL}/blog/${slug}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: ARTICLES[slug],
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "ImgControl", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "ImgControl",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: ARTICLES[slug], item: url },
      ],
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
