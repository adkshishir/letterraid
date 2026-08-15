"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerId, getSocket } from "@/lib/socket";
import {
  DISPLAY_NAME_MAX_LENGTH,
  getStoredDisplayName,
  storeDisplayName,
} from "@/lib/player";
import { useClientValue } from "@/lib/use-client-value";
import type { GameId, RoomCreatedPayload, RoomError } from "@/lib/types";
import { GAME_LABELS } from "@/lib/types";

const ROOM_CODE_LENGTH = 4;

export default function CreateJoinPanel({ game }: { game: GameId }) {
  const router = useRouter();

  // Prefill from localStorage without a setState-in-effect round trip.
  const storedName = useClientValue(getStoredDisplayName, "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const joinRef = useRef<HTMLButtonElement>(null);

  // `storedName` resolves after hydration, so seed the field once it lands
  // without clobbering anything already typed.
  const [seeded, setSeeded] = useState(false);
  if (!seeded && storedName) {
    setSeeded(true);
    setName(storedName);
  }

  useEffect(() => {
    const socket = getSocket(game);

    const onCreated = ({ roomCode }: RoomCreatedPayload) => {
      storeDisplayName(name.trim());
      router.push(`/room/${roomCode}`);
    };
    const onError = (payload: RoomError) => {
      setBusy(false);
      setError(payload.message);
    };

    socket.on("room:created", onCreated);
    socket.on("room:error", onError);
    return () => {
      socket.off("room:created", onCreated);
      socket.off("room:error", onError);
    };
  }, [game, name, router]);

  const trimmedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();
  const canCreate = !!trimmedName && !busy;
  const canJoin = canCreate && normalizedCode.length === ROOM_CODE_LENGTH;
  // A code in the box means they were sent one. From that moment joining is the
  // action they came for, and starting a fresh room is the one that would strand
  // their partner in a room nobody else is in.
  const joining = normalizedCode.length > 0;

  // Once the code is complete, move to whatever is actually left: the name if
  // it's still blank, otherwise Join itself, so Enter finishes the job. Done in
  // an effect rather than in the change handler because the button is still
  // disabled — and unfocusable — until the new code has rendered.
  const codeWasComplete = useRef(false);
  useEffect(() => {
    const complete = normalizedCode.length === ROOM_CODE_LENGTH;
    if (complete === codeWasComplete.current) return;
    codeWasComplete.current = complete;
    if (complete) (trimmedName ? joinRef : nameRef).current?.focus();
  }, [normalizedCode, trimmedName]);

  const handleCreate = () => {
    setBusy(true);
    setError(null);
    getSocket(game).emit("room:create", {
      playerId: getPlayerId(),
      displayName: trimmedName,
    });
  };

  const handleJoin = () => {
    storeDisplayName(trimmedName);
    // The room page does the actual join — it has to resolve the game from the
    // code first anyway, and routing here keeps one join path for links too.
    router.push(`/room/${normalizedCode}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-semibold text-ink">
          What should we call you?
        </label>
        <input
          id="name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            // Whichever button is the primary one right now — never the other,
            // so Enter can't start a room when a code is sitting in the box.
            if (joining) {
              if (canJoin) handleJoin();
            } else if (canCreate) {
              handleCreate();
            }
          }}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoComplete="nickname"
          placeholder="Your name"
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-3 text-ink outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={!canCreate}
        className={`pressable w-full rounded-full py-3.5 text-sm disabled:opacity-40 ${
          joining
            ? "border border-border font-semibold text-muted"
            : "bg-accent font-bold text-on-fill"
        }`}
      >
        {busy ? "Creating…" : `Start a ${GAME_LABELS[game]} game`}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-widest text-muted">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (canJoin) handleJoin();
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={ROOM_CODE_LENGTH}
          placeholder="CODE"
          aria-label="Room code"
          autoCapitalize="characters"
          autoComplete="off"
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-ink outline-none placeholder:tracking-normal placeholder:text-muted focus:border-accent"
        />
        <button
          ref={joinRef}
          type="submit"
          disabled={!canJoin}
          className={`pressable shrink-0 rounded-md px-5 text-sm disabled:opacity-40 ${
            joining
              ? "bg-accent font-bold text-on-fill"
              : "border border-border font-semibold text-ink"
          }`}
        >
          Join
        </button>
      </form>

      {error && (
        <p role="alert" className="text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
