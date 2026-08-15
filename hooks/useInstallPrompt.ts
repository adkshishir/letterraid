"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useClientValue } from "@/lib/use-client-value";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STANDALONE_QUERY = "(display-mode: standalone)";

function isStandalone(): boolean {
  return (
    window.matchMedia(STANDALONE_QUERY).matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function subscribeToInstalled(onChange: () => void): () => void {
  const mq = window.matchMedia(STANDALONE_QUERY);
  mq.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const isInstalled = useSyncExternalStore(
    subscribeToInstalled,
    isStandalone,
    () => false,
  );

  const isIos = useClientValue(
    () => /iphone|ipad|ipod/i.test(navigator.userAgent),
    false,
  );

  useEffect(() => {
    // setState here is inside an event callback, not the effect body — this is
    // the "subscribe to an external system" shape effects are meant for.
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  }, [deferredPrompt]);

  return {
    // Native install prompt is available (Chrome/Edge, Android + desktop).
    canPromptInstall: !!deferredPrompt,
    // Safari doesn't fire beforeinstallprompt — needs manual instructions.
    isIos,
    isInstalled,
    promptInstall,
  };
}
