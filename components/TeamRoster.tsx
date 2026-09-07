"use client";

import { Avatar, initials } from "@/components/Avatar";
import type { Player } from "@/lib/types";

/**
 * The 2v2 lobby view: two clusters of two seats, "Team A" vs "Team B".
 *
 * Same principle as `PlayerPair` (see its comment): an empty seat should read
 * as a teammate who's expected, not a slot waiting to be filled, so a missing
 * seat gets the same dashed, pending `Avatar` rather than being omitted.
 */
export default function TeamRoster({
  players,
  meId,
}: {
  players: Player[];
  meId: string | null;
}) {
  const me = players.find((p) => p.id === meId) ?? null;
  const myTeam = me?.team ?? 0;

  const teamA = players.filter((p) => p.team === 0);
  const teamB = players.filter((p) => p.team === 1);

  return (
    <div className="flex items-start justify-center gap-6">
      <Team
        label="Team A"
        players={teamA}
        meId={meId}
        highlight={myTeam === 0}
      />
      <div aria-hidden className="mt-6 h-16 w-px bg-border" />
      <Team
        label="Team B"
        players={teamB}
        meId={meId}
        highlight={myTeam === 1}
      />
    </div>
  );
}

function Team({
  label,
  players,
  meId,
  highlight,
}: {
  label: string;
  players: Player[];
  meId: string | null;
  highlight: boolean;
}) {
  // Always render two seats — a real one for whoever's here, a pending one
  // for whoever isn't, in the same slot on every screen.
  const seats: (Player | null)[] = [players[0] ?? null, players[1] ?? null];

  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className={`text-xs font-semibold uppercase tracking-widest ${
          highlight ? "text-accent" : "text-muted"
        }`}
      >
        {label}
        {highlight && " (you)"}
      </span>
      <div className="flex gap-3">
        {seats.map((player, i) => {
          const isMe = player?.id === meId;
          const label = player
            ? isMe
              ? "You"
              : player.connected
                ? player.displayName
                : `${player.displayName} · away`
            : "Waiting…";
          return (
            <div key={player?.id ?? `empty-${i}`} className="flex flex-col items-center gap-2">
              <Avatar
                label={player ? initials(player.displayName) : "···"}
                connected={player?.connected ?? false}
                pending={!player}
              />
              <span
                className={`text-xs font-semibold ${player ? "text-ink" : "text-muted"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
