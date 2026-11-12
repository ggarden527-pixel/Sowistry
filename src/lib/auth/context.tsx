import { useRouter } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { auth, type AuthUser } from "./index";

interface AuthState {
  user: AuthUser | null;
  /** False until the first session check finishes in the browser. Always false during SSR. */
  ready: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => {
    let alive = true;
    void auth.getUser().then((user) => alive && setState({ user, ready: true }));
    const off = auth.onChange((user) => {
      setState({ user, ready: true });
      // Re-run route guards so signing out leaves private pages immediately.
      void router.invalidate();
    });
    return () => {
      alive = false;
      off();
    };
  }, [router]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
