import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared social card renderer.
 *
 * Uses the DESIGN.md dark palette in every case: link previews render against
 * whatever chat app the reader uses, so a card that adapts to a theme it can't
 * detect would be a coin flip. Dark is the product's default look anyway.
 *
 * ImageResponse renders with Satori, which requires an explicit `display` on
 * every element with more than one child — omitting it throws at build time.
 */
export function renderOgImage({
  title,
  tagline,
  accent,
  eyebrow = "LetterRaid",
}: {
  title: string;
  tagline: string;
  /** Game accent colour, or the brand pink for the hub. */
  accent: string;
  eyebrow?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#16141C",
          padding: "72px 80px",
        }}
      >
        {/* Brand gradient bar, standing in for the logo mark. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 8,
              borderRadius: 999,
              background: "linear-gradient(90deg, #FF7A9C 0%, #8B7CF6 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              color: "#A79FBD",
              letterSpacing: 2,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 800,
              color: accent,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 38,
              color: "#F5F1FA",
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#A79FBD",
          }}
        >
          Two players · no signup · share a room code
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
