"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ==========================================
    // 1. FRONTEND VALIDATION (Xử lý các TC LOGIN_02, 03, 04)
    // ==========================================
    if (!email && !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu."); // LOGIN_02
      setLoading(false);
      return;
    }
    if (!email) {
      setError("Vui lòng nhập tài khoản."); // LOGIN_04
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu."); // LOGIN_03
      setLoading(false);
      return;
    }

    // ==========================================
    // 2. CALL API & BACKEND ERROR MAPPING
    // ==========================================
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        window.location.href = "/dashboard";
      } else {
        // Phân loại lỗi dựa trên HTTP Status Code từ NestJS trả về
        let customErrorMsg = json.message || "Đăng nhập thất bại. Vui lòng thử lại.";

        switch (res.status) {
          case 404:
            customErrorMsg = "Email không tồn tại trong hệ thống."; // LOGIN_08
            break;
          case 401:
            // Tuỳ thuộc vào backend NestJS của bạn trả về string gì trong json.message
            if (json.message?.toLowerCase().includes("password")) {
              customErrorMsg = "Sai mật khẩu."; // LOGIN_05
            } else if (json.message?.toLowerCase().includes("lock") || json.message?.toLowerCase().includes("quá 5 lần")) {
              customErrorMsg = "Tài khoản đã bị khóa do nhập sai quá 5 lần."; // LOGIN_09
            } else {
              customErrorMsg = "Sai tài khoản hoặc mật khẩu."; // LOGIN_06, LOGIN_07
            }
            break;
          case 403:
            customErrorMsg = "Tài khoản nhân viên đã bị vô hiệu hóa (Nghỉ việc)."; // LOGIN_10
            break;
        }
        setError(customErrorMsg);
      }
    } catch (err) {
      setError("Hệ thống đang bận. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

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
            {/* Đã bỏ thuộc tính `required` ở đây để React tự handle */}
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
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                Forget Password?
              </a>
            </div>
            {/* Đã bỏ thuộc tính `required` ở đây để React tự handle */}
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
        </form>
      </div>
    </div>
  );
}