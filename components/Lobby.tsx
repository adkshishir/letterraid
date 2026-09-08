"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import PlayerPair from "@/components/PlayerPair";
import TeamRoster from "@/components/TeamRoster";
import ShareModal from "@/components/ShareModal";
import type { GameId, Player, RoomMode } from "@/lib/types";
import { GAME_LABELS, maxPlayersForMode } from "@/lib/types";

/**
 * The waiting room, shown until the room is full.
 *
 * Scoring and competitive framing are deliberately absent here (DESIGN.md):
 * this screen's whole job is "your people are on the way".
 */
export default function Lobby({
  game,
  code,
  players,
  meId,
  mode,
  onPickTeam,
}: {
  game: GameId;
  code: string;
  players: Player[];
  meId: string | null;
  /** Null for the brief window before the server's `room:joined` confirms it. */
  mode: RoomMode | null;
  /** Lets the local player choose their `"2v2"` team; ignored otherwise. */
  onPickTeam?: (team: number) => void;
}) {
  const [showShare, setShowShare] = useState(false);
  const maxPlayers = mode ? maxPlayersForMode(mode) : 2;
  const waiting = players.length < maxPlayers;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {mode === "2v2" ? (
        <TeamRoster
          players={players}
          meId={meId}
          onPickTeam={waiting ? onPickTeam : undefined}
        />
      ) : (
        <PlayerPair players={players} meId={meId} />
      )}

      {waiting ? (
        <>
          <div className="text-center">
            <p className="text-sm text-muted">
              Send them this code to start playing {GAME_LABELS[game]}.
            </p>
            <p className="mt-4 select-all font-mono text-4xl font-bold tracking-[0.3em] text-accent">
              {code}
            </p>
          </div>

          <button
            onClick={() => setShowShare(true)}
            className="pressable flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-on-fill"
          >
            <Share2 size={16} />
            {mode === "2v2" ? "Invite more players" : "Invite your partner"}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="text-lg font-semibold text-ink">
            {mode === "2v2" ? "Everyone's here." : "You're both here."}
          </p>
          <p className="mt-2 text-sm text-muted">Starting {GAME_LABELS[game]}…</p>
        </div>
      )}

      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        code={code}
        shareTitle={`Play ${GAME_LABELS[game]} on LetterRaid`}
      />
    </div>
  );
}
