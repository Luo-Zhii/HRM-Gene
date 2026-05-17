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
              Endpoint RBAC Policies
            </h1>
            <p className="text-gray-600 mt-2">Manage granular endpoint access controls for each organizational role.</p>
          </div>
          {canEdit && (
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleSave}
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
          {/* Left Sidebar: Roles List */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Select Role</h2>
              </div>
              <ul className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                {positions.map((pos) => (
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
                ))}
                {positions.length === 0 && !loading && (
                  <li className="px-4 py-4 text-center text-gray-500 text-sm">No roles found</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Area: Grid Accordions */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading endpoint permissions...</p>
              </div>
            ) : groupedPermissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <p className="text-gray-500">No permissions configured.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedPermissions.map((group) => {
                  const isExpanded = expandedGroups[group.module_group];
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}