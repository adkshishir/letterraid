const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4042";

/** Clash-Royale-style presets — a fixed menu, not a free-typed number. */
export const TOURNAMENT_SIZES = [10, 50, 100] as const;
export type TournamentSize = (typeof TOURNAMENT_SIZES)[number];

export const TOURNAMENT_DURATIONS_MIN = [30, 60, 120] as const;
export type TournamentDurationMin = (typeof TOURNAMENT_DURATIONS_MIN)[number];

export type TournamentStatus = "OPEN" | "COMPLETE";

export interface TournamentStanding {
  playerId: string;
  displayName: string;
  wins: number;
  losses: number;
  points: number;
}

export interface TournamentSummary {
  id: string;
  code: string;
  name: string;
  maxMembers: number;
  durationMin: number;
  memberCount: number;
  endsAt: string;
  status: TournamentStatus;
  clanId: string | null;
}

export interface TournamentDetail extends TournamentSummary {
  createdAt: string;
  creatorId: string;
  clanName: string | null;
  isParticipant: boolean;
  standings: TournamentStanding[];
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("authToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export function listOpenTournaments(limit = 20): Promise<TournamentSummary[]> {
  return api(`/tournaments?limit=${limit}`);
}

export function listMyTournaments(): Promise<TournamentSummary[]> {
  return api("/tournaments/mine");
}

export function listClanTournaments(clanId: string): Promise<TournamentSummary[]> {
  return api(`/tournaments/clan/${clanId}`);
}

export function fetchTournament(idOrCode: string): Promise<TournamentDetail> {
  return api(`/tournaments/${idOrCode}`);
}

export function createTournament(input: {
  name: string;
  maxMembers: TournamentSize;
  durationMin: TournamentDurationMin;
  clanId?: string | null;
}): Promise<TournamentDetail> {
  return api("/tournaments", { method: "POST", body: JSON.stringify(input) });
}

export function joinTournament(idOrCode: string): Promise<TournamentDetail> {
  return api(`/tournaments/${idOrCode}/join`, { method: "POST" });
}

export function enqueueTournamentMatch(
  idOrCode: string,
): Promise<{ queued: boolean; queueSize: number }> {
  return api(`/tournaments/${idOrCode}/queue`, { method: "POST" });
}

export function dequeueTournamentMatch(
  idOrCode: string,
): Promise<{ removed: boolean; queueSize: number }> {
  return api(`/tournaments/${idOrCode}/queue`, { method: "DELETE" });
}

export function tournamentQueueStatus(
  idOrCode: string,
): Promise<{ queued: boolean; queueSize: number }> {
  return api(`/tournaments/${idOrCode}/queue/status`);
}

export interface TournamentActiveMatch {
  roomCode: string;
  opponentName: string;
}

export function getTournamentActiveMatch(
  idOrCode: string,
): Promise<{ match: TournamentActiveMatch | null }> {
  return api(`/tournaments/${idOrCode}/active`);
}
