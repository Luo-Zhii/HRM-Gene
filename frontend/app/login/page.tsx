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
        setError(json.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* SỬ DỤNG INLINE STYLE CHO BACKGROUND SVG
      - Lấy file trực tiếp từ thư mục public thông qua url('/bg-waves.svg')
      - Đảm bảo Next.js render hình ảnh chính xác ngay cả khi Tailwind chưa kịp cập nhật bộ nhớ đệm
    */
    <div
      className="relative min-h-screen flex items-center justify-center p-4 bg-[#5885ff] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-waves.svg')" }}
    >

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[24px] p-10 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Login to Account</h1>
          <p className="text-sm text-gray-500">
            Please enter your email and password to continue
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-sm text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
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
              required
              className="bg-[#f4f6f9] border-transparent focus:border-blue-400 focus:bg-white h-12 rounded-lg text-gray-900"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-gray-600">
                Password
              </Label>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                Forget Password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="bg-[#f4f6f9] border-transparent focus:border-blue-400 focus:bg-white h-12 rounded-lg text-2xl tracking-widest placeholder:tracking-normal placeholder:text-base text-gray-900"
            />
          </div>

          {/* Remember Me */}
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#6b93ff] hover:bg-[#5885ff] text-white rounded-lg font-semibold text-base transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="mt-8 text-xs text-gray-400 text-center opacity-70">
            <p>Admin: admin@example.com / admin</p>
            <p>Employee: user31@company.com / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
}