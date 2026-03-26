"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Wallet, TrendingUp, Eye, FileText } from "lucide-react";
import PayslipDetailModal, { PayslipDetail } from "@/components/PayslipDetailModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payslip extends PayslipDetail {}

interface SalaryConfig {
  config_id: number;
  base_salary: string;
  transport_allowance: string;
  lunch_allowance: string;
  responsibility_allowance: string;
  employee: { employee_id: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const fmt = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  if (isNaN(n)) return "₫0";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(n);
};

const getPeriod = (p: Payslip) => {
  if (p.pay_period) return p.pay_period;
  if (p.payroll_period) return `${String(p.payroll_period.month).padStart(2, "0")}/${p.payroll_period.year}`;
  return "—";
};

const getPeriodLabel = (p: Payslip) => {
  if (p.payroll_period) return `${MONTHS[p.payroll_period.month - 1]} ${p.payroll_period.year}`;
  return getPeriod(p);
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MySalaryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewPayslip, setViewPayslip] = useState<Payslip | null>(null);

  // Load payslips + salary config
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [psRes, cfgRes] = await Promise.all([
          fetch("/api/payroll/my-payslips", { credentials: "include" }),
          fetch("/api/payroll/config", { credentials: "include" }),
        ]);
        if (psRes.ok) { const d = await psRes.json(); setPayslips(Array.isArray(d) ? d : []); }
        if (cfgRes.ok) {
          const d = await cfgRes.json();
          const mine = Array.isArray(d) ? d.find((x: any) => x.employee?.employee_id === user.employee_id) : d;
          setSalaryConfig(mine ?? null);
        }
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Failed to load salary data" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Summary stats
  const lastPayslip = payslips[0] ?? null;
  const currentYear = new Date().getFullYear();
  const ytdTotal = useMemo(
    () => payslips.filter((p) => p.payroll_period?.year === currentYear).reduce((s, p) => s + parseFloat(p.net_salary || "0"), 0),
    [payslips, currentYear]
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Salary History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and download your payslips</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Last Month's Net */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Month's Net</p>
          </div>
          <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
            {lastPayslip ? fmt(lastPayslip.net_salary) : "—"}
          </p>
          {lastPayslip && (
            <p className="text-xs text-gray-400 mt-1">{getPeriodLabel(lastPayslip)}</p>
          )}
        </div>

        {/* YTD Income */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">YTD Income {currentYear}</p>
          </div>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{fmt(ytdTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">Total net received so far this year</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Payslip History
          </h2>
        </div>
        <div className="overflow-x-auto">
          {payslips.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payslips available yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
                  <th className="px-6 py-3 text-left">Period</th>
                  <th className="px-6 py-3 text-right">Work Days</th>
                  <th className="px-6 py-3 text-right">Gross</th>
                  <th className="px-6 py-3 text-right">Net Salary</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {payslips.map((p) => (
                  <tr key={p.payslip_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{getPeriodLabel(p)}</p>
                      <p className="text-xs text-gray-400">{getPeriod(p)}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                      {p.actual_work_days ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                      {fmt(p.gross_salary)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {fmt(p.net_salary)}
                    </td>
                    <td className="px-6 py-4"><StatusPill status={p.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setViewPayslip({ ...p, salaryConfig: salaryConfig ?? undefined })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Detail
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

      {/* Payslip Detail Modal */}
      {viewPayslip && (
        <PayslipDetailModal
          payslip={viewPayslip}
          userName={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
          onClose={() => setViewPayslip(null)}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: "Pending" | "Approved" | "Paid" }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
}