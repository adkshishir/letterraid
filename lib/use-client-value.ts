"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only value (a capability check, a platform sniff) without
 * breaking hydration.
 *
 * The obvious `useState` + `useEffect` version trips React's
 * `set-state-in-effect` rule and causes a second render pass on every mount.
 * `useSyncExternalStore` is the supported primitive for "value that lives
 * outside React": it returns `serverValue` during SSR and the real snapshot on
 * the client, in one pass.
 *
 * `getSnapshot` must return a primitive (or a cached reference) — returning a
 * fresh object each call makes React re-render forever.
 */
export function useClientValue<T>(getSnapshot: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => serverValue);
}
