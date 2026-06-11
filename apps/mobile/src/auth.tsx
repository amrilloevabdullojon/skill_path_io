import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { MeResponse } from "@/lib/contracts/auth";

import { api } from "./api";
import { clearTokens, getAccessToken, saveTokens } from "./storage";

type SessionUser = MeResponse["user"];

type AuthState = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  // On boot, restore a session if a stored token still resolves to a user.
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await api.auth.me();
        if (!active) return;
        setUser(me.user);
        setStatus("authenticated");
      } catch {
        await clearTokens();
        if (active) setStatus("unauthenticated");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      async login(email, password) {
        const tokens = await api.auth.login({ email, password });
        await saveTokens(tokens.accessToken, tokens.refreshToken);
        const me = await api.auth.me();
        setUser(me.user);
        setStatus("authenticated");
      },
      async register(name, email, password) {
        const tokens = await api.auth.register({ name, email, password });
        await saveTokens(tokens.accessToken, tokens.refreshToken);
        const me = await api.auth.me();
        setUser(me.user);
        setStatus("authenticated");
      },
      async logout() {
        await clearTokens();
        setUser(null);
        setStatus("unauthenticated");
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
