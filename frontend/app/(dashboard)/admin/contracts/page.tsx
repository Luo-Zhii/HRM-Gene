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
import { Plus, FileText, Loader2, Edit2, Trash2, X, Save } from "lucide-center";
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

// Import các types từ file vừa tạo
import {
  Contract,
  ContractStatus,
  ContractType,
  CreateContractDto,
  UpdateContractDto
} from "./contract.types";

// ============= API SERVICE FUNCTIONS =============
const contractsApi = {
  async getAll(employeeId?: number): Promise<Contract[]> {
    const url = employeeId ? `/api/contracts?employeeId=${employeeId}` : "/api/contracts";
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      if (res.status === 403) throw new Error("Permission Denied");
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to fetch contracts (${res.status})`);
    }
    return res.json();
  },

  async create(data: CreateContractDto): Promise<Contract> {
    const res = await fetch("/api/contracts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create contract");
    }
    return res.json();
  },

  async update(id: number, data: UpdateContractDto): Promise<Contract> {
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update contract");
    }
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`/api/contracts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete contract");
  },
};

export default function ContractsManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  const canManageEmployees = user?.permissions?.includes("manage:employees") ?? false;
  const canManageSystem = user?.permissions?.includes("manage:system") ?? false;
  const canEditOrDelete = canManageSystem;

  // Form state for create
  const [formData, setFormData] = useState<CreateContractDto>({
    employee_id: 0,
    contract_number: "",
    contract_type: ContractType.OFFICIAL,
    start_date: "",
    end_date: undefined,
    status: ContractStatus.ACTIVE,
    salary_rate: "",
    file_url: undefined,
  });

  // Form state for edit
  const [editFormData, setEditFormData] = useState<UpdateContractDto>({
    contract_number: "",
    contract_type: ContractType.OFFICIAL,
    start_date: "",
    end_date: undefined,
    status: ContractStatus.ACTIVE,
    salary_rate: "",
    file_url: undefined,
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
      const data = await contractsApi.getAll();
      setContracts(data || []);
      setFilteredContracts(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load contracts";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
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
        title: "Validation Error",
        description: "Please fill in all required fields (Employee, Contract Number, Start Date, Salary Rate)",
      });
      return;
    }

    try {
      setCreating(true);
      await contractsApi.create({
        ...formData,
        employee_id: formData.employee_id,
      });

      toast({
        variant: "default",
        title: "Success",
        description: "Contract created successfully",
      });

      setCreateDialogOpen(false);
      setFormData({
        employee_id: 0,
        contract_number: "",
        contract_type: ContractType.OFFICIAL,
        start_date: "",
        end_date: undefined,
        status: ContractStatus.ACTIVE,
        salary_rate: "",
        file_url: undefined,
      });
      await loadContracts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create contract";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setCreating(false);
    }
  };

  // Handle Edit button click
  const handleEditClick = (contract: Contract, event?: React.MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Set the contract data and open dialog
    setEditingContract(contract);
    setEditFormData({
      contract_number: contract.contract_number,
      contract_type: contract.contract_type,
      start_date: contract.start_date,
      end_date: contract.end_date || undefined,
      status: contract.status,
      salary_rate: contract.salary_rate,
      file_url: contract.file_url || undefined,
    });
    setEditDialogOpen(true);
  };

  // Update contract
  const handleUpdate = async () => {
    if (!editingContract) return;

    if (!editFormData.contract_number || !editFormData.salary_rate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Contract Number and Salary Rate are required",
      });
      return;
    }

    try {
      setUpdating(true);
      await contractsApi.update(editingContract.contract_id, editFormData);

      toast({
        variant: "default",
        title: "Success",
        description: "Contract updated successfully",
      });

      setEditDialogOpen(false);
      setEditingContract(null);
      await loadContracts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update contract";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setUpdating(false);
    }
  };

  // Delete contract
  const handleDelete = async (contractId: number) => {
    if (!confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(contractId);
      await contractsApi.delete(contractId);

      toast({
        variant: "default",
        title: "Success",
        description: "Contract deleted successfully",
      });

      await loadContracts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete contract";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setDeleting(null);
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
                    {/* Conditionally show Salary Rate column */}
                    {canManageEmployees && (
                      <TableHead className="text-right">Salary Rate</TableHead>
                    )}
                    {/* Conditionally show Actions column */}
                    {canEditOrDelete && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
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
                      {/* Conditionally show Salary Rate */}
                      {canManageEmployees && (
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(contract.salary_rate)}
                        </TableCell>
                      )}
                      {/* Conditionally show Actions */}
                      {canEditOrDelete && (
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEditClick(contract, e)}
                              className="gap-2"
                              type="button"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contract.contract_id)}
                              disabled={deleting === contract.contract_id}
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === contract.contract_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
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
                  value={formData.employee_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employee_id: parseInt(value, 10) })
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
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_type">Contract Type *</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, contract_type: value as ContractType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ContractType.PROBATION}>Probation</SelectItem>
                      <SelectItem value={ContractType.OFFICIAL}>Official</SelectItem>
                      <SelectItem value={ContractType.PART_TIME}>Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary_rate">Salary Rate *</Label>
                  <Input
                    id="salary_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_rate: e.target.value })
                    }
                    placeholder="0.00"
                    required
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
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end_date: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file_url">File URL (Optional)</Label>
                <Input
                  id="file_url"
                  value={formData.file_url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      file_url: e.target.value || undefined,
                    })
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

        {/* Edit Contract Dialog */}
        <Dialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditDialogOpen(false);
              setEditingContract(null);
            } else {
              setEditDialogOpen(true);
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Contract</DialogTitle>
              <DialogDescription>
                {editingContract ? (
                  <>
                    Update contract information for {editingContract.employee.first_name}{" "}
                    {editingContract.employee.last_name}
                  </>
                ) : (
                  "Update contract information"
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit_contract_number">Contract Number *</Label>
                <Input
                  id="edit_contract_number"
                  value={editFormData.contract_number}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contract_number: e.target.value,
                    })
                  }
                  placeholder="e.g., CT-2025-001"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_contract_type">Contract Type</Label>
                  <Select
                    value={editFormData.contract_type}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        contract_type: value as ContractType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ContractType.PROBATION}>Probation</SelectItem>
                      <SelectItem value={ContractType.OFFICIAL}>Official</SelectItem>
                      <SelectItem value={ContractType.PART_TIME}>Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        status: value as ContractStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ContractStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={ContractStatus.EXPIRED}>Expired</SelectItem>
                      <SelectItem value={ContractStatus.TERMINATED}>Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_start_date">Start Date</Label>
                  <Input
                    id="edit_start_date"
                    type="date"
                    value={editFormData.start_date}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit_end_date">End Date (Optional)</Label>
                  <Input
                    id="edit_end_date"
                    type="date"
                    value={editFormData.end_date || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        end_date: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_salary_rate">Salary Rate *</Label>
                <Input
                  id="edit_salary_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.salary_rate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      salary_rate: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_file_url">File URL (Optional)</Label>
                <Input
                  id="edit_file_url"
                  value={editFormData.file_url || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      file_url: e.target.value || undefined,
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingContract(null);
                }}
                disabled={updating}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

