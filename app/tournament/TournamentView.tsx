"use client";

import { Trophy, Swords, ChevronRight, Flame, Zap, Crown, Timer } from "lucide-react";

const TOURNAMENTS = [
  { id: 1, name: "Cyber Blitz", prize: "10,000", players: "128/256", timeLeft: "2H 15M", status: "live" as const },
  { id: 2, name: "Neon Championship", prize: "50,000", players: "64/128", timeLeft: "1D", status: "upcoming" as const },
  { id: 3, name: "Quick Strike", prize: "2,500", players: "32/32", timeLeft: "Ended", status: "ended" as const },
];

const PRIZES = [
  { place: "1st", reward: "25,000 Gems + Legendary Chest", color: "#FFD700", icon: Crown },
  { place: "2nd", reward: "15,000 Gems + Epic Chest", color: "#C0C0C0", icon: Trophy },
  { place: "3rd", reward: "10,000 Gems + Rare Chest", color: "#CD7F32", icon: Trophy },
  { place: "4th–8th", reward: "5,000 Gems", color: "#ccc3d8", icon: Zap },
];

const STATUS = {
  live: { bg: "bg-[#5ce0a0]/10", text: "text-[#5ce0a0]", border: "border-[#5ce0a0]/20", label: "LIVE" },
  upcoming: { bg: "bg-[#4cd7f6]/10", text: "text-[#4cd7f6]", border: "border-[#4cd7f6]/20", label: "SOON" },
  ended: { bg: "bg-white/[0.03]", text: "text-[#ccc3d8]/40", border: "border-white/[0.06]", label: "ENDED" },
};

export default function TournamentView() {
  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 pt-2">
        <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
          Tournaments
        </h2>
        <p className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Compete for glory and rewards
        </p>
      </div>

      {/* Season Banner */}
      <div className="glass rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#7c3aed] rounded-full blur-[80px] opacity-10" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#5ce0a0] animate-pulse" />
              <span className="text-[10px] text-[#5ce0a0] uppercase tracking-widest font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                Season 04
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Timer size={14} className="text-[#ccc3d8]/40" />
              <span className="text-sm text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-hanken)" }}>12 days remaining</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center">
            <Swords size={22} className="text-[#d2bbff]" />
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="space-y-3 mb-8">
        {TOURNAMENTS.map((t) => {
          const s = STATUS[t.status];
          return (
            <div key={t.id} className="glass rounded-2xl p-4 tap-scale hover:bg-white/[0.03] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                  {t.status === "live" ? <Flame size={20} className={s.text} /> :
                   t.status === "upcoming" ? <Trophy size={20} className={s.text} /> :
                   <Zap size={20} className={s.text} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#dae2fd] truncate" style={{ fontFamily: "var(--font-sora)" }}>
                      {t.name}
                    </span>
                    {t.status === "live" && <div className="w-1.5 h-1.5 rounded-full bg-[#5ce0a0] animate-pulse shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-[#FFD700]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {t.prize} G
                    </span>
                    <span className="text-[10px] text-[#ccc3d8]/30" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {t.players}
                    </span>
                    <span className="text-[10px] text-[#ccc3d8]/30" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {t.timeLeft}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {s.label}
                  </span>
                  <ChevronRight size={16} className="text-[#ccc3d8]/20" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prize Pool */}
      <div className="mb-6">
        <h3 className="text-[11px] text-[#ccc3d8]/40 mb-3 uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Prize Pool
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {PRIZES.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${p.color}10`, border: `1px solid ${p.color}20` }}>
                  <Icon size={14} style={{ color: p.color }} fill={p.color} />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold" style={{ color: p.color, fontFamily: "var(--font-jetbrains)" }}>
                    {p.place}
                  </span>
                </div>
                <span className="text-xs text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-hanken)" }}>
                  {p.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
