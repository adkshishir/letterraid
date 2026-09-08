const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4042";

export type BotTier = "rookie" | "bronze" | "silver" | "gold" | "diamond";

export interface BotTierInfo {
  tier: BotTier;
  label: string;
  blurb: string;
}

/** Mirrors `BOT_TIERS`/`TIER_CONFIG` in `backend/src/heist/heist-bot.service.ts`. */
export const BOT_TIERS: BotTierInfo[] = [
  { tier: "rookie", label: "Rookie", blurb: "Slow and forgiving — great for your very first games." },
  { tier: "bronze", label: "Bronze", blurb: "Casual pace, still makes mistakes." },
  { tier: "silver", label: "Silver", blurb: "Knows the board, goes for steals sometimes." },
  { tier: "gold", label: "Gold", blurb: "Quick and sharp — hunts for long words." },
  { tier: "diamond", label: "Diamond", blurb: "Near-perfect play. Bring your best." },
];

export interface PracticeMatch {
  roomCode: string;
  botName: string;
  tier: BotTier;
}

export async function startPracticeMatch(tier: BotTier): Promise<PracticeMatch> {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("authToken");
  const res = await fetch(`${BACKEND_URL}/practice/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
