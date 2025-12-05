"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

interface PermissionData {
  position_id: number;
  position_name: string;
  permissions: Array<{
    permission_id: number;
    permission_name: string;
  }>;
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

export default function PermissionMatrixPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const canEdit = !!user?.permissions?.includes("manage:system");

  const [matrix, setMatrix] = useState<PermissionData[]>([]);
  const [allPermissions, setAllPermissions] = useState<
    Array<{ permission_id: number; permission_name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [processingCell, setProcessingCell] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const canView =
        user.permissions?.includes("manage:system") ||
        user.permissions?.includes("view:permissions");

      if (!canView) {
        setStatusMessage({
          type: "error",
          text: "You do not have permission to access this page.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  // Load permission matrix
  const loadMatrix = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/permissions/matrix", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch permission matrix");
      }

      const data = await response.json();
      setMatrix(data || []);

      // Extract all unique permissions from the matrix
      const permissionsSet = new Map<
        number,
        { permission_id: number; permission_name: string }
      >();
      data.forEach((position: PermissionData) => {
        position.permissions.forEach((perm) => {
          permissionsSet.set(perm.permission_id, perm);
        });
      });
      setAllPermissions(
        Array.from(permissionsSet.values()).sort(
          (a, b) => a.permission_id - b.permission_id
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error loading matrix";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user &&
      (user.permissions?.includes("manage:system") ||
        user.permissions?.includes("view:permissions"))
    ) {
      loadMatrix();
    }
  }, [user]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Check if position has permission
  const hasPermission = (positionId: number, permissionId: number): boolean => {
    const position = matrix.find((p) => p.position_id === positionId);
    if (!position) return false;
    return position.permissions.some(
      (perm) => perm.permission_id === permissionId
    );
  };

  // Handle checkbox change
  const handleCheckboxChange = async (
    positionId: number,
    permissionId: number,
    checked: boolean
  ) => {
    const cellKey = `${positionId}-${permissionId}`;
    setProcessingCell(cellKey);

    // Security: ensure only editable users can make API calls
    if (!canEdit) {
      setStatusMessage({
        type: "error",
        text: "You do not have permission to make changes.",
      });
      setProcessingCell(null);
      return;
    }

    try {
      const endpoint = checked
        ? "/api/admin/permissions/assign"
        : "/api/admin/permissions/revoke";

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position_id: positionId,
          permission_id: permissionId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${checked ? "assign" : "revoke"} permission`
        );
      }

      setStatusMessage({
        type: "success",
        text: `Permission ${checked ? "assigned" : "revoked"} successfully!`,
      });

      // Reload matrix
      await loadMatrix();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error updating permission";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setProcessingCell(null);
    }
  };

  // Render authorization check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (
    !user ||
    !(
      user.permissions?.includes("manage:system") ||
      user.permissions?.includes("view:permissions")
    )
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
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Permission Matrix
          </h1>
          <p className="text-gray-600 mt-2">Assign permissions to positions</p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-4 p-4 rounded-lg font-medium ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : statusMessage.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading permission matrix...</p>
          </div>
        ) : matrix.length === 0 || allPermissions.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 font-medium">
              No positions or permissions found
            </p>
            <p className="text-gray-500 mt-2">
              Create positions and permissions first.
            </p>
          </div>
        ) : (
          // Permission Matrix Table
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-100 sticky left-0 z-10 min-w-[200px]">
                      Position
                    </th>
                    {allPermissions.map((perm) => (
                      <th
                        key={perm.permission_id}
                        className="px-4 py-4 text-center text-sm font-semibold text-gray-700 bg-gray-100 min-w-[150px]"
                      >
                        <div className="break-words text-xs leading-tight">
                          {perm.permission_name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((position) => (
                    <tr
                      key={position.position_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-9">
                        {position.position_name}
                      </td>
                      {allPermissions.map((perm) => {
                        const isChecked = hasPermission(
                          position.position_id,
                          perm.permission_id
                        );
                        const cellKey = `${position.position_id}-${perm.permission_id}`;
                        const isProcessing = processingCell === cellKey;

                        return (
                          <td
                            key={perm.permission_id}
                            className="px-4 py-4 text-center border-r border-gray-200"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  position.position_id,
                                  perm.permission_id,
                                  e.target.checked
                                )
                              }
                              disabled={isProcessing || !canEdit}
                              title={
                                !canEdit
                                  ? "Read-only: you cannot modify permissions"
                                  : undefined
                              }
                              aria-disabled={!canEdit}
                              className={`w-5 h-5 rounded cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                                !canEdit ? "opacity-70" : ""
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Legend:</strong> Check a box to assign a permission to a
                position. Uncheck to revoke. Users without edit privileges
                (read-only) can view the current assignments but cannot make
                changes.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Showing {matrix.length} position{matrix.length !== 1 ? "s" : ""}{" "}
                and {allPermissions.length} permission
                {allPermissions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
