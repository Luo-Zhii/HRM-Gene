"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Save, X, Trash2, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(true);
  const [editForm, setEditForm] = useState({
    base_salary: "",
    transport_allowance: "",
    lunch_allowance: "",
    responsibility_allowance: "",
  });
  const [saving, setSaving] = useState(false);

  // Debug: Log modal state changes
  useEffect(() => {
    console.log("Modal state changed:", {
      isEditModalOpen,
      hasSelectedEmployee: !!selectedEmployee,
      selectedEmployeeId: selectedEmployee?.employee.employee_id,
    });
  }, [isEditModalOpen, selectedEmployee]);

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

  // Load salary configs
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/config", {
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch salary configs (${res.status})`
        );
      }
      
      const data = await res.json();
      setConfigs(data || []);
    } catch (error) {
      console.error("Error loading salary configs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load salary configurations. Please try again.",
      });
      setConfigs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user &&
      (user.permissions?.includes("manage:payroll") ||
        user.permissions?.includes("manage:system"))
    ) {
      loadConfigs();
    }
  }, [user]);

  // Handle Edit button click - Open modal with employee data
  const handleEdit = (config: SalaryConfig, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    console.log("Edit button clicked for employee:", config.employee.employee_id);
    console.log("Current modal state before update:", isEditModalOpen);
    // Set selected employee and initialize form
    setSelectedEmployee(config);
    setEditForm({
      base_salary: config.base_salary || "0",
      transport_allowance: config.transport_allowance || "0",
      lunch_allowance: config.lunch_allowance || "0",
      responsibility_allowance: config.responsibility_allowance || "0",
    });
    
    // Open modal - Radix UI Dialog handles scroll locking automatically
    setIsEditModalOpen(true);
    
    console.log("Modal state set to true, selectedEmployee:", config.employee.employee_id);
  };

  // Close modal and reset state
  const handleCloseModal = () => {
    console.log("Closing modal, current state:", isEditModalOpen);
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    // Radix UI Dialog handles scroll unlocking automatically - no manual DOM manipulation needed
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedEmployee) return;

    try {
      setSaving(true);
      
      // Validate form data
      const baseSalary = parseFloat(editForm.base_salary);
      const transportAllowance = parseFloat(editForm.transport_allowance || "0");
      const lunchAllowance = parseFloat(editForm.lunch_allowance || "0");
      const responsibilityAllowance = parseFloat(editForm.responsibility_allowance || "0");

      if (isNaN(baseSalary) || baseSalary < 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Base salary must be a valid positive number",
        });
        return;
      }

      const res = await fetch(
        `/api/payroll/config/${selectedEmployee.employee.employee_id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base_salary: baseSalary.toFixed(2),
            transport_allowance: transportAllowance.toFixed(2),
            lunch_allowance: lunchAllowance.toFixed(2),
            responsibility_allowance: responsibilityAllowance.toFixed(2),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update salary config");
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Salary configuration saved successfully",
      });

      // Close modal and refresh data
      handleCloseModal();
      await loadConfigs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save salary configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  // Format currency in VND - handles null/undefined values
  const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return "₫0";
    }
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "₫0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get employee display name
  const getEmployeeName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}`.trim();
  };

  // Get employee initials for avatar
  const getInitials = (employee: Employee) => {
    const first = employee.first_name?.[0]?.toUpperCase() || "";
    const last = employee.last_name?.[0]?.toUpperCase() || "";
    return `${first}${last}` || "U";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading salary configurations...</p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    (!user.permissions?.includes("manage:payroll") &&
      !user.permissions?.includes("manage:system"))
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Salary Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage base salary and allowances for employees
          </p>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="dark:text-gray-200">Employee</TableHead>
                  <TableHead className="dark:text-gray-200">Email</TableHead>
                  <TableHead className="dark:text-gray-200">Department</TableHead>
                  <TableHead className="dark:text-gray-200">Position</TableHead>
                  <TableHead className="text-right dark:text-gray-200">
                    Base Salary
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-200">
                    Transport
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-200">
                    Lunch
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-200">
                    Responsibility
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-200">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                          No salary configurations found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                          Salary configurations will appear here once they are created
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => {
                    // Use config_id or employee_id as key (for employees without config)
                    const rowKey = config.config_id || `emp-${config.employee.employee_id}`;
                    const hasConfig = config.config_id !== null;
                    
                    return (
                      <TableRow
                        key={rowKey}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        // onClick={(e) => {
                        //   // Prevent row click from interfering with button clicks
                        //   // Only prevent if clicking directly on the row, not on interactive elements
                        //   if (e.target === e.currentTarget) {
                        //     e.preventDefault();
                        //   }
                        // }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {config.employee.avatar_url ? (
                              <img
                                src={config.employee.avatar_url}
                                alt={getEmployeeName(config.employee)}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials(config.employee)}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium dark:text-white">
                                {getEmployeeName(config.employee)}
                              </span>
                              {!hasConfig && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Not Configured
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {config.employee.email}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {config.employee.department?.department_name || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {config.employee.position?.position_name || "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold dark:text-white">
                          {formatCurrency(config.base_salary)}
                        </TableCell>
                        <TableCell className="text-right dark:text-gray-300">
                          {formatCurrency(config.transport_allowance)}
                        </TableCell>
                        <TableCell className="text-right dark:text-gray-300">
                          {formatCurrency(config.lunch_allowance)}
                        </TableCell>
                        <TableCell className="text-right dark:text-gray-300">
                          {formatCurrency(config.responsibility_allowance)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEdit(config, e)}
                              className="gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              {hasConfig ? "Edit" : "Configure"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* VÙNG HIỂN THỊ TEST - BẮT BUỘC PHẢI CÓ ĐOẠN NÀY MỚI HIỆN */}
        {isEditModalOpen && (
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
              // Click ra ngoài vùng đen thì đóng modal (nếu không đang lưu)
              if (!saving) handleCloseModal();
            }}
          >
            {/* Modal Container */}
            <div 
              className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 relative animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()} // Chặn sự kiện click để không bị đóng khi bấm vào form
            >
              
              {/* --- HEADER --- */}
              <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                <h2 className="text-xl font-semibold leading-none tracking-tight dark:text-white">
                  Edit Salary Configuration
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedEmployee && (
                    <div className="mt-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getEmployeeName(selectedEmployee.employee)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Employee ID: {selectedEmployee.employee.employee_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- BODY (FORM) --- */}
              <div className="space-y-4 py-2">
                {/* Employee Info (Read-only) */}
                {selectedEmployee && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Department:</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {selectedEmployee.employee.department?.department_name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Position:</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {selectedEmployee.employee.position?.position_name || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Base Salary */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Base Salary <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.base_salary}
                    onChange={(e) =>
                      setEditForm({ ...editForm, base_salary: e.target.value })
                    }
                    placeholder="0.00"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={saving}
                  />
                </div>

                {/* Transport Allowance */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Transport Allowance
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.transport_allowance}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        transport_allowance: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={saving}
                  />
                </div>

                {/* Lunch Allowance */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Lunch Allowance
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.lunch_allowance}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lunch_allowance: e.target.value })
                    }
                    placeholder="0.00"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={saving}
                  />
                </div>

                {/* Responsibility Allowance */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Responsibility Allowance
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.responsibility_allowance}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        responsibility_allowance: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* --- FOOTER (BUTTONS) --- */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </div>
          </div>
        )}
              </div>
    </div>
  );
}

