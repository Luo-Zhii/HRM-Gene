"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { canManagePermissions } from "@/src/lib/adminAccess";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface Permission {
  permission_id: number;
  permission_name: string;
  module_group: string;
  method: string;
  apiPath: string;
}

interface GroupedPermission {
  module_group: string;
  permissions: Permission[];
}

interface Position {
  position_id: number;
  position_name: string;
  permissions: {
    permission_id: number;
    permission: Permission;
  }[];
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

const SIDEBAR_ITEMS = [
  {
    module_group: "General",
    items: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "News Feed", path: "/company-news" },
      { name: "Staff Directory", path: "/directory" },
    ]
  },
  {
    module_group: "My Workspace",
    items: [
      { name: "Timekeeping", path: "/dashboard/timekeeping" },
      { name: "Leave Management", path: "/dashboard/leave" },
      { name: "My Goals", path: "/dashboard/performance/me" },
      { name: "My Salary", path: "/dashboard/salary" },
      { name: "My Resignation", path: "/my-resignation" },
    ]
  },
  {
    module_group: "People",
    items: [
      { name: "Employee Directory", path: "/admin/employees" },
      { name: "Employment Contract", path: "/admin/contracts" },
      { name: "Organizational Management", path: "/admin/organization" },
      { name: "Discipline", path: "/admin/discipline" },
      { name: "Permissions", path: "/admin/permissions" },
    ]
  },
  {
    module_group: "Attend & Leave",
    items: [
      { name: "Attendance History", path: "/admin/attendance" },
      { name: "QR Display", path: "/admin/qr-display" },
      { name: "Leave Approvals", path: "/admin/leave-approvals" },
      { name: "Resignation Approvals", path: "/admin/resignations" },
      { name: "Public Holidays", path: "/admin/holidays" },
    ]
  },
  {
    module_group: "Payroll",
    items: [
      { name: "Salary Configuration", path: "/admin/payroll/config" },
      { name: "Salary Adjustment", path: "/admin/payroll/adjustment" },
      { name: "Create Payroll", path: "/admin/payroll/generate" },
      { name: "Issue Payslips", path: "/admin/payroll/issue" },
    ]
  },
  {
    module_group: "Performance",
    items: [
      { name: "KPI Library", path: "/admin/performance/library" },
      { name: "Team Performance", path: "/admin/performance/team" },
    ]
  },
  {
    module_group: "Communication",
    items: [
      { name: "Manage News", path: "/admin/announcements" },
    ]
  },
  {
    module_group: "Analytics",
    items: [
      { name: "Analysis Report", path: "/admin/reports" },
    ]
  },
  {
    module_group: "System Settings",
    items: [
      { name: "System Settings", path: "/admin/settings" },
      { name: "Payroll Settings", path: "/admin/settings/payroll" },
    ]
  }
];

