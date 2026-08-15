"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Share2, Copy, CheckCircle2, X, QrCode, Link as LinkIcon } from "lucide-react";
import { useClientValue } from "@/lib/use-client-value";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
  /** Overrides the default `${origin}/room/${code}` link. */
  roomUrl?: string;
  /** Shown in the native share sheet. */
  shareTitle?: string;
}

export default function ShareModal({
  open,
  onClose,
  code,
  roomUrl,
  shareTitle = "LetterRaid",
}: ShareModalProps) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  // navigator.share doesn't exist during SSR, so it can't be read during render
  // without desyncing hydration.
  const canNativeShare = useClientValue(() => !!navigator.share, false);

  // Reset to the button list whenever the modal is reopened. Adjusting state
  // during render (rather than in an effect) avoids rendering one frame of the
  // previous view — see react.dev "You Might Not Need an Effect".
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setShowQr(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const url =
    roomUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/room/${code}`
      : "");

  const copyToClipboard = useCallback((type: "url" | "code", text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  if (typeof document === "undefined" || !open) return null;

  const buttonBase =
    "pressable flex w-full items-center gap-3 rounded-md border border-border px-4 py-3.5 text-sm font-semibold";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-surface-raised shadow-[var(--shadow-lg)] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-accent" />
            <span id="share-title" className="text-sm font-semibold text-ink">
              Invite your partner
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="pressable rounded-full p-2 text-muted hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          {!showQr ? (
            <>
              <button
                onClick={() => copyToClipboard("url", url)}
                className={`${buttonBase} ${copied === "url" ? "bg-success text-on-fill" : "bg-surface text-ink"}`}
              >
                {copied === "url" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <LinkIcon size={16} />
                )}
                {copied === "url" ? "Link copied!" : "Copy room link"}
              </button>

              <button
                onClick={() => copyToClipboard("code", code)}
                className={`${buttonBase} ${copied === "code" ? "bg-success text-on-fill" : "bg-surface text-ink"}`}
              >
                {copied === "code" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Copy size={16} />
                )}
                {copied === "code" ? "Code copied!" : "Copy room code"}
              </button>

              <button
                onClick={() => setShowQr(true)}
                className={`${buttonBase} bg-surface text-ink`}
              >
                <QrCode size={16} />
                Show QR code
              </button>

              {canNativeShare && (
                <button
                  onClick={() => {
                    navigator.share({ title: shareTitle, url }).catch(() => {});
                  }}
                  className={`${buttonBase} justify-center border-transparent bg-brand text-on-fill`}
                >
                  <Share2 size={16} />
                  Share
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* QR stays on a white plate in both themes — scanners need the
                  light/dark contrast to run the right way round. */}
              <div className="rounded-md bg-white p-4">
                <QRCodeCanvas
                  value={url}
                  size={220}
                  bgColor="#FFFFFF"
                  fgColor="#16141C"
                  level="M"
                />
              </div>

              <button
                onClick={() => setShowQr(false)}
                className={`${buttonBase} justify-center bg-surface text-ink`}
              >
                Back
              </button>

              <p className="text-center font-mono text-xs text-muted">
                Room code: <span className="font-bold text-ink">{code}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
