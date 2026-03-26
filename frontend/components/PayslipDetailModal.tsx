"use client";

import React from "react";
import { X, Printer, Building2, User, Calendar, Clock, TrendingUp, TrendingDown, DollarSign, CheckCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayslipLineItem {
  name: string;
  value: number;
}

export interface PayslipDetail {
  payslip_id: number;
  actual_work_days: number;
  ot_hours: number;
  bonus: string;
  gross_salary: string;
  deductions: string;
  net_salary: string;
  status: "Pending" | "Approved" | "Paid";
  payroll_period?: { month: number; year: number };
  pay_period?: string;
  employee?: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    position?: { position_name: string };
    department?: { department_name: string };
  };
  // Legacy fixed config (still supported)
  salaryConfig?: {
    base_salary: string;
    transport_allowance: string;
    lunch_allowance: string;
    responsibility_allowance: string;
  };
  // New optimized array structure from API
  earnings?: PayslipLineItem[];
  deduction_items?: PayslipLineItem[];
  has_nonzero_allowances?: boolean;
  has_bonus?: boolean;
}

interface Props {
  payslip: PayslipDetail;
  userName?: string;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  if (isNaN(n)) return "₫0";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(n);
};

const getPeriod = (p: PayslipDetail) => {
  if (p.pay_period) return p.pay_period;
  if (p.payroll_period) {
    const m = String(p.payroll_period.month).padStart(2, "0");
    return `${m}/${p.payroll_period.year}`;
  }
  return "—";
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const getPeriodLabel = (p: PayslipDetail) => {
  if (p.payroll_period) return `${MONTHS[p.payroll_period.month - 1]} ${p.payroll_period.year}`;
  return getPeriod(p);
};

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PayslipDetailModal({ payslip, userName, onClose }: Props) {
  const cfg = payslip.salaryConfig;
  const gross = parseFloat(payslip.gross_salary || "0");
  const bonus = parseFloat(payslip.bonus || "0");
  const deductions = parseFloat(payslip.deductions || "0");
  const net = parseFloat(payslip.net_salary || "0");

  // ── Income Breakdown ──
  // Support new array-based structure OR legacy fixed config
  let earningsRows: PayslipLineItem[];
  if (payslip.earnings && payslip.earnings.length > 0) {
    // New API structure: already filtered to non-zero by backend
    earningsRows = payslip.earnings;
  } else if (cfg) {
    // Legacy: build rows, filter zero values
    const basePart = parseFloat(cfg.base_salary || "0");
    const transport = parseFloat(cfg.transport_allowance || "0");
    const lunch = parseFloat(cfg.lunch_allowance || "0");
    const responsibility = parseFloat(cfg.responsibility_allowance || "0");
    earningsRows = [
      { name: "Base Salary", value: basePart },
      ...(transport > 0 ? [{ name: "Transport Allowance", value: transport }] : []),
      ...(lunch > 0 ? [{ name: "Lunch Allowance", value: lunch }] : []),
      ...(responsibility > 0 ? [{ name: "Responsibility Allowance", value: responsibility }] : []),
      ...(bonus > 0 ? [{ name: "Bonus / Commission", value: bonus }] : []),
    ];
  } else {
    // Minimal fallback
    earningsRows = [
      { name: "Base Salary", value: gross - bonus },
      ...(bonus > 0 ? [{ name: "Bonus / Commission", value: bonus }] : []),
    ];
  }

  // ── Deduction Breakdown ──
  let deductionRows: PayslipLineItem[];
  if (payslip.deduction_items && payslip.deduction_items.length > 0) {
    deductionRows = payslip.deduction_items;
  } else {
    const baseSalary = cfg ? parseFloat(cfg.base_salary || "0") : gross;
    const insurance = baseSalary * 0.105;
    const penalty = Math.max(0, deductions - insurance);
    deductionRows = [
      { name: "Social + Health + Unemployment (10.5%)", value: insurance },
      ...(penalty > 0 ? [{ name: "Penalties / Fines", value: penalty }] : []),
    ];
  }

  const empName = payslip.employee
    ? `${payslip.employee.first_name} ${payslip.employee.last_name}`.trim()
    : (userName ?? "Employee");
  const empDept = payslip.employee?.department?.department_name ?? "—";
  const empPos = payslip.employee?.position?.position_name ?? "—";

  const handlePrint = () => {
    const printContent = document.getElementById("payslip-print-area");
    if (!printContent) return;
    const win = window.open("", "_blank", "width=700,height=800");
    if (!win) return;
    win.document.write(`<html><head><title>Payslip - ${getPeriod(payslip)}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; padding: 28px; color: #111; font-size: 13px; }
        .divider { border-top: 1px solid #e5e7eb; margin: 10px 0; }
        .dash { border-top: 2px dashed #d1d5db; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .label { color: #6b7280; }
        .bold { font-weight: 700; }
        .net-box { background: #eff6ff; border: 2px solid #bfdbfe; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
        .net-amount { font-size: 20px; font-weight: 900; color: #1d4ed8; }
        .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 6px; margin-top: 10px; }
        h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; text-align: center; letter-spacing: 0.05em; }
        .red { color: #dc2626; } .green { color: #059669; } .blue { color: #2563eb; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f9fafb; padding: 8px; border-radius: 6px; margin: 8px 0; }
        .info-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; }
        .info-val { font-size: 12px; font-weight: 600; }
      </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal – compact receipt style */}
      <div className="relative w-full max-w-[480px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Payslip</h2>
              <p className="text-[11px] text-gray-400 leading-tight">{getPeriodLabel(payslip)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div id="payslip-print-area" className="overflow-y-auto flex-1 px-4 py-3 space-y-3">

          {/* Company + Title */}
          <div className="text-center pb-3 border-b-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">DashStack HR System</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">PAYSLIP</h3>
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-0.5 rounded-full">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">{getPeriodLabel(payslip)}</span>
            </div>
          </div>

          {/* Employee Info – 2×2 grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
            <InfoItem icon={<User className="w-3 h-3" />} label="Employee" value={empName} />
            <InfoItem icon={<Building2 className="w-3 h-3" />} label="Department" value={empDept} />
            <InfoItem icon={<DollarSign className="w-3 h-3" />} label="Position" value={empPos} />
            <InfoItem icon={<Calendar className="w-3 h-3" />} label="Pay Period" value={getPeriod(payslip)} />
          </div>

          {/* Attendance – single compact bar */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5 flex-1">
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Days Worked</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white ml-0.5">{payslip.actual_work_days}</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5 flex-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">OT</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white ml-0.5">{payslip.ot_hours ?? 0}h</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[payslip.status] ?? "bg-gray-100 text-gray-600"}`}>
                {payslip.status}
              </span>
            </div>
          </div>

          {/* Income */}
          <div>
            <SectionTitle>Income</SectionTitle>
            <div className="space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
              {earningsRows.map((item, i) => {
                const isBonus = item.name.toLowerCase().includes("bonus") || item.name.toLowerCase().includes("commission");
                return (
                  <LineItem
                    key={i}
                    label={item.name}
                    value={isBonus ? `+${fmt(item.value)}` : fmt(item.value)}
                    highlight={isBonus ? "emerald" : undefined}
                    icon={isBonus ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : undefined}
                    sub={item.name !== "Base Salary" && !isBonus}
                  />
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                <LineItem label="Total Gross" value={fmt(gross)} bold />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <SectionTitle>Deductions</SectionTitle>
            <div className="space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
              {deductionRows.map((item, i) => (
                <LineItem
                  key={i}
                  label={item.name}
                  value={`-${fmt(item.value)}`}
                  highlight="red"
                  icon={item.name.toLowerCase().includes("penalt") ? <TrendingDown className="w-3 h-3 text-red-500" /> : undefined}
                />
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                <LineItem label="Total Deductions" value={`-${fmt(deductions)}`} bold highlight="red" />
              </div>
            </div>
          </div>

          {/* Net Pay – compact banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Net Take-Home Pay</p>
              <p className="text-[9px] text-blue-300">Bank transfer</p>
            </div>
            <p className="text-xl font-black text-white tracking-tight">{fmt(net)}</p>
          </div>

          {/* Footer */}
          <p className="text-center text-[9px] text-gray-400 dark:text-gray-600 pb-1">
            System-generated payslip · DashStack HR © {new Date().getFullYear()}
          </p>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1.5 px-0.5">
      {children}
    </h4>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-400 mb-0.5">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{value}</p>
    </div>
  );
}

function LineItem({
  label, value, sub, bold, highlight, icon,
}: {
  label: string; value: string; sub?: boolean; bold?: boolean;
  highlight?: "red" | "emerald"; icon?: React.ReactNode;
}) {
  const valColor = highlight === "red" ? "text-red-600 dark:text-red-400"
    : highlight === "emerald" ? "text-emerald-600 dark:text-emerald-400"
      : "text-gray-900 dark:text-white";

  return (
    <div className={`flex items-center justify-between ${sub ? "pl-3" : ""}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`${sub ? "text-[11px] text-gray-400 dark:text-gray-500" : bold ? "text-xs font-semibold text-gray-700 dark:text-gray-200" : "text-xs text-gray-600 dark:text-gray-300"}`}>
          {label}
        </span>
      </div>
      <span className={`text-xs ${bold ? "font-bold" : "font-medium"} ${valColor}`}>{value}</span>
    </div>
  );
}
