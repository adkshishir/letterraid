import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Note the absence of a `Disallow: /room/`.
 *
 * An earlier draft blocked it, which was self-defeating in two ways:
 *
 * 1. `noindex` on the room page can only work if a crawler is allowed to fetch
 *    the page and read it. A disallowed URL is never fetched, so the directive
 *    is never seen — a blocked page can still end up indexed from inbound links.
 * 2. Social scrapers (facebookexternalhit, Twitterbot, Slack) honour robots.txt.
 *    Blocking `/room/` would kill the link-preview card on exactly the channels
 *    where LetterRaid spreads, which SEO.md identifies as the main growth loop.
 *
 * So: crawling is allowed, and `/room/[code]` carries `noindex, nofollow` in its
 * own metadata. That keeps rooms out of search results while letting a shared
 * link render a proper preview.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
