"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Swords, Target, Flame, Settings,
  ChevronDown, LogOut, Loader2,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { fetchMatchHistory, logout, type MatchHistoryEntry } from "@/lib/auth";

const XP_PER_LEVEL = 500;

/** Trophy-based rank name. Mirrors nothing on the backend — purely cosmetic. */
function tierFor(trophies: number): string {
  if (trophies >= 4000) return "Champion";
  if (trophies >= 2000) return "Diamond";
  if (trophies >= 1000) return "Platinum";
  if (trophies >= 500) return "Gold";
  if (trophies >= 200) return "Silver";
  return "Bronze";
}

const RESULT_STYLES = {
  W: "bg-[#5ce0a0]/15 text-[#5ce0a0] border border-[#5ce0a0]/20",
  L: "bg-[#ff8a85]/15 text-[#ff8a85] border border-[#ff8a85]/20",
  T: "bg-white/[0.06] text-[#ccc3d8]/70 border border-white/[0.08]",
};

export default function ProfileView() {
  const router = useRouter();
  const { player, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<MatchHistoryEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMatchHistory(10)
      .then((matches) => { if (!cancelled) setHistory(matches); })
      .catch(() => { if (!cancelled) setHistory([]); });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    await logout();
    signOut();
    router.replace("/login");
  };

  if (!player) return null;

  const winRate = player.totalGames > 0
    ? Math.round((player.totalWins / player.totalGames) * 100)
    : 0;
  const xpIntoLevel = player.xp % XP_PER_LEVEL;

  return (
    <div className="px-4 max-w-md mx-auto animate-fade-in">
      {/* Profile Header */}
      <section className="flex flex-col items-center pt-6 mb-8 relative">
        <div className="absolute top-0 w-40 h-40 bg-[#7c3aed] rounded-full blur-[60px] opacity-15" />

        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-[#4cd7f6] blur-2xl opacity-20" />
          <div className="relative w-24 h-24 rounded-full border-[3px] border-[#4cd7f6] bg-[#222a3d] flex items-center justify-center shadow-[0_0_30px_rgba(76,215,246,0.2)]">
            <span className="text-3xl font-black text-[#d2bbff]" style={{ fontFamily: "var(--font-sora)" }}>
              {player.displayName[0]?.toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#7c3aed] border-[3px] border-[#0b1326] flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <span className="text-[10px] font-black text-white" style={{ fontFamily: "var(--font-jetbrains)" }}>
              {player.level}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#dae2fd] text-glow-primary" style={{ fontFamily: "var(--font-sora)" }}>
          {player.displayName}
        </h2>

        <span className="text-xs text-[#ccc3d8]/50" style={{ fontFamily: "var(--font-jetbrains)" }}>
          {tierFor(player.trophies)} · {player.trophies.toLocaleString()} 🏆
        </span>

        <div className="w-full mt-4">
          <div className="flex justify-between text-[10px] text-[#ccc3d8]/40 mb-1" style={{ fontFamily: "var(--font-jetbrains)" }}>
            <span>XP {xpIntoLevel.toLocaleString()}</span>
            <span>{XP_PER_LEVEL.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-[#222a3d] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7c3aed] rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)]"
              style={{ width: `${Math.min(100, (xpIntoLevel / XP_PER_LEVEL) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass rounded-xl p-3 text-center">
          <Swords size={18} className="text-[#d2bbff] mx-auto mb-1.5" />
          <div className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            {player.totalGames.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#ccc3d8]/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>Battles</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Target size={18} className="text-[#4cd7f6] mx-auto mb-1.5" />
          <div className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>{winRate}%</div>
          <div className="text-[10px] text-[#ccc3d8]/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>Win Rate</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Flame size={18} className="text-[#FFD700] mx-auto mb-1.5" fill="currentColor" />
          <div className="text-lg font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>{player.winStreak}</div>
          <div className="text-[10px] text-[#ccc3d8]/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>Streak</div>
        </div>
      </section>

      {/* Recent Battles */}
      <section className="mb-8">
        <h3 className="text-[11px] text-[#ccc3d8]/40 mb-3 uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Recent Battles
        </h3>

        {history === null ? (
          <div className="glass rounded-2xl p-8 flex justify-center">
            <Loader2 size={20} className="text-[#7c3aed] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-sm text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-hanken)" }}>
              No battles yet — find a match to start your record.
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {history.map((m) => (
              <div key={m.matchId} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${RESULT_STYLES[m.result]}`} style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {m.result}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#dae2fd] truncate" style={{ fontFamily: "var(--font-hanken)" }}>
                    vs {m.opponentName}
                  </div>
                  <div className="text-[11px] text-[#ccc3d8]/40" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {m.words} word{m.words === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#ccc3d8]/60" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {m.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
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
            <div className="pt-2 border-t border-white/[0.04]">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-sm text-[#ff8a85]/70 hover:text-[#ff8a85] hover:bg-[#ff8a85]/5 transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
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
