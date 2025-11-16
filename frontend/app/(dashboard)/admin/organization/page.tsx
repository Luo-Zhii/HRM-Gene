"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

interface Department {
  department_id: number;
  department_name: string;
}

interface Position {
  position_id: number;
  position_name: string;
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

export default function OrganizationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentInput, setDepartmentInput] = useState("");
  const [creatingDept, setCreatingDept] = useState(false);

  // Positions
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionInput, setPositionInput] = useState("");
  const [creatingPos, setCreatingPos] = useState(false);

  // General state
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission = user.permissions?.includes("manage:system");
      if (!hasPermission) {
        setStatusMessage({
          type: "error",
          text: "You do not have permission to access this page.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [deptsRes, posRes] = await Promise.all([
        fetch("/api/admin/departments", {
          method: "GET",
          credentials: "include",
        }),
        fetch("/api/admin/positions", {
          method: "GET",
          credentials: "include",
        }),
      ]);

      if (!deptsRes.ok || !posRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const deptsData = await deptsRes.json();
      const posData = await posRes.json();

      setDepartments(deptsData || []);
      setPositions(posData || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error loading data";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.permissions?.includes("manage:system")) {
      loadData();
    }
  }, [user]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Create department
  const handleCreateDepartment = async () => {
    if (!departmentInput.trim()) {
      setStatusMessage({ type: "error", text: "Department name is required" });
      return;
    }

    try {
      setCreatingDept(true);
      const response = await fetch("/api/admin/departments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_name: departmentInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to create department");
      }

      setStatusMessage({
        type: "success",
        text: "Department created successfully!",
      });

      setDepartmentInput("");
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating department";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setCreatingDept(false);
    }
  };

  // Create position
  const handleCreatePosition = async () => {
    if (!positionInput.trim()) {
      setStatusMessage({ type: "error", text: "Position name is required" });
      return;
    }

    try {
      setCreatingPos(true);
      const response = await fetch("/api/admin/positions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_name: positionInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to create position");
      }

      setStatusMessage({
        type: "success",
        text: "Position created successfully!",
      });

      setPositionInput("");
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating position";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setCreatingPos(false);
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

  if (!user || !user.permissions?.includes("manage:system")) {
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Organization Management
          </h1>
          <p className="text-gray-600 mt-2">Manage departments and positions</p>
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

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departments Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Departments
                </h2>

                {/* Create Form */}
                <div className="bg-white rounded-lg shadow p-6 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Department
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={departmentInput}
                      onChange={(e) => setDepartmentInput(e.target.value)}
                      placeholder="Enter department name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCreateDepartment}
                      disabled={creatingDept}
                      className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creatingDept ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>

                {/* Departments List */}
                {departments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No departments yet</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                              Name
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {departments.map((dept) => (
                            <tr
                              key={dept.department_id}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-3 text-sm text-gray-600">
                                {dept.department_id}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                                {dept.department_name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 mt-2">
                  Total: {departments.length} department
                  {departments.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Positions Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Positions
                </h2>

                {/* Create Form */}
                <div className="bg-white rounded-lg shadow p-6 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Position
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={positionInput}
                      onChange={(e) => setPositionInput(e.target.value)}
                      placeholder="Enter position name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCreatePosition}
                      disabled={creatingPos}
                      className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creatingPos ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>

                {/* Positions List */}
                {positions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No positions yet</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                              Name
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((pos) => (
                            <tr
                              key={pos.position_id}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-3 text-sm text-gray-600">
                                {pos.position_id}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                                {pos.position_name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 mt-2">
                  Total: {positions.length} position
                  {positions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
