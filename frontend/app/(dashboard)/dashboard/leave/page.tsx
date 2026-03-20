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
import { CalendarDays } from "lucide-react";

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
  status: string;
  manager_approver?: string;
};

type LeaveType = {
  leave_type_id: number;
  name: string;
  default_days_allocated: number;
};

// Calculate days between two dates (inclusive)
const calculateDays = (
  startDate: Date | null,
  endDate: Date | null
): number => {
  if (!startDate || !endDate) return 0;
  if (endDate < startDate) return 0;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 to include both start and end date
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
    {[1, 2, 3, 4, 5].map((i) => (
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

  // State for balance section
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);

  // State for form section
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State for request history section
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

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

  // Load leave balance
  const loadBalance = async () => {
    setBalancesLoading(true);
    try {
      const res = await fetch("/api/leave/balance", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBalances(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load leave balance",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Error loading leave balance",
        variant: "destructive",
      });
    } finally {
      setBalancesLoading(false);
    }
  };

  // Load leave types
  const loadLeaveTypes = async () => {
    setLeaveTypesLoading(true);
    try {
      const res = await fetch("/api/leave/types", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveTypes(data);
      }
    } catch (err) {
      console.error("Error loading leave types:", err);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  // Load my requests
  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/leave/my-requests", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load leave requests",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Error loading leave requests",
        variant: "destructive",
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedLeaveType) {
      toast({
        title: "Error",
        description: "Please select a leave type",
        variant: "destructive",
      });
      return;
    }
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }
    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: json?.message || "Leave request submitted successfully!",
        });
        // Reset form
        setSelectedLeaveType("");
        setStartDate(null);
        setEndDate(null);
        setReason("");
        // Reload requests and balance
        await loadRequests();
        await loadBalance();
      } else {
        toast({
          title: "Error",
          description: json?.message || "Failed to submit leave request",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Error submitting leave request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get total days for a leave type (for display in balance cards)
  const getTotalDaysForType = (leaveTypeName: string): number => {
    const type = leaveTypes.find((lt) => lt.name === leaveTypeName);
    return type?.default_days_allocated || 0;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Leave Management
        </h1>

        {/* Section 1: Leave Balance Cards */}
        <Card className="mb-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              My Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : balances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {balances.map((balance) => {
                  const totalDays = getTotalDaysForType(
                    balance.leave_type_name
                  );
                  const usedDays = totalDays - balance.remaining_days;
                  const percentage =
                    totalDays > 0 ? (usedDays / totalDays) * 100 : 0;

                  return (
                    <div
                      key={balance.balance_id}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-blue-500"
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">
                        {balance.leave_type_name}
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {balance.remaining_days}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          days remaining
                        </div>
                      </div>
                      {totalDays > 0 && (
                        <>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage > 80
                                  ? "bg-red-500"
                                  : percentage > 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {usedDays} of {totalDays} days used (
                            {percentage.toFixed(0)}%)
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                No leave balance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Create Leave Request Form */}
        <Card className="mb-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Create Leave Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Leave Type Dropdown */}
              <div>
                <Label
                  htmlFor="leave-type"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Leave Type *
                </Label>
                <Select
                  value={selectedLeaveType.toString()}
                  onValueChange={(value) =>
                    setSelectedLeaveType(value ? parseInt(value, 10) : "")
                  }
                  disabled={leaveTypesLoading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="-- Select Leave Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => (
                      <SelectItem
                        key={lt.leave_type_id}
                        value={lt.leave_type_id.toString()}
                      >
                        {lt.name} ({lt.default_days_allocated} days allocated)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <Label className="text-gray-900 dark:text-gray-100">
                    Start Date *
                  </Label>
                  <DatePicker
                    selected={startDate}
                    onSelect={setStartDate}
                    placeholderText="Select start date"
                    className="mt-1 w-full"
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label className="text-gray-900 dark:text-gray-100">
                    End Date *
                  </Label>
                  <DatePicker
                    selected={endDate}
                    onSelect={setEndDate}
                    placeholderText="Select end date"
                    minDate={startDate || undefined}
                    className="mt-1 w-full"
                  />
                </div>
              </div>

              {/* Total Days Display */}
              {startDate && endDate && totalDays > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Total Days: {totalDays} {totalDays === 1 ? "day" : "days"}
                  </div>
                  {endDate < startDate && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      End date must be after start date
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <Label
                  htmlFor="reason"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Reason (optional)
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Enter reason for leave..."
                  className="mt-1 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedLeaveType("");
                    setStartDate(null);
                    setEndDate(null);
                    setReason("");
                  }}
                >
                  Clear
                </Button>
                <Button type="submit" variant="outline" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section 3: My Request History */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              My Request History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <SkeletonTable />
            ) : requests.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-900 dark:text-gray-100">
                        Leave Type
                      </TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">
                        Start Date
                      </TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">
                        End Date
                      </TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">
                        Total Days
                      </TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">
                        Status
                      </TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">
                        Reason
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => {
                      const start = new Date(req.start_date);
                      const end = new Date(req.end_date);
                      const days =
                        Math.floor(
                          (end.getTime() - start.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1;

                      return (
                        <TableRow key={req.request_id}>
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            {req.leave_type_name}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {new Date(req.start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {new Date(req.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {days}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "Approved"
                                  ? "default"
                                  : req.status === "Rejected"
                                  ? "destructive"
                                  : "outline"
                              }
                              className={
                                req.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                                  : req.status === "Approved"
                                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                  : req.status === "Rejected"
                                  ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                  : ""
                              }
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {req.reason || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                No leave requests submitted yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
