"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search, LayoutGrid, List, Mail, User, Phone,
  ArrowUpDown, ExternalLink, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Position { position_id: number; position_name: string; }
interface Department { department_id: number; department_name: string; }
interface EmployeeData {
  employee_id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  position?: Position | null;
  department?: Department | null;
}

export default function EmployeeDirectoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission = user.permissions?.includes("manage:employee") || user.permissions?.includes("manage:system") || user.permissions?.includes("manage:payroll");
      if (!hasPermission) {
        toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to view employee contact info." });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router, toast]);

  useEffect(() => {
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
    if (user && (user.permissions?.includes("manage:employee") || user.permissions?.includes("manage:system") || user.permissions?.includes("manage:payroll"))) {
      loadEmployees();
    }
  }, [user]);

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

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b pb-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1></div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-9 h-10 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><List size={18} /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><LayoutGrid size={18} /></button>
          </div>
        </div>
      </div>

      {filteredAndSortedEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">No employees found</div>
      ) : (
        <>
          {/* =========================================
              CHẾ ĐỘ TABLE VIEW
             ========================================= */}
          {viewMode === "table" && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="p-0 min-w-[200px]">
                      <Button variant="ghost" onClick={() => handleSort('first_name')} className="flex w-full justify-start gap-2 font-semibold text-gray-700">
                        Employee <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>

                    <TableHead className="font-semibold text-gray-700 px-4">Email</TableHead>

                    <TableHead className="p-0">
                      <Button variant="ghost" onClick={() => handleSort('department')} className="flex w-full justify-start gap-2 font-semibold text-gray-700">
                        Department <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>

                    {/* TRƯỜNG POSITION */}
                    <TableHead className="p-0">
                      <Button variant="ghost" onClick={() => handleSort('position')} className="flex w-full justify-start gap-2 font-semibold text-gray-700">
                        Position <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>

                    <TableHead className="p-0">
                      <Button variant="ghost" onClick={() => handleSort('phone_number')} className="flex w-full justify-start gap-2 font-semibold text-gray-700">
                        <Phone className="w-4 h-4" /> Phone Number <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>

                    {/* TRƯỜNG ADDRESS */}
                    <TableHead className="p-0">
                      <Button variant="ghost" onClick={() => handleSort('address')} className="flex w-full justify-start gap-2 font-semibold text-gray-700">
                        <MapPin className="w-4 h-4" /> Address <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>

                    <TableHead className="text-right font-semibold text-gray-700 px-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedEmployees.map((emp) => (
                    <TableRow key={emp.employee_id} className="hover:bg-gray-50">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E0E7FF] flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                            {getInitials(emp)}
                          </div>
                          <span className="font-medium text-gray-900">{getEmployeeName(emp)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-600 px-4 py-3">{emp.email}</TableCell>

                      <TableCell className="text-gray-600 px-4 py-3">{emp.department?.department_name || "-"}</TableCell>

                      {/* DỮ LIỆU POSITION */}
                      <TableCell className="text-gray-600 px-4 py-3">{emp.position?.position_name || "-"}</TableCell>

                      <TableCell className="px-4 py-3">
                        {emp.phone_number ? (
                          <span className="bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-md text-sm">
                            {emp.phone_number}
                          </span>
                        ) : "-"}
                      </TableCell>

                      {/* DỮ LIỆU ADDRESS */}
                      <TableCell className="text-gray-600 px-4 py-3 max-w-[200px] truncate" title={emp.address}>
                        {emp.address || "-"}
                      </TableCell>

                      <TableCell className="text-right px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProfile(emp.employee_id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          View Profile <ExternalLink className="w-4 h-4 ml-1.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* =========================================
              CHẾ ĐỘ GRID VIEW
             ========================================= */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEmployees.map((emp) => (
                <div key={emp.employee_id} className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-full bg-[#E0E7FF] border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      {getInitials(emp)}
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-gray-900 leading-tight">{getEmployeeName(emp)}</h3>
                      <p className="text-[13px] text-gray-500 mt-1 font-medium">{emp.position?.position_name || "Employee"}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600"><Mail className="w-4 h-4 shrink-0" /> <span className="text-sm font-medium truncate">{emp.email}</span></div>
                    <div className="flex items-center gap-3 text-gray-600"><Phone className="w-4 h-4 shrink-0" /> <span className="text-sm font-medium">{emp.phone_number || "Not updated"}</span></div>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => handleViewProfile(emp.employee_id)}
                      className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                    >
                      More info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}