"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, Trophy, Users, Clock, Loader2, X, Share2, Play } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  TournamentDetail,
  dequeueTournamentMatch,
  enqueueTournamentMatch,
  fetchTournament,
  getTournamentActiveMatch,
  joinTournament,
  startTournament,
} from "@/lib/tournaments";
import { Countdown } from "../TournamentView";

const POLL_MS = 2500;

export default function TournamentRoomClient({ code }: { code: string }) {
  const router = useRouter();
  const { player } = useAuth();
  const [detail, setDetail] = useState<TournamentDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const redirectedRef = useRef(false);

  // Used by click handlers (not the polling effect below, which inlines its
  // own `.then()` chain instead of calling this — a function that calls a
  // setState setter directly in its body trips `set-state-in-effect` when
  // invoked straight from an effect).
  const refresh = useCallback(async () => {
    try {
      const d = await fetchTournament(code);
      setDetail(d);
    } catch (err) {
      setDetail(null);
      setError(err instanceof Error ? err.message : "Tournament not found");
    }
  }, [code]);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      fetchTournament(code)
        .then((d) => {
          if (!cancelled) setDetail(d);
        })
        .catch((err) => {
          if (cancelled) return;
          setDetail(null);
          setError(err instanceof Error ? err.message : "Tournament not found");
        });

      getTournamentActiveMatch(code)
        .then(({ match }) => {
          if (cancelled || !match || redirectedRef.current) return;
          redirectedRef.current = true;
          router.push(`/room/${match.roomCode}`);
        })
        .catch(() => {
          // Best effort — next tick tries again.
        });
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code, router]);

  const handleFindMatch = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!detail?.isParticipant) {
        await joinTournament(code);
        await refresh();
      }
      setSearching(true);
      await enqueueTournamentMatch(code);
    } catch (err) {
      setSearching(false);
      setError(err instanceof Error ? err.message : "Failed to join the queue");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelSearch = async () => {
    setSearching(false);
    try {
      await dequeueTournamentMatch(code);
    } catch {
      // Best effort.
    }
  };

  const handleStart = async () => {
    setError(null);
    setBusy(true);
    try {
      await startTournament(code);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start tournament");
    } finally {
      setBusy(false);
    }
  };

  if (detail === undefined) {
    return (
      <div className="px-4 max-w-lg mx-auto py-16 flex justify-center">
        <Loader2 size={24} className="text-[#7c3aed] animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="px-4 max-w-lg mx-auto py-16 text-center">
        <p className="text-lg font-semibold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
          {error ?? "No tournament with that code."}
        </p>
        <Link
          href="/tournament"
          className="mt-6 inline-block rounded-full bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white tap-scale"
        >
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const isLobby = detail.status === "LOBBY";
  const isOpen = detail.status === "OPEN";
  const isHost = detail.creatorId === player?.id;

  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
              {detail.name}
            </h2>
            <div
              className="flex items-center gap-3 text-[11px] text-[#ccc3d8]/40 mt-1"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <span className="flex items-center gap-1"><Users size={11} /> {detail.memberCount}/{detail.maxMembers}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />{" "}
                {isLobby ? "Not started" : detail.endsAt && isOpen ? <Countdown endsAt={detail.endsAt} /> : "Ended"}
              </span>
              {detail.clanName && <span>{detail.clanName}</span>}
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(detail.code).catch(() => {})}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-bold text-[#ccc3d8]/60 hover:text-[#d2bbff] tap-scale"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <Share2 size={12} />
            {detail.code}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-[#ff8a85]/10 border border-[#ff8a85]/20 p-3">
          <p className="text-sm text-[#ff8a85] text-center" style={{ fontFamily: "var(--font-hanken)" }}>
            {error}
          </p>
        </div>
      )}

      {isLobby ? (
        <div className="glass rounded-2xl p-5 mb-8 flex flex-col items-center text-center gap-3">
          {isHost ? (
            <>
              <button
                onClick={handleStart}
                disabled={busy || detail.memberCount < 2}
                className="w-full rounded-xl bg-[#7c3aed] py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all disabled:opacity-30 flex items-center justify-center gap-2 tap-scale"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Play size={16} />
                    Start Tournament
                  </>
                )}
              </button>
              <p className="text-xs text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
                {detail.memberCount < 2
                  ? "Need at least 2 players joined before you can start."
                  : `Start now with ${detail.memberCount} of ${detail.maxMembers} joined, or wait for more to trickle in.`}
              </p>
            </>
          ) : (
            <>
              <Clock size={24} className="text-[#7c3aed]/50" />
              <p className="text-sm text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-hanken)" }}>
                Waiting for the host to start the tournament…
              </p>
              <p className="text-xs text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
                {detail.memberCount}/{detail.maxMembers} joined so far.
              </p>
            </>
          )}
        </div>
      ) : isOpen ? (
        <div className="glass rounded-2xl p-5 mb-8 flex flex-col items-center text-center gap-3">
          {searching ? (
            <>
              <Loader2 size={28} className="text-[#7c3aed] animate-spin" />
              <p className="text-sm text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-hanken)" }}>
                Looking for an opponent…
              </p>
              <button
                onClick={handleCancelSearch}
                className="flex items-center gap-1.5 text-xs text-[#ccc3d8]/50 hover:text-[#ff8a85] tap-scale"
                style={{ fontFamily: "var(--font-hanken)" }}
              >
                <X size={14} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleFindMatch}
                disabled={busy}
                className="w-full rounded-xl bg-[#7c3aed] py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all disabled:opacity-30 flex items-center justify-center gap-2 tap-scale"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Swords size={16} />
                    {detail.isParticipant ? "Find Match" : "Join & Find Match"}
                  </>
                )}
              </button>
              <p className="text-xs text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
                Play as many matches as you like before the clock runs out.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 mb-8 text-center">
          <p className="text-sm font-semibold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            This tournament has ended
          </p>
          <p className="mt-1 text-xs text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
            Final standings below.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center px-3 py-2 text-[10px] text-[#ccc3d8]/30 uppercase tracking-widest border-b border-white/[0.04] mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
          <div className="w-8 text-center">#</div>
          <div className="flex-1 px-3">Player</div>
          <div className="w-16 text-center">W-L</div>
          <div className="w-12 text-right">Pts</div>
        </div>
        <div className="space-y-1.5">
          {detail.standings.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center">
              <Trophy size={20} className="text-[#ccc3d8]/30 mx-auto mb-2" />
              <p className="text-sm text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
                Nobody&apos;s played a match yet.
              </p>
            </div>
          ) : (
            detail.standings.map((s, i) => {
              const isYou = s.playerId === player?.id;
              return (
                <div
                  key={s.playerId}
                  className={`flex items-center gap-1 px-3 py-2.5 rounded-xl transition-all ${
                    isYou
                      ? "bg-[#7c3aed]/10 border border-[#7c3aed]/20"
                      : "bg-white/[0.02] border border-transparent"
                  }`}
                >
                  <div className={`w-8 text-center text-xs ${isYou ? "text-[#7c3aed] font-bold" : "text-[#ccc3d8]/40"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {i + 1}
                  </div>
                  <span className={`flex-1 px-3 text-sm truncate ${isYou ? "text-[#d2bbff] font-semibold" : "text-[#dae2fd]"}`} style={{ fontFamily: "var(--font-hanken)" }}>
                    {isYou ? "You" : s.displayName}
                  </span>
                  <span className="w-16 text-center text-xs text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {s.wins}-{s.losses}
                  </span>
                  <span className={`w-12 text-right text-xs font-semibold ${isYou ? "text-[#7c3aed]" : "text-[#ccc3d8]/60"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {s.points}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
