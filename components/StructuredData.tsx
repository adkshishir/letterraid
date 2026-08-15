import { SITE_URL } from "@/lib/site";

/**
 * schema.org JSON-LD for the marketing pages (SEO.md).
 *
 * Deliberately minimal — `WebApplication` with the game category is what search
 * engines can actually do something with here. No FAQPage or BreadcrumbList:
 * marking up content that doesn't exist is how a site earns a structured-data
 * penalty rather than a rich result.
 */
export default function StructuredData({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  /** Route path, e.g. "/heist". Use "/" for the hub. */
  path: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript.",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    numberOfPlayers: { "@type": "QuantitativeValue", minValue: 2, maxValue: 2 },
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built from literals above, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
