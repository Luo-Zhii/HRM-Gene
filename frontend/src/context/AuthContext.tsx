"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import "dotenv/config";
// import { useRouter } from "next/navigation"; // Không cần dùng router nữa cho logout
type User = {
  employee_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  permissions?: string[];
  [key: string]: any;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      // const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      //const res = await fetch(
      //  `${"http://47.130.182.18:3001".replace(
      //    /\/api$|\/$/,
      //    ""
      // `http://10.78.101.32:3001
      // `http://localhost:3001
      //    )}/api/auth/profile?t=${new Date().getTime()}`,
      // `http://10.78.101.32:3001/api/auth/profile`,
      //const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      //const res = await fetch(`${apiBase}/auth/profile?t=${new Date().getTime()}`, {
      //  credentials: "include",
      const res = await fetch(`/api/auth/profile?t=${new Date().getTime()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      setUser(json);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(() => {
    (async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
        await fetch(`${apiBase.replace(/\/api$|\/$/, "")}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout error", err);
      }

      // Xóa sạch storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        // Clear all cookies (best effort)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }

      setUser(null);
      window.location.href = "/login";
    })();
  }, []);

  // --- GLOBAL FETCH INTERCEPTOR (FOR 401 HANDLING) ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // If 401 Unauthorized, trigger logout
      if (response.status === 401) {
        const url = args[0] instanceof Request ? args[0].url : args[0].toString();
        // Don't intercept 401s from profile or login itself to avoid loops
        if (!url.includes("/auth/profile") && !url.includes("/auth/login")) {
          console.warn("Session expired (401). Logging out...");
          logout();
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);

  // --- FORCED REDIRECT LOGIC ---
  useEffect(() => {
    if (loading) return;

    const pathname = window.location.pathname;
    const isPublicPath = pathname === "/login" || pathname === "/admin-register" || pathname === "/";

    if (!user && !isPublicPath) {
      console.log("Unauthenticated access to protected route. Redirecting to login...");
      window.location.href = "/login";
    }
  }, [user, loading]);

  const value: AuthContextValue = {
    user,
    loading,
    refresh: fetchProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