export default function PermissionMatrixPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const canEdit = canManagePermissions(user);

  const [positions, setPositions] = useState<Position[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // New department state variables
  const [activeTab, setActiveTab] = useState<"roles" | "departments">("roles");
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [deptVisibility, setDeptVisibility] = useState<Record<string, Record<string, boolean>>>({});

  // Check authorization — Director always has access
  useEffect(() => {
    if (!authLoading && user) {
      if (!canEdit) {
        setStatusMessage({ type: "error", text: t("permissions.noPermission", "You do not have permission to view this page.") });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router, canEdit, t]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch grouped permissions
      const pRes = await fetch("/api/admin/permissions/grouped", { credentials: "include" });
      if (!pRes.ok) throw new Error("Failed to load permissions");
      const pData: GroupedPermission[] = await pRes.json();
      setGroupedPermissions(pData);

      // Expand all groups by default
      const initialExpanded: Record<string, boolean> = {};
      pData.forEach(g => { initialExpanded[g.module_group] = true; });
      setExpandedGroups(initialExpanded);

      // Fetch positions (roles)
      const rRes = await fetch("/api/admin/positions", { credentials: "include" });
      if (!rRes.ok) throw new Error("Failed to load roles");
      const rData: Position[] = await rRes.json();
      setPositions(rData);

      if (rData.length > 0 && selectedPositionId === null) {
        setSelectedPositionId(rData[0].position_id);
      }

      // Fetch departments
      const dRes = await fetch("/api/admin/departments", { credentials: "include" });
      if (dRes.ok) {
        const dData = await dRes.json();
        setDepartments(dData);
        if (dData.length > 0 && selectedDeptId === null) {
          setSelectedDeptId(dData[0].department_id);
        }
      }

      // Fetch sidebar visibility settings
      const sRes = await fetch("/api/admin/settings/sidebar_dept_visibility", { credentials: "include" });
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData && sData.value) {
          try {
            setDeptVisibility(JSON.parse(sData.value));
          } catch (e) {}
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error loading data";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && canEdit) {
      loadData();
    }
  }, [user]);

  // Update selected permission IDs when position changes
  useEffect(() => {
    if (selectedPositionId !== null && positions.length > 0) {
      const currentPos = positions.find(p => p.position_id === selectedPositionId);
      if (currentPos) {
        const ids = currentPos.permissions.map(p => p.permission ? p.permission.permission_id : p.permission_id);
        setSelectedPermissionIds(ids);
      }
    }
  }, [selectedPositionId, positions]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const togglePermission = (permId: number) => {
    if (!canEdit) return;
    setSelectedPermissionIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const currentDept = departments.find(d => d.department_id === selectedDeptId);
  const currentDeptName = currentDept ? currentDept.department_name : "";

  const toggleDeptPath = (path: string) => {
    if (!currentDeptName) return;
    setDeptVisibility(prev => {
      const deptSettings = prev[currentDeptName] || {};
      const currentVal = deptSettings[path] !== false; // default true
      return {
        ...prev,
        [currentDeptName]: {
          ...deptSettings,
          [path]: !currentVal
        }
      };
    });
  };

  const toggleAllInDeptGroup = (groupPaths: string[], allSelected: boolean) => {
    if (!currentDeptName) return;
    setDeptVisibility(prev => {
      const deptSettings = { ...(prev[currentDeptName] || {}) };
      groupPaths.forEach(path => {
        deptSettings[path] = !allSelected;
      });
      return {
        ...prev,
        [currentDeptName]: deptSettings
      };
    });
  };

  const handleSave = async () => {
    if (!selectedPositionId || !canEdit) return;
    
    setSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/roles/${selectedPositionId}/permissions`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission_ids: selectedPermissionIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role permissions");
      }

      setStatusMessage({
        type: "success",
        text: "Permissions updated successfully",
      });

      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error saving";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDeptVisibility = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "sidebar_dept_visibility",
          value: JSON.stringify(deptVisibility)
        })
      });
      if (!res.ok) throw new Error("Failed to save sidebar visibility policies");
      setStatusMessage({ type: "success", text: "Sidebar visibility policies updated successfully" });
      
      // Update cache in sessionStorage immediately for the admin
      if (user?.department?.department_name) {
        const userDeptName = user.department.department_name;
        const currentDeptSettings = deptVisibility[userDeptName] || {};
        sessionStorage.setItem(`sidebar_dept_visibility_${userDeptName}`, JSON.stringify(currentDeptSettings));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error saving";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (activeTab === "roles") {
      await handleSave();
    } else {
      await handleSaveDeptVisibility();
    }
  };

  // Helper for Method Color Coding
  const getMethodStyle = (method: string) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "POST":
        return "bg-green-100 text-green-700 border-green-200";
      case "PATCH":
      case "PUT":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "DELETE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || !canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
          <ShieldCheck className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-indigo-600" />
              Permissions Management
            </h1>
            <p className="text-gray-600 mt-2">Configure endpoint access for system roles or toggle sidebar menu visibility for departments.</p>
          </div>
          {canEdit && (
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleSaveAll}
                disabled={saving || loading}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? "Updating Policies..." : "Save Policies"}
              </button>
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-lg font-medium shadow-sm transition-all duration-300 ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : statusMessage.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar: Roles & Departments */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              {/* Tab Selector */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`flex-1 py-3 text-center text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                    activeTab === "roles"
                      ? "border-indigo-600 text-indigo-600 bg-white font-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Roles (RBAC)
                </button>
                <button
                  onClick={() => setActiveTab("departments")}
                  className={`flex-1 py-3 text-center text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                    activeTab === "departments"
                      ? "border-indigo-600 text-indigo-600 bg-white font-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Departments
                </button>
              </div>

              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {activeTab === "roles" ? "Select Role" : "Select Department"}
              </div>

              <ul className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                {activeTab === "roles" ? (
                  positions.map((pos) => (
                    <li key={pos.position_id}>
                      <button
                        onClick={() => setSelectedPositionId(pos.position_id)}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                          selectedPositionId === pos.position_id
                            ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                      >
                        {pos.position_name}
                      </button>
                    </li>
                  ))
                ) : (
                  departments.map((dept) => (
                    <li key={dept.department_id}>
                      <button
                        onClick={() => setSelectedDeptId(dept.department_id)}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                          selectedDeptId === dept.department_id
                            ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                      >
                        {dept.department_name}
                      </button>
                    </li>
                  ))
                )}
                {activeTab === "roles" && positions.length === 0 && !loading && (
                  <li className="px-4 py-4 text-center text-gray-500 text-sm">No roles found</li>
                )}
                {activeTab === "departments" && departments.length === 0 && !loading && (
                  <li className="px-4 py-4 text-center text-gray-500 text-sm">No departments found</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Area: Grid Accordions */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : activeTab === "roles" ? (
              // Existing roles RBAC grid
              groupedPermissions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No permissions configured.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedPermissions.map((group) => {
                    const isExpanded = expandedGroups[group.module_group] !== false;
                    const groupPermIds = group.permissions.map(p => p.permission_id);
                    const selectedInGroup = groupPermIds.filter(id => selectedPermissionIds.includes(id)).length;
                    const allSelected = selectedInGroup === groupPermIds.length && groupPermIds.length > 0;

                    return (
                      <div key={group.module_group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => toggleGroup(group.module_group)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none border-b border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-800 text-lg uppercase tracking-wide">
                              {group.module_group === "OTHER" ? "GENERAL" : group.module_group}
                            </h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              allSelected ? 'bg-green-100 text-green-700' : 
                              selectedInGroup > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {selectedInGroup} / {groupPermIds.length} ACTIVE
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 bg-white">
                            {group.permissions.map((perm) => {
                              const isSelected = selectedPermissionIds.includes(perm.permission_id);
                              return (
                                <div 
                                  key={perm.permission_id}
                                  className={`flex flex-col p-4 rounded-xl border transition-all duration-200 ${
                                    isSelected ? "border-indigo-300 bg-indigo-50/40 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 pr-4">
                                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                        {perm.permission_name}
                                      </h4>
                                    </div>
                                    
                                    {/* Custom Toggle Switch */}
                                    <button
                                      type="button"
                                      disabled={!canEdit}
                                      onClick={() => togglePermission(perm.permission_id)}
                                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                        isSelected ? 'bg-indigo-600' : 'bg-gray-200'
                                      } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      role="switch"
                                      aria-checked={isSelected}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          isSelected ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mt-auto">
                                    {perm.method ? (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getMethodStyle(perm.method)}`}>
                                        {perm.method}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 bg-gray-100 text-gray-500 uppercase tracking-wider">
                                        ANY
                                      </span>
                                    )}
                                    
                                    <span className="text-xs font-mono text-gray-600 truncate bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex-1">
                                      {perm.apiPath || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // Departments Sidebar Visibility Grid
              <div className="space-y-6">
                {SIDEBAR_ITEMS.map((group) => {
                  const isExpanded = expandedGroups[group.module_group] !== false; // default true for sidebar groups
                  const groupPaths = group.items.map(i => i.path);
                  
                  // Count how many are allowed/selected in this group
                  const selectedInGroup = group.items.filter(item => {
                    const isAllowed = deptVisibility[currentDeptName]?.[item.path] !== false;
                    return isAllowed;
                  }).length;
                  
                  const allSelected = selectedInGroup === group.items.length;

                  return (
                    <div key={group.module_group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                        <button
                          onClick={() => toggleGroup(group.module_group)}
                          className="flex items-center gap-3 focus:outline-none flex-1 text-left"
                        >
                          <h3 className="font-semibold text-gray-800 text-lg uppercase tracking-wide">
                            {group.module_group}
                          </h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            allSelected ? 'bg-green-100 text-green-700' : 
                            selectedInGroup > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {selectedInGroup} / {group.items.length} VISIBLE
                          </span>
                        </button>
                        
                        <div className="flex items-center gap-4">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => toggleAllInDeptGroup(groupPaths, allSelected)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              {allSelected ? "Hide All" : "Show All"}
                            </button>
                          )}
                          <button
                            onClick={() => toggleGroup(group.module_group)}
                            className="focus:outline-none"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                          {group.items.map((item) => {
                            const isAllowed = deptVisibility[currentDeptName]?.[item.path] !== false; // default true
                            return (
                              <div 
                                key={item.path}
                                className={`flex flex-col p-4 rounded-xl border transition-all duration-200 ${
                                  isAllowed ? "border-indigo-300 bg-indigo-50/40 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 pr-4">
                                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                      {item.name}
                                    </h4>
                                    <span className="text-xs text-gray-500 font-mono mt-1 block">
                                      {item.path}
                                    </span>
                                  </div>
                                  
                                  {/* Custom Toggle Switch */}
                                  <button
                                    type="button"
                                    disabled={!canEdit}
                                    onClick={() => toggleDeptPath(item.path)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                      isAllowed ? 'bg-indigo-600' : 'bg-gray-200'
                                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    role="switch"
                                    aria-checked={isAllowed}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isAllowed ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}