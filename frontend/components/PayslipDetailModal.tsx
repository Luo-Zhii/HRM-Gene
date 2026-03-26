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
  // Optimized array structure from API
  earnings?: PayslipLineItem[];
  deduction_items?: PayslipLineItem[];
  has_nonzero_allowances?: boolean;
  has_bonus?: boolean;
  // New fields for Net Pay card + Signatures
  total_income?: number;
  total_deductions?: number;
  net_pay_in_words?: string;
  employee_name?: string;
  prepared_by_name?: string;
  prepared_by_department?: string;
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

// Squiggly SVG signature placeholder
function SquigglyLine() {
  return (
    <svg viewBox="0 0 120 24" className="w-full h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 16 Q14 4 24 16 Q34 28 44 16 Q54 4 64 16 Q74 28 84 16 Q94 4 104 16 Q114 28 120 16" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PayslipDetailModal({ payslip, userName, onClose }: Props) {
  const cfg = payslip.salaryConfig;
  const gross = payslip.total_income ?? parseFloat(payslip.gross_salary || "0");
  const bonus = parseFloat(payslip.bonus || "0");
  const deductions = payslip.total_deductions ?? parseFloat(payslip.deductions || "0");
  const net = parseFloat(payslip.net_salary || "0");

  // ── Income Breakdown ──
  let earningsRows: PayslipLineItem[];
  if (payslip.earnings && payslip.earnings.length > 0) {
    earningsRows = payslip.earnings;
  } else if (cfg) {
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

  const empName = payslip.employee_name
    || (payslip.employee
      ? `${payslip.employee.first_name} ${payslip.employee.last_name}`.trim()
      : (userName ?? "Employee"));
  const empDept = payslip.employee?.department?.department_name ?? "—";
  const empPos = payslip.employee?.position?.position_name ?? "—";
  const preparedBy = payslip.prepared_by_name || userName || "System Admin";
  const preparedByDept = payslip.prepared_by_department || "Human Resources";
  const netInWords = payslip.net_pay_in_words ?? "";

  const handlePrint = () => {
    const printContent = document.getElementById("payslip-print-area");
    if (!printContent) return;
    const win = window.open("", "_blank", "width=700,height=900");
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
        .net-box { border: 1.5px solid #bfdbfe; padding: 12px 14px; border-radius: 8px; display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-top: 12px; }
        .net-amount { font-size: 22px; font-weight: 900; color: #1d4ed8; }
        .words { font-size: 9px; color: #6b7280; margin-top: 4px; font-style: italic; }
        .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 6px; margin-top: 10px; }
        h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; text-align: center; letter-spacing: 0.05em; }
        .red { color: #dc2626; } .green { color: #059669; } .blue { color: #2563eb; }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; }
        .sig-box { text-align: center; }
        .sig-title { font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .sig-sub { font-size: 9px; color: #9ca3af; }
        .sig-name { font-size: 11px; font-weight: 700; margin-top: 4px; }
        .sig-line { border-top: 1px dashed #d1d5db; margin: 28px 8px 6px; }
      </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
            <InfoItem icon={<User className="w-3 h-3" />} label="Employee" value={empName} />
            <InfoItem icon={<Building2 className="w-3 h-3" />} label="Department" value={empDept} />
            <InfoItem icon={<DollarSign className="w-3 h-3" />} label="Position" value={empPos} />
            <InfoItem icon={<Calendar className="w-3 h-3" />} label="Pay Period" value={getPeriod(payslip)} />
          </div>

          {/* Attendance bar */}
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

          {/* I. Income */}
          <div>
            <SectionTitle>I. Income</SectionTitle>
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

          {/* II. Deductions */}
          <div>
            <SectionTitle>II. Deductions</SectionTitle>
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

          {/* III. Net Take-Home Pay – Figma card */}
          <div>
            <SectionTitle>III. Net Take-Home Pay</SectionTitle>
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto] divide-x divide-blue-100 dark:divide-blue-900">

                {/* Left column – summary rows */}
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Total Income:</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{fmt(gross)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Total Deductions:</span>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 tabular-nums">-{fmt(deductions)}</span>
                  </div>
                </div>

                {/* Right column – net amount */}
                <div className="px-3 py-2.5 flex flex-col items-end justify-center bg-blue-50/60 dark:bg-blue-950/30 min-w-0">
                  <p className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest whitespace-nowrap mb-0.5">
                    Net Salary Received
                  </p>
                  <p className="text-xl font-black text-blue-700 dark:text-blue-300 tabular-nums leading-tight">
                    {fmt(net)}
                  </p>
                  {netInWords && (
                    <p className="text-[9px] text-blue-400 dark:text-blue-500 italic mt-0.5 text-right leading-snug max-w-[170px]">
                      ({netInWords})
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* IV. Signatures */}
          <div>
            <SectionTitle>Signatures</SectionTitle>
            <div className="grid grid-cols-2 gap-3">

              {/* Prepared By */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 pt-2 pb-3 flex flex-col items-center text-center">
                <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Prepared By</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mb-3">(System Generated)</p>
                <div className="w-full px-1 mb-2">
                  <SquigglyLine />
                </div>
                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate w-full">{preparedBy}</p>
                <p className="text-[9px] text-gray-400">{preparedByDept}</p>
              </div>

              {/* Employee Confirmation */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 pt-2 pb-3 flex flex-col items-center text-center">
                <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Employee Confirmation</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mb-3">(System Generated)</p>
                <div className="w-full px-1 mb-2">
                  <SquigglyLine />
                </div>
                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate w-full">{empName}</p>
                <p className="text-[9px] text-gray-400">Employee</p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-1 space-y-0.5">
            <p className="text-[9px] italic text-gray-400 dark:text-gray-600">
              This is a system-generated document from the DashStack HR platform.
            </p>
            <p className="text-[9px] italic text-gray-400 dark:text-gray-600">
              It does not require a physical signature or company stamp.
            </p>
            <p className="text-[9px] italic text-gray-400 dark:text-gray-600">
              © {new Date().getFullYear()} DashStack Inc. All rights reserved.
            </p>
          </div>
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


