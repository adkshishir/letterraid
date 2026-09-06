"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { logout } from "@/lib/auth";
import { disconnectAllSockets } from "@/lib/socket";

export default function TopAppBar() {
  const { player, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    disconnectAllSockets();
    signOut();
    await logout();
    router.replace("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-[#0b1326]/70 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Left: Avatar + Name */}
      <Link
        href="/profile"
        className="flex items-center gap-2 tap-scale"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#7c3aed]/60 bg-[#222a3d] flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.2)]">
          <User size={18} className="text-[#d2bbff]" />
        </div>
        {player && (
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-[#dae2fd] leading-tight" style={{ fontFamily: "var(--font-sora)" }}>
              {player.displayName}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#ccc3d8]/50" style={{ fontFamily: "var(--font-jetbrains)" }}>
              <Trophy size={9} className="text-[#FFD700]" />
              {player.trophies}
            </div>
          </div>
        )}
      </Link>

      {/* Center: Logo */}
      <Link href="/" className="flex items-center gap-1.5 tap-scale">
        <div className="w-6 h-6 rounded-md bg-[#7c3aed] flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <span className="text-[10px] font-black text-white" style={{ fontFamily: "var(--font-sora)" }}>LR</span>
        </div>
        <span
          className="text-sm font-bold tracking-tight text-[#d2bbff] hidden sm:inline"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          LETTER RAID
        </span>
      </Link>

      {/* Right: Logout */}
      <button
        onClick={handleLogout}
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#ccc3d8]/60 hover:text-[#ff8a85] hover:bg-white/5 transition-all duration-200 tap-scale"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
