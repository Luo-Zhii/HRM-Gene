"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit2, RefreshCw, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Violation {
  violation_id: number;
  violation_date: string;
  violation_type: string;
  description: string;
  deduction_amount: string;
  severity: string;
  status: string;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
  }
}

export default function AdminDisciplinePage() {
  const { user, loading: authLoading } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/admin/employees/basic", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingViolation, setEditingViolation] = useState<any>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    violation_date: "",
    violation_type: "Lateness",
    severity: "Normal",
    status: "Pending",
    deduction_amount: "",
    description: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchViolations = async () => {
    if (authLoading || !user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/violations`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setViolations(data.records || []);
        setStats(data.stats || { total: 0, resolved: 0 });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch discipline records.", duration: 3000 });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to load data.", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [authLoading, user]);

  const handleSyncAttendance = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/violations/sync-attendance`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Sync Complete", description: `Synced successfully. ${data.createdCount} new drafts created.`, duration: 4000 });
        fetchViolations();
      } else {
        toast({ variant: "destructive", title: "Sync Failed", description: "Could not sync from attendance.", duration: 4000 });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Network error during sync.", duration: 4000 });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenModal = (violation?: Violation) => {
    if (violation) {
      setEditingViolation(violation);
      setFormData({
        employee_id: violation.employee.employee_id.toString(),
        violation_date: violation.violation_date,
        violation_type: violation.violation_type,
        severity: violation.severity,
        status: violation.status,
        deduction_amount: violation.deduction_amount,
        description: violation.description
      });
    } else {
      setEditingViolation(null);
      setFormData({
        employee_id: "",
        violation_date: new Date().toISOString().split('T')[0],
        violation_type: "Lateness",
        severity: "Normal",
        status: "Pending",
        deduction_amount: "0.00",
        description: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingViolation ? `/api/violations/${editingViolation.violation_id}` : `/api/violations`;
      const method = editingViolation ? "PATCH" : "POST";
      const payload = { ...formData, employee_id: parseInt(formData.employee_id) };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (res.ok) {
        toast({ title: "Success", description: `Record ${editingViolation ? 'updated' : 'created'} successfully.`, duration: 3000 });
        setIsModalOpen(false);
        fetchViolations();
      } else {
        const errorData = await res.json();
        toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to save record.", duration: 4000 });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred.", duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount) || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge className="bg-amber-500 hover:bg-amber-600 border-transparent text-white">Pending</Badge>;
      case "Resolved": return <Badge className="bg-green-500 hover:bg-green-600 border-transparent text-white">Resolved</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High": return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">High</Badge>;
      case "Normal": return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">Normal</Badge>;
      case "Low": return <Badge variant="outline" className="border-slate-300 text-slate-600 bg-slate-50">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="p-8 font-inter bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discipline Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage employee violations and disciplinary actions</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSyncAttendance} disabled={isSyncing} className="bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm flex items-center gap-2">
              <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "Syncing..." : "Force Sync Now"}
            </Button>
            <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white shadow-sm">
              <Plus size={18} /> Add New Record
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm bg-white rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full text-slate-700">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Cases</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-full text-green-700">
                <RefreshCw size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Resolved Cases</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.resolved}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table List */}
        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Employee</TableHead>
                  <TableHead className="font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Severity</TableHead>
                  <TableHead className="font-semibold text-slate-600">Amount</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-right text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">Loading cases...</TableCell>
                  </TableRow>
                ) : violations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">No disciplinary records found.</TableCell>
                  </TableRow>
                ) : (
                  violations.map((v) => (
                    <TableRow key={v.violation_id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900 border-b border-slate-50 py-4">
                        {v.employee?.first_name} {v.employee?.last_name}
                      </TableCell>
                      <TableCell className="border-b border-slate-50 py-4 font-medium text-slate-700">{v.violation_type}</TableCell>
                      <TableCell className="text-sm text-slate-600 border-b border-slate-50 py-4">
                        {new Date(v.violation_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="border-b border-slate-50 py-4">{getSeverityBadge(v.severity)}</TableCell>
                      <TableCell className="font-bold text-slate-700 border-b border-slate-50 py-4">{formatCurrency(v.deduction_amount)}</TableCell>
                      <TableCell className="border-b border-slate-50 py-4">{getStatusBadge(v.status)}</TableCell>
                      <TableCell className="text-right space-x-2 border-b border-slate-50 py-4">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full h-8 w-8" onClick={() => handleOpenModal(v)}>
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
                <h2 className="text-xl font-bold text-slate-900">{editingViolation ? 'Edit Record' : 'Create New Record'}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 hover:bg-red-50 rounded-full p-2">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Employee Dropdown */}
                  <div className="space-y-2 relative md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</Label>
                    <Select
                      disabled={!!editingViolation}
                      value={formData.employee_id}
                      onValueChange={(val) => setFormData({ ...formData, employee_id: val })}
                    >
                      <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 shadow-xl border border-slate-100 rounded-lg max-h-64 overflow-y-auto custom-thin-scrollbar">
                        {employees.map((emp) => (
                          <SelectItem key={emp.employee_id} value={emp.employee_id.toString()} className="cursor-pointer font-medium hover:bg-slate-50">
                            {emp.first_name} {emp.last_name} ({emp.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Violation Type</Label>
                    <select required className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.violation_type} onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}>
                      <option value="Lateness">Lateness</option>
                      <option value="Absence">Absence</option>
                      <option value="Incomplete Shift">Incomplete Shift</option>
                      <option value="Policy Violation">Policy Violation</option>
                      <option value="Damage">Damage</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</Label>
                    <select required className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })}>
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</Label>
                    <Input type="date" required className="h-11 bg-slate-50 border-slate-200" value={formData.violation_date ? new Date(formData.violation_date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, violation_date: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                    <select required className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deduction / Damages Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <Input type="number" step="0.01" required className="pl-8 h-11 bg-slate-50 border-slate-200 font-bold text-slate-700" placeholder="0.00" value={formData.deduction_amount} onChange={(e) => setFormData({ ...formData, deduction_amount: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                    <Textarea required className="min-h-[100px] bg-slate-50 border-slate-200 resize-y" placeholder="Enter violation description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" className="hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">{isSaving ? 'Saving...' : 'Save Record'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
