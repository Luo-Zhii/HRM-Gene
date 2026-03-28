"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import {
  Search, LayoutGrid, List, Mail, Phone,
  ArrowUpDown, ExternalLink, MapPin, UserMinus, X
} from "lucide-react";
// ĐÃ XÓA TOÀN BỘ IMPORT TỪ @/components/ui/dialog, select, datepicker...

interface Position { position_id: number; position_name: string; }
interface Department { department_id: number; department_name: string; }
interface EmployeeData {
  employee_id: number; email: string; first_name: string; last_name: string;
  avatar_url?: string; phone_number?: string; address?: string;
  position?: Position | null; department?: Department | null;
  is_department_head?: boolean;
}

export default function EmployeeDirectoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // --- STATE CHO MODAL OFFBOARD (CODE TAY) ---
  const [offboardEmployeeId, setOffboardEmployeeId] = useState<number | null>(null);
  const [resignationDate, setResignationDate] = useState<string>(""); // Dùng string cho input type="date"
  const [resignationReason, setResignationReason] = useState<string>("");
  const [isSubmittingOffboard, setIsSubmittingOffboard] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null);

  // Hiển thị Toast code tay
  const showToast = (title: string, desc: string, type: 'success' | 'error') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission = user.permissions?.includes("manage:employee") || user.permissions?.includes("manage:system") || user.permissions?.includes("manage:payroll");
      if (!hasPermission) {
        showToast("Access Denied", "You do not have permission to view employee contact info.", "error");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch employee list");
      const data = await res.json();
      setEmployees(data || []);
    } catch (error) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.permissions?.includes("manage:employee") || user.permissions?.includes("manage:system") || user.permissions?.includes("manage:payroll"))) {
      loadEmployees();
    }
  }, [user]);

  const handleOffboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offboardEmployeeId || !resignationDate || !resignationReason) {
      showToast("Error", "All fields are required", "error");
      return;
    }
    setIsSubmittingOffboard(true);
    try {
      const payload = {
        employment_status: "Terminated",
        resignation_date: resignationDate, // Gửi thẳng string định dạng YYYY-MM-DD
        resignation_reason: resignationReason
      };
      const res = await fetch(`/api/employees/${offboardEmployeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Success", "Employee formally offboarded.", "success");
        setOffboardEmployeeId(null);
        setResignationDate("");
        setResignationReason("");
        await loadEmployees(); // Load lại data ngay
      } else {
        showToast("Error", "Failed to offboard employee", "error");
      }
    } catch (err) {
      showToast("Error", "Server error", "error");
    } finally {
      setIsSubmittingOffboard(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let processed = employees.filter(emp => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      return fullName.includes(searchLower) || emp.email.toLowerCase().includes(searchLower) || (emp.phone_number && emp.phone_number.includes(searchLower));
    });

    if (sortConfig.key) {
      processed.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'department') { aValue = a.department?.department_name || ""; bValue = b.department?.department_name || ""; }
        else if (sortConfig.key === 'position') { aValue = a.position?.position_name || ""; bValue = b.position?.position_name || ""; }
        else { aValue = aValue || ""; bValue = bValue || ""; }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return processed;
  }, [employees, sortConfig, searchTerm]);

  const handleViewProfile = (employeeId: number) => {
    window.location.href = `/profile?id=${employeeId}`;
  };

  const getEmployeeName = (employee: EmployeeData) => `${employee.first_name} ${employee.last_name}`.trim();

  const getInitials = (employee: EmployeeData) => {
    const first = employee.first_name?.[0]?.toUpperCase() || "";
    const last = employee.last_name?.[0]?.toUpperCase() || "";
    return `${first}${last}` || "U";
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading employee data...</div>;

  return (
    <div className="relative">
      {/* --- TOAST THÔNG BÁO TỰ CODE --- */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg border ${toastMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} transition-all duration-300`}>
          <h4 className="font-bold text-sm">{toastMsg.title}</h4>
          <p className="text-sm mt-0.5">{toastMsg.desc}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b pb-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1></div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 h-10 w-full bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><List size={18} /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><LayoutGrid size={18} /></button>
          </div>
        </div>
      </div>

      {filteredAndSortedEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border text-gray-500 font-medium">No employees found</div>
      ) : (
        <>
          {/* =========================================
              CHẾ ĐỘ TABLE VIEW (HTML/TAILWIND THUẦN)
             ========================================= */}
          {viewMode === "table" && (
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-700 font-semibold border-b">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('first_name')}>
                      <div className="flex items-center gap-2">Employee <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                    </th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('department')}>
                      <div className="flex items-center gap-2">Department <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('position')}>
                      <div className="flex items-center gap-2">Position <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('phone_number')}>
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> Phone <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /></div>
                    </th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedEmployees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 overflow-hidden border border-gray-200">
                            {emp.avatar_url ? (
                              <img src={emp.avatar_url} alt={emp.first_name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(emp)
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{getEmployeeName(emp)}</span>
                            {emp.is_department_head && (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 w-max mt-0.5 uppercase">Head</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-600 px-4 py-3">{emp.email}</td>
                      <td className="text-gray-600 px-4 py-3 font-medium">{emp.department?.department_name || "-"}</td>
                      <td className="text-gray-600 px-4 py-3">{emp.position?.position_name || "-"}</td>
                      <td className="px-4 py-3">
                        {emp.phone_number ? (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md text-xs border border-blue-100">{emp.phone_number}</span>
                        ) : "-"}
                      </td>
                      <td className="text-right px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleViewProfile(emp.employee_id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-transparent hover:bg-blue-50 rounded-md transition-colors mr-2"
                        >
                          View <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </button>
                        <button
                          disabled={emp.employee_id === user?.employee_id}
                          onClick={() => setOffboardEmployeeId(emp.employee_id)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${emp.employee_id === user?.employee_id ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100'}`}
                          title={emp.employee_id === user?.employee_id ? "You cannot offboard yourself" : "Offboard Employee"}
                        >
                          Offboard <UserMinus className="w-3.5 h-3.5 ml-1.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =========================================
              CHẾ ĐỘ GRID VIEW
             ========================================= */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAndSortedEmployees.map((emp) => (
                <div key={emp.employee_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                      {emp.avatar_url ? (
                        <img src={emp.avatar_url} alt={emp.first_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(emp)
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{getEmployeeName(emp)}</h3>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{emp.position?.position_name || "Employee"} • {emp.department?.department_name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-5 border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-2.5 text-gray-600"><Mail className="w-4 h-4 text-gray-400" /> <span className="text-sm font-medium truncate">{emp.email}</span></div>
                    <div className="flex items-center gap-2.5 text-gray-600"><Phone className="w-4 h-4 text-gray-400" /> <span className="text-sm font-medium">{emp.phone_number || "Not updated"}</span></div>
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewProfile(emp.employee_id)}
                      className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      Profile <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={emp.employee_id === user?.employee_id}
                      onClick={() => setOffboardEmployeeId(emp.employee_id)}
                      className={`py-2 px-3 border text-sm font-bold rounded-lg transition-colors flex items-center justify-center ${emp.employee_id === user?.employee_id ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 border-red-100 text-red-600'}`}
                      title={emp.employee_id === user?.employee_id ? "You cannot offboard yourself" : "Offboard Employee"}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* =========================================
          MODAL OFFBOARD (TỰ CODE HOÀN TOÀN BẰNG TAILWIND)
          ========================================= */}
      {offboardEmployeeId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Nút X đóng */}
            <button
              onClick={() => setOffboardEmployeeId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-red-600 flex items-center gap-2">
                <UserMinus className="w-6 h-6" /> Process Resignation
              </h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                This action will officially terminate the employee's active contract and update analytics globally.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleOffboard} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Resignation Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={resignationDate}
                  onChange={(e) => setResignationDate(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for Resignation <span className="text-red-500">*</span></label>
                <select
                  required
                  value={resignationReason}
                  onChange={(e) => setResignationReason(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="" disabled>-- Select Reason --</option>
                  <option value="Compensation">Compensation & Benefits</option>
                  <option value="Culture">Company Culture</option>
                  <option value="Personal">Personal Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setOffboardEmployeeId(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffboard}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  {isSubmittingOffboard ? "Processing..." : "Confirm Offboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}