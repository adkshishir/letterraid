"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import type {
  GameErrorPayload,
  HeistClaimedPayload,
  HeistResult,
  HeistStateView,
} from "@/lib/types";

/** How long a bounced claim stays on screen before it clears itself. */
const ERROR_TTL_MS = 2200;

export interface HeistGame {
  state: HeistStateView | null;
  /** The claim that just landed, for the board's flash of movement. */
  lastClaim: HeistClaimedPayload | null;
  gameOver: HeistResult | null;
  /** Keyed so the same message twice in a row still re-triggers the shake. */
  error: { message: string; key: number } | null;
  claim: (word: string) => void;
  restart: () => void;
}

/**
 * Heist game state over the socket.
 *
 * The errors here are part of play rather than exceptions — a bounced claim is
 * just a word that didn't work — so they expire on their own instead of
 * waiting for a dismissal nobody has a spare hand for mid-race.
 */
export function useHeistGame(
  roomCode: string,
  playerId: string | null,
): HeistGame {
  const [state, setState] = useState<HeistStateView | null>(null);
  const [lastClaim, setLastClaim] = useState<HeistClaimedPayload | null>(null);
  const [gameOver, setGameOver] = useState<HeistResult | null>(null);
  const [error, setError] = useState<{ message: string; key: number } | null>(
    null,
  );

  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playerId) return;
    const socket = getSocket("heist");

    const onState = (next: HeistStateView) => setState(next);
    const onClaimed = (payload: HeistClaimedPayload) => setLastClaim(payload);
    const onGameOver = (payload: HeistResult) => setGameOver(payload);

    const onError = (payload: GameErrorPayload) => {
      setError({ message: payload.message, key: Date.now() });
      if (errorTimer.current) clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => setError(null), ERROR_TTL_MS);
    };

    const onRestarted = () => {
      setGameOver(null);
      setLastClaim(null);
      setError(null);
    };

    socket.on("heist:state", onState);
    socket.on("heist:claimed", onClaimed);
    socket.on("heist:game-over", onGameOver);
    socket.on("heist:restarted", onRestarted);
    socket.on("heist:error", onError);

    const requestState = () =>
      socket.emit("heist:request-state", { roomCode, playerId });
    socket.on("connect", requestState);
    requestState();

    return () => {
      socket.off("heist:state", onState);
      socket.off("heist:claimed", onClaimed);
      socket.off("heist:game-over", onGameOver);
      socket.off("heist:restarted", onRestarted);
      socket.off("heist:error", onError);
      socket.off("connect", requestState);
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, [roomCode, playerId]);

  const claim = useCallback(
    (word: string) => {
      if (!playerId) return;
      getSocket("heist").emit("heist:claim", { roomCode, playerId, word });
    },
    [roomCode, playerId],
  );

  const restart = useCallback(() => {
    if (!playerId) return;
    getSocket("heist").emit("heist:restart", { roomCode, playerId });
  }, [roomCode, playerId]);

  return { state, lastClaim, gameOver, error, claim, restart };
}
