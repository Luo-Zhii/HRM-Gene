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
import { Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  employee_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface SalaryConfig {
  config_id: number;
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
  const [editingConfig, setEditingConfig] = useState<SalaryConfig | null>(null);
  const [editForm, setEditForm] = useState({
    base_salary: "",
    transport_allowance: "",
    lunch_allowance: "",
    responsibility_allowance: "",
  });
  const [saving, setSaving] = useState(false);

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
      if (!res.ok) throw new Error("Failed to fetch salary configs");
      const data = await res.json();
      setConfigs(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load salary configurations",
      });
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

  // Open edit dialog
  const handleEdit = (config: SalaryConfig) => {
    setEditingConfig(config);
    setEditForm({
      base_salary: config.base_salary,
      transport_allowance: config.transport_allowance,
      lunch_allowance: config.lunch_allowance,
      responsibility_allowance: config.responsibility_allowance,
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      setSaving(true);
      const res = await fetch(
        `/api/payroll/config/${editingConfig.employee.employee_id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update salary config");
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Salary configuration updated successfully",
      });

      setEditingConfig(null);
      await loadConfigs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update salary configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Salary Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Manage base salary and allowances for employees
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Base Salary</TableHead>
                  <TableHead className="text-right">Transport</TableHead>
                  <TableHead className="text-right">Lunch</TableHead>
                  <TableHead className="text-right">Responsibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">No salary configurations found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => (
                    <TableRow key={config.config_id}>
                      <TableCell className="font-medium">
                        {config.employee.first_name} {config.employee.last_name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {config.employee.email}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(config.base_salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(config.transport_allowance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(config.lunch_allowance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(config.responsibility_allowance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingConfig}
          onOpenChange={(open) => !open && setEditingConfig(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Salary Configuration</DialogTitle>
              <DialogDescription>
                Update salary and allowances for{" "}
                {editingConfig?.employee.first_name}{" "}
                {editingConfig?.employee.last_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Base Salary
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.base_salary}
                  onChange={(e) =>
                    setEditForm({ ...editForm, base_salary: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Transport Allowance
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.transport_allowance}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      transport_allowance: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Lunch Allowance
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.lunch_allowance}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lunch_allowance: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Responsibility Allowance
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.responsibility_allowance}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      responsibility_allowance: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingConfig(null)}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

