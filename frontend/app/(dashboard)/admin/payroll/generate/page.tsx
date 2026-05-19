"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { canManagePayroll } from "@/src/lib/adminAccess";
import { toQueryString } from "@/src/utils/api";
import {
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Play,
  CheckCheck,
  Eye,
  RefreshCw,
  ChevronDown,
  FileText,
} from "lucide-react";
import PayslipDetailModal, { PayslipDetail } from "@/components/PayslipDetailModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payslip {
  payslip_id: number;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
    department?: { department_name: string };
  };
  actual_work_days: number;
  bonus: string;
  gross_salary: string;
  deductions: string;
  net_salary: string;
  status: "Pending" | "Approved" | "Paid";
  payroll_period?: { id?: number; month: number; year: number };
}

interface GenerateSummary {
  period_id: number;
  generated: number;
  total_gross: string;
  total_deductions: string;
  total_net: string;
  total_bonus: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmt = (v: string | number) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "₫0";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(n);
};

const getInitials = (p: Payslip["employee"]) =>
  `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() || "?";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatePayrollPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipDetail | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && user) {
      if (!canManagePayroll(user)) {
        toast({ variant: "destructive", title: t("payroll.accessDenied") });
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    }
  }, [authLoading, user, router, toast, t]);

  // Load payslips for selected period
  const loadPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const params = { month: selectedMonth, year: selectedYear };
      const [periodRes, listRes] = await Promise.all([
        fetch(`/api/payroll/period${toQueryString(params)}`, { credentials: "include" }),
        fetch(`/api/payroll/list${toQueryString(params)}`, { credentials: "include" }),
      ]);
      if (periodRes.ok) {
        const pd = await periodRes.json();
        setPeriodId(pd?.id ?? null);
      }
      if (listRes.ok) {
        const data = await listRes.json();
        setPayslips(Array.isArray(data) ? data : []);
      } else {
        setPayslips([]);
      }
    } catch {
      toast({ variant: "destructive", title: t("payroll.saveError"), description: t("payroll.loadFailed") });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, toast, t]);

  useEffect(() => {
    if (user && canManagePayroll(user)) {
      loadPayslips();
    }
  }, [user, loadPayslips]);

  // Generate payroll
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Generation failed");
      }
      const summary: GenerateSummary = await res.json();
      toast({
        title: `✅ ${t("payroll.createPayroll")} ${t("payroll.months." + selectedMonth)} ${selectedYear}`,
        description: `${summary.generated} ${t("payroll.payslipsSent") || "payslips created"}`,
      });
      await loadPayslips();
    } catch (err) {
      toast({ variant: "destructive", title: t("payroll.saveError"), description: err instanceof Error ? err.message : t("payroll.saveError") });
    } finally {
      setGenerating(false);
    }
  };

  // Approve all pending payslips
  const handleApproveAll = async () => {
    setApprovingAll(true);
    try {
      const res = await fetch("/api/payroll/approve-all", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      const data = await res.json();
      toast({ title: `✅ ${data.approved} ${t("payroll.approved")}` });
      await loadPayslips();
    } catch (err) {
      toast({ variant: "destructive", title: t("payroll.saveError"), description: err instanceof Error ? err.message : "Failed" });
    } finally {
      setApprovingAll(false);
    }
  };

  // Approve single
  const handleApproveOne = async (id: number) => {
    try {
      if (!id || isNaN(Number(id))) throw new Error("Invalid ID");
      await fetch(`/api/payroll/${String(id)}/approve`, { method: "PATCH", credentials: "include" });
      await loadPayslips();
    } catch { toast({ variant: "destructive", title: t("payroll.saveError") }); }
  };
  // Mark paid single
  const handleMarkPaid = async (id: number) => {
    try {
      if (!id || isNaN(Number(id))) throw new Error("Invalid ID");
      await fetch(`/api/payroll/${String(id)}/mark-paid`, { method: "PATCH", credentials: "include" });
      await loadPayslips();
    } catch { toast({ variant: "destructive", title: t("payroll.saveError") }); }
  };

  // Fetch individual detail
  const handleViewDetail = async (id: number) => {
    setFetchingDetail(true);
    try {
      if (!id || isNaN(Number(id))) throw new Error("Invalid ID");
      const res = await fetch(`/api/payroll/${String(id)}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch detail");
      const data = await res.json();
      setSelectedPayslip(data);
    } catch {
      toast({ variant: "destructive", title: t("payroll.saveError"), description: t("payroll.loadFailed") });
    } finally {
      setFetchingDetail(false);
    }
  };

  // ─── Summary card values ───────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalBaseSalary = payslips.reduce((s, p) => s + parseFloat(p.gross_salary || "0") - parseFloat(p.bonus || "0"), 0);
    const totalBonus = payslips.reduce((s, p) => s + parseFloat(p.bonus || "0"), 0);
    const totalDeductions = payslips.reduce((s, p) => s + parseFloat(p.deductions || "0"), 0);
    const totalNet = payslips.reduce((s, p) => s + parseFloat(p.net_salary || "0"), 0);
    return { count: payslips.length, totalBaseSalary, totalBonus, totalDeductions, totalNet };
  }, [payslips]);

  const canApprove = canManagePayroll(user);
  const pendingCount = payslips.filter((p) => p.status === "Pending").length;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("payroll.createPayroll")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("payroll.createPayrollSubtitle")}
          </p>
        </div>
        {periodId && (
          <button
            onClick={() => router.push(`/admin/payroll/cycle/${periodId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            {t("payroll.detailedReport")}
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          {/* Month */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              {t("payroll.month")}
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i + 1}>{t(`payroll.months.${i + 1}`)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Year */}
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              {t("payroll.year")}
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {generating
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t("payroll.calculating")}</>
              : <><Play className="w-4 h-4" /> {t("payroll.autoCalculate")}</>
            }
          </button>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard icon={<Users className="w-5 h-5 text-blue-600" />} bg="bg-blue-50 dark:bg-blue-900/20"
          label={t("payroll.totalEmployees")} value={String(stats.count)} valueColor="text-blue-700 dark:text-blue-400" />
        <SummaryCard icon={<Wallet className="w-5 h-5 text-violet-600" />} bg="bg-violet-50 dark:bg-violet-900/20"
          label={t("payroll.baseSalary")} value={fmt(stats.totalBaseSalary)} valueColor="text-violet-700 dark:text-violet-400" compact />
        <SummaryCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-50 dark:bg-emerald-900/20"
          label={t("payroll.commissionBonus")} value={fmt(stats.totalBonus)} valueColor="text-emerald-700 dark:text-emerald-400" compact />
        <SummaryCard icon={<TrendingDown className="w-5 h-5 text-red-500" />} bg="bg-red-50 dark:bg-red-900/20"
          label={t("payroll.deductionsInsurance")} value={fmt(stats.totalDeductions)} valueColor="text-red-600 dark:text-red-400" compact />
        {/* Dark net salary card */}
        <div className="col-span-2 lg:col-span-1 bg-gray-900 dark:bg-gray-950 rounded-xl p-5 flex items-center gap-4 border border-gray-800">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">{t("payroll.totalNetSalary")}</p>
            <p className="text-base font-bold text-white mt-0.5 truncate">{fmt(stats.totalNet)}</p>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t("payroll.previewPayroll")}
              <span className="ml-2 text-xs font-normal text-gray-400">
                {t(`payroll.months.${selectedMonth}`)} {selectedYear}
              </span>
            </h2>
            {payslips.length === 0 && !loading && (
              <p className="text-xs text-gray-400 mt-0.5">{t("payroll.noPayslipsMsg")}</p>
            )}
          </div>
          {pendingCount > 0 && canApprove && (
            <button
              onClick={handleApproveAll}
              disabled={approvingAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {approvingAll
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t("payroll.processing")}</>
                : <><CheckCheck className="w-3.5 h-3.5" /> {t("payroll.approvePayroll")} ({pendingCount})</>
              }
            </button>
          )}
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payslips.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{t("payroll.noPayslipsGenerated")}</p>
              <p className="text-xs mt-1">{t("payroll.calcInstructions")}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
                  <th className="px-6 py-3 text-left">{t("payroll.employee")}</th>
                  <th className="px-6 py-3 text-right">{t("payroll.baseSalary")}</th>
                  <th className="px-6 py-3 text-right">{t("payroll.commissionBonus")}</th>
                  <th className="px-6 py-3 text-right">{t("payroll.deductionsInsurance")}</th>
                  <th className="px-6 py-3 text-right">{t("payroll.netReceived")}</th>
                  <th className="px-6 py-3 text-left">{t("payroll.status")}</th>
                  <th className="px-6 py-3 text-right">{t("payroll.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {payslips.map((p) => {
                  const baseSalary = parseFloat(p.gross_salary || "0") - parseFloat(p.bonus || "0");
                  return (
                    <tr key={p.payslip_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      {/* Employee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.employee.avatar_url ? (
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
                            {p.employee.department && (
                              <p className="text-xs text-gray-400">{p.employee.department.department_name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Basic Salary */}
                      <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {fmt(baseSalary)}
                      </td>

                      {/* Bonus */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {fmt(p.bonus)}
                        </span>
                      </td>

                      {/* Deductions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="text-red-500 dark:text-red-400">
                          -{fmt(p.deductions)}
                        </span>
                      </td>

                      {/* Net Salary */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="font-bold text-gray-900 dark:text-white">{fmt(p.net_salary)}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusPill status={p.status} t={t} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t("payroll.view") || "View"}
                            disabled={fetchingDetail}
                            onClick={() => handleViewDetail(p.payslip_id)}
                          >
                            <Eye className={`w-4 h-4 ${fetchingDetail ? "animate-pulse" : ""}`} />
                          </button>
                          {canApprove && p.status === "Pending" && (
                            <button
                              onClick={() => handleApproveOne(p.payslip_id)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg transition-colors"
                            >
                              {t("payroll.approve")}
                            </button>
                          )}
                          {canApprove && p.status === "Approved" && (
                            <button
                              onClick={() => handleMarkPaid(p.payslip_id)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors"
                            >
                              {t("payroll.markPaid")}
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
      {/* Detailed Payslip Modal */}
      {selectedPayslip && (
        <PayslipDetailModal
          payslip={selectedPayslip}
          userName={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  icon, bg, label, value, valueColor, compact,
}: {
  icon: React.ReactNode; bg: string; label: string;
  value: string; valueColor: string; compact?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className={`font-bold mt-0.5 truncate ${compact ? "text-sm" : "text-lg"} ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status, t }: { status: "Pending" | "Approved" | "Paid"; t: any }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
  const labelMap = {
    Pending: t("payroll.pendingApproval"),
    Approved: t("payroll.approved"),
    Paid: t("payroll.paid"),
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {labelMap[status]}
    </span>
  );
}
