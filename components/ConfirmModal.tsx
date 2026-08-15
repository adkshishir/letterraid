"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Leave game?",
  message = "Your progress in this round will be lost.",
  confirmLabel = "Leave",
  cancelLabel = "Stay",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-lg border border-border bg-surface-raised p-6 shadow-[var(--shadow-lg)] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-title"
          className="text-center text-lg font-semibold text-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={`pressable w-full rounded-full py-3 text-sm font-semibold ${
              destructive
                ? "bg-danger text-on-fill"
                : "bg-brand text-on-fill"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="pressable w-full rounded-full border border-border py-3 text-sm font-semibold text-ink"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
