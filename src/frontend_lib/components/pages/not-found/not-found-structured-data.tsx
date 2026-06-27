/**
 * JSON-LD structured data for the 404 page.
 * Helps search engines understand this is an error page within the PeopleBoard site.
 */

interface NotFoundStructuredDataProps {
  title: string;
  description: string;
}

export function NotFoundStructuredData({
  title,
  description,
}: NotFoundStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "PeopleBoard",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
