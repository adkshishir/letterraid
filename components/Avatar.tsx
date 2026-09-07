"use client";

/**
 * The "person as a circle of initials" look shared by the 1v1 pair view
 * (`PlayerPair`) and the 2v2 team roster (`TeamRoster`), so the two don't
 * drift apart as one gets tweaked.
 */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({
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
