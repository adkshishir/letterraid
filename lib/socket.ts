import { io, Socket } from "socket.io-client";
import { getToken } from "./auth";

/**
 * LetterRaid runs one Socket.io namespace per game (see docs/SOCKET_EVENTS.md),
 * so rather than a single global socket we cache one connection per namespace.
 */
export type GameNamespace = "heist";

const sockets = new Map<GameNamespace, Socket>();

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4042";

/**
 * Stable per-browser player identity.
 *
 * localStorage (not sessionStorage) so this survives a closed tab or a killed
 * mobile browser — a player who drops mid-round is recognised and put back in
 * their own seat when they return. Socket IDs change on every reconnect and
 * must never be used for identity.
 */
export function getPlayerId(): string {
  let pid = localStorage.getItem("playerId");
  if (!pid) {
    pid = crypto.randomUUID();
    localStorage.setItem("playerId", pid);
  }
  return pid;
}

export function getSocket(namespace: GameNamespace): Socket {
  const existing = sockets.get(namespace);
  if (existing) return existing;

  const token = getToken();
  const socket = io(`${BACKEND_URL}/${namespace}`, {
    autoConnect: true,
    auth: token ? { token } : undefined,
  });
  sockets.set(namespace, socket);
  return socket;
}

export function disconnectSocket(namespace: GameNamespace) {
  sockets.get(namespace)?.disconnect();
  sockets.delete(namespace);
}

export function disconnectAllSockets() {
  for (const socket of sockets.values()) socket.disconnect();
  sockets.clear();
}
