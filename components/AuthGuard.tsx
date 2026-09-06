"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { player, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !player) {
      router.replace("/login");
    }
  }, [player, loading, router]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 size={32} className="text-[#7c3aed] animate-spin" />
      </div>
    );
  }

  if (!player) return null;

  return <>{children}</>;
}
