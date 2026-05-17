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
import { useAuth } from "@/src/hooks/useAuth";
import { Mail, Lock, Building2, Briefcase, User, ShieldAlert } from "lucide-react";
import { useShowStatus } from "@/hooks/use-status";

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
  const { user, loading: authLoading } = useAuth();
  const showStatus = useShowStatus();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [positionId, setPositionId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadDepartmentsAndPositions();
  }, []);

  const loadDepartmentsAndPositions = async () => {
    setLoadingData(true);
    try {
      const [deptsRes, posRes] = await Promise.all([
        fetch("/api/admin/departments", { credentials: "include" }),
        fetch("/api/admin/positions", { credentials: "include" }),
      ]);

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(Array.isArray(deptsData) ? deptsData : []);
      }

      if (posRes.ok) {
        const posData = await posRes.json();
        setPositions(Array.isArray(posData) ? posData : []);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showStatus("error", "Failed to load departments or positions");
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          department_id: departmentId ? Number(departmentId) : undefined,
          position_id: positionId ? Number(positionId) : undefined,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        showStatus("success", `Employee created successfully! ID: ${json.employee_id}`);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDepartmentId("");
        setPositionId("");
      } else {
        setError(json.message || "Registration failed");
        showStatus("error", json.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      showStatus("error", "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl border border-slate-100 text-center p-8">
          <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-500 mb-4">You must be logged in as an administrator to create employee accounts.</p>
          <Button onClick={() => router.push("/login")} className="bg-indigo-600 hover:bg-indigo-700">Go to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl shadow-2xl border border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Create New Employee
          </CardTitle>
          <CardDescription className="text-slate-600">
            Add a new employee to the organization. They will receive their credentials via email.
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
                  htmlFor="firstName"
                  className="text-sm font-medium text-slate-700"
                >
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="John"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-slate-700"
                >
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Work Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  placeholder="employee@company.com"
                />
              </div>
            </div>

            {/* Department & Position Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-slate-700"
                >
                  Department
                </Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                  <Select
                    value={departmentId.toString()}
                    onValueChange={(v) =>
                      setDepartmentId(v ? parseInt(v, 10) : "")
                    }
                    disabled={loadingData}
                  >
                    <SelectTrigger
                      id="department"
                      className="pl-10 bg-slate-50 border-slate-200"
                    >
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white shadow-xl border border-slate-100">
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
                          {loadingData ? "Loading..." : "No departments"}
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
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                  <Select
                    value={positionId.toString()}
                    onValueChange={(v) =>
                      setPositionId(v ? parseInt(v, 10) : "")
                    }
                    disabled={loadingData}
                  >
                    <SelectTrigger
                      id="position"
                      className="pl-10 bg-slate-50 border-slate-200"
                    >
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white shadow-xl border border-slate-100">
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
                          {loadingData ? "Loading..." : "No positions"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Password Fields */}
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
                    minLength={6}
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="At least 6 characters"
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
                    minLength={6}
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-2">
              <p className="text-sm text-slate-500">
                The new employee will use these credentials to log in.
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[180px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {loading ? "Creating…" : "Create Employee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
