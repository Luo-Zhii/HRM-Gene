"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

interface LeaveRequest {
  leave_request_id: string;
  employee_id: string;
  employee_name?: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  manager_approver?: string;
  created_at: string;
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

export default function LeaveApprovalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      // Check if user has manage:leave permission
      const hasPermission = user.permissions?.includes("manage:leave");
      if (!hasPermission) {
        setStatusMessage({
          type: "error",
          text: "You do not have permission to access this page.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  // Load pending leave requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leave/pending-requests", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error loading requests";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.permissions?.includes("manage:leave")) {
      loadRequests();
    }
  }, [user]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Handle approval/rejection
  const handleAction = async (
    requestId: string,
    status: "Approved" | "Rejected"
  ) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));

      const response = await fetch(`/api/leave/request/${requestId}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} request`);
      }

      setStatusMessage({
        type: "success",
        text: `Request ${status.toLowerCase()} successfully!`,
      });

      // Refresh requests
      await loadRequests();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Error ${status.toLowerCase()}ing request`;
      setStatusMessage({ type: "error", text: message });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
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

  if (!user || !user.permissions?.includes("manage:leave")) {
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
          <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>
          <p className="text-gray-600 mt-2">
            Review and approve pending leave requests
          </p>
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
            <p className="text-gray-600">Loading pending requests...</p>
          </div>
        ) : requests.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 font-medium">
              No pending leave requests
            </p>
            <p className="text-gray-500 mt-2">
              All requests have been processed.
            </p>
          </div>
        ) : (
          // Table
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Leave Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.leave_request_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.employee_name ||
                          `Employee #${request.employee_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.leave_type_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {request.reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-medium ${
                            request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleAction(request.leave_request_id, "Approved")
                            }
                            disabled={processingIds.has(
                              request.leave_request_id
                            )}
                            className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingIds.has(request.leave_request_id)
                              ? "Processing..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleAction(request.leave_request_id, "Rejected")
                            }
                            disabled={processingIds.has(
                              request.leave_request_id
                            )}
                            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingIds.has(request.leave_request_id)
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Count */}
        {!loading && requests.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {requests.length} pending request
            {requests.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
