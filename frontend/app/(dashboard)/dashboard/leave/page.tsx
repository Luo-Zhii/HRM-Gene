"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Eye, MessageSquare, Clock, Calendar, FileText, Info } from "lucide-react";
import ContextualChat from "@/src/components/ContextualChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Types
type LeaveBalance = {
  balance_id: number;
  leave_type_name: string;
  remaining_days: number;
};

type LeaveRequest = {
  request_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  reason?: string;
  admin_note?: string; // Sửa lại type để hứng note từ HR
  status: string;
  manager_approver?: string;
};

type LeaveType = {
  leave_type_id: number;
  name: string;
  default_days_allocated: number;
};

// Calculate days between two dates (inclusive, fixed logic)
const calculateDays = (
  startDate: Date | null | string,
  endDate: Date | null | string
): number => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time to midnight to avoid timezone shift issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) return 0;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// Skeleton Loading Components
const SkeletonCard = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-gray-300 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
      ></div>
    ))}
  </div>
);

export default function LeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Calculate total days
  const totalDays = useMemo(
    () => calculateDays(startDate, endDate),
    [startDate, endDate]
  );

  // Load data on mount
  useEffect(() => {
    loadBalance();
    loadLeaveTypes();
    loadRequests();
  }, []);

  const loadBalance = async () => {
    setBalancesLoading(true);
    try {
      const res = await fetch("/api/leave/balance", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBalances(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBalancesLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    setLeaveTypesLoading(true);
    try {
      const res = await fetch("/api/leave/types", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLeaveTypes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/leave/my-requests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLeaveType || !startDate || !endDate) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (endDate < startDate) {
      toast({ title: "Error", description: "End date must be after start date", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leave/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leave_type_id: parseInt(String(selectedLeaveType), 10),
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          reason: reason || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Leave request submitted!" });
        setSelectedLeaveType("");
        setStartDate(null);
        setEndDate(null);
        setReason("");
        await loadRequests();
        await loadBalance();
      } else {
        toast({ title: "Error", description: json?.message || "Failed to submit", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Error submitting request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalDaysForType = (leaveTypeName: string): number => {
    const type = leaveTypes.find((lt) => lt.name === leaveTypeName);
    return type?.default_days_allocated || 0;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Leave Management
        </h1>

        {/* --- SECTION 1: BALANCE CARDS --- */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              My Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {balancesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : balances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {balances.map((balance) => {
                  const totalDays = getTotalDaysForType(balance.leave_type_name);
                  const usedDays = totalDays - balance.remaining_days;
                  const percentage = totalDays > 0 ? (usedDays / totalDays) * 100 : 0;

                  return (
                    <div key={balance.balance_id} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                      <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2 ml-2">
                        {balance.leave_type_name}
                      </div>
                      <div className="flex items-end gap-2 mb-4 ml-2">
                        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                          {balance.remaining_days}
                        </span>
                        <span className="text-sm text-gray-500 mb-1 font-medium">days left</span>
                      </div>
                      {totalDays > 0 && (
                        <div className="ml-2">
                          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-amber-400" : "bg-blue-500"}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {usedDays} of {totalDays} days used ({percentage.toFixed(0)}%)
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-6 font-medium">No balance data available.</div>
            )}
          </CardContent>
        </Card>

        {/* --- SECTION 2: CREATE REQUEST FORM --- */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 rounded-t-xl">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Submit New Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitRequest} className="space-y-6 max-w-3xl">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Leave Type *</Label>
                <Select value={selectedLeaveType.toString()} onValueChange={(val) => setSelectedLeaveType(parseInt(val, 10))}>
                  <SelectTrigger className="mt-1.5 h-11 rounded-lg border-gray-300">
                    <SelectValue placeholder="-- Select Leave Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => (
                      <SelectItem key={lt.leave_type_id} value={lt.leave_type_id.toString()}>
                        {lt.name} ({lt.default_days_allocated} days allocated)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Start Date *</Label>
                  <DatePicker selected={startDate} onSelect={setStartDate} placeholderText="Select start date" className="mt-1.5 w-full h-11 rounded-lg border-gray-300" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">End Date *</Label>
                  <DatePicker selected={endDate} onSelect={setEndDate} placeholderText="Select end date" minDate={startDate || undefined} className="mt-1.5 w-full h-11 rounded-lg border-gray-300" />
                </div>
              </div>

              {startDate && endDate && totalDays > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900">Calculated Duration:</span>
                  <span className="text-lg font-bold text-blue-700">{totalDays} {totalDays === 1 ? "day" : "days"}</span>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-gray-700">Reason (Optional)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Briefly explain your reason..." className="mt-1.5 rounded-lg border-gray-300 resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => { setSelectedLeaveType(""); setStartDate(null); setEndDate(null); setReason(""); }} className="h-11 px-6 text-gray-600 font-semibold">
                  Clear
                </Button>
                <Button type="submit" disabled={submitting} className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-200">
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* --- SECTION 3: REQUEST HISTORY TABLE --- */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold">My Request History</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="font-semibold text-gray-600 py-4 pl-6">Type</TableHead>
                  <TableHead className="font-semibold text-gray-600">Period</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">Days</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="font-semibold text-gray-600">My Reason</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsLoading ? (
                  <TableRow><TableCell colSpan={6}><SkeletonTable /></TableCell></TableRow>
                ) : requests.length > 0 ? (
                  requests.map((req) => {
                    const days = calculateDays(req.start_date, req.end_date);
                    return (
                      <TableRow key={req.request_id} className="hover:bg-gray-50/50 border-b border-gray-50">
                        <TableCell className="font-semibold text-gray-900 pl-6 py-4">{req.leave_type_name}</TableCell>
                        <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                          {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-gray-700 text-center">{days}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize font-bold border ${req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            req.status.includes('Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                            {req.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-[200px] truncate" title={req.reason}>
                          {req.reason || "—"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedRequest(req); setIsDetailModalOpen(true); }}
                            className="text-blue-600 font-semibold hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4 mr-2" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400 font-medium">No leave requests found.</TableCell>
                  </TableRow>
                )
                }
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* --- MODAL DETAIL & CHAT --- */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="fixed top-[50%] left-[50%] z-[9999] w-[95vw] sm:max-w-[700px] translate-x-[-50%] translate-y-[-50%] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:bg-white/10 hover:[&>button]:bg-white/20 [&>button]:p-2 [&>button]:text-white [&>button>svg]:h-5 [&>button>svg]:w-5 [&>button>span]:sr-only [&>button]:z-[10001]">
          {selectedRequest && (
            <div className="flex flex-col max-h-[90vh]">
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shrink-0 relative">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="bg-white/20 border-white/30 text-white uppercase text-[10px] tracking-widest font-bold px-2 py-0.5">
                    {selectedRequest.status}
                  </Badge>
                  <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest opacity-60">Leave Request Discussion</span>
                </div>
                <DialogTitle className="text-3xl font-extrabold tracking-tight mb-1">{selectedRequest.leave_type_name}</DialogTitle>
                <DialogDescription className="text-blue-100/80 text-sm font-medium">Request ID: #{selectedRequest.request_id} • Contextual Thread</DialogDescription>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-blue-200/80 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Start Date</p>
                    <p className="font-bold text-base">{new Date(selectedRequest.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-blue-200/80 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> End Date</p>
                    <p className="font-bold text-base">{new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-blue-200/80 mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration</p>
                    <p className="font-bold text-base">{calculateDays(selectedRequest.start_date, selectedRequest.end_date)} Days</p>
                  </div>
                </div>
              </div>

              {/* Body Modal */}
              <div className="px-8 py-6 flex-1 space-y-8 bg-gray-50/30 overflow-y-auto custom-thin-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-300" /> Submission Reason
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed flex-1">{selectedRequest.reason || <span className="italic text-gray-300">No reason was specified for this request.</span>}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-300" /> Decision Notes
                    </p>
                    <div className={`text-sm leading-relaxed flex-1 ${selectedRequest.admin_note ? 'text-indigo-700 font-medium italic' : 'text-gray-300 italic'}`}>
                      {selectedRequest.admin_note ? `"${selectedRequest.admin_note}"` : "Waiting for HR feedback..."}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 flex flex-col overflow-hidden ring-1 ring-gray-100">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      Discussion Thread
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       Bi-directional
                    </div>
                  </div>
                  <div className="h-[450px] bg-white">
                    <ContextualChat entityType="LEAVE_REQUEST" entityId={selectedRequest.request_id.toString()} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}