"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, ArrowLeft, Zap, Swords } from "lucide-react";
import { getPlayerId, getSocket } from "@/lib/socket";
import { DISPLAY_NAME_MAX_LENGTH, getStoredDisplayName, storeDisplayName } from "@/lib/player";
import { useClientValue } from "@/lib/use-client-value";
import type { RoomCreatedPayload, RoomError, RoomMode } from "@/lib/types";
import { DEFAULT_ROOM_MODE } from "@/lib/types";

const ROOM_CODE_LENGTH = 4;

export default function ClanView() {
  const router = useRouter();
  const storedName = useClientValue(getStoredDisplayName, "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [roomMode, setRoomMode] = useState<RoomMode>(DEFAULT_ROOM_MODE);

  const nameRef = useRef<HTMLInputElement>(null);
  const joinRef = useRef<HTMLButtonElement>(null);

  const [seeded, setSeeded] = useState(false);
  if (!seeded && storedName) {
    setSeeded(true);
    setName(storedName);
  }

  useEffect(() => {
    const socket = getSocket("heist");
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
  }, [name, router]);

  const trimmedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();
  const canCreate = !!trimmedName && !busy;
  const canJoin = canCreate && normalizedCode.length === ROOM_CODE_LENGTH;

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
    getSocket("heist").emit("room:create", {
      playerId: getPlayerId(),
      displayName: trimmedName,
      mode: roomMode,
    });
  };

  const handleJoin = () => {
    storeDisplayName(trimmedName);
    router.push(`/room/${normalizedCode}`);
  };

  const reset = () => { setMode("idle"); setError(null); setCode(""); setBusy(false); setRoomMode(DEFAULT_ROOM_MODE); };

  /* ─── IDLE: play with a friend, or peek at what's next ─── */
  if (mode === "idle") {
    return (
      <div className="px-4 max-w-lg mx-auto animate-fade-in">
        <div className="mb-6 pt-2">
          <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            Squads
          </h2>
          <p className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
            Play a private match with a friend
          </p>
        </div>

        <button
          onClick={() => setMode("create")}
          className="w-full glass rounded-2xl p-5 flex items-center gap-4 tap-scale hover:bg-white/[0.04] transition-colors group mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center group-hover:border-[#7c3aed]/40 transition-colors shrink-0">
            <Users size={24} className="text-[#d2bbff]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>Friends</div>
            <div className="text-[10px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-hanken)" }}>
              Create a private room and share the code
            </div>
          </div>
        </button>

        <div className="glass rounded-2xl p-6 flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Users size={20} className="text-[#ccc3d8]/50" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
              Clans are coming soon
            </h3>
            <p className="mt-1 text-xs text-[#ccc3d8]/40 max-w-xs" style={{ fontFamily: "var(--font-hanken)" }}>
              Rosters, invites and squad standings aren&apos;t built yet — for now,
              play with a friend using a private room code above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── CREATE / JOIN / BOTS ─── */
  return (
    <div className="px-4 max-w-sm mx-auto animate-slide-up">
      <button onClick={reset} className="flex items-center gap-2 text-sm text-[#ccc3d8]/60 hover:text-[#d2bbff] transition-colors mb-6 tap-scale" style={{ fontFamily: "var(--font-hanken)" }}>
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
          {mode === "create" ? "Create Room" : "Join Room"}
        </h2>
        <p className="text-sm text-[#ccc3d8]/50 mt-1" style={{ fontFamily: "var(--font-hanken)" }}>
          {mode === "create" ? "Share the code with your friend" : "Enter the code your friend shared"}
        </p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label htmlFor="clan-name" className="block text-[11px] text-[#ccc3d8]/50 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Your Name
        </label>
        <input
          id="clan-name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (mode === "join") { if (canJoin) handleJoin(); }
            else if (canCreate) handleCreate();
          }}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoComplete="nickname"
          placeholder="Enter your name"
          className="w-full rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 px-4 py-3.5 text-[#dae2fd] outline-none placeholder:text-[#ccc3d8]/30 focus:border-[#7c3aed]/60 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all"
          style={{ fontFamily: "var(--font-hanken)" }}
        />
      </div>

      {/* Team size — a joiner inherits whatever the room already is, so this
          choice only exists on the create side. */}
      {mode === "create" && (
        <div className="mb-6">
          <label className="block text-[11px] text-[#ccc3d8]/50 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
            Team Size
          </label>
          <div className="flex rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 p-1">
            {(["1v1", "2v2"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRoomMode(option)}
                aria-pressed={roomMode === option}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all tap-scale ${
                  roomMode === option
                    ? "bg-[#7c3aed] text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]"
                    : "text-[#ccc3d8]/50 hover:text-[#d2bbff]"
                }`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                {option === "1v1" ? "1v1" : "2v2 Teams"}
              </button>
            ))}
          </div>
          {roomMode === "2v2" && (
            <p className="mt-2 text-xs text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
              2v2 pairs you with the next person who joins your code.
            </p>
          )}
        </div>
      )}

      {/* Create */}
      {mode === "create" && (
        <button onClick={handleCreate} disabled={!canCreate} className="w-full rounded-xl bg-[#7c3aed] py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-2 tap-scale" style={{ fontFamily: "var(--font-sora)" }}>
          {busy ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            <><Zap size={18} /> Create Room</>
          )}
        </button>
      )}

      {/* Join */}
      {mode === "join" && (
        <div>
          <label htmlFor="room-code" className="block text-[11px] text-[#ccc3d8]/50 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
            Room Code
          </label>
          <form onSubmit={(e) => { e.preventDefault(); if (canJoin) handleJoin(); }} className="flex gap-3">
            <input
              id="room-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={ROOM_CODE_LENGTH}
              placeholder="ABCD"
              aria-label="Room code"
              autoCapitalize="characters"
              autoComplete="off"
              className="flex-1 rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 px-4 py-3.5 text-center text-xl tracking-[0.4em] text-[#dae2fd] outline-none placeholder:tracking-[0.4em] placeholder:text-[#ccc3d8]/20 focus:border-[#4cd7f6]/60 focus:shadow-[0_0_0_3px_rgba(76,215,246,0.1)] transition-all"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            />
            <button ref={joinRef} type="submit" disabled={!canJoin} className="shrink-0 rounded-xl bg-[#4cd7f6] px-6 py-3.5 text-sm font-bold text-[#003640] shadow-[0_4px_16px_rgba(76,215,246,0.25)] hover:shadow-[0_6px_24px_rgba(76,215,246,0.35)] transition-all disabled:opacity-30 tap-scale" style={{ fontFamily: "var(--font-sora)" }}>
              Join
            </button>
          </form>
        </div>
      )}

      {/* Divider + switch */}
      <div className="flex items-center gap-3 my-6">
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[11px] text-[#ccc3d8]/30" style={{ fontFamily: "var(--font-jetbrains)" }}>OR</span>
        <span className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <button onClick={() => { setMode(mode === "create" ? "join" : "create"); setError(null); }} className="w-full rounded-xl border border-white/[0.06] py-3 text-sm font-medium text-[#ccc3d8]/60 hover:text-[#d2bbff] hover:border-[#7c3aed]/20 transition-all flex items-center justify-center gap-2 tap-scale" style={{ fontFamily: "var(--font-hanken)" }}>
        {mode === "create" ? <><UserPlus size={16} /> Join with Code</> : <><Swords size={16} /> Create Instead</>}
      </button>

      {error && (
        <div className="mt-4 rounded-xl bg-[#ff8a85]/10 border border-[#ff8a85]/20 p-3 animate-slide-up">
          <p className="text-sm text-[#ff8a85] text-center" role="alert" style={{ fontFamily: "var(--font-hanken)" }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
