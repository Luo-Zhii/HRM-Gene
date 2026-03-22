"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit2, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interface Definitions
interface Contract {
  contract_id: number;
  contract_number: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
  salary_rate: string;
  file_url: string;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
  }
}

export default function AdminContractsPage() {
  const { user, loading: authLoading } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    contract_number: "",
    contract_type: "Official",
    start_date: "",
    end_date: "",
    status: "Active",
    salary_rate: "",
    file_url: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchContracts();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, typeFilter, page, authLoading, user]);

  const fetchContracts = async () => {
    if (authLoading || !user) return;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "100"); // Just fetch a lot for simple table
      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (typeFilter !== "ALL") queryParams.append("type", typeFilter);

      const res = await fetch(`/api/contracts?${queryParams.toString()}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setContracts(data.data);
          setTotal(data.total || 0);
        } else if (Array.isArray(data)) {
           setContracts(data);
           setTotal(data.length);
        }
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch contracts." });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        employee_id: contract.employee.employee_id.toString(),
        contract_number: contract.contract_number,
        contract_type: contract.contract_type,
        start_date: contract.start_date,
        end_date: contract.end_date || "",
        status: contract.status,
        salary_rate: contract.salary_rate,
        file_url: contract.file_url || ""
      });
    } else {
      setEditingContract(null);
      setFormData({ employee_id: "", contract_number: "", contract_type: "Official", start_date: "", end_date: "", status: "Active", salary_rate: "", file_url: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingContract ? `/api/contracts/${editingContract.contract_id}` : `/api/contracts`;
      const method = editingContract ? "PUT" : "POST";
      
      const payload = { ...formData, employee_id: parseInt(formData.employee_id) };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (res.ok) {
        toast({ title: "Success", description: `Contract ${editingContract ? 'updated' : 'created'} successfully.` });
        setIsModalOpen(false);
        fetchContracts();
      } else {
        const errorData = await res.json();
        toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to save contract." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount) || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-green-500 hover:bg-green-600 border-transparent text-white">Active</Badge>;
      case "Expired": return <Badge className="bg-slate-500 hover:bg-slate-600 border-transparent text-white">Expired</Badge>;
      case "Terminated": return <Badge className="bg-red-500 hover:bg-red-600 border-transparent text-white">Terminated</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="p-8 font-inter bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contract Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage employee labor contracts and agreements</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white shadow-sm">
            <Plus size={18} /> Create Contract
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Search contract number..." 
                  className="pl-10 h-11 bg-slate-50 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select 
                  className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <div>
                <select 
                  className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="Probation">Probation</option>
                  <option value="Official">Official</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table List */}
        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Employee</TableHead>
                  <TableHead className="font-semibold text-slate-600">Contract No.</TableHead>
                  <TableHead className="font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="font-semibold text-slate-600">Duration</TableHead>
                  <TableHead className="font-semibold text-slate-600">Salary Rate</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-right text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">Loading contracts...</TableCell>
                  </TableRow>
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">No contracts found.</TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.contract_id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900 border-b border-slate-50 py-4">
                        {contract.employee?.first_name} {contract.employee?.last_name}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {contract.employee?.employee_id}</div>
                      </TableCell>
                      <TableCell className="border-b border-slate-50 font-mono text-sm">{contract.contract_number}</TableCell>
                      <TableCell className="border-b border-slate-50 py-4 font-medium text-slate-700">{contract.contract_type}</TableCell>
                      <TableCell className="text-sm text-slate-600 border-b border-slate-50 py-4">
                        <div className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400">to {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "Indefinite"}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700 border-b border-slate-50 py-4">{formatCurrency(contract.salary_rate)}</TableCell>
                      <TableCell className="border-b border-slate-50 py-4">{getStatusBadge(contract.status)}</TableCell>
                      <TableCell className="text-right space-x-2 border-b border-slate-50 py-4">
                        {contract.file_url && (
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8 w-8" onClick={() => window.open(contract.file_url, "_blank")}>
                            <FileText size={16} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full h-8 w-8" onClick={() => handleOpenModal(contract)}>
                          <Edit2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Modal/Dialog for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white justify-between rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">{editingContract ? 'Edit Contract' : 'Create New Contract'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 hover:bg-red-50 rounded-full p-2">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</Label>
                    <Input required disabled={!!editingContract} className="h-11 bg-slate-50 border-slate-200" placeholder="e.g. 1" value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Number</Label>
                    <Input required className="h-11 bg-slate-50 border-slate-200" placeholder="HD-2023-001" value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</Label>
                    <select className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.contract_type} onChange={(e) => setFormData({...formData, contract_type: e.target.value})}>
                      <option value="Probation">Probation</option>
                      <option value="Official">Official</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                    <select className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</Label>
                    <Input type="date" required className="h-11 bg-slate-50 border-slate-200" value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</Label>
                    <Input type="date" className="h-11 bg-slate-50 border-slate-200" value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salary Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <Input type="number" step="0.01" required className="pl-8 h-11 bg-slate-50 border-slate-200 font-bold text-slate-700" placeholder="5000.00" value={formData.salary_rate} onChange={(e) => setFormData({...formData, salary_rate: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">File URL (Optional)</Label>
                    <Input className="h-11 bg-slate-50 border-slate-200" placeholder="https://..." value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" className="hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">{isSaving ? 'Saving...' : 'Save Contract'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
