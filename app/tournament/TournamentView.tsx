"use client";

import Link from "next/link";
import { Trophy, Swords } from "lucide-react";

export default function TournamentView() {
  return (
    <div className="px-4 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6 pt-2">
        <h2 className="text-xl font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
          Tournaments
        </h2>
        <p className="text-[11px] text-[#ccc3d8]/40 mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Compete for glory and rewards
        </p>
      </div>

      <div className="glass rounded-2xl p-10 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#7c3aed] rounded-full blur-2xl opacity-20" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center">
            <Trophy size={28} className="text-[#d2bbff]" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#dae2fd]" style={{ fontFamily: "var(--font-sora)" }}>
            Coming soon
          </h3>
          <p className="mt-1 text-sm text-[#ccc3d8]/50 max-w-xs" style={{ fontFamily: "var(--font-hanken)" }}>
            Scheduled brackets and seasonal prizes aren&apos;t built yet. Ranked
            matchmaking is live now — climb the leaderboard while you wait.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed] text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all tap-scale"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          <Swords size={16} />
          Find a match
        </Link>
      </div>
    </div>
  );
}
