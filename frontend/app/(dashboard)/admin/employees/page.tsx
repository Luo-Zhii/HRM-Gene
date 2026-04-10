"use client";

/**
 * Admin Employee Directory — /admin/employees
 *
 * RBAC: Only accessible to users with manage:employee / manage:system /
 *       manage:payroll permissions, or Admin/HR/Director positions.
 *
 * Re-uses the shared <EmployeeTable> component with:
 *   showSensitive={true}  → Phone column visible
 *   showActions={true}    → View + Offboard buttons visible
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { UserMinus, X, ShieldOff } from "lucide-react";
import EmployeeTable, { EmployeeRow } from "@/components/EmployeeTable";

// ─── Permission helper (same logic as isPrivilegedUser in the old page) ────────
function isPrivilegedUser(user: any): boolean {
  if (!user) return false;
  const perms: string[] = user.permissions ?? [];
  const pos = (user.position?.position_name ?? user.role ?? "").toLowerCase();
  return (
    perms.includes("manage:employee") ||
    perms.includes("manage:system") ||
    perms.includes("manage:payroll") ||
    pos === "admin" ||
    pos === "hr" ||
    pos === "hr manager" ||
    pos === "director"
  );
}

export default function AdminEmployeeDirectoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{
    title: string;
    desc: string;
    type: "success" | "error";
  } | null>(null);

  // Offboard modal state
  const [offboardId, setOffboardId] = useState<number | null>(null);
  const [resignationDate, setResignationDate] = useState("");
  const [resignationReason, setResignationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (title: string, desc: string, type: "success" | "error") => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── RBAC render gate ────────────────────────────────────────────────────────
  // Computed synchronously after auth resolves — no data is fetched until this is true.
  const canAccess = !authLoading && isPrivilegedUser(user);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // Admin endpoint returns full data including phone_number and address
      const res = await fetch("/api/employees", { credentials: "include" });
      if (!res.ok) throw new Error();
      setEmployees((await res.json()) || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      loadEmployees();
    } else if (!authLoading) {
      setLoading(false); // stop spinner for unauthorized users
    }
  }, [canAccess, authLoading]);

  const handleOffboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offboardId || !resignationDate || !resignationReason) {
      showToast("Error", "All fields are required", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${offboardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employment_status: "Terminated",
          resignation_date: resignationDate,
          resignation_reason: resignationReason,
        }),
      });
      if (res.ok) {
        showToast("Success", "Employee formally offboarded.", "success");
        setOffboardId(null);
        setResignationDate("");
        setResignationReason("");
        await loadEmployees();
      } else {
        showToast("Error", "Failed to offboard employee", "error");
      }
    } catch {
      showToast("Error", "Server error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Stage 1: Auth loading ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        {t("common.loading")}
      </div>
    );
  }

  // ── Stage 2: Not privileged — block completely, link to public directory ──
  if (!canAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <ShieldOff size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t("access.denied")}</h2>
          <p className="text-sm text-gray-500">
            {t("access.noPermission")}
            <br className="mb-2" />
            {t("access.tryDirectory")}{" "}
            <a href="/directory" className="text-blue-600 font-semibold hover:underline">
              {t("access.staffDirectory")}
            </a>.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {t("access.backToDashboard")}
          </a>
        </div>
      </div>
    );
  }

  // ── Stage 3: Privileged user — full admin UI ──────────────────────────────
  return (
    <div className="relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
            toastMsg.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <h4 className="font-bold text-sm">{toastMsg.title}</h4>
          <p className="text-sm mt-0.5">{toastMsg.desc}</p>
        </div>
      )}

      {/* Page title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("sidebar.employeeDirectory")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("directory.adminSubtitle")}</p>
        </div>
      </div>

      {/*
        EmployeeTable with full privileges:
          showSensitive={true}  → Phone column rendered
          showActions={true}    → View/Offboard buttons rendered
      */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        showSensitive={true}
        showActions={true}
        currentUserId={user?.employee_id}
        onOffboard={(id) => setOffboardId(id)}
      />

      {/* ── Offboard modal ─────────────────────────────────────────────────── */}
      {offboardId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setOffboardId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-red-600 flex items-center gap-2">
                <UserMinus className="w-6 h-6" /> {t("offboard.title")}
              </h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                {t("offboard.description")}
              </p>
            </div>

            <form onSubmit={handleOffboard} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  {t("offboard.resignationDate")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={resignationDate}
                  onChange={(e) => setResignationDate(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  {t("offboard.reason")} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={resignationReason}
                  onChange={(e) => setResignationReason(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="" disabled>{t("offboard.selectReason")}</option>
                  <option value="Compensation">{t("offboard.compensation")}</option>
                  <option value="Culture">{t("offboard.culture")}</option>
                  <option value="Personal">{t("offboard.personal")}</option>
                  <option value="Other">{t("offboard.other")}</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setOffboardId(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                >
                  {t("offboard.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  {isSubmitting ? t("offboard.processing") : t("offboard.confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}