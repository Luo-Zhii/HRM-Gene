"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Info, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface KpiLibrary {
  id: number;
  name: string;
  description: string;
  calculation_formula: string;
  unit: string;
  created_by: { first_name: string; last_name: string; };
}

export default function KpiLibraryPage() {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<KpiLibrary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // Edit Mode States (MỚI THÊM)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [formData, setFormData] = useState({
    name: "", description: "", calculation_formula: "", unit: "Percent",
  });
  const [periodFormData, setPeriodFormData] = useState({ name: "", start_date: "", end_date: "" });
  const [kpiPeriods, setKpiPeriods] = useState<any[]>([]);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kpi/library", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KPI library");
      const data = await res.json();
      setKpis(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not load KPI library" });
      setKpis([]);
    } finally { setLoading(false); }
  };

  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/kpi/period", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKpiPeriods(Array.isArray(data) ? data : []);
    } catch (error) { setKpiPeriods([]); }
  };

  useEffect(() => { fetchKpis(); fetchPeriods(); }, []);

  // ─── Hàm xử lý Mở Form Tạo Mới ──────────────────────────────
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ name: "", description: "", calculation_formula: "", unit: "Percent" });
    setIsAddModalOpen(true);
  };

  // ─── Hàm xử lý Mở Form Sửa (MỚI THÊM) ────────────────────────
  const openEditModal = (kpi: KpiLibrary) => {
    setIsEditMode(true);
    setEditId(kpi.id);
    setFormData({
      name: kpi.name || "",
      description: kpi.description || "",
      calculation_formula: kpi.calculation_formula || "",
      unit: kpi.unit || "Percent"
    });
    setIsAddModalOpen(true);
  };

  // ─── Hàm Lưu (Gộp cả Create và Update) ─────────────────────
  const handleSubmitKpi = async () => {
    if (!formData.name) return;
    try {
      setSubmitting(true);
      const url = isEditMode ? `/api/kpi/library/${editId}` : "/api/kpi/library";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to save KPI");

      toast({ title: "Success", description: `KPI ${isEditMode ? "updated" : "created"} successfully` });
      setIsAddModalOpen(false);
      fetchKpis();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save KPI. Did you add the PATCH API in Backend?" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePeriod = async () => {
    if (!periodFormData.name) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/kpi/period", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(periodFormData), credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Success", description: "KPI period created successfully" });
      setPeriodFormData({ name: "", start_date: "", end_date: "" });
      fetchPeriods();
    } catch (error) { toast({ variant: "destructive", title: "Error", description: "Failed to create period" }); }
    finally { setSubmitting(false); }
  };

  const filteredKpis = kpis.filter(kpi => kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.description?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Master Library</h1>
          <p className="text-sm text-gray-500">Global definitions of performance indicators</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsPeriodModalOpen(true)} className="gap-2 h-10 px-4">
            <Calendar className="w-4 h-4" /> Manage Periods
          </Button>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search KPIs..." className="pl-9 h-10 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-4">
            <Plus className="w-4 h-4" /> Add KPI
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="min-w-[200px]">KPI Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="max-w-[300px]">Formula</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">Loading...</TableCell></TableRow>
            ) : filteredKpis.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">No KPIs found</TableCell></TableRow>
            ) : (
              filteredKpis.map((kpi) => (
                <TableRow key={kpi.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-500">#{kpi.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{kpi.name}</span>
                      <span className="text-xs text-gray-500 line-clamp-1">{kpi.description || "No description"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">{kpi.unit}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-600 bg-gray-50/50 p-2 rounded border border-dashed border-gray-200">
                    {kpi.calculation_formula || "Manual Entry"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {kpi.created_by ? `${kpi.created_by.first_name} ${kpi.created_by.last_name}` : "System Admin"}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* ĐÃ SỬA NÚT EDIT LÀM CẢNH THÀNH NÚT THẬT */}
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(kpi)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Add/Edit KPI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[500px] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit KPI Definition" : "Define New KPI"}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">KPI Name</Label>
                <Input id="name" placeholder="e.g. Sales Conversion Rate" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit of Measurement</Label>
                <select id="unit" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                  <option value="Percent">Percent (%)</option>
                  <option value="Number">Number (#)</option>
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What does this KPI measure?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="formula" className="flex items-center gap-2">Calculation Formula <Info className="w-3.5 h-3.5 text-gray-400" /></Label>
                <Input id="formula" placeholder="e.g. (Total Sales / Leads) * 100" value={formData.calculation_formula} onChange={(e) => setFormData({ ...formData, calculation_formula: e.target.value })} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmitKpi} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting || !formData.name}>
                {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Definition"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Period (Giữ nguyên) */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h2 className="text-xl font-bold">Manage KPI Periods</h2><button onClick={() => setIsPeriodModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-6 space-y-5">
              <div className="grid gap-2"><Label>Period Name</Label><Input placeholder="Jan 2026" value={periodFormData.name} onChange={(e) => setPeriodFormData({ ...periodFormData, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={periodFormData.start_date} onChange={(e) => setPeriodFormData({ ...periodFormData, start_date: e.target.value })} /></div>
                <div className="grid gap-2"><Label>End Date</Label><Input type="date" value={periodFormData.end_date} onChange={(e) => setPeriodFormData({ ...periodFormData, end_date: e.target.value })} /></div>
              </div>
              <Button className="w-full bg-blue-600 text-white" onClick={handleCreatePeriod} disabled={submitting}>Create New Period</Button>
              <div className="border-t pt-4">
                <Label className="text-xs uppercase font-bold text-gray-400">Existing Periods</Label>
                <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                  {kpiPeriods.map(p => (
                    <div key={p.id} className="flex justify-between p-2.5 bg-gray-50 rounded-lg text-sm border">
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}