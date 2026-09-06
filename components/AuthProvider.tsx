"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Player,
  getStoredPlayer,
  getToken,
  fetchProfile,
  clearAuth,
} from "@/lib/auth";

interface AuthState {
  player: Player | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  player: null,
  loading: true,
  refresh: async () => {},
  signOut: () => {},
});

function getInitialPlayer(): Player | null {
  if (typeof window === "undefined") return null;
  return getStoredPlayer();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(getInitialPlayer);
  const [loading, setLoading] = useState(true);
  const didHydrate = useRef(false);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setPlayer(null);
      setLoading(false);
      return;
    }
    try {
      const p = await fetchProfile();
      setPlayer(p);
    } catch {
      clearAuth();
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setPlayer(null);
  }, []);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ player, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
