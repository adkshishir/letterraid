import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "Heist — the word-stealing race on LetterRaid";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "LETTERRAID",
    title: "Heist",
    tagline: "Grab words off the table. Steal theirs before the clock stops.",
    accent: "#FF9B6B",
  });
}
