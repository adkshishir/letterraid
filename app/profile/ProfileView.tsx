"use client";

import { useState } from "react";
import {
  Verified, Swords, Target, Flame, Settings,
  ChevronDown, LogOut, Volume2, Vibrate,
} from "lucide-react";

const RECENT = [
  { result: "W" as const, opponent: "NeonNinja", rp: "+24", words: 8 },
  { result: "L" as const, opponent: "CryptoKing", rp: "-12", words: 5 },
  { result: "W" as const, opponent: "Ghost_X", rp: "+18", words: 7 },
  { result: "W" as const, opponent: "Viper_99", rp: "+31", words: 11 },
];

export default function ProfileView() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="px-4 max-w-md mx-auto animate-fade-in">
      {/* Profile Header */}
      <section className="flex flex-col items-center pt-6 mb-8 relative">
        {/* Glow */}
        <div className="absolute top-0 w-40 h-40 bg-[#7c3aed] rounded-full blur-[60px] opacity-15" />

        {/* Avatar */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-[#4cd7f6] blur-2xl opacity-20" />
          <div className="relative w-24 h-24 rounded-full border-[3px] border-[#4cd7f6] bg-[#222a3d] flex items-center justify-center shadow-[0_0_30px_rgba(76,215,246,0.2)]">
            <span className="text-3xl font-black text-[#d2bbff]" style={{ fontFamily: "var(--font-sora)" }}>V</span>
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#7c3aed] border-[3px] border-[#0b1326] flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <span className="text-[10px] font-black text-white" style={{ fontFamily: "var(--font-jetbrains)" }}>42</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-xl font-bold text-[#dae2fd] text-glow-primary" style={{ fontFamily: "var(--font-sora)" }}>
            Vanguard_X
          </h2>
          <Verified size={18} className="text-[#4cd7f6]" fill="currentColor" />
        </div>

        <span className="text-xs text-[#ccc3d8]/50" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Diamond Tier II
        </span>

        {/* XP Bar */}
        <div className="w-full mt-4">
          <div className="flex justify-between text-[10px] text-[#ccc3d8]/40 mb-1" style={{ fontFamily: "var(--font-jetbrains)" }}>
            <span>XP 12,450</span>
            <span>15,000</span>
          </div>
          <div className="h-2 bg-[#222a3d] rounded-full overflow-hidden">
            <div className="h-full bg-[#7c3aed] rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)]" style={{ width: "83%" }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass rounded-xl p-3 text-center">
          <Swords size={18} className="text-[#d2bbff] mx-auto mb-1.5" />
          <div className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>1,204</div>
          <div className="text-[10px] text-[#ccc3d8]/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>Battles</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Target size={18} className="text-[#4cd7f6] mx-auto mb-1.5" />
          <div className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>68%</div>
          <div className="text-[10px] text-[#ccc3d8]/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>Win Rate</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Flame size={18} className="text-[#FFD700] mx-auto mb-1.5" fill="currentColor" />
          <div className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>12</div>
          <div className="text-[10px] text-[#ccc3d8]/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>Streak</div>
        </div>
      </section>

      {/* Recent Battles */}
      <section className="mb-8">
        <h3 className="text-[11px] text-[#ccc3d8]/40 mb-3 uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Recent Battles
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {RECENT.map((r, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                r.result === "W"
                  ? "bg-[#5ce0a0]/15 text-[#5ce0a0] border border-[#5ce0a0]/20"
                  : "bg-[#ff8a85]/15 text-[#ff8a85] border border-[#ff8a85]/20"
              }`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                {r.result}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#dae2fd] truncate" style={{ fontFamily: "var(--font-hanken)" }}>
                  vs {r.opponent}
                </div>
                <div className="text-[11px] text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {r.words} words
                </div>
              </div>
              <span className={`text-xs font-semibold ${r.result === "W" ? "text-[#5ce0a0]" : "text-[#ff8a85]"}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                {r.rp} RP
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="glass rounded-2xl overflow-hidden mb-8">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors focus:outline-none"
        >
          <Settings size={18} className="text-[#ccc3d8]/50" />
          <span className="flex-1 text-left text-sm font-semibold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            Settings
          </span>
          <ChevronDown size={16} className={`text-[#ccc3d8]/40 transition-transform duration-300 ${settingsOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`settings-content ${settingsOpen ? "expanded" : ""}`}>
          <div className="px-4 pb-4 space-y-3">
            {[
              { icon: Volume2, label: "Sound", enabled: true },
              { icon: Vibrate, label: "Haptics", enabled: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <s.icon size={16} className="text-[#ccc3d8]/40" />
                  <span className="text-sm text-[#ccc3d8]/80" style={{ fontFamily: "var(--font-hanken)" }}>{s.label}</span>
                </div>
                <div className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-colors ${s.enabled ? "bg-[#7c3aed]/40 border border-[#7c3aed]/50" : "bg-[#222a3d] border border-white/[0.06]"}`}>
                  <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all shadow-sm ${s.enabled ? "right-[3px] bg-[#d2bbff]" : "left-[3px] bg-[#ccc3d8]/30"}`} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-white/[0.04]">
              <button className="w-full py-2.5 rounded-xl text-sm text-[#ff8a85]/70 hover:text-[#ff8a85] hover:bg-[#ff8a85]/5 transition-colors flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-jetbrains)" }}>
                <LogOut size={14} />
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
