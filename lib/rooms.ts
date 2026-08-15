import type { RoomLookup } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4042";

/**
 * Resolves which game a room code belongs to.
 *
 * Share links are short (`/room/ABCD`) and don't name the game, so the room
 * page has to ask before it knows which socket namespace to open.
 * Returns null for an unknown or malformed code.
 */
export async function lookupRoom(code: string): Promise<RoomLookup | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/rooms/${encodeURIComponent(code)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as RoomLookup;
  } catch {
    // Backend unreachable — treated the same as "not found" by callers, which
    // then show the join screen rather than a hard error.
    return null;
  }
}
