"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/src/hooks/useAuth";
import { Calendar, Clock, FileText, User as UserIcon, Building2, Briefcase, Mail, LayoutGrid, List as ListIcon, CheckCircle2, XCircle, X } from "lucide-react";

interface LeaveRequest {
  request_id: number;
  employee_id?: number;
  employee_email?: string;
  employee_name?: string;
  employee_avatar?: string;
  employee_department?: string;
  employee_position?: string;
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

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name[0].toUpperCase();
};

export default function LeaveApprovalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, action: 'Approve' | 'Reject' | 'Revoke' | null, requestId: number | null }>({ isOpen: false, action: null, requestId: null });
  const [actionReason, setActionReason] = useState("");

  const [activeRequest, setActiveRequest] = useState<LeaveRequest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'split'>('split');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('Pending');

  const filteredRequests = useMemo(() => {
    return requests.filter(req =>
      req.status === statusFilter ||
      (statusFilter === 'Pending' && req.status === 'Approved_By_Manager')
    );
  }, [requests, statusFilter]);

  useEffect(() => {
    if (!authLoading && user) {
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
      const loadedRequests = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      setRequests(loadedRequests);

      if (data.stats) {
        setStats(data.stats);
      }

      // Auto-select first if none selected, but scope it to the first of the newly filtered array
      if (activeRequest) {
        const updatedActive = loadedRequests.find((r: LeaveRequest) => r.request_id === activeRequest.request_id);
        if (updatedActive) {
          setActiveRequest(updatedActive);
        } else {
          setActiveRequest(null);
        }
      } else {
        const defaultFiltered = loadedRequests.filter((req: LeaveRequest) =>
          req.status === statusFilter ||
          (statusFilter === 'Pending' && req.status === 'Approved_By_Manager')
        );
        if (defaultFiltered.length > 0) {
          setActiveRequest(defaultFiltered[0]);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error loading requests";
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

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const executeAction = async () => {
    if (!confirmModal.requestId || !confirmModal.action) return;

    const { requestId, action } = confirmModal;
    const isApproving = action === 'Approve';
    const backendStatus = isApproving ? "Approved" : "Rejected";

    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));
      const response = await fetch(`/api/leave/request/${requestId}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus, reason: actionReason }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json?.message || `Failed to ${action.toLowerCase()} request`);
      }

      setStatusMessage({ type: "success", text: `Request ${backendStatus.toLowerCase()} successfully!` });
      setConfirmModal({ isOpen: false, action: null, requestId: null });
      setActionReason("");
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Error processing request`;
      setStatusMessage({ type: "error", text: message });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

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
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Calculate days for active request
  let totalDays = 0;
  if (activeRequest) {
    const start = new Date(activeRequest.start_date);
    const end = new Date(activeRequest.end_date);
    totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>
            <p className="text-gray-600 mt-2">Review and manage employee leave requests</p>
          </div>
          {statusMessage && (
            <div className={`px-4 py-2 rounded-lg font-medium text-sm animate-fade-in ${statusMessage.type === "success" ? "bg-green-100 text-green-800" :
              statusMessage.type === "error" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Requests</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center"><FileText className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Pending Approval</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-600" /></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Approved</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Rejected</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.rejected}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><XCircle className="w-6 h-6 text-red-600" /></div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex shadow-sm">
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${viewMode === 'split'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Split View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${viewMode === 'list'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <ListIcon className="w-4 h-4 mr-2" /> List View
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          /* LIST VIEW: Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 mb-6">
            <div className="overflow-x-auto h-full max-h-[calc(100vh-320px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Leave Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Start Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">End Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Days</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading requests...</td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No {statusFilter.toLowerCase()} leave requests</td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => {
                      const start = new Date(request.start_date);
                      const end = new Date(request.end_date);
                      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      const isProcessing = processingIds.has(request.request_id);
                      const displayName = request.employee_name || request.employee_email || `Employee #${request.employee_id || request.request_id}`;

                      return (
                        <tr key={request.request_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                {request.employee_avatar ? (
                                  <img src={request.employee_avatar} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                  getInitials(displayName)
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{displayName}</div>
                                <div className="text-xs text-gray-500">{request.employee_department || "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">{request.leave_type_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(request.start_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(request.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{days}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={request.reason}>{request.reason || "-"}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`text-[11px] uppercase tracking-wider font-semibold ${request.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              request.status === "Approved_By_Manager" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-gray-50 text-gray-700"
                              }`}>
                              {request.status.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {(request.status === "Pending" || request.status === "Approved_By_Manager" || request.status === "Rejected") && (
                                <button
                                  onClick={() => setConfirmModal({ isOpen: true, action: 'Approve', requestId: request.request_id })}
                                  disabled={isProcessing}
                                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs rounded-md font-medium transition-colors disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : "Approve"}
                                </button>
                              )}
                              {(request.status === "Pending" || request.status === "Approved_By_Manager" || request.status === "Approved") && (
                                <button
                                  onClick={() => { setActiveRequest(request); setConfirmModal({ isOpen: true, action: request.status === 'Approved' ? 'Revoke' : 'Reject', requestId: request.request_id }); }}
                                  disabled={isProcessing}
                                  className="border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3 text-xs rounded-md font-medium transition-colors disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : (request.status === "Approved" ? "Revoke" : "Reject")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SPLIT VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-[calc(100vh-320px)] min-h-[500px] mb-6">

            {/* LEFT COLUMN: Request List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">{statusFilter === 'Pending' ? 'Pending' : statusFilter} Requests</h2>
                  <Badge variant="secondary" className="bg-white text-gray-700 font-bold">{filteredRequests.length}</Badge>
                </div>
                <div className="flex bg-gray-200/50 p-1 rounded-lg">
                  {['Pending', 'Approved', 'Rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setActiveRequest(null); }}
                      className={`flex-1 text-xs py-1.5 font-medium rounded-md transition-all ${statusFilter === status ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading && filteredRequests.length === 0 ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3 items-center animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="space-y-2 flex-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div>
                      </div>
                    ))}
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No {statusFilter.toLowerCase()} requests</p>
                    <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredRequests.map((request) => {
                      const isActive = activeRequest?.request_id === request.request_id;
                      const displayName = request.employee_name || request.employee_email || `Employee #${request.employee_id || request.request_id}`;

                      return (
                        <div
                          key={request.request_id}
                          onClick={() => setActiveRequest(request)}
                          className={`p-4 cursor-pointer transition-all flex items-start gap-3 hover:bg-gray-50 ${isActive ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-blue-200">
                            {request.employee_avatar ? (
                              <img src={request.employee_avatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(displayName)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`font-semibold text-sm truncate pr-2 ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                                {displayName}
                              </h3>
                              <span className="text-[11px] text-gray-500 shrink-0 mt-0.5">
                                {new Date(request.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 truncate font-medium">{request.leave_type_name}</p>
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${request.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              request.status === "Approved_By_Manager" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-gray-50 text-gray-700"
                              }`}>
                              {request.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Detail View */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden relative">
              {!activeRequest ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700">Select a Request</h2>
                  <p className="text-gray-500 mt-2 max-w-sm">
                    Click on any leave request from the list to view its complete details and take action.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-100 flex-none bg-white z-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                      <Badge className={
                        activeRequest.status === "Pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                          activeRequest.status === "Approved_By_Manager" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                            "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }>
                        {activeRequest.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Section 1: Employee Information */}
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" /> Employee Information
                      </h3>
                      <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0 overflow-hidden shadow-sm border border-white">
                          {activeRequest.employee_avatar ? (
                            <img src={activeRequest.employee_avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(activeRequest.employee_name || activeRequest.employee_email)
                          )}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Full Name</p>
                            <p className="font-semibold text-gray-900">{activeRequest.employee_name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> Email</p>
                            <p className="font-medium text-gray-800">{activeRequest.employee_email || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center"><Building2 className="w-3.5 h-3.5 mr-1" /> Department</p>
                            <p className="font-medium text-gray-800">{activeRequest.employee_department || "Not assigned"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1" /> Position</p>
                            <p className="font-medium text-gray-800">{activeRequest.employee_position || "Not assigned"}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Leave Information */}
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2" /> Leave Information
                      </h3>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-100">
                          <div className="p-4 bg-gray-50/30">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Leave Type</p>
                            <p className="font-semibold text-gray-900">{activeRequest.leave_type_name}</p>
                          </div>
                          <div className="p-4 bg-gray-50/30">
                            <p className="text-xs text-gray-500 mb-1 font-medium flex items-center"><Calendar className="w-3 h-3 mr-1" /> From Date</p>
                            <p className="font-semibold text-gray-900">{new Date(activeRequest.start_date).toLocaleDateString()}</p>
                          </div>
                          <div className="p-4 bg-gray-50/30">
                            <p className="text-xs text-gray-500 mb-1 font-medium flex items-center"><Calendar className="w-3 h-3 mr-1" /> To Date</p>
                            <p className="font-semibold text-gray-900">{new Date(activeRequest.end_date).toLocaleDateString()}</p>
                          </div>
                          <div className="p-4 bg-gray-50/30">
                            <p className="text-xs text-gray-500 mb-1 font-medium flex items-center"><Clock className="w-3 h-3 mr-1" /> Duration</p>
                            <p className="font-semibold text-blue-700">{totalDays} day{totalDays !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="text-sm font-medium text-gray-500 mb-2">Reason for Leave</p>
                          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed border border-gray-100 min-h-[80px]">
                            {activeRequest.reason ? (
                              <span className="whitespace-pre-wrap">{activeRequest.reason}</span>
                            ) : (
                              <span className="italic text-gray-400">No reason provided.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/80 mt-auto shrink-0 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> Request ID:</span> #{activeRequest.request_id}
                    </div>
                    <div className="flex gap-3">
                      {(activeRequest.status === "Pending" || activeRequest.status === "Approved_By_Manager" || activeRequest.status === "Approved") && (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, action: activeRequest.status === 'Approved' ? 'Revoke' : 'Reject', requestId: activeRequest.request_id })}
                          disabled={processingIds.has(activeRequest.request_id)}
                          className="border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold px-6 py-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {processingIds.has(activeRequest.request_id) ? "..." : (activeRequest.status === "Approved" ? "Revoke / Reject" : "Reject")}
                        </button>
                      )}
                      {(activeRequest.status === "Pending" || activeRequest.status === "Approved_By_Manager" || activeRequest.status === "Rejected") && (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, action: 'Approve', requestId: activeRequest.request_id })}
                          disabled={processingIds.has(activeRequest.request_id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm px-6 py-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          {processingIds.has(activeRequest.request_id) ? "Processing..." : "Approve Leave"}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>



      {/* Hand-coded Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${confirmModal.action === 'Approve' ? 'text-green-600' : 'text-red-600'}`}>Confirm {confirmModal.action}</h3>
              <button onClick={() => setConfirmModal({ isOpen: false, action: null, requestId: null })} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to {confirmModal.action?.toLowerCase()} this request?
              </p>

              <Label htmlFor="action-reason" className="mb-2 block text-gray-700 font-medium">Reason / Note (Optional)</Label>
              <Textarea
                id="action-reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Provide context for why this leave was ${confirmModal.action === 'Approve' ? 'approved' : 'denied'}...`}
                className="resize-none"
                rows={4}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal({ isOpen: false, action: null, requestId: null })} className="px-4 py-2 text-gray-600 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button
                onClick={executeAction}
                disabled={processingIds.has(confirmModal.requestId!)}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmModal.action === 'Approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {processingIds.has(confirmModal.requestId!) ? "Processing..." : `Confirm ${confirmModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
