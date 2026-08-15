"use client";

interface RoundTimerProps {
  secondsLeft: number;
  /** Total round length, used to decide when to switch to the warning colour. */
  totalSeconds: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * mm:ss countdown. Used by Heist's 3-minute round clock (docs/RULES.md).
 */
export default function RoundTimer({
  secondsLeft,
  totalSeconds,
  label,
  size = "md",
}: RoundTimerProps) {
  const clamped = Math.max(0, secondsLeft);
  const mm = String(Math.floor(clamped / 60)).padStart(2, "0");
  const ss = String(clamped % 60).padStart(2, "0");

  // Warn in the last quarter of the round (and always in the last 10s, so short
  // rounds still get a warning window).
  const isLow = clamped <= Math.max(10, totalSeconds * 0.25);

  const digitClass =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-4xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 ${
          isLow ? "animate-pulse-soft" : ""
        }`}
      >
        <span
          className={`font-mono font-bold tabular-nums leading-none ${digitClass} ${
            isLow ? "text-warning" : "text-ink"
          }`}
          // Announce only at the very end — a per-second live region would
          // spam screen readers for the whole round.
          aria-live={clamped <= 5 ? "assertive" : "off"}
        >
          {mm}:{ss}
        </span>
      </div>
      {label && (
        <span className="text-xs uppercase tracking-widest text-muted">
          {label}
        </span>
      )}
    </div>
  );
}
