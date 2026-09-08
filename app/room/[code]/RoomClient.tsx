"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeistGame from "@/components/heist/HeistGame";
import Lobby from "@/components/Lobby";
import RoomHeader from "@/components/RoomHeader";
import SocketStatusToast from "@/components/SocketStatusToast";
import { useRoom } from "@/hooks/useRoom";
import { getStoredDisplayName } from "@/lib/player";
import { lookupRoom } from "@/lib/rooms";
import { useClientValue } from "@/lib/use-client-value";
import type { GameId, Player } from "@/lib/types";
import { GAME_LABELS, maxPlayersForMode } from "@/lib/types";

type Lookup =
  | { state: "loading" }
  | { state: "missing" }
  | { state: "found"; game: GameId };

interface GameProps {
  roomCode: string;
  playerId: string | null;
  players: Player[];
  /** Leaves the room and returns to the homepage. */
  onGoHome: () => void;
  /** Reports whether the round is actively being played — see `HeistGame`. */
  onPhaseChange?: (playing: boolean) => void;
}

const GAMES: Record<GameId, React.ComponentType<GameProps>> = {
  heist: HeistGame,
};

export default function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  const [lookup, setLookup] = useState<Lookup>({ state: "loading" });

  // Name is always from storage — set once at login, never asked again
  const displayName = useClientValue(getStoredDisplayName, "Player");

  useEffect(() => {
    let cancelled = false;
    lookupRoom(code).then((result) => {
      if (cancelled) return;
      setLookup(
        result ? { state: "found", game: result.game } : { state: "missing" },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const game = lookup.state === "found" ? lookup.game : null;
  const { status, players, error, playerId, mode, leave, retry, setTeam } =
    useRoom(game, code, displayName);
  // Falls back to 2 (1v1's size) for the brief window before `room:joined`
  // has told us the room's actual mode.
  const maxPlayers = mode ? maxPlayersForMode(mode) : 2;

  // While a round is actively being played, the header (back button, invite,
  // room code) gets out of the way entirely — nothing should tempt someone
  // to leave, or clutter the screen, mid-race. It reappears for the lobby
  // and the result screen.
  const [playing, setPlaying] = useState(false);
  const handlePhaseChange = useCallback((next: boolean) => setPlaying(next), []);

  const handleLeave = () => {
    leave();
    router.push(game ? `/${game}` : "/");
  };

  // Distinct from `handleLeave` (which returns to this game's own landing
  // page): "Back to Home" from the result screen always goes to "/", the
  // same destination the room-not-found/room-full states already link to.
  const handleGoHome = () => {
    leave();
    router.push("/");
  };

  if (lookup.state === "loading") {
    return <Centered>Looking for room {code}…</Centered>;
  }

  if (lookup.state === "missing") {
    return (
      <Centered>
        <p className="text-lg font-semibold text-ink">
          No room with the code {code}.
        </p>
        <p className="mt-2 text-sm text-muted">
          It may have expired, or the code may be mistyped.
        </p>
        <Link
          href="/"
          className="pressable mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-on-fill"
        >
          Back to LetterRaid
        </Link>
      </Centered>
    );
  }

  const Game = GAMES[lookup.game];

  return (
    <div data-game={game} className="flex min-h-full flex-col">
      {!playing && (
        <RoomHeader
          code={code}
          phaseLabel={GAME_LABELS[lookup.game]}
          connected={status !== "error"}
          onLeave={handleLeave}
        />
      )}

      <main className="mx-auto w-full max-w-lg flex-1 px-5">
        {status === "error" && error ? (
          <Centered>
            <p className="text-lg font-semibold text-ink">{error.message}</p>
            {error.code === "ROOM_FULL" ? (
              <Link
                href="/"
                className="pressable mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-on-fill"
              >
                Back to LetterRaid
              </Link>
            ) : (
              <button
                onClick={retry}
                className="pressable mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-on-fill"
              >
                Try again
              </button>
            )}
          </Centered>
        ) : status === "joining" ? (
          <Centered>Joining…</Centered>
        ) : players.length < maxPlayers ? (
          <Lobby
            game={lookup.game}
            code={code}
            players={players}
            meId={playerId}
            mode={mode}
            onPickTeam={setTeam}
          />
        ) : (
          <Game
            roomCode={code}
            playerId={playerId}
            players={players}
            onGoHome={handleGoHome}
            onPhaseChange={handlePhaseChange}
          />
        )}
      </main>

      <SocketStatusToast namespace={lookup.game} />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-24 text-center text-muted">
      {children}
    </main>
  );
}
