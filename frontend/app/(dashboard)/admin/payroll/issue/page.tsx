"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Send,
  Clock,
  ChevronDown,
  Eye,
  CheckSquare,
  Square,
  RefreshCw,
  SendHorizonal,
} from "lucide-react";
import PayslipDetailModal, { PayslipDetail } from "@/components/PayslipDetailModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payslip extends PayslipDetail {
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
    position?: { position_name: string };
    department?: { department_name: string };
  };
}

type IssuedStatus = "Sent" | "Pending" | "Error";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const fmt = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  if (isNaN(n)) return "₫0";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(n);
};

const getInitials = (p: Payslip["employee"]) =>
  `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() || "?";

// Simulate an "issue" status (real implementation would persist this)
const deriveIssueStatus = (p: Payslip): IssuedStatus => {
  if (p.status === "Paid") return "Sent";
  if (p.status === "Approved") return "Pending";
  return "Pending";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function IssuePayslipsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedDept, setSelectedDept] = useState("All");
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewPayslip, setViewPayslip] = useState<Payslip | null>(null);
  const [issuedSet, setIssuedSet] = useState<Set<number>>(new Set());

  // Auth guard
  useEffect(() => {
    if (!authLoading && user) {
      const ok = user.permissions?.includes("manage:payroll") || user.permissions?.includes("manage:system");
      if (!ok) { toast({ variant: "destructive", title: "Access Denied" }); setTimeout(() => router.push("/dashboard"), 1500); }
    }
  }, [authLoading, user, router, toast]);

  // Load payslips
  const loadPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/list?month=${selectedMonth}&year=${selectedYear}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPayslips(Array.isArray(data) ? data : []);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load payslips" });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, toast]);

  useEffect(() => {
    if (user) loadPayslips();
  }, [user, loadPayslips]);

  // Departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    payslips.forEach((p) => { if (p.employee?.department?.department_name) depts.add(p.employee.department.department_name); });
    return ["All", ...Array.from(depts).sort()];
  }, [payslips]);

  // Filtered list
  const filtered = useMemo(() =>
    selectedDept === "All" ? payslips : payslips.filter((p) => p.employee?.department?.department_name === selectedDept),
    [payslips, selectedDept]
  );

  // Stats
  const sentCount = useMemo(() => payslips.filter((p) => p.status === "Paid" || issuedSet.has(p.payslip_id)).length, [payslips, issuedSet]);
  const pendingCount = payslips.length - sentCount;

  // Select all
  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.payslip_id));
  const toggleAll = () => {
    const updated = new Set(selectedIds);
    if (allSelected) { filtered.forEach((p) => updated.delete(p.payslip_id)); }
    else { filtered.forEach((p) => updated.add(p.payslip_id)); }
    setSelectedIds(updated);
  };
  const toggleOne = (id: number) => {
    const updated = new Set(selectedIds);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setSelectedIds(updated);
  };

  // Send bulk
  const handleSendBulk = async () => {
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : filtered.map((p) => p.payslip_id);
    if (ids.length === 0) { toast({ variant: "destructive", title: "Nothing to send" }); return; }
    setSending(true);
    try {
      // Mark selected payslips as Paid via approve+mark-paid cascade
      for (const id of ids) {
        const p = payslips.find((x) => x.payslip_id === id);
        if (!p) continue;
        if (p.status === "Pending") await fetch(`/api/payroll/${id}/approve`, { method: "PATCH", credentials: "include" });
        await fetch(`/api/payroll/${id}/mark-paid`, { method: "PATCH", credentials: "include" });
      }
      const updated = new Set(issuedSet);
      ids.forEach((id) => updated.add(id));
      setIssuedSet(updated);
      toast({ title: `✅ ${ids.length} payslips sent successfully` });
      await loadPayslips();
      setSelectedIds(new Set());
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Some payslips could not be sent" });
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const progressPct = payslips.length > 0 ? Math.round((sentCount / payslips.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issue Payslips</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Send and track payslip delivery for {MONTHS[selectedMonth - 1]} {selectedYear}
          </p>
        </div>
        <button
          onClick={handleSendBulk}
          disabled={sending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          {sending
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</>
            : <><SendHorizonal className="w-4 h-4" /> Send bulk payslips{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}</>
          }
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex flex-wrap gap-4">
          {/* Month */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Month</label>
            <div className="relative">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          {/* Year */}
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Year</label>
            <div className="relative">
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          {/* Department */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
            <div className="relative">
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Employees */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Employees</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{filtered.length}</p>
          </div>
        </div>

        {/* Payslips Sent + Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Payslips Sent</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {sentCount}<span className="text-sm font-normal text-gray-400 ml-1">/ {payslips.length}</span>
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{progressPct}%</p>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payslips found for this period</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
                  {/* Checkbox all */}
                  <th className="pl-5 pr-2 py-3">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-blue-600 transition-colors">
                      {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Pay Period</th>
                  <th className="px-4 py-3 text-left">Payment Date</th>
                  <th className="px-4 py-3 text-right">Total Gross</th>
                  <th className="px-4 py-3 text-right">Net Received</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((p) => {
                  const issueStatus: IssuedStatus = issuedSet.has(p.payslip_id) ? "Sent" : deriveIssueStatus(p);
                  const period = p.pay_period ?? `${String(p.payroll_period?.month ?? selectedMonth).padStart(2, "0")}/${p.payroll_period?.year ?? selectedYear}`;
                  return (
                    <tr key={p.payslip_id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${selectedIds.has(p.payslip_id) ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                      <td className="pl-5 pr-2 py-4">
                        <button onClick={() => toggleOne(p.payslip_id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                          {selectedIds.has(p.payslip_id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {p.employee?.avatar_url ? (
                            <img src={p.employee.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {getInitials(p.employee)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                              {p.employee.first_name} {p.employee.last_name}
                            </p>
                            <p className="text-xs text-gray-400">{p.employee.department?.department_name ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{period}</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                        {issueStatus === "Sent" ? new Date().toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(p.gross_salary)}</td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">{fmt(p.net_salary)}</td>
                      <td className="px-4 py-4"><IssueStatusBadge status={issueStatus} /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewPayslip(p)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {issueStatus !== "Sent" && (
                            <button
                              onClick={async () => {
                                setSending(true);
                                try {
                                  if (p.status === "Pending") await fetch(`/api/payroll/${p.payslip_id}/approve`, { method: "PATCH", credentials: "include" });
                                  await fetch(`/api/payroll/${p.payslip_id}/mark-paid`, { method: "PATCH", credentials: "include" });
                                  setIssuedSet((prev) => new Set([...prev, p.payslip_id]));
                                  toast({ title: "Payslip sent" });
                                  await loadPayslips();
                                } finally { setSending(false); }
                              }}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Send"
                            >
                              <SendHorizonal className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payslip Detail Modal */}
      {viewPayslip && (
        <PayslipDetailModal payslip={viewPayslip} onClose={() => setViewPayslip(null)} />
      )}
    </div>
  );
}

function IssueStatusBadge({ status }: { status: IssuedStatus }) {
  const map: Record<IssuedStatus, string> = {
    Sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Error: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
}
