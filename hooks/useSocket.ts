"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket, type GameNamespace } from "@/lib/socket";

/**
 * Binds a map of event handlers to a game namespace's socket.
 *
 * Handlers are read through a ref at dispatch time, so callers can pass an
 * inline object literal without re-subscribing on every render — while still
 * never invoking a stale closure. (imposter's version froze the handlers from
 * first render via an empty dep array, so any handler reading component state
 * saw the initial values forever.)
 */
export function useSocket(
  namespace: GameNamespace,
  events: Record<string, (...args: never[]) => void>,
) {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);

  // Kept in an effect rather than assigned during render: writing to a ref
  // while rendering is unsafe under concurrent rendering, since a render can be
  // thrown away or replayed. Declared before the subscribe effect so it has
  // already run by the time any listener can fire.
  useEffect(() => {
    eventsRef.current = events;
  });

  const eventNames = Object.keys(events).sort().join(",");

  useEffect(() => {
    const socket = getSocket(namespace);
    socketRef.current = socket;

    const listeners = Object.keys(eventsRef.current).map((name) => {
      const listener = (...args: unknown[]) => {
        // Handlers are declared with `never[]` params so callers can pass
        // precisely-typed callbacks (parameter contravariance); widening here
        // is the cost of that, and is safe because payload shapes are pinned by
        // docs/SOCKET_EVENTS.md on both ends.
        const handler = eventsRef.current[name] as
          | ((...a: unknown[]) => void)
          | undefined;
        handler?.(...args);
      };
      socket.on(name, listener);
      return [name, listener] as const;
    });

    return () => {
      for (const [name, listener] of listeners) socket.off(name, listener);
    };
    // Re-subscribe only when the namespace or the *set* of event names changes,
    // not when handler identities do.
  }, [namespace, eventNames]);

  return socketRef;
}
