import { lookupRoom } from "@/lib/rooms";
import { GAME_LABELS } from "@/lib/types";
import type { GameId } from "@/lib/types";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "You've been invited to a game on LetterRaid";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Typed as full records so adding a game to `GameId` fails the build here
// rather than shipping an invite card with an undefined colour on it.
const ACCENTS: Record<GameId, string> = {
  heist: "#FF9B6B",
};

const TAGLINES: Record<GameId, string> = {
  heist: "Three minutes, a table of letters, and nothing that stays yours.",
};

/**
 * The link-preview card for a shared room.
 *
 * SEO.md calls this the highest-leverage item on the site: almost every player
 * arrives through a room link pasted into a chat app, and this card is what
 * they see at that moment.
 *
 * It deliberately carries no puzzle content and no player names. The room
 * lookup endpoint doesn't expose names on purpose (room codes are four
 * characters and guessable), and no game state may appear here — the preview
 * is generated before the recipient has played anything.
 */
export default async function Image({
  // Next 16: params is a Promise in image-generating routes.
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const room = await lookupRoom(code);

  if (!room) {
    // Expired room, or the backend is unreachable. A generic card still
    // previews correctly — far better than a broken image in the chat thread.
    return renderOgImage({
      eyebrow: "LETTERRAID",
      title: "Word games with a thief in them.",
      tagline: "Grab words off the table — and steal the ones they took.",
      accent: "#FF7A9C",
    });
  }

  return renderOgImage({
    eyebrow: `LETTERRAID · ROOM ${room.code}`,
    title: `A game of ${GAME_LABELS[room.game]}`,
    tagline: TAGLINES[room.game],
    accent: ACCENTS[room.game],
  });
}
