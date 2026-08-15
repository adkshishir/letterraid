"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

/**
 * Resolves the *effective* theme.
 *
 * When the user has made an explicit choice, `ThemeScript` has already put it
 * on <html data-theme>. When they haven't, the attribute is absent and the OS
 * preference is in charge — so we ask the media query rather than assuming.
 */
function resolveTheme(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

// Local subscribers, so a toggle in one component updates every other consumer.
// The OS media query alone can't do this — it doesn't fire for our own writes.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const mq = window.matchMedia(LIGHT_QUERY);
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", onChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    resolveTheme,
    // Dark is the documented default, and matches what an unstyled first paint
    // shows before ThemeScript runs.
    () => "dark" as Theme,
  );

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode — the theme still applies for this session.
    }
    for (const listener of listeners) listener();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolveTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
