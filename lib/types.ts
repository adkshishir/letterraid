/**
 * The client half of docs/SOCKET_EVENTS.md.
 *
 * Frontend and backend are separate repos with no shared package, so these
 * types are a hand-maintained mirror of `backend/src/rooms/room.types.ts`.
 * Change the doc first, then both sides.
 */

/** Mirrors the backend union — one entry per game LetterRaid serves. */
export type GameId = "heist";

export type RoomErrorCode =
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "INVALID_NAME"
  | "INVALID_CODE"
  | "PROFANITY_REJECTED";

/** "2v2" is fixed-size teams of two, not general N-player support. */
export type RoomMode = "1v1" | "2v2";

export const DEFAULT_ROOM_MODE: RoomMode = "1v1";

export function maxPlayersForMode(mode: RoomMode): number {
  return mode === "2v2" ? 4 : 2;
}

export interface Player {
  id: string;
  displayName: string;
  connected: boolean;
  /** Which side of a 2v2 room (0 or 1) this player is on; null in a 1v1 room. */
  team: number | null;
  /** A matchmaker-seeded bot opponent rather than a real connected player. */
  isBot: boolean;
}

export interface RoomError {
  code: RoomErrorCode;
  message: string;
}

// ── Server -> client payloads ───────────────────────────────────────────────

export interface RoomCreatedPayload {
  roomCode: string;
  players: Player[];
  mode: RoomMode;
}

export interface RoomJoinedPayload {
  roomCode: string;
  players: Player[];
  reconnected: boolean;
  mode: RoomMode;
}

export interface PlayerJoinedPayload {
  player: Player;
  reconnected: boolean;
}

export interface PlayerLeftPayload {
  playerId: string;
  /** True for a dropped connection (seat held), false for a deliberate exit. */
  temporary: boolean;
}

// ── REST ────────────────────────────────────────────────────────────────────

export interface RoomLookup {
  code: string;
  game: GameId;
  playerCount: number;
  joinable: boolean;
  mode: RoomMode;
  maxPlayers: number;
}

export const GAME_LABELS: Record<GameId, string> = {
  heist: "Heist",
};

// ── Heist ───────────────────────────────────────────────────────────────────
//
// Mirrors `backend/src/heist/heist.types.ts`. Heist hides nothing, so there's a
// single state view broadcast to the room rather than one redacted per player.

export type HeistStatus = "playing" | "complete";

export const HEIST_MIN_WORD_LENGTH = 4;
export const HEIST_ROUND_SECONDS = 180;

export interface HeistWordView {
  id: number;
  word: string;
  ownerId: string;
  points: number;
}

export interface HeistScore {
  playerId: string;
  score: number;
  words: number;
  /** Mirrors the player's `team` — null outside a 2v2 room. */
  team: number | null;
}

/** A 2v2 team's combined total. Absent (null on `HeistResult`) in a 1v1 game. */
export interface HeistTeamScore {
  team: number;
  score: number;
  playerIds: string[];
}

export interface HeistResult {
  scores: HeistScore[];
  /** Null on a draw. */
  winnerId: string | null;
  tied: boolean;
  /** Null in a 1v1 game. */
  teamScores: HeistTeamScore[] | null;
  /** Null in a 1v1 game, or on a 2v2 tie. */
  winningTeam: number | null;
}

/**
 * The `heist:game-over` socket payload — `HeistResult` plus the trophy swing
 * from this round. `trophyDeltas` is only present for a match between two
 * logged-in players; a game where the room never resolved to real `Player`
 * rows (anonymous play) finishes without ranking, so the field is absent.
 */
export interface HeistGameOverPayload extends HeistResult {
  trophyDeltas?: Record<string, number> | null;
}

export interface HeistStateView {
  status: HeistStatus;
  pool: string[];
  words: HeistWordView[];
  scores: HeistScore[];
  msRemaining: number | null;
  result: HeistResult | null;
}

export interface HeistClaimedPayload {
  playerId: string;
  word: string;
  points: number;
  type: "pool" | "steal";
  stolenWord: string | null;
  stolenFrom: string | null;
}

/** What a word is worth. Mirrors the server's linear scale. */
export function heistWordPoints(word: string): number {
  return Math.max(0, word.length - (HEIST_MIN_WORD_LENGTH - 1));
}

// ── Shared game-event payloads ──────────────────────────────────────────────

/** Every game's `*:error` payload has this shape. */
export interface GameErrorPayload {
  code: string;
  message: string;
  /** Present only on a `PROFANITY_WARNING` — the entries that tripped it. */
  flagged?: string[];
}
