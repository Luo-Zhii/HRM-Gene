"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit2, Save, X, Trash2, User, FileText, FilePlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PayslipDetailModal from "@/components/PayslipDetailModal";
import { ToastAction } from "@/components/ui/toast";

interface Position {
  position_id: number;
  position_name: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Employee {
  employee_id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  position?: Position | null;
  department?: Department | null;
}

interface SalaryConfig {
  config_id: number | null;
  employee: Employee;
  base_salary: string;
  transport_allowance: string;
  lunch_allowance: string;
  responsibility_allowance: string;
}

export default function SalaryConfigPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SalaryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    base_salary: "",
    transport_allowance: "",
    lunch_allowance: "",
    responsibility_allowance: "",
  });
  const [saving, setSaving] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission =
        user.permissions?.includes("manage:payroll") ||
        user.permissions?.includes("manage:system");
      if (!hasPermission) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have permission to access this page.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router, toast]);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedConfigs = useMemo(() => {
    let sortableItems = [...configs];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key!];
        let bValue: any = b[sortConfig.key!];
        
        // Handle nested employee properties for sorting if needed (e.g., first_name)
        if (sortConfig.key === 'first_name') {
           aValue = a.employee.first_name;
           bValue = b.employee.first_name;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [configs, sortConfig]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/config?page=1&limit=1000", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch salary configs (${res.status})`);
      const data = await res.json();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading salary configs:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load salary configurations." });
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.permissions?.includes("manage:payroll") || user.permissions?.includes("manage:system"))) {
      loadConfigs();
    }
  }, [user]);

  const handleEdit = (config: SalaryConfig, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEmployee(config);
    setEditForm({
      base_salary: config.base_salary || "0",
      transport_allowance: config.transport_allowance || "0",
      lunch_allowance: config.lunch_allowance || "0",
      responsibility_allowance: config.responsibility_allowance || "0",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsGenerateModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    try {
      setSaving(true);
      const employeeId = selectedEmployee.employee.employee_id;
      const res = await fetch(`/api/payroll/config/${employeeId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_salary: String(parseFloat(editForm.base_salary).toFixed(2)),
          transport_allowance: String(parseFloat(editForm.transport_allowance || "0").toFixed(2)),
          lunch_allowance: String(parseFloat(editForm.lunch_allowance || "0").toFixed(2)),
          responsibility_allowance: String(parseFloat(editForm.responsibility_allowance || "0").toFixed(2)),
        }),
      });
      if (!res.ok) throw new Error("Failed to update salary config");
      toast({ variant: "default", title: "Success", description: "Salary configuration saved successfully" });
      handleCloseModal();
      await loadConfigs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to save configuration" });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateClick = (config: SalaryConfig, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEmployee(config);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateSingle = async () => {
    if (!selectedEmployee) return;
    try {
      setGenerating(true);
      const res = await fetch("/api/payroll/generate-single", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee.employee_id,
          month: parseInt(generateForm.month),
          year: parseInt(generateForm.year),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate payslip");
      }
      const data = await res.json();
      toast({
        title: "Payslip Generated",
        description: `Generated payslip for ${getEmployeeName(selectedEmployee.employee)}`,
        action: (
          <ToastAction onClick={() => setViewingPayslip(data)} className="bg-blue-600 text-white hover:bg-blue-700">
            View
          </ToastAction>
        ),
      });
      handleCloseModal();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value: any) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "₫0";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(num);
  };

  const getEmployeeName = (employee: Employee) => `${employee.first_name} ${employee.last_name}`.trim();
  const getInitials = (employee: Employee) => `${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase() || "U";

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Salary Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage base salary and allowances for employees</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border dark:border-gray-700">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                  <TableHead className="p-0"><Button variant="ghost" onClick={() => handleSort('first_name')} className="flex w-full justify-start gap-2 h-12 font-bold hover:bg-transparent">Employee <ArrowUpDown size={14} /></Button></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="p-0"><Button variant="ghost" onClick={() => handleSort('base_salary')} className="flex w-full justify-end gap-2 h-12 font-bold hover:bg-transparent text-right">Base Salary <ArrowUpDown size={14} /></Button></TableHead>
                  <TableHead className="text-right">Allowances</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedConfigs.map((config) => (
                  <TableRow key={config.config_id || `emp-${config.employee.employee_id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <TableCell>
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold overflow-hidden border border-gray-100 dark:border-gray-700">
                          {config.employee.avatar_url ? <img src={config.employee.avatar_url} className="w-full h-full object-cover" /> : getInitials(config.employee)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{getEmployeeName(config.employee)}</span>
                          {config.config_id === null && <span className="text-[10px] uppercase font-bold text-red-500">Not Configured</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{config.employee.email}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{config.employee.department?.department_name || "-"}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{config.employee.position?.position_name || "-"}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">{formatCurrency(config.base_salary)}</TableCell>
                    <TableCell className="text-right text-gray-500 text-sm">
                      {formatCurrency(parseFloat(config.transport_allowance || "0") + parseFloat(config.lunch_allowance || "0") + parseFloat(config.responsibility_allowance || "0"))}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => handleEdit(config, e)} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={16} /></Button>
                        <Button variant="ghost" size="sm" onClick={(e) => handleGenerateClick(config, e)} disabled={config.config_id === null} className="text-blue-600 hover:bg-blue-50"><FilePlus size={16} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* --- EDIT MODAL --- */}
        {isEditModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleCloseModal}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold">Salary Config: {getEmployeeName(selectedEmployee.employee)}</h2>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}><X size={20} /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-500">Base Salary</label><Input type="number" value={editForm.base_salary} onChange={e => setEditForm({...editForm, base_salary: e.target.value})} className="h-11" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-500">Transport Allowance</label><Input type="number" value={editForm.transport_allowance} onChange={e => setEditForm({...editForm, transport_allowance: e.target.value})} className="h-11" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-500">Lunch Allowance</label><Input type="number" value={editForm.lunch_allowance} onChange={e => setEditForm({...editForm, lunch_allowance: e.target.value})} className="h-11" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-500">Responsibility</label><Input type="number" value={editForm.responsibility_allowance} onChange={e => setEditForm({...editForm, responsibility_allowance: e.target.value})} className="h-11" /></div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseModal} disabled={saving} className="h-11 px-6">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 font-bold shadow-lg shadow-blue-500/20">{saving ? "Saving..." : "Save Configuration"}</Button>
              </div>
            </div>
          </div>
        )}

        {/* --- GENERATE MODAL --- */}
        {isGenerateModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleCloseModal}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border dark:border-gray-700 animate-in fade-in zoom-in duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="p-6 text-center space-y-4 pt-10">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FilePlus className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Generate Payslip</h3>
                  <p className="text-gray-500 text-sm">Calculate payroll for {getEmployeeName(selectedEmployee.employee)}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <select className="h-11 rounded-lg border dark:bg-gray-700 dark:border-gray-600 px-3 bg-white" value={generateForm.month} onChange={e => setGenerateForm({...generateForm, month: e.target.value})}>
                      {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Month {i+1}</option>)}
                    </select>
                    <select className="h-11 rounded-lg border dark:bg-gray-700 dark:border-gray-600 px-3 bg-white" value={generateForm.year} onChange={e => setGenerateForm({...generateForm, year: e.target.value})}>
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
               </div>
               <div className="p-6 flex flex-col gap-2 mt-4 pb-8">
                  <Button onClick={handleGenerateSingle} disabled={generating} className="bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold shadow-lg shadow-blue-500/25">{generating ? "Processing..." : "Generate Now"}</Button>
                  <Button variant="ghost" onClick={handleCloseModal} className="h-11">Cancel</Button>
               </div>
            </div>
          </div>
        )}

        {/* --- DETAIL MODAL --- */}
        {viewingPayslip && (
          <PayslipDetailModal payslip={viewingPayslip} onClose={() => setViewingPayslip(null)} userName={user?.first_name + " " + user?.last_name} />
        )}
      </div>
    </div>
  );
}
