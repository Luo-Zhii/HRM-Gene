"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, KeyRound, ShieldCheck, Building2, Briefcase } from "lucide-react";

const roles = ["Admin", "Developer"] as const;

interface Department {
  department_id: number;
  department_name: string;
}

interface Position {
  position_id: number;
  position_name: string;
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("Admin");
  const [secretKey, setSecretKey] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [positionId, setPositionId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Departments and Positions state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load departments and positions on mount
  useEffect(() => {
    loadDepartmentsAndPositions();
  }, []);

  const loadDepartmentsAndPositions = async () => {
    setLoadingData(true);
    try {
      const [deptsRes, posRes] = await Promise.all([
        fetch("/api/admin/departments", {
          method: "GET",
          credentials: "include",
        }),
        fetch("/api/admin/positions", {
          method: "GET",
          credentials: "include",
        }),
      ]);

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(Array.isArray(deptsData) ? deptsData : []);
      } else {
        console.error("Failed to load departments");
        setDepartments([]);
      }

      if (posRes.ok) {
        const posData = await posRes.json();
        setPositions(Array.isArray(posData) ? posData : []);
      } else {
        console.error("Failed to load positions");
        setPositions([]);
      }
    } catch (err) {
      console.error("Error loading departments/positions:", err);
      setDepartments([]);
      setPositions([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/admin-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          role,
          secretKey,
          department_id: departmentId ? Number(departmentId) : undefined,
          position_id: positionId ? Number(positionId) : undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast({
          title: "Registration successful",
          description: "You have been signed in.",
        });
        router.push("/dashboard/timekeeping");
      } else {
        setError(json.message || json.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl shadow-2xl border border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Create Admin / Developer Account
          </CardTitle>
          <CardDescription className="text-slate-600">
            Secure bootstrap access. Only share the secret key with trusted team
            members.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Username / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="admin@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-slate-700"
                >
                  Role
                </Label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Select value={role} onValueChange={(v) => setRole(v as any)}>
                    <SelectTrigger id="role" className="pl-10">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Department and Position Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-slate-700"
                >
                  Department
                </Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Select
                    value={departmentId.toString()}
                    onValueChange={(v) =>
                      setDepartmentId(v ? parseInt(v, 10) : "")
                    }
                    disabled={loadingData}
                  >
                    <SelectTrigger id="department" className="pl-10">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem
                            key={dept.department_id}
                            value={dept.department_id.toString()}
                          >
                            {dept.department_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {loadingData
                            ? "Loading..."
                            : "No departments available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="position"
                  className="text-sm font-medium text-slate-700"
                >
                  Position
                </Label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Select
                    value={positionId.toString()}
                    onValueChange={(v) =>
                      setPositionId(v ? parseInt(v, 10) : "")
                    }
                    disabled={loadingData}
                  >
                    <SelectTrigger id="position" className="pl-10">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {positions.length > 0 ? (
                        positions.map((pos) => (
                          <SelectItem
                            key={pos.position_id}
                            value={pos.position_id.toString()}
                          >
                            {pos.position_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {loadingData
                            ? "Loading..."
                            : "No positions available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="secretKey"
                className="text-sm font-medium text-slate-700"
              >
                Admin Access Token
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="Enter the provided secret key"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-2">
              <p className="text-sm text-slate-500">
                Only authorized administrators should create accounts with
                elevated access.
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[180px] bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Registering…" : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
