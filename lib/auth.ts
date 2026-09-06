const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4042";

export interface Player {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  trophies: number;
  totalGames: number;
  totalWins: number;
  winStreak: number;
  bestStreak: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  player: Player;
}

const TOKEN_KEY = "authToken";
const PLAYER_KEY = "authPlayer";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Private mode
  }
}

export function getStoredPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredPlayer(player: Player): void {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  } catch {
    // Private mode
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PLAYER_KEY);
  } catch {
    // Private mode
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function requestOtp(email: string): Promise<{ message: string }> {
  return api("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(
  email: string,
  code: string,
  displayName: string,
): Promise<AuthResponse> {
  const res = await api<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code, displayName }),
  });
  setToken(res.token);
  setStoredPlayer(res.player);
  return res;
}

export async function fetchProfile(): Promise<Player> {
  const player = await api<Player>("/auth/me");
  setStoredPlayer(player);
  return player;
}

export async function logout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Best effort
  }
  clearAuth();
}

export async function joinQueue(): Promise<{ queued: boolean; queueSize: number }> {
  return api("/match/queue", { method: "POST" });
}

export async function leaveQueue(): Promise<{ removed: boolean; queueSize: number }> {
  return api("/match/queue", { method: "DELETE" });
}

export interface ActiveMatch {
  matchId: string;
  roomCode: string;
  opponentName: string;
}

export async function getActiveMatch(): Promise<{ match: ActiveMatch | null }> {
  return api("/match/active");
}
