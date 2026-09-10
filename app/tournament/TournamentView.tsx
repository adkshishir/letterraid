"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, Users, Clock } from "lucide-react";
import {
  TOURNAMENT_DURATIONS_MIN,
  TOURNAMENT_SIZES,
  TournamentDurationMin,
  TournamentSize,
  TournamentSummary,
  createTournament,
  joinTournament,
  listMyTournaments,
  listOpenTournaments,
} from "@/lib/tournaments";
import { fetchClan, ClanDetail } from "@/lib/clans";

const DURATION_LABEL: Record<TournamentDurationMin, string> = {
  30: "30 min",
  60: "1 hour",
  120: "2 hours",
};

export default function TournamentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clanId = searchParams.get("clanId");

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [mine, setMine] = useState<TournamentSummary[] | null>(null);
  const [open, setOpen] = useState<TournamentSummary[] | null>(null);
  // Arriving via "Host one" from a clan (?clanId=…) opens the form pre-expanded.
  const [showCreate, setShowCreate] = useState(() => !!clanId);
  const [joinCode, setJoinCode] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyTournaments().then(setMine).catch(() => setMine([]));
    listOpenTournaments().then(setOpen).catch(() => setOpen([]));
  }, []);

  useEffect(() => {
    if (!clanId) return;
    fetchClan(clanId).then(setClan).catch(() => setClan(null));
  }, [clanId]);

  const handleJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || joinBusy) return;
    setJoinBusy(true);
    setError(null);
    try {
      await joinTournament(code);
      router.push(`/tournament/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join tournament");
      setJoinBusy(false);
    }
  };

  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6 pt-2">
        <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
          Tournaments
        </h2>
        <p className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Pick a size and a clock, then battle the field
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-[#ff8a85]/10 border border-[#ff8a85]/20 p-3">
          <p className="text-sm text-[#ff8a85] text-center" style={{ fontFamily: "var(--font-hanken)" }}>
            {error}
          </p>
        </div>
      )}

      {/* My tournaments */}
      {mine && mine.length > 0 && (
        <div className="mb-8">
          <h3
            className="text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            My tournaments
          </h3>
          <TournamentList tournaments={mine} />
        </div>
      )}

      {/* Create */}
      <div className="glass rounded-2xl p-5 mb-8">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="w-full flex items-center gap-4 tap-scale"
        >
          <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center shrink-0">
            <Trophy size={24} className="text-[#d2bbff]" />
          </div>
          <div className="text-left flex-1">
            <div className="text-sm font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
              {clan ? `Host a tournament for ${clan.name}` : "Host a tournament"}
            </div>
            <div className="text-[10px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-hanken)" }}>
              Choose a size and a countdown
            </div>
          </div>
        </button>

        {showCreate && (
          <CreateTournamentForm
            clanId={clanId}
            onCreated={(t) => router.push(`/tournament/${t.code}`)}
            onError={setError}
          />
        )}
      </div>

      {/* Join by code */}
      <div className="glass rounded-2xl p-5 mb-8">
        <h3 className="text-sm font-bold text-[#dae2fd] mb-3" style={{ fontFamily: "var(--font-sora)" }}>
          Join with a code
        </h3>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") handleJoinByCode(); }}
            maxLength={6}
            placeholder="CODE"
            aria-label="Tournament code"
            autoCapitalize="characters"
            autoComplete="off"
            className="flex-1 rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 px-4 py-3 text-center text-lg tracking-[0.3em] text-[#dae2fd] outline-none placeholder:tracking-normal placeholder:text-[#ccc3d8]/20 focus:border-[#4cd7f6]/60 transition-all"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          />
          <button
            onClick={handleJoinByCode}
            disabled={joinCode.trim().length < 4 || joinBusy}
            className="shrink-0 rounded-xl bg-[#4cd7f6] px-5 text-sm font-bold text-[#003640] disabled:opacity-30 tap-scale"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {joinBusy ? <Loader2 size={16} className="animate-spin" /> : "Join"}
          </button>
        </div>
      </div>

      {/* Browse public */}
      <div>
        <h3
          className="text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Open tournaments
        </h3>
        {open === null ? (
          <div className="py-8 flex justify-center">
            <Loader2 size={20} className="text-[#7c3aed] animate-spin" />
          </div>
        ) : open.length === 0 ? (
          <div className="glass rounded-2xl p-8 flex flex-col items-center text-center gap-2">
            <Trophy size={24} className="text-[#ccc3d8]/30" />
            <p className="text-sm text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
              Nothing open right now — start one above.
            </p>
          </div>
        ) : (
          <TournamentList tournaments={open} />
        )}
      </div>
    </div>
  );
}

function TournamentList({ tournaments }: { tournaments: TournamentSummary[] }) {
  return (
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
            <div
              className="flex items-center gap-3 text-[11px] text-[#ccc3d8]/40 mt-0.5"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <span className="flex items-center gap-1"><Users size={11} /> {t.memberCount}/{t.maxMembers}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {t.endsAt ? <Countdown endsAt={t.endsAt} /> : "Not started"}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ${
              t.status === "OPEN"
                ? "bg-[#5ce0a0]/10 text-[#5ce0a0]"
                : t.status === "LOBBY"
                ? "bg-[#f6c945]/10 text-[#f6c945]"
                : "bg-white/[0.04] text-[#ccc3d8]/40"
            }`}
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {t.status}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = new Date(endsAt).getTime() - now;
  if (remainingMs <= 0) return <span>Ended</span>;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return (
    <span>
      {h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`}
    </span>
  );
}

function CreateTournamentForm({
  clanId,
  onCreated,
  onError,
}: {
  clanId: string | null;
  onCreated: (t: { code: string }) => void;
  onError: (msg: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [size, setSize] = useState<TournamentSize>(10);
  const [duration, setDuration] = useState<TournamentDurationMin>(30);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    onError(null);
    try {
      const t = await createTournament({
        name: name.trim(),
        maxMembers: size,
        durationMin: duration,
        clanId,
      });
      onCreated(t);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create tournament");
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-5 animate-slide-up">
      <div>
        <label className="block text-[11px] text-[#ccc3d8]/50 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Friday Night Raid"
          className="w-full rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 px-4 py-3 text-[#dae2fd] outline-none placeholder:text-[#ccc3d8]/30 focus:border-[#7c3aed]/60 transition-all"
          style={{ fontFamily: "var(--font-hanken)" }}
        />
      </div>

      <div>
        <label className="block text-[11px] text-[#ccc3d8]/50 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Members
        </label>
        <div className="flex rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 p-1">
          {TOURNAMENT_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSize(n)}
              aria-pressed={size === n}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all tap-scale ${
                size === n ? "bg-[#7c3aed] text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]" : "text-[#ccc3d8]/50 hover:text-[#d2bbff]"
              }`}
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#ccc3d8]/50 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Duration
        </label>
        <div className="flex rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 p-1">
          {TOURNAMENT_DURATIONS_MIN.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              aria-pressed={duration === d}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all tap-scale ${
                duration === d ? "bg-[#7c3aed] text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]" : "text-[#ccc3d8]/50 hover:text-[#d2bbff]"
              }`}
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {DURATION_LABEL[d]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || busy}
        className="w-full rounded-xl bg-[#7c3aed] py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-2 tap-scale"
        style={{ fontFamily: "var(--font-sora)" }}
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <>Start Tournament</>}
      </button>
    </div>
  );
}
