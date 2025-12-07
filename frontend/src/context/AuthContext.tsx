"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      // Thêm timestamp để tránh cache trình duyệt tuyệt đối
      const res = await fetch(
        `${apiBase.replace(
          /\/api$|\/$/,
          ""
        )}/api/auth/profile?t=${new Date().getTime()}`,
        // `http://10.78.101.32:3001/api/auth/profile`,
        {
          credentials: "include",
          
        }
      );
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
        localStorage.clear(); // Xóa sạch LocalStorage
        sessionStorage.clear(); // Xóa sạch SessionStorage
      }

      setUser(null);

      // --- SỬA LỖI TẠI ĐÂY ---
      // Thay vì router.push("/login"), dùng window.location.href
      // Để ép trình duyệt reload lại hoàn toàn, xóa sạch Router Cache của Next.js
      window.location.href = "/login";
    })();
  }, []); // Bỏ dependency [router] vì không dùng nữa

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
