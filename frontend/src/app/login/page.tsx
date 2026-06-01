"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const REMEMBER_KEY = "hrm_remembered_credentials";

function tryLoadCredentials(): { email: string; password: string } | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const decoded = JSON.parse(atob(raw));
    if (decoded.email && decoded.password) {
      return { email: decoded.email, password: decoded.password };
    }
    return null;
  } catch {
    return null;
  }
}

function persistCredentials(email: string, password: string) {
  try {
    const encoded = btoa(JSON.stringify({ email, password }));
    localStorage.setItem(REMEMBER_KEY, encoded);
  } catch { /* quota exceeded – silently skip */ }
}

function forgetCredentials() {
  try {
    localStorage.removeItem(REMEMBER_KEY);
  } catch { /* noop */ }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track whether we've already auto-filled from localStorage
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    const saved = tryLoadCredentials();
    if (saved) {
      setEmail(saved.email);
      setPassword(saved.password);
      setRemember(true);
    }
    hydrated.current = true;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      if (!email && !password) {
        setError("Vui lòng nhập tài khoản và mật khẩu.");
        setLoading(false);
        return;
      }
      if (!email) {
        setError("Vui lòng nhập tài khoản.");
        setLoading(false);
        return;
      }
      if (!password) {
        setError("Vui lòng nhập mật khẩu.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });
        const json = await res.json();

        if (res.ok && json.success) {
          if (remember) {
            persistCredentials(email, password);
          } else {
            forgetCredentials();
          }
          window.location.href = "/dashboard";
        } else {
          // Login failed — if the credentials were wrong, forget to avoid dead-loop
          if (res.status === 401 || res.status === 404) {
            forgetCredentials();
          }

          let customErrorMsg = json.message || "Đăng nhập thất bại. Vui lòng thử lại.";
          switch (res.status) {
            case 404:
              customErrorMsg = "Email không tồn tại trong hệ thống.";
              break;
            case 401:
              if (json.message?.toLowerCase().includes("password")) {
                customErrorMsg = "Sai mật khẩu.";
              } else if (json.message?.toLowerCase().includes("lock") || json.message?.toLowerCase().includes("quá 5 lần")) {
                customErrorMsg = "Tài khoản đã bị khóa do nhập sai quá 5 lần.";
              } else {
                customErrorMsg = "Sai tài khoản hoặc mật khẩu.";
              }
              break;
            case 403:
              customErrorMsg = "Tài khoản nhân viên đã bị vô hiệu hóa (Nghỉ việc).";
              break;
          }
          setError(customErrorMsg);
        }
      } catch (err) {
        setError("Hệ thống đang bận. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember]
  );

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 bg-[#5885ff] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-waves.svg')" }}
    >
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[24px] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Login to Account</h1>
          <p className="text-sm text-gray-500">
            Please enter your email and password to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-sm text-red-600 border border-red-200 text-center transition-all">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-600">
              Email address:
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="bg-[#f4f6f9] border-transparent focus:border-blue-400 focus:bg-white h-12 rounded-lg text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-gray-600">
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="bg-[#f4f6f9] border-transparent focus:border-blue-400 focus:bg-white h-12 rounded-lg text-2xl tracking-widest placeholder:tracking-normal placeholder:text-base text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="remember" className="text-sm text-gray-500 font-normal cursor-pointer">
              Remember Password
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#6b93ff] hover:bg-[#5885ff] text-white rounded-lg font-semibold text-base transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <text className="text-sm text-gray-500 font-normal cursor-pointer blur-[0.5px] mt-8 pt-8 pl-8 text-center items-center justify-center">
            admin@example.com / admin
          </text>
        </form>
      </div>
    </div>
  );
}