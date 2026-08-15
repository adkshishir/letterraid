"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeistGame from "@/components/heist/HeistGame";
import Lobby from "@/components/Lobby";
import NameGate from "@/components/NameGate";
import RoomHeader from "@/components/RoomHeader";
import SocketStatusToast from "@/components/SocketStatusToast";
import { useRoom } from "@/hooks/useRoom";
import { getStoredDisplayName } from "@/lib/player";
import { lookupRoom } from "@/lib/rooms";
import { useClientValue } from "@/lib/use-client-value";
import type { GameId, Player } from "@/lib/types";
import { GAME_LABELS } from "@/lib/types";

type Lookup =
  | { state: "loading" }
  | { state: "missing" }
  | { state: "found"; game: GameId };

interface GameProps {
  roomCode: string;
  playerId: string | null;
  players: Player[];
}

/**
 * Every game, keyed by id. They all take the same props and all sit behind the
 * lobby — LetterRaid's games are real-time by definition, so there is nothing
 * to do in a room alone. A game that can be played with an empty seat would
 * need routing around this map rather than an entry in it.
 */
const GAMES: Record<GameId, React.ComponentType<GameProps>> = {
  heist: HeistGame,
};

export default function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  const [lookup, setLookup] = useState<Lookup>({ state: "loading" });

  // A returning player already has a name stored; only ask when we don't.
  const storedName = useClientValue(getStoredDisplayName, "");
  const [chosenName, setChosenName] = useState<string | null>(null);
  const displayName = chosenName ?? storedName;

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
  const { status, players, error, playerId, leave, retry } = useRoom(
    game,
    code,
    displayName,
  );

  const handleLeave = () => {
    leave();
    router.push(game ? `/${game}` : "/");
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

  if (!displayName) {
    return (
      <main data-game={game} className="mx-auto w-full max-w-lg px-5 py-16">
        <p className="mb-6 text-center text-sm text-muted">
          Joining a game of {GAME_LABELS[lookup.game]}
        </p>
        <NameGate
          title="What should we call you?"
          submitLabel="Join game"
          onSubmit={setChosenName}
        />
      </main>
    );
  }

  const Game = GAMES[lookup.game];

  return (
    <div data-game={game} className="flex min-h-full flex-col">
      <RoomHeader
        code={code}
        phaseLabel={GAME_LABELS[lookup.game]}
        connected={status !== "error"}
        onLeave={handleLeave}
      />

      <main className="mx-auto w-full max-w-lg flex-1 px-5">
        {status === "error" && error ? (
          <Centered>
            <p className="text-lg font-semibold text-ink">{error.message}</p>
            {/* ROOM_FULL is terminal for this room; everything else is worth
                another try (a dropped socket, a transient name rejection). */}
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
        ) : players.length < 2 ? (
          <Lobby
            game={lookup.game}
            code={code}
            players={players}
            meId={playerId}
          />
        ) : (
          <Game roomCode={code} playerId={playerId} players={players} />
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
