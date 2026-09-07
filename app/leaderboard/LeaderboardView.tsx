"use client";

import { useEffect, useState } from "react";
import { Crown, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { fetchLeaderboard, fetchMyRank, type LeaderboardEntry, type MyRank } from "@/lib/auth";

const PODIUM_STYLE: Record<number, { border: string; size: string; height: string; delay: string }> = {
  1: { border: "#FFD700", size: "w-20 h-20", height: "130px", delay: "0s" },
  2: { border: "#C0C0C0", size: "w-14 h-14", height: "100px", delay: "0.1s" },
  3: { border: "#CD7F32", size: "w-12 h-12", height: "85px", delay: "0.2s" },
};

function PodiumPlayer({
  entry, style,
}: {
  entry: LeaderboardEntry;
  style: (typeof PODIUM_STYLE)[number];
}) {
  const isFirst = entry.rank === 1;
  return (
    <div
      className="relative flex flex-col items-center animate-pop-in"
      style={{ animationDelay: style.delay, width: isFirst ? "40%" : "30%" }}
    >
      {isFirst && (
        <Crown size={28} className="absolute -top-8 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.6)] z-20" fill="currentColor" />
      )}
      <div className="absolute -top-5 text-[11px] text-[#ccc3d8]/60 z-20" style={{ fontFamily: "var(--font-jetbrains)" }}>
        #{entry.rank}
      </div>
      <div
        className={`${style.size} rounded-full flex items-center justify-center z-10 relative bg-[#222a3d]`}
        style={{ border: `2px solid ${style.border}`, boxShadow: `0 0 20px ${style.border}33` }}
      >
        <span className="font-bold" style={{ color: style.border, fontFamily: "var(--font-sora)", fontSize: isFirst ? "20px" : "16px" }}>
          {entry.displayName[0]?.toUpperCase()}
        </span>
      </div>
      <div
        className="w-full rounded-t-xl mt-[-16px] pt-7 pb-3 px-2 text-center flex flex-col items-center backdrop-blur-md"
        style={{
          height: style.height,
          background: isFirst ? "rgba(34,42,61,0.8)" : "rgba(34,42,61,0.6)",
          borderTop: `1px solid ${style.border}30`,
          borderLeft: `1px solid ${style.border}15`,
          borderRight: `1px solid ${style.border}15`,
        }}
      >
        <span className="text-sm truncate w-full" style={{ color: "#dae2fd", fontFamily: "var(--font-hanken)" }}>
          {entry.displayName}
        </span>
        <div className="mt-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${style.border}10`, border: `1px solid ${style.border}20` }}>
          <Trophy size={10} style={{ color: style.border }} />
          <span className="text-[11px] font-semibold" style={{ color: style.border, fontFamily: "var(--font-jetbrains)" }}>
            {entry.trophies.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardView() {
  const { player } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [myRank, setMyRank] = useState<MyRank | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(50)
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch(() => { if (!cancelled) setEntries([]); });
    if (player) {
      fetchMyRank()
        .then((rank) => { if (!cancelled) setMyRank(rank); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [player]);

  if (entries === null) {
    return (
      <div className="px-4 max-w-lg mx-auto py-16 flex justify-center">
        <Loader2 size={24} className="text-[#7c3aed] animate-spin" />
      </div>
    );
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  // Podium renders center-first: [2nd, 1st, 3rd].
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as LeaderboardEntry[];
  const iAmRanked = entries.some((e) => e.id === player?.id);

  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            Leaderboard
          </h2>
          <div className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
            {entries.length} ranked player{entries.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5ce0a0]/10 border border-[#5ce0a0]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5ce0a0] animate-pulse" />
          <span className="text-[10px] text-[#5ce0a0] font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>LIVE</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center mb-6">
          <p className="text-sm text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
            Nobody has ranked in yet — be the first to play a match.
          </p>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="flex items-end justify-center gap-2 mb-8 h-[200px]">
              {podiumOrder.map((entry) => (
                <PodiumPlayer key={entry.id} entry={entry} style={PODIUM_STYLE[entry.rank]} />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <>
              <div className="flex items-center px-3 py-2 text-[10px] text-[#ccc3d8]/30 uppercase tracking-widest border-b border-white/[0.04] mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
                <div className="w-8 text-center">#</div>
                <div className="flex-1 px-3">Player</div>
                <div className="text-right">Trophies</div>
              </div>

              <div className="space-y-1.5">
                {rest.map((p) => {
                  const isYou = p.id === player?.id;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isYou
                          ? "bg-[#7c3aed]/10 border border-[#7c3aed]/20 shadow-[0_0_16px_rgba(124,58,237,0.08)]"
                          : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                      }`}
                    >
                      <div className={`w-8 text-center text-xs ${isYou ? "text-[#7c3aed] font-bold" : "text-[#ccc3d8]/40"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                        {p.rank}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#222a3d] flex items-center justify-center border border-white/[0.06] shrink-0">
                        <span className="text-xs font-bold text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-sora)" }}>
                          {p.displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className={`flex-1 text-sm truncate ${isYou ? "text-[#d2bbff] font-semibold" : "text-[#dae2fd]"}`} style={{ fontFamily: "var(--font-hanken)" }}>
                        {isYou ? "You" : p.displayName}
                      </span>
                      <span className={`text-xs ${isYou ? "text-[#7c3aed] font-semibold" : "text-[#ccc3d8]/60"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                        {p.trophies.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!iAmRanked && myRank && (
            <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20">
              <div className="w-8 text-center text-xs text-[#7c3aed] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {myRank.rank}
              </div>
              <span className="flex-1 text-sm text-[#d2bbff] font-semibold" style={{ fontFamily: "var(--font-hanken)" }}>
                You · {myRank.totalPlayers} ranked total
              </span>
              <span className="text-xs text-[#7c3aed] font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                {myRank.trophies.toLocaleString()}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
