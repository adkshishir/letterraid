"use client";

import { ArrowLeft, Share2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import ShareModal from "@/components/ShareModal";
import ThemeToggle from "@/components/ThemeToggle";

interface RoomHeaderProps {
  code: string;
  /** e.g. "Heist", "Round 3". */
  phaseLabel?: string;
  connected?: boolean;
  onLeave?: () => void;
  /**
   * Slims the header to a mostly-transparent strip so it stops competing for
   * attention during an active turn.
   */
  compact?: boolean;
}

export default function RoomHeader({
  code,
  phaseLabel,
  connected = true,
  onLeave,
  compact = false,
}: RoomHeaderProps) {
  const [showShare, setShowShare] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ease-out ${
          compact
            ? "border-b-0 bg-bg/75 backdrop-blur-md"
            : "border-b border-border bg-surface"
        }`}
      >
        <div
          className={`mx-auto flex max-w-lg items-center justify-between gap-3 px-4 transition-[height] duration-300 ease-out ${
            compact ? "h-10" : "h-14"
          }`}
        >
          {onLeave ? (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="pressable flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink"
              aria-label="Leave room"
            >
              <ArrowLeft size={14} />
              {!compact && "Back"}
            </button>
          ) : (
            <div />
          )}

          <div className="flex min-w-0 items-center gap-3">
            <span className="select-all font-mono text-sm font-bold tracking-widest text-ink">
              {code}
            </span>

            {!compact && (
              <>
                <button
                  onClick={() => setShowShare(true)}
                  className="pressable flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink animate-fade-in"
                >
                  <Share2 size={14} />
                  Invite
                </button>

                {phaseLabel && (
                  <span className="shrink-0 truncate text-xs text-muted animate-fade-in">
                    {phaseLabel}
                  </span>
                )}
              </>
            )}

            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                connected ? "bg-success" : "bg-danger animate-pulse-soft"
              }`}
              role="status"
              aria-label={connected ? "Connected" : "Disconnected"}
            />

            {/* Reachable mid-game: the light/dark switch is most wanted when
                someone picks the game up in bed, not on the landing page. */}
            {!compact && <ThemeToggle />}
          </div>
        </div>
      </header>

      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        code={code}
      />

      <ConfirmModal
        open={showLeaveConfirm}
        title="Leave room?"
        message="You'll drop out of this game. Your partner will be told you left."
        confirmLabel="Leave room"
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onLeave?.();
        }}
      />
    </>
  );
}
