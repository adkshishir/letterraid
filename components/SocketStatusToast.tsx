"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getSocket, type GameNamespace } from "@/lib/socket";

/**
 * Shows a toast whenever the game socket isn't connected.
 *
 * Connection state is read straight off the socket via `useSyncExternalStore`
 * rather than mirrored into `useState`. That matters beyond lint compliance: a
 * mirrored copy is wrong for the window between the socket dropping and this
 * component mounting, which is exactly when a player navigates mid-outage.
 */
export default function SocketStatusToast({
  namespace,
}: {
  namespace: GameNamespace;
}) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const socket = getSocket(namespace);
      socket.on("connect", onChange);
      socket.on("disconnect", onChange);
      socket.on("connect_error", onChange);
      return () => {
        socket.off("connect", onChange);
        socket.off("disconnect", onChange);
        socket.off("connect_error", onChange);
      };
    },
    [namespace],
  );

  const connected = useSyncExternalStore(
    subscribe,
    () => getSocket(namespace).connected,
    // Never render the toast during SSR — it would flash on every page load.
    () => true,
  );

  if (connected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-slide-up"
    >
      <div className="flex items-center gap-2.5 rounded-full bg-danger px-5 py-2.5 shadow-[var(--shadow-md)]">
        <span className="h-2 w-2 rounded-full bg-on-fill animate-pulse-soft" />
        <span className="text-xs font-semibold text-on-fill">Reconnecting…</span>
      </div>
    </div>
  );
}
