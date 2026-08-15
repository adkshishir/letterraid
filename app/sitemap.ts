import type { MetadataRoute } from "next";
import { INDEXABLE_ROUTES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: "monthly" as const,
    // The hub is the entry point; the game pages are equally important to each
    // other, so they share a rank rather than inventing a hierarchy.
    priority: route === "/" ? 1 : 0.8,
  }));
}
