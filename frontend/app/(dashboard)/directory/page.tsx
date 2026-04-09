"use client";

/**
 * Staff Directory — /directory
 *
 * Public view accessible to ALL authenticated employees.
 * Reuses the same <EmployeeTable> component as /admin/employees, but with
 * RBAC props set to restrict sensitive data:
 *
 *   showSensitive={false}  → Phone column NOT rendered (neither in table nor card)
 *   showActions={false}    → View/Offboard buttons NOT rendered
 *
 * Data comes from GET /api/employees/directory — the backend also strips
 * phone_number and address at the service layer, providing defence-in-depth.
 */

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import EmployeeTable, { EmployeeRow } from "@/components/EmployeeTable";

export default function StaffDirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Calls GET /api/employees/directory — this endpoint is handled by
     * EmployeesService.findAllPublic() which deliberately excludes
     * phone_number and address from the JSON response.
     *
     * UI hiding is a second layer of security; the backend is the true gate.
     */
    fetch("/api/employees/directory", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={22} className="text-blue-500" />
          Staff Directory
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Find colleagues and send them a quick message.
        </p>
      </div>

      {/*
        Shared EmployeeTable — restricted mode:
          showSensitive={false}  No Phone column in table view, no phone row in cards
          showActions={false}    No View Profile (admin) or Offboard button
                                 Cards get a "View Profile" link to /directory/[id] instead
      */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        showSensitive={false}
        showActions={false}
      />
    </div>
  );
}
