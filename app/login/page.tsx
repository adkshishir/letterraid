"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, KeyRound, User, ArrowLeft, Loader2 } from "lucide-react";
import { requestOtp, verifyOtp } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const { player, refresh } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (player && !loading) {
      router.replace("/");
    }
  }, [player, loading, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      await requestOtp(email.trim());
      setStep("code");
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code.trim(), name.trim());
      setSuccess(true);
      await refresh();
      setTimeout(() => router.replace("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if already logged in
  if (player && !loading) return null;

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-[#7c3aed] rounded-2xl blur-2xl opacity-30" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#7c3aed] flex items-center justify-center shadow-[0_8px_32px_rgba(124,58,237,0.4)]">
              <KeyRound size={28} className="text-white" />
            </div>
          </div>
          <h1
            className="text-2xl font-extrabold text-[#d2bbff]"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            LETTER RAID
          </h1>
          <p
            className="text-sm text-[#ccc3d8]/50 mt-1"
            style={{ fontFamily: "var(--font-hanken)" }}
          >
            {step === "email" ? "Enter your email to start" : "Enter the code we sent"}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="text-center py-8 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-[#5ce0a0]/10 border border-[#5ce0a0]/30 flex items-center justify-center mx-auto mb-4">
              <Loader2 size={32} className="text-[#5ce0a0] animate-spin" />
            </div>
            <p className="text-[#5ce0a0] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
              Welcome!
            </p>
          </div>
        ) : step === "email" ? (
          /* Step 1: Email */
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc3d8]/30"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEmailSubmit(e);
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  className="w-full rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 pl-10 pr-4 py-3.5 text-[#dae2fd] outline-none placeholder:text-[#ccc3d8]/30 focus:border-[#7c3aed]/60 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all"
                  style={{ fontFamily: "var(--font-hanken)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="w-full rounded-xl bg-[#7c3aed] py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all disabled:opacity-30 disabled:shadow-none tap-scale"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Send Code
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Code + Name */
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="flex items-center gap-2 text-sm text-[#ccc3d8]/60 hover:text-[#d2bbff] transition-colors tap-scale mb-2"
              style={{ fontFamily: "var(--font-hanken)" }}
            >
              <ArrowLeft size={14} />
              {email}
            </button>

            {/* Name */}
            <div>
              <label
                htmlFor="otp-name"
                className="block text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Your Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc3d8]/30"
                />
                <input
                  id="otp-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  placeholder="Choose a name"
                  autoComplete="nickname"
                  className="w-full rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 pl-10 pr-4 py-3.5 text-[#dae2fd] outline-none placeholder:text-[#ccc3d8]/30 focus:border-[#7c3aed]/60 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all"
                  style={{ fontFamily: "var(--font-hanken)" }}
                />
              </div>
            </div>

            {/* OTP Code */}
            <div>
              <label
                htmlFor="otp-code"
                className="block text-[11px] text-[#ccc3d8]/40 uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Verification Code
              </label>
              <input
                id="otp-code"
                ref={codeRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCodeSubmit(e);
                }}
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                className="w-full rounded-xl border border-[#4a4455]/60 bg-[#171f33]/80 px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-[#dae2fd] outline-none placeholder:tracking-[0.5em] placeholder:text-[#ccc3d8]/20 focus:border-[#4cd7f6]/60 focus:shadow-[0_0_0_3px_rgba(76,215,246,0.1)] transition-all"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              />
            </div>

            <button
              type="submit"
              disabled={!code.trim() || !name.trim() || loading}
              className="w-full rounded-xl bg-[#7c3aed] py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)] transition-all disabled:opacity-30 disabled:shadow-none tap-scale"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Verify & Play
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl bg-[#ff8a85]/10 border border-[#ff8a85]/20 p-3 animate-slide-up">
            <p
              className="text-sm text-[#ff8a85] text-center"
              role="alert"
              style={{ fontFamily: "var(--font-hanken)" }}
            >
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
