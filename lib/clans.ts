const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4042";

export interface ClanRosterEntry {
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  trophies: number;
  role: "LEADER" | "MEMBER";
  joinedAt: string;
}

export interface ClanDetail {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  totalTrophies: number;
  myRole: "LEADER" | "MEMBER" | null;
  roster: ClanRosterEntry[];
}

export interface ClanSummary {
  id: string;
  name: string;
  memberCount: number;
  totalTrophies: number;
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

export function listClans(limit = 20): Promise<ClanSummary[]> {
  return api(`/clans?limit=${limit}`);
}

export function fetchMyClan(): Promise<ClanDetail | null> {
  return api("/clans/me");
}

export function fetchClan(id: string): Promise<ClanDetail> {
  return api(`/clans/${id}`);
}

export function createClan(name: string): Promise<ClanDetail> {
  return api("/clans", { method: "POST", body: JSON.stringify({ name }) });
}

export function joinClan(id: string): Promise<ClanDetail> {
  return api(`/clans/${id}/join`, { method: "POST" });
}

export function leaveClan(): Promise<{ left: boolean }> {
  return api("/clans/leave", { method: "POST" });
}

export function kickMember(clanId: string, playerId: string): Promise<{ removed: boolean }> {
  return api(`/clans/${clanId}/members/${playerId}`, { method: "DELETE" });
}
