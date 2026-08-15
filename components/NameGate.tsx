"use client";

import { useState } from "react";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/player";

/**
 * Asks for a display name before joining. Kept as its own screen so the room
 * page never has to render a half-joined state while it waits for a name.
 */
export default function NameGate({
  title,
  submitLabel = "Continue",
  onSubmit,
  initialName = "",
}: {
  title: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
  initialName?: string;
}) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed) onSubmit(trimmed);
      }}
    >
      <label className="text-sm font-semibold text-ink" htmlFor="display-name">
        {title}
      </label>
      <input
        id="display-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        autoComplete="nickname"
        placeholder="Your name"
        className="w-full rounded-md border border-border-strong bg-surface px-4 py-3 text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      <button
        type="submit"
        disabled={!trimmed}
        className="pressable w-full rounded-full bg-brand py-3 text-sm font-semibold text-on-fill disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  );
}
