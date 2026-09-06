"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import BottomNavBar from "@/components/nav/BottomNavBar";
import { getStoredDisplayName, storeDisplayName } from "@/lib/player";
import { useClientValue } from "@/lib/use-client-value";
import { joinQueue, leaveQueue, getActiveMatch } from "@/lib/auth";

/**
 * Main hub — one-click matchmaking.
 *
 * The entire screen is the FIND MATCH button. Player taps once,
 * matchmaking starts, opponent found → room created → game begins.
 */
export default function HomePage() {
  return (
    <AuthGuard>
      <MainHub />
    </AuthGuard>
  );
}

function MainHub() {
  const router = useRouter();
  const { player } = useAuth();
  const storedName = useClientValue(getStoredDisplayName, "");
  const displayName = storedName || player?.displayName || "Player";

  const [status, setStatus] = useState<"idle" | "searching" | "found" | "joining">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [opponent, setOpponent] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);

  // Timer for search duration
  useEffect(() => {
    if (status !== "searching") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mountedRef.current) {
        leaveQueue().catch(() => {});
      }
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Poll for active match
  useEffect(() => {
    if (status !== "searching") return;

    const check = async () => {
      try {
        const { match } = await getActiveMatch();
        if (match) {
          if (pollRef.current) clearInterval(pollRef.current);
          setOpponent(match.opponentName);
          setStatus("found");
          setTimeout(() => {
            setStatus("joining");
            router.push(`/room/${match.roomCode}`);
          }, 1500);
        }
      } catch {
        // Silently retry
      }
    };

    check();
    pollRef.current = setInterval(check, 1500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, router]);

  const startSearch = async () => {
    storeDisplayName(displayName);
    setElapsed(0);
    setStatus("searching");
    mountedRef.current = true;
    try {
      await joinQueue();
    } catch {
      setStatus("idle");
    }
  };

  const cancelSearch = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    await leaveQueue().catch(() => {});
    mountedRef.current = false;
    setStatus("idle");
    setElapsed(0);
  };

  return (
    <div className="min-h-screen relative overflow-hidden select-none">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7c3aed]/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ─── IDLE: MAIN HUB ─── */}
      {status === "idle" && (
        <main className="h-screen flex flex-col items-center justify-center relative z-10 px-4">
          {/* Season badge */}
          <div className="mb-8 flex flex-col items-center animate-fade-in">
            <span
              className="bg-[#03b5d3]/20 text-[#4cd7f6] border border-[#4cd7f6]/30 rounded-full px-4 py-1 text-[14px] tracking-widest shadow-[0_0_15px_rgba(76,215,246,0.3)] backdrop-blur-sm mb-4"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              SEASON 4 LIVE
            </span>
            <h1
              className="text-[40px] leading-[48px] font-extrabold text-[#d2bbff] text-center -tracking-[0.02em]"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              ENTER THE FRAY
            </h1>
            <p
              className="text-[18px] leading-[28px] text-[#ccc3d8]/80 mt-2"
              style={{ fontFamily: "var(--font-hanken)" }}
            >
              Ranked Matchmaking Ready
            </p>
          </div>

          {/* THE BIG BUTTON */}
          <button
            onClick={startSearch}
            className="relative group cursor-pointer active:scale-95 transition-transform duration-200 mt-8 mb-24 tap-scale"
          >
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-full pulse-glow bg-[#7c3aed] z-0" />

            {/* Glow layer */}
            <div className="absolute -inset-4 bg-[#7c3aed] rounded-full blur-[30px] opacity-40 group-hover:opacity-70 transition-opacity duration-300 z-0" />

            {/* Main button body */}
            <div className="relative z-10 w-48 h-48 rounded-full bg-[#171f33] border border-[#7c3aed]/40 flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(124,58,237,0.5)]">
              {/* Inner spinning ring */}
              <div className="absolute inset-2 rounded-full border border-[#4cd7f6]/20 border-dashed opacity-50 animate-[spin_10s_linear_infinite]" />

              <div className="flex flex-col items-center justify-center">
                <Swords
                  size={64}
                  className="text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.8)] mb-2 group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                />
                <span
                  className="text-[32px] leading-[40px] font-bold tracking-widest text-[#dae2fd] drop-shadow-md"
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  FIND
                </span>
                <span
                  className="text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#4cd7f6]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  MATCH
                </span>
              </div>
            </div>
          </button>
        </main>
      )}

      {/* ─── SEARCHING / FOUND / JOINING ─── */}
      {status !== "idle" && (
        <main className="h-screen flex flex-col items-center justify-center relative z-10 px-4">
          <div className="flex flex-col items-center animate-fade-in">
            {/* Animated search ring */}
            <div className="relative mb-8">
              <div className="absolute inset-[-20px] rounded-full border border-[#7c3aed]/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-[-40px] rounded-full border border-[#7c3aed]/10 animate-ping" style={{ animationDuration: "2.5s" }} />

              <div className="relative w-28 h-28 rounded-full bg-[#171f33] border border-[#7c3aed]/40 flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)]">
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#d2bbff] border-r-[#4cd7f6] animate-spin" style={{ animationDuration: "1.5s" }} />
                <Swords size={40} className={`text-[#d2bbff] ${status === "searching" ? "animate-pulse" : ""}`} fill="currentColor" />
              </div>
            </div>

            {/* Searching */}
            {status === "searching" && (
              <div className="text-center animate-slide-up">
                <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
                  Searching...
                </h2>
                <p className="text-sm text-[#ccc3d8]/50 mt-1" style={{ fontFamily: "var(--font-hanken)" }}>
                  Looking for an opponent
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#222a3d]/60 border border-white/[0.06]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                  <span className="text-xs text-[#ccc3d8]/60 tabular-nums" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                  </span>
                </div>

                <button
                  onClick={cancelSearch}
                  className="mt-8 px-6 py-3 rounded-xl border border-white/[0.06] text-sm text-[#ccc3d8]/50 hover:text-[#ff8a85] hover:border-[#ff8a85]/20 transition-all tap-scale flex items-center gap-2 mx-auto"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}

            {/* Found */}
            {status === "found" && (
              <div className="text-center animate-scale-in">
                <h2 className="text-xl font-bold text-[#5ce0a0] text-glow-secondary" style={{ fontFamily: "var(--font-sora)" }}>
                  MATCH FOUND!
                </h2>
                <p className="text-sm text-[#ccc3d8]/60 mt-1" style={{ fontFamily: "var(--font-hanken)" }}>
                  vs <span className="text-[#dae2fd] font-semibold">{opponent}</span>
                </p>
              </div>
            )}

            {/* Joining */}
            {status === "joining" && (
              <div className="text-center animate-fade-in">
                <h2 className="text-lg text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-hanken)" }}>
                  Joining game...
                </h2>
              </div>
            )}
          </div>
        </main>
      )}

      <BottomNavBar onBattleClick={status === "idle" ? startSearch : undefined} />
    </div>
  );
}
