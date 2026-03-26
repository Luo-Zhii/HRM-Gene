"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  TrendingUp,
  Award,
  X // <-- Đã thêm icon X để làm nút đóng Modal
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/src/hooks/useAuth";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  department?: { department_name: string };
  position?: { position_name: string };
}

interface KpiPeriod {
  id: number;
  name: string;
  status: string;
}

interface KpiLibrary {
  id: number;
  name: string;
  unit: string;
}

interface KpiAssignment {
  id: number;
  kpi_library: KpiLibrary;
  weight: number;
  target_value: number;
  actual_value: number;
  manager_score: number | null;
  status: string;
}

export default function TeamPerformancePage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<KpiPeriod[]>([]);
  const [library, setLibrary] = useState<KpiLibrary[]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [assignments, setAssignments] = useState<KpiAssignment[]>([]);

  const [loading, setLoading] = useState(false);

  // State quản lý Modal Code Tay
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // New Assignment Form
  const [newAssignments, setNewAssignments] = useState<{ kpi_library_id: number, weight: number, target_value: number }[]>([]);

  const fetchData = async () => {
    try {
      const [empRes, perRes, libRes] = await Promise.all([
        fetch("/api/employees", { credentials: "include" }),
        // Gọi đúng API số ít "period" theo Backend anh em mình vừa fix
        fetch("/api/kpi/period", { credentials: "include" }),
        fetch("/api/kpi/library", { credentials: "include" })
      ]);

      if (!empRes.ok || !perRes.ok || !libRes.ok) throw new Error("Fetch failed");

      const empData = await empRes.json();
      const perData = await perRes.json();
      const libData = await libRes.json();

      setEmployees(Array.isArray(empData) ? empData : []);
      setPeriods(Array.isArray(perData) ? perData : []);
      setLibrary(Array.isArray(libData) ? libData : []);

      if (Array.isArray(perData) && perData.length > 0) setSelectedPeriod(perData[0].id.toString());
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load performance data" });
      setEmployees([]);
      setPeriods([]);
      setLibrary([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("Are you sure ?")) return;
    try {
      const res = await fetch(`/api/kpi/assignment/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Deleted", description: "Đã xóa KPI thành công!" });
      fetchAssignments(selectedEmployee!.employee_id, selectedPeriod);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Check API Backend!" });
    }
  };
  const fetchAssignments = async (empId: number, perId: string) => {
    if (!empId || !perId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/kpi/assignments?employee_id=${empId}&period_id=${perId}`, { credentials: "include" });
      const data = await res.json();
      setAssignments(data || []);
    } catch (error) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmployee && selectedPeriod) {
      fetchAssignments(selectedEmployee.employee_id, selectedPeriod);
    }
  }, [selectedEmployee, selectedPeriod]);

  const handleApprove = async (id: number, score: number) => {
    if (isNaN(score)) return; // Don't update if it's not a number (e.g. empty input)
    try {
      const res = await fetch(`/api/kpi/assignment/${id}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manager_score: score }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Approved", description: "KPI score approved successfully" });
      fetchAssignments(selectedEmployee!.employee_id, selectedPeriod);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to approve score" });
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedPeriod) return;

    // Validate dữ liệu trống
    if (newAssignments.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please add at least one KPI variable." });
      return;
    }

    if (newAssignments.some(na => na.kpi_library_id === 0)) {
      toast({ variant: "destructive", title: "Error", description: "Please select a KPI for all rows." });
      return;
    }

    const totalWeight = newAssignments.reduce((s, a) => s + a.weight, 0);
    if (totalWeight !== 100) {
      toast({ variant: "destructive", title: "Validation Error", description: `Total weight must be 100% (Current: ${totalWeight}%)` });
      return;
    }

    try {
      const res = await fetch("/api/kpi/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee_id,
          period_id: parseInt(selectedPeriod),
          assignments: newAssignments
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Assigned", description: "KPIs assigned successfully" });
      setIsAssignModalOpen(false);
      fetchAssignments(selectedEmployee.employee_id, selectedPeriod);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to assign KPIs" });
    }
  };

  const calculateAchievement = (actual: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(120, Math.round((actual / target) * 100));
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)] overflow-hidden relative">

      {/* Sidebar: Employees List */}
      <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Direct Reports</h2>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {/* Sidebar Select vẫn xài của Radix được vì nó không nằm trong Modal */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="pl-9 h-10 w-full bg-white border-gray-200">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-thin-scrollbar">
          {employees.map(emp => {
            const isSelected = selectedEmployee?.employee_id === emp.employee_id;
            return (
              <button
                key={emp.employee_id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <div className="flex items-center gap-3 truncate text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${isSelected ? "bg-white/20 border-white/30" : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}>
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>
                  <div className="truncate">
                    <p className={`font-bold text-sm ${isSelected ? "text-white" : "text-gray-900"}`}>{emp.first_name} {emp.last_name}</p>
                    <p className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-500"}`}>{emp.position?.position_name}</p>
                  </div>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 opacity-70" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Grading Sheet */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden">
        {!selectedEmployee ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Select an employee</h3>
            <p className="max-w-[280px]">Pick a team member from the left to start grading their performance for the selected period.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 italic">
                  {selectedEmployee.first_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedEmployee.position?.position_name}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-xs text-gray-500">{selectedEmployee.department?.department_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setNewAssignments([]);
                    setIsAssignModalOpen(true);
                  }}
                  variant="outline"
                  className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 font-bold uppercase tracking-wider text-[10px] px-4"
                >
                  <Plus className="w-4 h-4 mr-2" /> Assign KPIs
                </Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-blue-100">
                  Submit All
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-thin-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 px-6">KPI Description</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Weight</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Target</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Actual</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Achieve %</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Score</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-right pr-6">Status</TableHead>
                    <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-gray-400 italic">No KPIs assigned for this period.</TableCell>
                    </TableRow>
                  ) : (
                    assignments.map(a => {
                      const achievement = calculateAchievement(a.actual_value, a.target_value);
                      return (
                        <TableRow key={a.id} className="hover:bg-gray-50/50 group">
                          <TableCell className="px-6 py-4">
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{a.kpi_library.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Measurement: {a.kpi_library.unit}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="bg-gray-100 text-gray-600 font-black text-[10px] px-2 py-1 rounded-md">{a.weight}%</span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-gray-700">{a.target_value}</TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-sm border border-blue-100">
                              {a.actual_value}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-black ${achievement >= 100 ? "text-emerald-600" : achievement >= 80 ? "text-amber-600" : "text-red-500"
                                }`}>
                                {achievement}%
                              </span>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${achievement >= 100 ? "bg-emerald-500" : achievement >= 80 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                  style={{ width: `${Math.min(100, achievement)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center w-[120px]">
                            <Input
                              type="number"
                              className="h-8 text-center font-black text-blue-600 border-gray-200 focus:ring-blue-500"
                              defaultValue={a.manager_score || a.actual_value}
                              onBlur={(e) => handleApprove(a.id, parseFloat(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === "Approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}>
                              {a.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                              {a.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-3">

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAssignment(a.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-full"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Summary Footer */}
            {assignments.length > 0 && (
              <div className="p-4 border-t bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Weighted KPI Score</p>
                    <p className="text-2xl font-black text-blue-600">
                      {(assignments.reduce((sum, a) => sum + (calculateAchievement(a.actual_value, a.target_value) * a.weight / 100), 0)).toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-10 w-px bg-gray-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Bonus Multiplier</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <p className="text-xl font-black text-emerald-600">x{(assignments.reduce((sum, a) => sum + (calculateAchievement(a.actual_value, a.target_value) * a.weight / 100), 0) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-[10px] font-bold text-blue-800 leading-tight">Approved scores will be automatically factored <br /> into the next payroll cycle for this employee.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CODE TAY MODAL: ASSIGN KPIs (KHÔNG DÙNG THƯ VIỆN RADIX/SHADCN)            */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[700px] max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header Xanh Nét Căng */}
            <div className="p-6 bg-blue-600 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3">
                  <Award className="w-8 h-8" /> Assign Performance Goals
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Define metrics for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-blue-200 hover:text-white transition-colors bg-blue-700/50 p-2 rounded-full hover:bg-blue-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  Ensure the total weight of all assigned KPIs equals exactly <span className="font-black underline">100%</span>.
                  Current Total: <span className={`font-black ml-1 ${newAssignments.reduce((s, a) => s + a.weight, 0) === 100 ? "text-emerald-600" : "text-red-600"}`}>
                    {newAssignments.reduce((s, a) => s + a.weight, 0)}%
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {newAssignments.map((na, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end p-4 bg-white rounded-2xl border border-gray-200 shadow-sm relative group transition-all hover:border-blue-300 hover:shadow-md">

                    {/* Đã thay bằng <select> mặc định để tránh lỗi đè Layer của Radix */}
                    <div className="col-span-5">
                      <Label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">KPI Variable</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={na.kpi_library_id.toString()}
                        onChange={(e) => {
                          const updated = [...newAssignments];
                          updated[idx].kpi_library_id = parseInt(e.target.value);
                          setNewAssignments(updated);
                        }}
                      >
                        <option value="0" disabled>-- Select KPI --</option>
                        {library.map(k => <option key={k.id} value={k.id.toString()}>{k.name}</option>)}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <Label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Weight (%)</Label>
                      <Input
                        type="number"
                        className="bg-gray-50 border-gray-200 focus:bg-white"
                        value={na.weight || ""}
                        onChange={(e) => {
                          const updated = [...newAssignments];
                          updated[idx].weight = parseInt(e.target.value) || 0;
                          setNewAssignments(updated);
                        }}
                      />
                    </div>

                    <div className="col-span-3">
                      <Label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Target Value</Label>
                      <Input
                        type="number"
                        className="bg-blue-50/50 border-blue-200 text-blue-700 font-bold focus:bg-white"
                        value={na.target_value || ""}
                        onChange={(e) => {
                          const updated = [...newAssignments];
                          updated[idx].target_value = parseFloat(e.target.value) || 0;
                          setNewAssignments(updated);
                        }}
                      />
                    </div>

                    <div className="col-span-1 pb-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setNewAssignments(newAssignments.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full border-dashed border-2 py-8 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 flex-col gap-2 font-bold uppercase tracking-widest text-[10px] bg-white transition-colors"
                onClick={() => setNewAssignments([...newAssignments, { kpi_library_id: library[0]?.id || 0, weight: 0, target_value: 0 }])}
              >
                <Plus className="w-6 h-6 mb-1" /> Add Metric Variable
              </Button>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
              <Button variant="ghost" className="font-bold text-gray-500 hover:text-gray-900" onClick={() => setIsAssignModalOpen(false)}>
                Discard
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 font-black uppercase tracking-widest shadow-lg shadow-blue-200"
                onClick={handleAssign}
              >
                Confirm Goals
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}