"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Trash2, Building2, Users, Receipt, Briefcase, Edit2, X, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface Department {
  department_id: number;
  department_name: string;
  manager_name?: string;
  manager_id?: number | null;
  employee_count?: number;
  total_budget?: number;
}

interface Position {
  position_id: number;
  position_name: string;
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

interface BasicEmployee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  department_id?: number | null;
  position_id?: number | null;
}

export default function OrganizationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentInput, setDepartmentInput] = useState("");
  const [creatingDept, setCreatingDept] = useState(false);

  const [positions, setPositions] = useState<Position[]>([]);
  const [positionInput, setPositionInput] = useState("");
  const [creatingPos, setCreatingPos] = useState(false);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [stats, setStats] = useState({ total_departments: 0, total_employees: 0, total_budget: 0 });
  const [basicEmployees, setBasicEmployees] = useState<BasicEmployee[]>([]);

  // Editing State
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editManagerId, setEditManagerId] = useState<string>("none");
  const [savingEdit, setSavingEdit] = useState(false);

  // Assign Staff State
  const [assigningDept, setAssigningDept] = useState<Department | null>(null);
  const [assignEmpId, setAssignEmpId] = useState<string>("");
  const [assignPosId, setAssignPosId] = useState<string>("");
  const [savingAssign, setSavingAssign] = useState(false);

  // Check Quyền
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission = user.permissions?.includes("manage:system");
      if (!hasPermission) {
        setStatusMessage({ type: "error", text: "You do not have permission to access this page." });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [deptsRes, posRes, statsRes, empsRes] = await Promise.all([
        fetch("/api/admin/departments", { method: "GET", credentials: "include" }),
        fetch("/api/admin/positions", { method: "GET", credentials: "include" }),
        fetch("/api/admin/organization/stats", { method: "GET", credentials: "include" }).catch(() => ({ ok: false, json: () => ({}) })),
        fetch("/api/admin/employees/basic", { method: "GET", credentials: "include" }).catch(() => ({ ok: false, json: () => ({}) })),
      ]);

      if (!deptsRes.ok || !posRes.ok) throw new Error("Failed to fetch data");

      const deptsData = await deptsRes.json();
      const posData = await posRes.json();
      const empsData = empsRes.ok ? await empsRes.json() : [];

      let statsData = { total_departments: 0, total_employees: 0, total_budget: 0 };
      if (statsRes.ok) statsData = await statsRes.json();

      setDepartments(deptsData || []);
      setPositions(posData || []);
      setBasicEmployees(empsData || []);

      setStats({
        total_departments: statsData.total_departments || (deptsData || []).length,
        total_employees: statsData.total_employees || 0,
        total_budget: statsData.total_budget || 0
      });
    } catch (error) {
      setStatusMessage({ type: "error", text: error instanceof Error ? error.message : "Error loading data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.permissions?.includes("manage:system")) loadData();
  }, [user]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // API Handlers
  const handleCreateDepartment = async () => {
    if (!departmentInput.trim()) return setStatusMessage({ type: "error", text: "Department name is required" });
    try {
      setCreatingDept(true);
      const response = await fetch("/api/admin/departments", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_name: departmentInput }),
      });
      if (!response.ok) throw new Error("Failed to create department");
      toast({ variant: "success", title: "Success", description: "Department created successfully!" });
      setDepartmentInput("");
      await loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error creating department" });
    } finally { setCreatingDept(false); }
  };

  const handleCreatePosition = async () => {
    if (!positionInput.trim()) return setStatusMessage({ type: "error", text: "Position name is required" });
    try {
      setCreatingPos(true);
      const response = await fetch("/api/admin/positions", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_name: positionInput }),
      });
      if (!response.ok) throw new Error("Failed to create position");
      toast({ variant: "success", title: "Success", description: "Position created successfully!" });
      setPositionInput("");
      await loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error creating position" });
    } finally { setCreatingPos(false); }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDept || !editDeptName.trim()) return;
    try {
      setSavingEdit(true);
      const manager_id = editManagerId !== "none" ? parseInt(editManagerId, 10) : null;

      const response = await fetch(`/api/admin/departments/${editingDept.department_id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_name: editDeptName, manager_id }),
      });

      if (!response.ok) throw new Error("Failed to update department");

      toast({ variant: "success", title: "Success", description: "Department updated successfully" });
      setEditingDept(null);
      await loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error updating department" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!assigningDept || !assignEmpId || !assignPosId) return;
    try {
      setSavingAssign(true);
      const response = await fetch(`/api/admin/employees/${assignEmpId}/transfer`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department_id: assigningDept.department_id,
          position_id: parseInt(assignPosId, 10),
        }),
      });

      if (!response.ok) throw new Error("Failed to assign staff");

      toast({ variant: "success", title: "Success", description: "Staff assigned successfully!" });
      setAssigningDept(null);
      setAssignEmpId("");
      setAssignPosId("");
      await loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error assigning staff" });
    } finally {
      setSavingAssign(false);
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`Are you sure you want to delete ${department.department_name}?`)) return;
    try {
      const response = await fetch(`/api/departments/${department.department_id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete department");
      toast({ variant: "success", title: "Success", description: "Department deleted successfully" });
      setDepartments((prev) => prev.filter((d) => d.department_id !== department.department_id));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error deleting department" });
    }
  };

  const handleDeletePosition = async (position: Position) => {
    if (!confirm(`Are you sure you want to delete ${position.position_name}?`)) return;
    try {
      const response = await fetch(`/api/positions/${position.position_id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete position");
      toast({ variant: "success", title: "Success", description: "Position deleted successfully" });
      setPositions((prev) => prev.filter((p) => p.position_id !== position.position_id));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error deleting position" });
    }
  };

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 font-medium">Loading...</p></div>;
  if (!user || !user.permissions?.includes("manage:system")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center border border-gray-100">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizational Management</h1>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl font-bold ${statusMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
            {statusMessage.text}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500 font-medium border border-gray-100">Loading organization data...</div>
        ) : (
          <>
            {/* ==================================================== */}
            {/* 1. TOP STATS */}
            {/* ==================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center bg-white p-6 transition-all hover:shadow-md">
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4"><Building2 className="w-6 h-6 text-blue-600" /></div>
                <div className="text-4xl font-black text-gray-900">{stats.total_departments}</div>
                <div className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">Total Departments</div>
              </Card>
              <Card className="rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center bg-white p-6 transition-all hover:shadow-md">
                <div className="p-3 bg-green-50 rounded-xl w-fit mb-4"><Users className="w-6 h-6 text-green-600" /></div>
                <div className="text-4xl font-black text-gray-900">{stats.total_employees}</div>
                <div className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">Total Employments</div>
              </Card>
              <Card className="rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center bg-white p-6 transition-all hover:shadow-md">
                <div className="p-3 bg-purple-50 rounded-xl w-fit mb-4"><Receipt className="w-6 h-6 text-purple-600" /></div>
                <div className="text-4xl font-black text-gray-900 truncate" title={`${stats.total_budget} VND`}>
                  {new Intl.NumberFormat('vi-VN').format(stats.total_budget)} <span className="text-xl">VND</span>
                </div>
                <div className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">Total Budgets</div>
              </Card>
            </div>

            {/* ==================================================== */}
            {/* 2. NHÓM PHÒNG BAN (DEPARTMENTS AREA) */}
            {/* ==================================================== */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              {/* Header & Create Form */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Manage corporate structure and budgets</p>
                </div>

                {/* Form tạo mới nằm gọn ở đây */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <input
                    type="text"
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                    placeholder="New department name..."
                    className="w-full lg:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  />
                  <button
                    onClick={handleCreateDepartment}
                    disabled={creatingDept}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} /> {creatingDept ? "..." : "Add"}
                  </button>
                </div>
              </div>

              {/* Grid Danh sách Phòng ban */}
              {departments.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No departments found. Create one above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departments.map(dept => (
                    <Card key={dept.department_id} className="relative rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white p-6 group">

                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity z-10 space-x-1">
                        <button
                          onClick={() => setAssigningDept(dept)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Assign Staff"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDept(dept);
                            setEditDeptName(dept.department_name);
                            setEditManagerId(dept.manager_id ? dept.manager_id.toString() : "none");
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit department"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete department"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mb-6">
                        <div className="p-3 bg-gray-100 rounded-xl w-fit mb-4"><Briefcase className="w-5 h-5 text-gray-700" /></div>
                        <h3 className="font-extrabold text-gray-900 text-xl">{dept.department_name}</h3>
                      </div>

                      <div className="space-y-3 text-sm font-medium">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Head</span>
                          <span className="text-gray-900 font-bold">{dept.manager_name || "Not assigned"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Employees</span>
                          <span className="text-gray-900">{dept.employee_count || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Budget</span>
                          <span className="text-gray-900">{new Intl.NumberFormat('vi-VN').format(dept.total_budget || 0)} VND</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* ==================================================== */}
            {/* 3. NHÓM CHỨC VỤ (POSITIONS AREA) */}
            {/* ==================================================== */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              {/* Header & Create Form */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Positions</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Manage job titles across the company</p>
                </div>

                {/* Form tạo mới nằm gọn ở đây */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <input
                    type="text"
                    value={positionInput}
                    onChange={(e) => setPositionInput(e.target.value)}
                    placeholder="New position name..."
                    className="w-full lg:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  />
                  <button
                    onClick={handleCreatePosition}
                    disabled={creatingPos}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} /> {creatingPos ? "..." : "Add"}
                  </button>
                </div>
              </div>

              {/* Grid Mini-Cards Danh sách Chức vụ */}
              {positions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No positions found. Create one above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {positions.map((pos) => (
                    <div
                      key={pos.position_id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-black text-[10px] border border-gray-200">
                          #{pos.position_id}
                        </div>
                        <span className="font-extrabold text-gray-800 text-sm">{pos.position_name}</span>
                      </div>
                      <button
                        onClick={() => handleDeletePosition(pos)}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Delete position"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Total Active Positions: {positions.length}
                </p>
              </div>
            </div>

          </>
        )}
      </div>

      {/* ==================================================== */}
      {/* CUSTOM MODAL EDIT (CODE TAY) */}
      {/* ==================================================== */}
      {editingDept && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-gray-100">

            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
              <h2 className="text-2xl font-extrabold text-gray-900">Edit Department</h2>
              <button onClick={() => setEditingDept(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Department Name</label>
                <input
                  type="text"
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-gray-900 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Assign Department Head</label>
                
                {(() => {
                  const departmentEmployees = basicEmployees.filter(emp => emp.department_id === editingDept.department_id);
                  return departmentEmployees.length === 0 ? (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                      No employees in this department. Please assign staff first.
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={editManagerId}
                        onChange={(e) => setEditManagerId(e.target.value)}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-gray-900 appearance-none cursor-pointer transition-all"
                      >
                        <option value="none">-- None / Not assigned --</option>
                        {departmentEmployees.map((emp) => (
                          <option key={emp.employee_id} value={emp.employee_id.toString()}>
                            {emp.first_name} {emp.last_name} ({emp.email})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateDepartment}
                disabled={savingEdit || !editDeptName.trim()}
                className="px-6 py-3 text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ASSIGN STAFF MODAL */}
      {/* ==================================================== */}
      {assigningDept && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-gray-100">

            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
              <h2 className="text-2xl font-extrabold text-gray-900">Assign Staff</h2>
              <button onClick={() => { setAssigningDept(null); setAssignEmpId(""); setAssignPosId(""); }} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium tracking-tight">
                  Moving employee to <span className="font-extrabold text-blue-900">{assigningDept.department_name}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Select Employee</label>
                <div className="relative">
                  <select
                    value={assignEmpId}
                    onChange={(e) => setAssignEmpId(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-gray-900 appearance-none cursor-pointer transition-all"
                  >
                    <option value="" disabled>-- Select an Employee --</option>
                    {basicEmployees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id.toString()}>
                        {emp.first_name} {emp.last_name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Assign Position</label>
                <div className="relative">
                  <select
                    value={assignPosId}
                    onChange={(e) => setAssignPosId(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-gray-900 appearance-none cursor-pointer transition-all"
                  >
                    <option value="" disabled>-- Select a Position --</option>
                    {positions.map((pos) => (
                      <option key={pos.position_id} value={pos.position_id.toString()}>
                        {pos.position_name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setAssigningDept(null); setAssignEmpId(""); setAssignPosId(""); }}
                className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignStaff}
                disabled={savingAssign || !assignEmpId || !assignPosId}
                className="px-6 py-3 text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {savingAssign ? "Assigning..." : "Assign Staff"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}