"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Zap,
  Swords,
  Crown,
  LogOut,
  X,
  Trophy,
  Loader2,
  Bot,
} from "lucide-react";
import { getPlayerId, getSocket } from "@/lib/socket";
import { useAuth } from "@/components/AuthProvider";
import {
  ClanDetail,
  ClanSummary,
  createClan,
  fetchMyClan,
  joinClan,
  kickMember,
  leaveClan,
  listClans,
} from "@/lib/clans";
import { listClanTournaments, TournamentSummary } from "@/lib/tournaments";
import { BOT_TIERS, BotTier, startPracticeMatch } from "@/lib/practice";
import type { RoomCreatedPayload, RoomError, RoomMode } from "@/lib/types";
import { DEFAULT_ROOM_MODE } from "@/lib/types";

const ROOM_CODE_LENGTH = 4;

export default function ClanView() {
  const [tab, setTab] = useState<"clan" | "friends" | "practice">("clan");

  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6 pt-2">
        <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
          Squads
        </h2>
        <p className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Your clan, a friend match, or a bot to warm up against
        </p>
      </div>

      <div className="flex mb-6 rounded-xl border border-white/[0.06] bg-[#171f33]/60 p-1">
        {(["clan", "friends", "practice"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all tap-scale ${
              tab === t ? "bg-[#7c3aed] text-white" : "text-[#ccc3d8]/50 hover:text-[#d2bbff]"
            }`}
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t === "clan" ? "Clan" : t === "friends" ? "Friends" : "Practice"}
          </button>
        ))}
      </div>

      {tab === "clan" ? <ClanHub /> : tab === "friends" ? <FriendsPanel /> : <PracticeHub />}
    </div>
  );
}

// ── Practice (bots) ──────────────────────────────────────────────────────

function PracticeHub() {
  const router = useRouter();
  const [busyTier, setBusyTier] = useState<BotTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = async (tier: BotTier) => {
    if (busyTier) return;
    setBusyTier(tier);
    setError(null);
    try {
      const { roomCode } = await startPracticeMatch(tier);
      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start practice match");
      setBusyTier(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
        No trophies at stake — pick a bot and jump straight in.
      </p>

      {error && (
        <div className="rounded-xl bg-[#ff8a85]/10 border border-[#ff8a85]/20 p-3">
          <p className="text-sm text-[#ff8a85] text-center" style={{ fontFamily: "var(--font-hanken)" }}>
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {BOT_TIERS.map(({ tier, label, blurb }) => (
          <button
            key={tier}
            onClick={() => handlePlay(tier)}
            disabled={busyTier !== null}
            className="glass rounded-2xl p-4 flex items-center gap-4 tap-scale hover:bg-white/[0.04] transition-colors disabled:opacity-50 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-[#d2bbff]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
                {label}
              </div>
              <div className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-hanken)" }}>
                {blurb}
              </div>
            </div>
            {busyTier === tier ? (
              <Loader2 size={18} className="text-[#7c3aed] animate-spin shrink-0" />
            ) : (
              <Swords size={16} className="text-[#ccc3d8]/30 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Clan hub ─────────────────────────────────────────────────────────────

function ClanHub() {
  const [clan, setClan] = useState<ClanDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetchMyClan()
      .then(setClan)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load clan"));
  };

  useEffect(load, []);

  if (clan === undefined) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 size={24} className="text-[#7c3aed] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-[#ff8a85]/10 border border-[#ff8a85]/20 p-3">
          <p className="text-sm text-[#ff8a85] text-center" style={{ fontFamily: "var(--font-hanken)" }}>
            {error}
          </p>
        </div>
      )}
      {clan ? (
        <ClanDetailView clan={clan} onChanged={load} onError={setError} />
      ) : (
        <NoClanView onJoined={load} onError={setError} />
      )}
    </div>
  );
}

function NoClanView({
  onJoined,
  onError,
}: {
  onJoined: () => void;
  onError: (msg: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [clans, setClans] = useState<ClanSummary[] | null>(null);

  useEffect(() => {
    listClans().then(setClans).catch(() => setClans([]));
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    onError(null);
    try {
      await createClan(name.trim());
      onJoined();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create clan");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (id: string) => {
    onError(null);
    try {
      await joinClan(id);
      onJoined();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to join clan");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#dae2fd] mb-3" style={{ fontFamily: "var(--font-sora)" }}>
          Start a clan
        </h3>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            maxLength={24}
            placeholder="Clan name"
            className="flex-1 rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 px-4 py-3 text-[#dae2fd] outline-none placeholder:text-[#ccc3d8]/30 focus:border-[#7c3aed]/60 transition-all"
            style={{ fontFamily: "var(--font-hanken)" }}
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || busy}
            className="shrink-0 rounded-xl bg-[#7c3aed] px-5 text-sm font-bold text-white disabled:opacity-30 tap-scale"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : "Create"}
          </button>
        </div>
      </div>

      <div>
        <h3
          className="text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Top clans
        </h3>
        {clans === null ? (
          <div className="py-8 flex justify-center">
            <Loader2 size={20} className="text-[#7c3aed] animate-spin" />
          </div>
        ) : clans.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-sm text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
              No clans yet — be the first to start one.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {clans.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#222a3d] flex items-center justify-center border border-white/[0.06] shrink-0">
                  <span className="text-xs font-bold text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-sora)" }}>
                    {c.name[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#dae2fd] truncate" style={{ fontFamily: "var(--font-hanken)" }}>
                    {c.name}
                  </div>
                  <div className="text-[11px] text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {c.memberCount}/50 · {c.totalTrophies.toLocaleString()} 🏆
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(c.id)}
                  className="shrink-0 rounded-lg border border-[#7c3aed]/40 px-3 py-1.5 text-xs font-bold text-[#d2bbff] hover:bg-[#7c3aed]/10 tap-scale"
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClanDetailView({
  clan,
  onChanged,
  onError,
}: {
  clan: ClanDetail;
  onChanged: () => void;
  onError: (msg: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const isLeader = clan.myRole === "LEADER";

  const handleLeave = async () => {
    if (busy) return;
    setBusy(true);
    onError(null);
    try {
      await leaveClan();
      onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to leave clan");
    } finally {
      setBusy(false);
    }
  };

  const handleKick = async (playerId: string) => {
    onError(null);
    try {
      await kickMember(clan.id, playerId);
      onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
              {clan.name}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-[#ccc3d8]/50" style={{ fontFamily: "var(--font-jetbrains)" }}>
              <span>{clan.memberCount}/50 members</span>
              <span className="flex items-center gap-1">
                <Trophy size={11} /> {clan.totalTrophies.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            disabled={busy}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-[#ff8a85]/30 px-3 py-1.5 text-xs font-bold text-[#ff8a85] hover:bg-[#ff8a85]/10 disabled:opacity-40 tap-scale"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            <LogOut size={12} />
            Leave
          </button>
        </div>
      </div>

      <div>
        <h3
          className="text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Roster
        </h3>
        <div className="space-y-1.5">
          {clan.roster.map((m) => (
            <div
              key={m.playerId}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#222a3d] flex items-center justify-center border border-white/[0.06] shrink-0">
                <span className="text-xs font-bold text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-sora)" }}>
                  {m.displayName[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                {m.role === "LEADER" && <Crown size={13} className="text-[#FFD700] shrink-0" fill="currentColor" />}
                <span className="text-sm text-[#dae2fd] truncate" style={{ fontFamily: "var(--font-hanken)" }}>
                  {m.displayName}
                </span>
              </div>
              <span className="text-xs text-[#ccc3d8]/60 shrink-0" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {m.trophies.toLocaleString()}
              </span>
              {isLeader && m.role !== "LEADER" && (
                <button
                  onClick={() => handleKick(m.playerId)}
                  className="shrink-0 text-[#ccc3d8]/30 hover:text-[#ff8a85] transition-colors tap-scale"
                  aria-label={`Remove ${m.displayName}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ClanTournaments clanId={clan.id} />
    </div>
  );
}

function ClanTournaments({ clanId }: { clanId: string }) {
  const [tournaments, setTournaments] = useState<TournamentSummary[] | null>(null);

  useEffect(() => {
    listClanTournaments(clanId).then(setTournaments).catch(() => setTournaments([]));
  }, [clanId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Clan tournaments
        </h3>
        <Link
          href={`/tournament?clanId=${clanId}`}
          className="text-xs font-bold text-[#d2bbff] hover:text-[#dae2fd] tap-scale"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          + Host one
        </Link>
      </div>
      {tournaments === null ? (
        <div className="py-6 flex justify-center">
          <Loader2 size={18} className="text-[#7c3aed] animate-spin" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-sm text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
            No tournaments running for this clan yet.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournament/${t.code}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#dae2fd] truncate" style={{ fontFamily: "var(--font-hanken)" }}>
                  {t.name}
                </div>
                <div className="text-[11px] text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {t.memberCount}/{t.maxMembers} joined
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  t.status === "OPEN"
                    ? "bg-[#5ce0a0]/10 text-[#5ce0a0]"
                    : "bg-white/[0.04] text-[#ccc3d8]/40"
                }`}
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {t.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Friends (private room) ──────────────────────────────────────────────

function FriendsPanel() {
  const router = useRouter();
  const { player } = useAuth();
  const displayName = player?.displayName ?? "Player";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [roomMode, setRoomMode] = useState<RoomMode>(DEFAULT_ROOM_MODE);

  const joinRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const socket = getSocket("heist");
    const onCreated = ({ roomCode }: RoomCreatedPayload) => {
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
  }, [router]);

  const normalizedCode = code.trim().toUpperCase();
  const canCreate = !busy;
  const canJoin = normalizedCode.length === ROOM_CODE_LENGTH;

  const codeWasComplete = useRef(false);
  useEffect(() => {
    const complete = normalizedCode.length === ROOM_CODE_LENGTH;
    if (complete === codeWasComplete.current) return;
    codeWasComplete.current = complete;
    if (complete) joinRef.current?.focus();
  }, [normalizedCode]);

  const handleCreate = () => {
    setBusy(true);
    setError(null);
    getSocket("heist").emit("room:create", {
      playerId: getPlayerId(),
      displayName,
      mode: roomMode,
    });
  };

  const handleJoin = () => {
    router.push(`/room/${normalizedCode}`);
  };

  const reset = () => { setMode("idle"); setError(null); setCode(""); setBusy(false); setRoomMode(DEFAULT_ROOM_MODE); };

  /* ─── IDLE: play with a friend ─── */
  if (mode === "idle") {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setMode("create")}
          className="w-full glass rounded-2xl p-5 flex items-center gap-4 tap-scale hover:bg-white/[0.04] transition-colors group"
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
      </div>
    );
  }

  /* ─── CREATE / JOIN ─── */
  return (
    <div className="animate-slide-up">
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
              2v2 pairs you with the next people who join your code — you can
              pick a team once you&apos;re in the lobby.
            </p>
          )}
        </div>
      )}

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
