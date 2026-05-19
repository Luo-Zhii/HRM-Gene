"use client";

/**
 * EmployeeTable — Shared, RBAC-aware component used by BOTH:
 *   - /admin/employees  (showSensitive=true,  showActions=true)
 *   - /directory        (showSensitive=false, showActions=false)
 *
 * The two RBAC control props are the ONLY difference between the two views.
 * No column duplication, no separate page logic.
 */

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Search, LayoutGrid, List, Mail, Phone,
  ArrowUpDown, ExternalLink, UserMinus,
  Users, Building2, Pencil, Trash2, MessageSquare, Plus,
} from "lucide-react";
import Link from "next/link";
import { Can } from "@/src/components/Can";

// ─── Shared data shape ─────────────────────────────────────────────────────────
// phone_number / address may be undefined when the backend strips them for
// non-privileged callers (GET /employees/directory endpoint).
export interface EmployeeRow {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  phone_number?: string | null;   // Only present in admin responses
  address?: string | null;        // Only present in admin responses
  bankInfo?: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
  } | null;
  department?: { department_id?: number; department_name: string } | null;
  position?: { position_id?: number; position_name: string } | null;
  is_department_head?: boolean;
  employment_status?: string;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface EmployeeTableProps {
  employees: EmployeeRow[];
  loading: boolean;

  /**
   * RBAC: when false the Phone column / Phone card row are hidden entirely.
   * The backend must also strip the field — the UI is a second layer of defence.
   */
  showSensitive: boolean;

  /**
   * RBAC: when false the View / Offboard action buttons are not rendered.
   * Regular employees see no action column at all.
   */
  showActions: boolean;

  /** ID of the currently logged-in user — prevents self-offboard. */
  currentUserId?: number;

  /** Called when admin clicks the Offboard button. */
  onOffboard?: (employeeId: number) => void;

  /** Called when admin clicks the Onboard button. */
  onOnboard?: (employeeId: number) => void;

  /** Called when admin clicks the Edit button. */
  onEdit?: (employee: EmployeeRow) => void;

  /** Called when admin clicks the Delete button. */
  onDelete?: (employeeId: number) => void;

  /** Called to chat with an employee */
  onMessageClick?: (employee: EmployeeRow) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(emp: EmployeeRow) {
  return (
    `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase() || "?"
  );
}

function fullName(emp: EmployeeRow) {
  return `${emp.first_name} ${emp.last_name}`.trim();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmployeeTable({
  employees,
  loading,
  showSensitive,
  showActions,
  currentUserId,
  onOffboard,
  onOnboard,
  onEdit,
  onDelete,
  onMessageClick,
}: EmployeeTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Extract unique department names from the loaded employees list
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      if (emp.department?.department_name) {
        set.add(emp.department.department_name);
      }
    });
    return Array.from(set).sort();
  }, [employees]);

  // ── Filtered + sorted list ─────────────────────────────────────────────────
  const processed = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let list = employees.filter((e) => {
      const name = fullName(e).toLowerCase();
      const emailMatch = e.email.toLowerCase().includes(q);
      const nameMatch = name.includes(q);
      // Only include phone in search when we're allowed to show it
      const phoneMatch = showSensitive && !!e.phone_number?.includes(q);
      const matchesSearch = nameMatch || emailMatch || phoneMatch;

      const matchesDept = selectedDept
        ? e.department?.department_name === selectedDept
        : true;

      return matchesSearch && matchesDept;
    });

    if (sortConfig.key) {
      list = [...list].sort((a: any, b: any) => {
        let av =
          sortConfig.key === "department"
            ? a.department?.department_name ?? ""
            : sortConfig.key === "position"
            ? a.position?.position_name ?? ""
            : a[sortConfig.key!] ?? "";
        let bv =
          sortConfig.key === "department"
            ? b.department?.department_name ?? ""
            : sortConfig.key === "position"
            ? b.position?.position_name ?? ""
            : b[sortConfig.key!] ?? "";
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [employees, searchTerm, selectedDept, sortConfig, showSensitive]);

  // ── Profile navigation ─────────────────────────────────────────────────────
  // Admin → full profile page with HR data
  // Regular employee → read-only public directory profile
  const navigateToProfile = (emp: EmployeeRow) => {
    if (showActions) {
      router.push(`/profile?id=${emp.employee_id}`);
    } else {
      router.push(`/directory/${emp.employee_id}`);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mr-3" />
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b pb-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={showSensitive ? t("employeeTable.searchPlaceholder") : t("employeeTable.searchPublicPlaceholder")}
              className="pl-9 h-10 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="relative w-full sm:w-48">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-10 w-full bg-white border border-gray-200 rounded-xl text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer appearance-none pr-8 font-medium text-gray-600"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.25rem 1.25rem',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <option value="">{t("employeeTable.allDepartments")}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 self-end md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            title="Table view"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {processed.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border text-gray-500">
          <Users size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="font-medium">{t("employeeTable.noEmployees")}</p>
          {searchTerm && (
            <p className="text-sm mt-1 text-gray-400">{t("directory.tryDifferent")}</p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TABLE VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {processed.length > 0 && viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-700 font-semibold border-b">
              <tr>
                {/* Always visible columns */}
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("first_name")}>
                  <div className="flex items-center gap-2">{t("employeeTable.employee")} <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                </th>
                <th className="px-4 py-3">{t("employeeTable.email")}</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("department")}>
                  <div className="flex items-center gap-2">{t("employeeTable.department")} <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("position")}>
                  <div className="flex items-center gap-2">{t("employeeTable.position")} <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                </th>

                {/*
                  RBAC: Phone column is only rendered for Admin/HR users.
                  Regular employees never see this column header or any cell data.
                */}
                {showSensitive && (
                  <>
                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("phone_number")}>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {t("employeeTable.phone")} <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3">{t("employeeTable.bankName")}</th>
                    <th className="px-4 py-3">{t("employeeTable.bankAccount")}</th>
                    <th className="px-4 py-3">{t("employeeTable.address")}</th>
                  </>
                )}

                {/*
                  RBAC: Action column (View Profile + Offboard) is only rendered
                  for Admin/HR users.
                */}
                <th className="px-4 py-3 text-right">{t("employeeTable.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
              {processed.map((emp) => (
                <tr
                  key={emp.employee_id}
                  className={`hover:bg-gray-50/80 transition-colors ${emp.employment_status === "Terminated" ? "opacity-60 bg-gray-50/30" : ""}`}
                >
                  {/* Employee name + avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 overflow-hidden border border-gray-200">
                        {emp.avatar_url
                          ? <img src={emp.avatar_url} alt={emp.first_name} className="w-full h-full object-cover" />
                          : getInitials(emp)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{fullName(emp)}</span>
                          {emp.employment_status === "Terminated" && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border border-red-200">
                              {t("employeeTable.terminated")}
                            </span>
                          )}
                        </div>
                        {emp.is_department_head && (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 w-max mt-0.5 uppercase tracking-wider">
                            {t("employeeTable.head")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="text-gray-600 px-4 py-3">{emp.email}</td>
                  <td className="text-gray-600 px-4 py-3 font-medium">
                    {emp.department?.department_name || "—"}
                  </td>
                  <td className="text-gray-600 px-4 py-3">
                    {emp.position?.position_name || "—"}
                  </td>

                  {/* RBAC: Phone cell — only rendered when showSensitive is true */}
                  {showSensitive && (
                    <>
                      <td className="px-4 py-3">
                        {emp.phone_number ? (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md text-xs border border-blue-100">
                            {emp.phone_number}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="text-gray-600 px-4 py-3 font-medium">{emp.bankInfo?.bank_name || "—"}</td>
                      <td className="px-4 py-3">
                        {emp.bankInfo?.account_number ? (
                          <span className="font-mono bg-slate-50 text-slate-700 px-2 py-1 rounded border border-slate-100 text-xs font-semibold">
                            {emp.bankInfo.account_number}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="text-gray-600 px-4 py-3 text-xs max-w-[150px] truncate" title={emp.address || ""}>
                        {emp.address || "—"}
                      </td>
                    </>
                  )}

                  {/* RBAC: Action buttons */}
                  <td className="text-right px-4 py-3 whitespace-nowrap">
                    {showActions ? (
                      <>
                        <button
                          onClick={() => navigateToProfile(emp)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-2"
                          title={t("employeeTable.viewProfile")}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <Can method="PATCH" apiPath="/api/admin/employees/:id">
                          <button
                            onClick={() => onEdit?.(emp)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-md transition-colors mr-2"
                            title={t("common.edit")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Can>

                        <Can method="DELETE" apiPath="/api/admin/employees/:id">
                          <button
                            disabled={emp.employee_id === currentUserId}
                            onClick={() => onDelete?.(emp.employee_id)}
                            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-md transition-colors mr-2 ${
                              emp.employee_id === currentUserId
                                ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50"
                                : "text-red-600 bg-red-50 hover:bg-red-100 border-red-100"
                            }`}
                            title={t("common.delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                        {emp.employment_status === "Terminated" ? (
                          <Can method="PATCH" apiPath="/api/employees/:id/onboard">
                            <button
                              onClick={() => onOnboard?.(emp.employee_id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-semibold border border-green-100 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                              title={t("employeeTable.onboard")}
                            >
                              {t("employeeTable.onboard")} <Plus className="w-3.5 h-3.5 ml-1.5" />
                            </button>
                          </Can>
                        ) : (
                          <Can method="PATCH" apiPath="/api/employees/:id/offboard">
                            <button
                              disabled={emp.employee_id === currentUserId}
                              onClick={() => onOffboard?.(emp.employee_id)}
                              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
                                emp.employee_id === currentUserId
                                  ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50"
                                  : "text-red-600 bg-red-50 hover:bg-red-100 border-red-100"
                              }`}
                              title={
                                emp.employee_id === currentUserId
                                  ? t("offboard.selfError")
                                  : t("employeeTable.offboard")
                              }
                            >
                              {t("employeeTable.offboard")} <UserMinus className="w-3.5 h-3.5 ml-1.5" />
                            </button>
                          </Can>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onMessageClick?.(emp)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Chat"
                        >
                          <MessageSquare className="w-4 h-4 mr-1.5" /> Chat
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          GRID VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {processed.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {processed.map((emp) => (
            <div
              key={emp.employee_id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-all group ${
                emp.employment_status === "Terminated" ? "opacity-60 grayscale-[0.3]" : ""
              }`}
            >
              {/* Card header: avatar + name */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden border-2 border-white shadow-sm">
                  {emp.avatar_url
                    ? <img src={emp.avatar_url} alt={emp.first_name} className="w-full h-full object-cover" />
                    : <span>{getInitials(emp)}</span>}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {fullName(emp)}
                    </h3>
                    {emp.employment_status === "Terminated" && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border border-red-200">
                        {t("employeeTable.terminated")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {emp.position?.position_name || t("employeeTable.employee")} · {emp.department?.department_name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Card body: safe fields always shown */}
              <div className="space-y-2 mb-4 border-t border-gray-50 pt-3 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.department?.department_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{emp.department.department_name}</span>
                  </div>
                )}

                {/*
                  RBAC: Phone row is conditionally rendered.
                  When showSensitive=false, this block is completely absent from the DOM.
                */}
                {showSensitive && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{emp.phone_number || t("employeeTable.noPhone")}</span>
                  </div>
                )}
              </div>

              {/*
                RBAC: Action buttons — only rendered when showActions=true.
                Regular employees get a single "View Profile" link to the public directory.
              */}
              <div className="mt-auto flex gap-2 pt-2">
                {showActions ? (
                  <>
                    <button
                      onClick={() => navigateToProfile(emp)}
                      className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      title={t("employeeTable.viewProfile")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <Can method="PATCH" apiPath="/api/admin/employees/:id">
                      <button
                        onClick={() => onEdit?.(emp)}
                        className="py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-600 text-sm font-bold rounded-lg transition-colors flex items-center justify-center"
                        title={t("common.edit")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </Can>

                    <Can method="DELETE" apiPath="/api/admin/employees/:id">
                      <button
                        disabled={emp.employee_id === currentUserId}
                        onClick={() => onDelete?.(emp.employee_id)}
                        className={`py-2 px-3 border text-sm font-bold rounded-lg transition-colors flex items-center justify-center ${
                          emp.employee_id === currentUserId
                            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50"
                            : "bg-red-50 hover:bg-red-100 border-red-100 text-red-600"
                        }`}
                        title={t("common.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Can>
                    {emp.employment_status === "Terminated" ? (
                      <Can method="PATCH" apiPath="/api/employees/:id/onboard">
                        <button
                          onClick={() => onOnboard?.(emp.employee_id)}
                          className="py-2 px-3 border border-green-100 text-green-600 bg-green-50 hover:bg-green-100 text-sm font-bold rounded-lg transition-colors flex items-center justify-center"
                          title={t("employeeTable.onboard")}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </Can>
                    ) : (
                      <Can method="PATCH" apiPath="/api/employees/:id/offboard">
                        <button
                          disabled={emp.employee_id === currentUserId}
                          onClick={() => onOffboard?.(emp.employee_id)}
                          className={`py-2 px-3 border text-sm font-bold rounded-lg transition-colors flex items-center justify-center ${
                            emp.employee_id === currentUserId
                              ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50"
                              : "bg-red-50 hover:bg-red-100 border-red-100 text-red-600"
                          }`}
                          title={
                            emp.employee_id === currentUserId
                              ? t("offboard.selfError")
                              : t("employeeTable.offboard")
                          }
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </Can>
                    )}
                  </>
                ) : (
                  /* Regular employee: link to public directory profile + Chat */
                  <>
                    <Link
                      href={`/directory/${emp.employee_id}`}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {t("employeeTable.viewProfile")} <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => onMessageClick?.(emp)}
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      Chat <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record count */}
      {processed.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {processed.length} {t("employeeTable.employee").toLowerCase()}{processed.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
