"use client";

import { useEffect, useState } from "react";

/**
 * A UX speed bump, not a security control: it blocks the common keyboard
 * shortcuts and right-click, and blanks the screen while a docked DevTools
 * panel looks open. None of this stops a determined user — the browser's own
 * menu still opens DevTools, and every game action is re-validated server
 * side (see HeistService.claim) regardless of what a client sends. This only
 * exists to stop casual poking, not scripted cheating.
 */
const SIZE_GAP_THRESHOLD = 160;

export default function DevToolsGuard() {
  const [suspectedOpen, setSuspectedOpen] = useState(false);

  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const combo =
        key === "f12" ||
        (e.ctrlKey && key === "u") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key));
      if (combo) e.preventDefault();
    };
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    const checkSize = () => {
      const widthGap = window.outerWidth - window.innerWidth > SIZE_GAP_THRESHOLD;
      const heightGap = window.outerHeight - window.innerHeight > SIZE_GAP_THRESHOLD;
      setSuspectedOpen(widthGap || heightGap);
    };

    window.addEventListener("keydown", blockKeys);
    window.addEventListener("contextmenu", blockContextMenu);
    window.addEventListener("resize", checkSize);
    const interval = setInterval(checkSize, 1000);
    checkSize();

    return () => {
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("contextmenu", blockContextMenu);
      window.removeEventListener("resize", checkSize);
      clearInterval(interval);
    };
  }, []);

  if (!suspectedOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b1326] px-6 text-center">
      <p className="text-base font-medium text-white/80">
        Close developer tools to keep playing.
      </p>
    </div>
  );
}
