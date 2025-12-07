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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Contract {
  contract_id: number;
  contract_number: string;
  contract_type: string;
  start_date: string;
  end_date?: string;
  status: string;
  salary_rate: string;
  file_url?: string;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ContractsManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    contract_number: "",
    contract_type: "Official",
    start_date: "",
    end_date: "",
    salary_rate: "",
    file_url: "",
  });

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission =
        user.permissions?.includes("manage:employees") ||
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

  // Load employees for dropdown
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch("/api/admin/employees", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data || []);
        }
      } catch (error) {
        console.error("Failed to load employees:", error);
      }
    };

    if (
      user &&
      (user.permissions?.includes("manage:employees") ||
        user.permissions?.includes("manage:system"))
    ) {
      loadEmployees();
    }
  }, [user]);

  // Load contracts
  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contracts", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch contracts");
      const data = await res.json();
      setContracts(data || []);
      setFilteredContracts(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contracts",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user &&
      (user.permissions?.includes("manage:employees") ||
        user.permissions?.includes("manage:system"))
    ) {
      loadContracts();
    }
  }, [user]);

  // Filter contracts by status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredContracts(contracts);
    } else {
      setFilteredContracts(
        contracts.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase())
      );
    }
  }, [statusFilter, contracts]);

  // Create new contract
  const handleCreate = async () => {
    if (
      !formData.employee_id ||
      !formData.contract_number ||
      !formData.start_date ||
      !formData.salary_rate
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/contracts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: parseInt(formData.employee_id),
          contract_number: formData.contract_number,
          contract_type: formData.contract_type,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          salary_rate: formData.salary_rate,
          file_url: formData.file_url || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create contract");
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Contract created successfully",
      });

      setCreateDialogOpen(false);
      setFormData({
        employee_id: "",
        contract_number: "",
        contract_type: "Official",
        start_date: "",
        end_date: "",
        salary_rate: "",
        file_url: "",
      });
      await loadContracts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create contract",
      });
    } finally {
      setCreating(false);
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "Terminated":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (
    !user ||
    (!user.permissions?.includes("manage:employees") &&
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contract Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all labor contracts in the system
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Contract
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filter by Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 ml-auto">
              Showing {filteredContracts.length} of {contracts.length} contracts
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredContracts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {statusFilter === "all"
                  ? "No contracts found"
                  : `No ${statusFilter} contracts found`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>Contract Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Salary Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.contract_id}>
                      <TableCell className="font-medium">
                        {contract.employee.first_name}{" "}
                        {contract.employee.last_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {contract.contract_number}
                      </TableCell>
                      <TableCell>{contract.contract_type}</TableCell>
                      <TableCell>{formatDate(contract.start_date)}</TableCell>
                      <TableCell>
                        {contract.end_date
                          ? formatDate(contract.end_date)
                          : "Open-ended"}
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(contract.salary_rate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Create Contract Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
              <DialogDescription>
                Add a new labor contract for an employee
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="employee_id">Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem
                        key={emp.employee_id}
                        value={emp.employee_id.toString()}
                      >
                        {emp.first_name} {emp.last_name} ({emp.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contract_number">Contract Number *</Label>
                <Input
                  id="contract_number"
                  value={formData.contract_number}
                  onChange={(e) =>
                    setFormData({ ...formData, contract_number: e.target.value })
                  }
                  placeholder="e.g., CT-2025-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_type">Contract Type *</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, contract_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Probation">Probation</SelectItem>
                      <SelectItem value="Official">Official</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary_rate">Salary Rate *</Label>
                  <Input
                    id="salary_rate"
                    type="number"
                    step="0.01"
                    value={formData.salary_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_rate: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file_url">File URL (Optional)</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) =>
                    setFormData({ ...formData, file_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Contract"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

