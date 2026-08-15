/** Canonical site origin, used for metadata, sitemap and robots URLs. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4041";

/**
 * Routes that are static, public, and worth indexing.
 *
 * SEO.md's rule: marketing/explainer routes are indexed; gameplay routes
 * (`/room/*`) are not. Room codes must never be enumerated here — they're
 * ephemeral and private to a pair.
 */
export const INDEXABLE_ROUTES = ["/", "/heist"] as const;
