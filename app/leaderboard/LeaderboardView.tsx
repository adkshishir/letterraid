"use client";

import { Crown, ChevronDown, Trophy } from "lucide-react";

const TOP_3 = [
  { rank: 2, name: "Viper_99", trophies: 8420, border: "#C0C0C0" },
  { rank: 1, name: "ZeroKool", trophies: 9150, border: "#FFD700" },
  { rank: 3, name: "Ghost_X", trophies: 8100, border: "#CD7F32" },
];

const RANKS = [
  { rank: 4, name: "NeonNinja", trophies: 7950 },
  { rank: 5, name: "CryptoKing", trophies: 7820 },
  { rank: 6, name: "ShadowStrike", trophies: 7710 },
  { rank: 7, name: "YOU", trophies: 7605, isYou: true },
  { rank: 8, name: "Player_8492", trophies: 7400 },
  { rank: 9, name: "BlazeFury", trophies: 7280 },
  { rank: 10, name: "NightHawk", trophies: 7150 },
];

function PodiumPlayer({ rank, name, trophies, border, size, height, delay }: {
  rank: number; name: string; trophies: number; border: string;
  size: string; height: string; delay: string;
}) {
  const isFirst = rank === 1;
  return (
    <div
      className="relative flex flex-col items-center animate-pop-in"
      style={{ animationDelay: delay, width: isFirst ? "40%" : "30%" }}
    >
      {isFirst && (
        <Crown size={28} className="absolute -top-8 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.6)] z-20" fill="currentColor" />
      )}
      <div className={`absolute -top-5 text-[11px] text-[#ccc3d8]/60 z-20`} style={{ fontFamily: "var(--font-jetbrains)" }}>
        #{rank}
      </div>
      {/* Avatar */}
      <div
        className={`${size} rounded-full flex items-center justify-center z-10 relative bg-[#222a3d]`}
        style={{ border: `2px solid ${border}`, boxShadow: `0 0 20px ${border}33` }}
      >
        <span className="font-bold" style={{ color: border, fontFamily: "var(--font-sora)", fontSize: isFirst ? "20px" : "16px" }}>
          {name[0]}
        </span>
      </div>
      {/* Podium base */}
      <div
        className="w-full rounded-t-xl mt-[-16px] pt-7 pb-3 px-2 text-center flex flex-col items-center backdrop-blur-md"
        style={{
          height,
          background: isFirst
            ? `rgba(34,42,61,0.8)`
            : "rgba(34,42,61,0.6)",
          borderTop: `1px solid ${border}30`,
          borderLeft: `1px solid ${border}15`,
          borderRight: `1px solid ${border}15`,
        }}
      >
        <span className="text-sm truncate w-full" style={{ color: "#dae2fd", fontFamily: "var(--font-hanken)" }}>
          {name}
        </span>
        <div className="mt-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${border}10`, border: `1px solid ${border}20` }}>
          <Trophy size={10} style={{ color: border }} />
          <span className="text-[11px] font-semibold" style={{ color: border, fontFamily: "var(--font-jetbrains)" }}>
            {trophies.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardView() {
  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            Leaderboard
          </h2>
          <div className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
            Season 04 · Ends in 2d 14h
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5ce0a0]/10 border border-[#5ce0a0]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5ce0a0] animate-pulse" />
          <span className="text-[10px] text-[#5ce0a0] font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>LIVE</span>
        </div>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 mb-8 h-[200px]">
        <PodiumPlayer {...TOP_3[0]} size="w-14 h-14" height="100px" delay="0.1s" />
        <PodiumPlayer {...TOP_3[1]} size="w-20 h-20" height="130px" delay="0s" />
        <PodiumPlayer {...TOP_3[2]} size="w-12 h-12" height="85px" delay="0.2s" />
      </div>

      {/* List Header */}
      <div className="flex items-center px-3 py-2 text-[10px] text-[#ccc3d8]/30 uppercase tracking-widest border-b border-white/[0.04] mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
        <div className="w-8 text-center">#</div>
        <div className="flex-1 px-3">Player</div>
        <div className="text-right">Trophies</div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {RANKS.map((p) => (
          <div
            key={p.rank}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              p.isYou
                ? "bg-[#7c3aed]/10 border border-[#7c3aed]/20 shadow-[0_0_16px_rgba(124,58,237,0.08)]"
                : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
            }`}
          >
            <div className={`w-8 text-center text-xs ${p.isYou ? "text-[#7c3aed] font-bold" : "text-[#ccc3d8]/40"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
              {p.rank}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#222a3d] flex items-center justify-center border border-white/[0.06] shrink-0">
              <span className="text-xs font-bold text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-sora)" }}>
                {p.name[0]}
              </span>
            </div>
            <span className={`flex-1 text-sm ${p.isYou ? "text-[#d2bbff] font-semibold" : "text-[#dae2fd]"}`} style={{ fontFamily: "var(--font-hanken)" }}>
              {p.name}
            </span>
            <span className={`text-xs ${p.isYou ? "text-[#7c3aed] font-semibold" : "text-[#ccc3d8]/60"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
              {p.trophies.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-[#ccc3d8]/40 hover:text-[#d2bbff] hover:border-[#7c3aed]/20 transition-all flex items-center gap-1.5 tap-scale" style={{ fontFamily: "var(--font-jetbrains)" }}>
          LOAD MORE
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
