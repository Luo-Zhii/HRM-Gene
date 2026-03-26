"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { toQueryString } from "@/src/utils/api";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  department?: { department_name: string };
  base_salary?: string | number | null; // Cập nhật type để nhận base_salary từ danh sách
}

interface Adjustment {
  id: number;
  employee: Employee;
  type: "Bonus" | "Penalty";
  amount: string;
  applied_month: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  created_by_id?: number;
}

type TabKey = "All" | "Bonus" | "Penalty";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₫0";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(num);
};

const getInitials = (emp: Employee) =>
  `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase() || "?";

const getEmployeeName = (emp: Employee) =>
  `${emp.first_name} ${emp.last_name}`.trim();

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalaryAdjustmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // ── employee list for the form ──
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ── form state ──
  const [form, setForm] = useState({
    employee_id: "",
    type: "Bonus" as "Bonus" | "Penalty",
    amount: "",
    applied_month: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentSalary, setCurrentSalary] = useState<number | null>(null);

  // ── table state ──
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [tab, setTab] = useState<TabKey>("All");
  const [loadingTable, setLoadingTable] = useState(true);

  // ─── Auth guard ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user) {
      const ok =
        user.permissions?.includes("manage:payroll") ||
        user.permissions?.includes("manage:system");
      if (!ok) {
        toast({ variant: "destructive", title: "Access Denied" });
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    }
  }, [authLoading, user, router, toast]);

  // ─── Load employees (for dropdown) ────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    fetch("/api/employees", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]));
  }, [user]);

  // ─── Cập nhật lương khi đổi nhân viên (MỚI) ──────────────────────────────

  useEffect(() => {
    if (!form.employee_id) {
      setCurrentSalary(null);
      return;
    }

    // Tìm nhân viên trong danh sách `employees`
    const selectedEmp = employees.find(
      (emp) => emp.employee_id.toString() === form.employee_id.toString()
    );

    // Nếu tìm thấy và có đính kèm base_salary từ Backend thì lấy luôn
    if (selectedEmp && selectedEmp.base_salary != null) {
      setCurrentSalary(parseFloat(String(selectedEmp.base_salary)));
    } else {
      // Nếu nhân viên này chưa được cài đặt cấu hình lương
      setCurrentSalary(0);
    }
  }, [form.employee_id, employees]);

  // ─── Load adjustments ─────────────────────────────────────────────────────

  const loadAdjustments = useCallback(async () => {
    setLoadingTable(true);
    try {
      // Gắn mặc định page và limit vào mọi request
      const baseParams = { page: 1, limit: 1000 };
      const params = tab === "All" ? baseParams : { ...baseParams, type: tab };

      const res = await fetch(`/api/payroll/adjustments${toQueryString(params)}`, {
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setAdjustments(Array.isArray(data) ? data : []);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load adjustments" });
    } finally {
      setLoadingTable(false);
    }
  }, [tab, toast]);
  useEffect(() => {
    if (user) loadAdjustments();
  }, [user, loadAdjustments]);

  // ─── Submit form ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.amount || !form.applied_month) {
      toast({ variant: "destructive", title: "Validation", description: "Please fill all required fields." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll/adjustments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: Number(form.employee_id),
          type: form.type,
          amount: String(parseFloat(form.amount).toFixed(2)),
          applied_month: String(form.applied_month),
          reason: String(form.reason || ""),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }
      toast({ title: "Adjustment saved successfully" });
      setForm({ employee_id: "", type: "Bonus", amount: "", applied_month: "", reason: "" });
      loadAdjustments();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this adjustment?")) return;
    try {
      if (!id || isNaN(Number(id))) throw new Error("Invalid ID");
      await fetch(`/api/payroll/adjustments/${String(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast({ title: "Deleted" });
      loadAdjustments();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete" });
    }
  };

  // ─── Approve / Reject shortcut ────────────────────────────────────────────

  const handleStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      if (!id || isNaN(Number(id))) throw new Error("Invalid ID");
      await fetch(`/api/payroll/adjustments/${String(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: String(status) }),
      });
      loadAdjustments();
    } catch {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  // ─── Loading / auth check ─────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Computed stats ───────────────────────────────────────────────────────

  const totalBonus = adjustments
    .filter((a) => a.type === "Bonus")
    .reduce((s, a) => s + parseFloat(a.amount || "0"), 0);
  const totalPenalty = adjustments
    .filter((a) => a.type === "Penalty")
    .reduce((s, a) => s + parseFloat(a.amount || "0"), 0);
  const pendingCount = adjustments.filter((a) => a.status === "Pending").length;

  const TABS: TabKey[] = ["All", "Bonus", "Penalty"];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Salary Adjustments
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create bonus or penalty adjustments for employees
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          bg="bg-emerald-50 dark:bg-emerald-900/20"
          label="Total Bonuses"
          value={formatVND(totalBonus)}
          valueColor="text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          bg="bg-red-50 dark:bg-red-900/20"
          label="Total Penalties"
          value={formatVND(totalPenalty)}
          valueColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          bg="bg-amber-50 dark:bg-amber-900/20"
          label="Pending Review"
          value={String(pendingCount)}
          valueColor="text-amber-700 dark:text-amber-400"
        />
      </div>

      {/* ── Create Form ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Create New Adjustment
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Employee */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an employee...</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {getEmployeeName(emp)}
                    {emp.department ? ` — ${emp.department.department_name}` : ""}
                  </option>
                ))}
              </select>
              {/* Current base salary hint */}
              {form.employee_id && (
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  {currentSalary !== null
                    ? <>Current Base Salary: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatVND(currentSalary)}</span></>
                    : "Loading salary info..."}
                </p>
              )}
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adjustment Type <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden h-10">
                {(["Bonus", "Penalty"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors
                      ${form.type === t
                        ? t === "Bonus"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                  >
                    {t === "Bonus" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount (VND) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₫</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  className="w-full h-10 pl-7 pr-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Applied Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Applied Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                // Parse ngược lại từ MM/YYYY thành YYYY-MM để hiển thị đúng trên thẻ
                value={form.applied_month ? (() => {
                  const [m, y] = form.applied_month.split('/');
                  return `${y}-${m}`;
                })() : ""}
                onChange={(e) => {
                  const val = e.target.value; // Trình duyệt trả về "YYYY-MM"
                  if (!val) {
                    setForm({ ...form, applied_month: "" });
                    return;
                  }
                  const [y, m] = val.split("-");
                  // Lưu vào state theo chuẩn MM/YYYY để gửi lên Backend
                  setForm({ ...form, applied_month: `${m}/${y}` });
                }}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reason
              </label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe the reason for the adjustment..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {submitting ? "Saving..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>

      {/* ── History Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Header + Tabs */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Recent History
          </h2>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === t
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loadingTable ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No adjustments found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3 text-left">Employee</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-left">Applied Month</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-left">Date Created</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {adj.employee.avatar_url ? (
                          <img
                            src={adj.employee.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(adj.employee)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {getEmployeeName(adj.employee)}
                          </p>
                          {adj.employee.department && (
                            <p className="text-xs text-gray-400">
                              {adj.employee.department.department_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type pill */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${adj.type === "Bonus"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                      >
                        {adj.type === "Bonus" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {adj.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatVND(adj.amount)}
                    </td>

                    {/* Applied Month */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {adj.applied_month}
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                      {adj.reason || "—"}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(adj.created_at).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={adj.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {adj.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleStatus(adj.id, "Approved")}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatus(adj.id, "Rejected")}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(adj.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({
  icon,
  bg,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className={`text-lg font-bold mt-0.5 ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Pending" | "Approved" | "Rejected" }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}