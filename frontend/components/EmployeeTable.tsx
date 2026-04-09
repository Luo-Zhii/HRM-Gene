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
import {
  Search, LayoutGrid, List, Mail, Phone,
  ArrowUpDown, ExternalLink, UserMinus,
  Users, Building2,
} from "lucide-react";
import Link from "next/link";

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
}: EmployeeTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
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

  // ── Filtered + sorted list ─────────────────────────────────────────────────
  const processed = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let list = employees.filter((e) => {
      const name = fullName(e).toLowerCase();
      const emailMatch = e.email.toLowerCase().includes(q);
      const nameMatch = name.includes(q);
      // Only include phone in search when we're allowed to show it
      const phoneMatch = showSensitive && !!e.phone_number?.includes(q);
      return nameMatch || emailMatch || phoneMatch;
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
  }, [employees, searchTerm, sortConfig, showSensitive]);

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
        Loading employees…
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b pb-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={showSensitive ? "Search name, email, phone…" : "Search name, email, dept…"}
            className="pl-9 h-10 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          <p className="font-medium">No employees found</p>
          {searchTerm && (
            <p className="text-sm mt-1 text-gray-400">Try a different search term</p>
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
                  <div className="flex items-center gap-2">Employee <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                </th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("department")}>
                  <div className="flex items-center gap-2">Department <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("position")}>
                  <div className="flex items-center gap-2">Position <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                </th>

                {/*
                  RBAC: Phone column is only rendered for Admin/HR users.
                  Regular employees never see this column header or any cell data.
                */}
                {showSensitive && (
                  <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("phone_number")}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </th>
                )}

                {/*
                  RBAC: Action column (View Profile + Offboard) is only rendered
                  for Admin/HR users. Regular employees have no action column at all.
                */}
                {showActions && (
                  <th className="px-4 py-3 text-right">Actions</th>
                )}
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
                              Terminated
                            </span>
                          )}
                        </div>
                        {emp.is_department_head && (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 w-max mt-0.5 uppercase tracking-wider">
                            Head
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
                    <td className="px-4 py-3">
                      {emp.phone_number ? (
                        <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md text-xs border border-blue-100">
                          {emp.phone_number}
                        </span>
                      ) : "—"}
                    </td>
                  )}

                  {/* RBAC: Action buttons — only rendered when showActions is true */}
                  {showActions && (
                    <td className="text-right px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => navigateToProfile(emp)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-2"
                      >
                        View <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </button>
                      <button
                        disabled={emp.employee_id === currentUserId || emp.employment_status === "Terminated"}
                        onClick={() => onOffboard?.(emp.employee_id)}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
                          emp.employee_id === currentUserId || emp.employment_status === "Terminated"
                            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50"
                            : "text-red-600 bg-red-50 hover:bg-red-100 border-red-100"
                        }`}
                        title={
                          emp.employee_id === currentUserId
                            ? "You cannot offboard yourself"
                            : emp.employment_status === "Terminated"
                            ? "Already terminated"
                            : "Offboard employee"
                        }
                      >
                        Offboard <UserMinus className="w-3.5 h-3.5 ml-1.5" />
                      </button>
                    </td>
                  )}
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
                        Terminated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {emp.position?.position_name || "Employee"} · {emp.department?.department_name || "N/A"}
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
                    <span>{emp.phone_number || "Not provided"}</span>
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
                    >
                      Profile <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={emp.employee_id === currentUserId || emp.employment_status === "Terminated"}
                      onClick={() => onOffboard?.(emp.employee_id)}
                      className={`py-2 px-3 border text-sm font-bold rounded-lg transition-colors flex items-center justify-center ${
                        emp.employee_id === currentUserId || emp.employment_status === "Terminated"
                          ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-50"
                          : "bg-red-50 hover:bg-red-100 border-red-100 text-red-600"
                      }`}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  /* Regular employee: link to public directory profile only */
                  <Link
                    href={`/directory/${emp.employee_id}`}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Profile <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record count */}
      {processed.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {processed.length} employee{processed.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
