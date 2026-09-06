"use client";

import TopAppBar from "@/components/nav/TopAppBar";
import BottomNavBar from "@/components/nav/BottomNavBar";
import AuthGuard from "@/components/AuthGuard";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
    <div className="min-h-[100dvh] relative overflow-x-hidden flex flex-col">
      {/* Deep space background */}
      <div className="fixed inset-0 -z-30 bg-[#060e1e]" />

      {/* Surface background */}
      <div className="fixed inset-0 -z-20 bg-[#0b1326]" />

      {/* Grid pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundSize: "48px 48px",
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
        }}
      />

      <TopAppBar />

      <main className="flex-1 pt-16 pb-24 relative z-10">
        {children}
      </main>

      <BottomNavBar />
    </div>
    </AuthGuard>
  );
}
