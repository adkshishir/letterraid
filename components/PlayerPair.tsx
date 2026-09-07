"use client";

import { Avatar, initials } from "@/components/Avatar";
import type { Player } from "@/lib/types";

/**
 * The pair display: two people, joined by a link — not a "Player 1 / Player 2"
 * roster.
 *
 * Inherited from Cahoots' DESIGN.md pillar 3: even in a head-to-head game the
 * lobby should read as "you two" rather than a Player 1 / Player 2 roster, and
 * the empty seat should feel like someone is expected rather than like a slot
 * to be filled. `TeamRoster` extends this same idea to 2v2.
 */

export default function PlayerPair({
  players,
  meId,
}: {
  players: Player[];
  meId: string | null;
}) {
  const me = players.find((p) => p.id === meId) ?? players[0] ?? null;
  const partner = players.find((p) => p.id !== me?.id) ?? null;
  const waiting = !partner;

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar
          label={me ? initials(me.displayName) : "?"}
          connected={me?.connected ?? false}
        />
        <span className="text-sm font-semibold text-ink">You</span>
      </div>

      {/* The link between them — pulses while a partner is still expected. */}
      <div
        aria-hidden
        className={`h-0.5 w-12 rounded-full ${
          waiting
            ? "animate-pulse-soft bg-border"
            : "bg-[#7c3aed]"}
        }`}
      />

      <div className="flex flex-col items-center gap-2">
        <Avatar
          label={partner ? initials(partner.displayName) : "···"}
          connected={partner?.connected ?? false}
          pending={waiting}
        />
        <span
          className={`text-sm font-semibold ${partner ? "text-ink" : "text-muted"}`}
        >
          {partner
            ? partner.connected
              ? partner.displayName
              : `${partner.displayName} · away`
            : "Waiting…"}
        </span>
      </div>
    </div>
  );
}
