"use client";

import type { Player } from "@/lib/types";

/**
 * The pair display: two people, joined by a link — not a "Player 1 / Player 2"
 * roster.
 *
 * Inherited from Cahoots' DESIGN.md pillar 3: even in a head-to-head game the
 * lobby should read as "you two" rather than a Player 1 / Player 2 roster, and
 * the empty seat should feel like someone is expected rather than like a slot
 * to be filled.
 */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function Avatar({
  label,
  connected,
  pending,
}: {
  label: string;
  connected: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${
        pending
          ? "border-dashed border-border-strong text-muted"
          : connected
            ? // A solid brand fill rather than the vivid gradient: initials are
              // text, and white over the gradient's pink end is only 2.5:1.
              "border-transparent bg-brand text-on-fill"
            : // Disconnected: still present (their seat is held), visibly dimmed.
              "border-border bg-surface text-muted opacity-60"
      }`}
    >
      {label}
    </div>
  );
}

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
            : "bg-gradient-to-r from-brand-vivid to-brand-2-vivid"
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
