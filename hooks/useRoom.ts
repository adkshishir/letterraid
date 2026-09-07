"use client";

import { useCallback, useEffect, useState } from "react";
import { getPlayerId, getSocket } from "@/lib/socket";
import { storeDisplayName } from "@/lib/player";
import { useClientValue } from "@/lib/use-client-value";
import type {
  GameId,
  Player,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  RoomError,
  RoomJoinedPayload,
  RoomMode,
} from "@/lib/types";

export type RoomStatus = "joining" | "in-room" | "error";

interface UseRoomResult {
  status: RoomStatus;
  players: Player[];
  error: RoomError | null;
  /** The local player's id, so callers can tell "you" from "them". */
  playerId: string | null;
  /** Null until the first `room:joined` lands. */
  mode: RoomMode | null;
  leave: () => void;
  retry: () => void;
}

/**
 * Joins a room and tracks its roster.
 *
 * Joining is idempotent by design: the server keys players on the persisted
 * `playerId`, so this hook can emit `room:join` on every mount and on every
 * reconnect without risking a duplicate seat. That's what makes a refresh, a
 * navigation, or a dropped phone connection all recover on their own.
 */
export function useRoom(
  /** Null until the room's game has been resolved from its code. */
  game: GameId | null,
  roomCode: string,
  displayName: string,
): UseRoomResult {
  const [status, setStatus] = useState<RoomStatus>("joining");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<RoomError | null>(null);
  const [mode, setMode] = useState<RoomMode | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Render-relevant (it's what distinguishes "you" from your partner), so it
  // belongs in the render path rather than a ref. getPlayerId is stable after
  // its first call — it persists to localStorage — so it's a safe snapshot.
  const playerId = useClientValue<string | null>(getPlayerId, null);

  useEffect(() => {
    // Nothing to join until we know the game and have a name to join under.
    if (!game || !displayName || !playerId) return;

    const socket = getSocket(game);

    const join = () => {
      socket.emit("room:join", { roomCode, playerId, displayName });
    };

    const onJoined = (payload: RoomJoinedPayload) => {
      setPlayers(payload.players);
      setMode(payload.mode);
      setError(null);
      setStatus("in-room");
      if (displayName) storeDisplayName(displayName);
    };

    const onPlayerJoined = ({ player }: PlayerJoinedPayload) => {
      setPlayers((current) => {
        const existing = current.findIndex((p) => p.id === player.id);
        if (existing === -1) return [...current, player];
        // A returning player — replace in place so the roster order (and so the
        // on-screen position of each person) stays stable.
        const next = [...current];
        next[existing] = player;
        return next;
      });
    };

    const onPlayerLeft = ({ playerId: goneId, temporary }: PlayerLeftPayload) => {
      setPlayers((current) =>
        temporary
          ? // Seat is held — keep them listed, greyed out as disconnected.
            current.map((p) =>
              p.id === goneId ? { ...p, connected: false } : p,
            )
          : current.filter((p) => p.id !== goneId),
      );
    };

    const onError = (payload: RoomError) => {
      setError(payload);
      setStatus("error");
    };

    socket.on("room:joined", onJoined);
    socket.on("room:player-joined", onPlayerJoined);
    socket.on("room:player-left", onPlayerLeft);
    socket.on("room:error", onError);
    // Re-join after a reconnect: the server dropped our socket binding, and the
    // room is only re-entered by asking.
    socket.on("connect", join);

    join();

    return () => {
      socket.off("room:joined", onJoined);
      socket.off("room:player-joined", onPlayerJoined);
      socket.off("room:player-left", onPlayerLeft);
      socket.off("room:error", onError);
      socket.off("connect", join);
    };
  }, [game, roomCode, displayName, attempt, playerId]);

  const leave = useCallback(() => {
    if (!game || !playerId) return;
    getSocket(game).emit("room:leave", { roomCode, playerId });
  }, [game, roomCode, playerId]);

  const retry = useCallback(() => {
    setError(null);
    setStatus("joining");
    setAttempt((n) => n + 1);
  }, []);

  return { status, players, error, playerId, mode, leave, retry };
}
