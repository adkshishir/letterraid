import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "LetterRaid — real-time word games you play against someone";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "LETTERRAID",
    title: "Word games with a thief in them.",
    tagline: "Grab words off the table — and steal the ones they took.",
    accent: "#FF7A9C",
  });
}
