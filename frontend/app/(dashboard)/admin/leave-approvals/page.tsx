"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface LeaveRequest {
  request_id: number; // Fixed: backend returns request_id, not leave_request_id
  employee_email?: string;
  employee_name?: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  manager_approver?: string;
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

// Skeleton Loading Component
const SkeletonTable = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
    ))}
  </div>
);

export default function LeaveApprovalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

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
      // Fixed: Backend returns array directly, not wrapped in data.data
      setRequests(Array.isArray(data) ? data : data.data || []);
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

  // Handle approval
  const handleApprove = async (requestId: number) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));

      const response = await fetch(`/api/leave/request/${requestId}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json?.message || "Failed to approve request");
      }

      setStatusMessage({
        type: "success",
        text: "Request approved successfully!",
      });

      // Refresh requests
      await loadRequests();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error approving request";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle rejection (opens confirmation dialog)
  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  // Confirm rejection
  const handleConfirmReject = async () => {
    if (selectedRequestId === null) return;

    try {
      setProcessingIds((prev) => new Set(prev).add(selectedRequestId));

      const response = await fetch(
        `/api/leave/request/${selectedRequestId}/approve`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Rejected" }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json?.message || "Failed to reject request");
      }

      setStatusMessage({
        type: "success",
        text: "Request rejected successfully!",
      });

      // Close dialog and refresh
      setRejectDialogOpen(false);
      setSelectedRequestId(null);
      setRejectionReason("");
      await loadRequests();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error rejecting request";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequestId);
        return newSet;
      });
    }
  };

  // Render authorization check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
          <div className="bg-white rounded-lg shadow p-8">
            <SkeletonTable />
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
                      Days
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
                  {requests.map((request) => {
                    const start = new Date(request.start_date);
                    const end = new Date(request.end_date);
                    const days =
                      Math.floor(
                        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                      ) + 1;
                    const isProcessing = processingIds.has(request.request_id);

                    return (
                      <tr
                        key={request.request_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {request.employee_name ||
                            request.employee_email ||
                            `Employee #${request.request_id}`}
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
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {days}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {request.reason || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            variant={
                              request.status === "Approved"
                                ? "default"
                                : request.status === "Rejected"
                                ? "destructive"
                                : "outline"
                            }
                            className={
                              request.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : request.status === "Approved"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : ""
                            }
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(request.request_id)}
                              disabled={isProcessing}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </Button>
                            <Button
                              onClick={() => handleRejectClick(request.request_id)}
                              disabled={isProcessing}
                              size="sm"
                              variant="destructive"
                            >
                              {isProcessing ? "Processing..." : "Reject"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Rejection Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this leave request? You can
              optionally provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">
                Rejection Reason (optional)
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Enter reason for rejection..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedRequestId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={processingIds.has(selectedRequestId || 0)}
            >
              {processingIds.has(selectedRequestId || 0)
                ? "Processing..."
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
