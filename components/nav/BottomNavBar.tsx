"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Trophy, Swords, Users, Medal } from "lucide-react";

const tabs = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/", icon: Swords, label: "Battle", isCenter: true },
  { href: "/clan", icon: Users, label: "Squads" },
  { href: "/tournament", icon: Medal, label: "Events" },
];

interface BottomNavBarProps {
  /** When provided, the center Battle button calls this instead of navigating. */
  onBattleClick?: () => void;
}

export default function BottomNavBar({ onBattleClick }: BottomNavBarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {/* ── MOBILE ── */}
      <nav
        className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[92%] rounded-full z-50 backdrop-blur-2xl border border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex justify-around items-center h-20 px-3 md:hidden"
        style={{ backgroundColor: "rgba(45, 52, 73, 0.4)" }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          if (tab.isCenter) {
            const handleClick = (e: React.MouseEvent) => {
              if (isHome && onBattleClick) {
                e.preventDefault();
                onBattleClick();
              }
            };

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={handleClick}
                className="flex items-center justify-center w-12 h-12 relative group active:scale-90 transition-transform duration-200"
              >
                <div className="energy-ring -translate-y-4" />
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full -translate-y-4"
                  style={{
                    backgroundColor: "#7c3aed",
                    boxShadow: "0 0 30px rgba(124,58,237,0.8)",
                  }}
                >
                  <Swords
                    size={24}
                    className="text-[#ede0ff]"
                    fill="currentColor"
                  />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-12 h-12 transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-[#4cd7f6] drop-shadow-[0_0_8px_rgba(76,215,246,0.6)] scale-110"
                  : "text-[#ccc3d8]/50 hover:text-[#dae2fd]"
              }`}
            >
              <Icon
                size={24}
                fill={isActive ? "currentColor" : "none"}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              />
            </Link>
          );
        })}
      </nav>

      {/* ── DESKTOP SIDE NAV ── */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-[#0b1326]/50 backdrop-blur-md border-r border-white/5 flex-col items-center py-12 gap-8 z-40">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          if (tab.isCenter) {
            const handleClick = (e: React.MouseEvent) => {
              if (isHome && onBattleClick) {
                e.preventDefault();
                onBattleClick();
              }
            };

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={handleClick}
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-[#4cd7f6] drop-shadow-[0_0_15px_rgba(76,215,246,0.8)] scale-125 bg-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                    : "text-[#ccc3d8]/50 hover:text-[#dae2fd] hover:scale-110"
                }`}
              >
                <Icon size={28} fill={isActive ? "currentColor" : "none"} />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#4cd7f6] drop-shadow-[0_0_8px_rgba(76,215,246,0.6)] scale-110"
                  : "text-[#ccc3d8]/50 hover:text-[#dae2fd] hover:scale-110"
              }`}
            >
              <Icon size={28} fill={isActive ? "currentColor" : "none"} />
            </Link>
          );
        })}
      </div>
    </>
  );
}
