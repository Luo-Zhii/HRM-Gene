"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../src/hooks/useAuth";
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
import { useToast } from "@/hooks/use-toast";

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
};

type LeaveType = {
  leave_type_id: number;
  name: string;
  default_days_allocated: number;
};

export default function LeavePage() {
  const { user } = useAuth();

  // State for balance section
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);

  // State for form section
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State for request history section
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const { toast } = useToast();

  const showStatus = (type: "success" | "error" | "info", text: string) => {
    if (type === "success") {
      toast({
        title: "Success",
        description: text,
      });
    } else if (type === "error") {
      toast({
        title: "Error",
        description: text,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Info",
        description: text,
      });
    }
  };

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
      } else {
        showStatus("error", "Failed to load leave balance");
      }
    } catch (err) {
      showStatus("error", "Error loading leave balance");
    } finally {
      setBalancesLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const res = await fetch("/api/leave/types", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLeaveTypes(data);
      }
    } catch (err) {
      // Silently fail - leave types dropdown will show empty
    }
  };

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
        showStatus("error", "Failed to load leave requests");
      }
    } catch (err) {
      showStatus("error", "Error loading leave requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLeaveType) {
      showStatus("error", "Please select a leave type");
      return;
    }
    if (!startDate || !endDate) {
      showStatus("error", "Please select start and end dates");
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
        showStatus(
          "success",
          json?.message || "Leave request submitted successfully!"
        );
        // Reset form
        setSelectedLeaveType("");
        setStartDate(null);
        setEndDate(null);
        setReason("");
        // Reload requests and balance
        await loadRequests();
        await loadBalance();
      } else {
        showStatus("error", json?.message || "Failed to submit leave request");
      }
    } catch (err) {
      showStatus("error", "Error submitting leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Leave Management</h1>

      {/* Section 1: My Leave Balance */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>My Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : balances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <div
                  key={balance.balance_id}
                  className="p-4 bg-white rounded shadow border-l-4 border-blue-500"
                >
                  <div className="text-sm text-gray-600 uppercase font-semibold">
                    {balance.leave_type_name}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {balance.remaining_days} days
                  </div>
                  <div className="text-xs text-gray-500 mt-2">remaining</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No leave balance data available</div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Submit New Request */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Submit New Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            {/* Leave Type Dropdown */}
            <div>
              <Label htmlFor="leave-type">Leave Type</Label>
              <Select
                value={selectedLeaveType.toString()}
                onValueChange={(value) =>
                  setSelectedLeaveType(value ? parseInt(value, 10) : "")
                }
              >
                <SelectTrigger>
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

            {/* Start Date */}
            <div>
              <Label>Start Date</Label>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                placeholderText="Select start date"
              />
            </div>

            {/* End Date */}
            <div>
              <Label>End Date</Label>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                placeholderText="Select end date"
              />
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Enter reason for leave..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
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
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Section 3: My Request History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>My Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.request_id}>
                    <TableCell>{req.leave_type_name}</TableCell>
                    <TableCell>{req.start_date}</TableCell>
                    <TableCell>{req.end_date}</TableCell>
                    <TableCell className="text-gray-600">
                      {req.reason || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : req.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-gray-500">No leave requests submitted yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
