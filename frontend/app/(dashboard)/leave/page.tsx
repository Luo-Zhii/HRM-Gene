"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../src/hooks/useAuth";
import { useTranslation } from "react-i18next";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CalendarDays, List } from "lucide-react";

type LeaveBalance = {
  balance_id: number;
  leave_type_name: string;
  remaining_days: number;
  total_days?: number;
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

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="p-4 bg-white rounded shadow border-l-4 border-gray-300 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-20"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
    ))}
  </div>
);

// Calculate days between two dates (inclusive)
const calculateDays = (
  startDate: Date | null,
  endDate: Date | null
): number => {
  if (!startDate || !endDate) return 0;
  if (endDate < startDate) return 0;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// Calendar View Component
const CalendarView = ({ requests }: { requests: LeaveRequest[] }) => {
  const { t } = useTranslation();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const leaveDates = useMemo(() => {
    const dates = new Set<string>();
    requests.forEach((req) => {
      const start = new Date(req.start_date);
      const end = new Date(req.end_date);
      const current = new Date(start);
      while (current <= end) {
        dates.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  }, [requests]);

  const getStatusForDate = (date: Date): LeaveRequest | null => {
    const dateStr = date.toISOString().split("T")[0];
    return (
      requests.find((req) => {
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        return date >= start && date <= end;
      }) || null
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={() => navigateMonth("next")}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const dateStr = date.toISOString().split("T")[0];
          const hasLeave = leaveDates.has(dateStr);
          const request = getStatusForDate(date);
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          return (
            <div
              key={day}
              className={`aspect-square border rounded p-1 ${isToday ? "ring-2 ring-blue-500" : ""
                } ${hasLeave
                  ? request?.status === "Approved"
                    ? "bg-green-100 border-green-300"
                    : request?.status === "Rejected"
                      ? "bg-red-100 border-red-300"
                      : "bg-yellow-100 border-yellow-300"
                  : "bg-white"
                }`}
            >
              <div className="text-xs font-medium">{day}</div>
              {hasLeave && request && (
                <div className="text-[10px] mt-1 truncate">
                  {request.leave_type_name}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>{t("leave.statusApproved")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>{t("leave.statusPending")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>{t("leave.statusRejected")}</span>
        </div>
      </div>
    </div>
  );
};

export default function LeavePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { toast } = useToast();

  const totalDays = useMemo(
    () => calculateDays(startDate, endDate),
    [startDate, endDate]
  );

  const showStatus = (type: "success" | "error" | "info", text: string) => {
    if (type === "success") {
      toast({ title: t("common.success"), description: text });
    } else if (type === "error") {
      toast({ title: t("common.error"), description: text, variant: "destructive" });
    } else {
      toast({ title: t("common.info"), description: text });
    }
  };

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
        const filtered = data.filter((lt: LeaveType) => !lt.name.toLowerCase().includes("resignation") && !lt.name.toLowerCase().includes("offboard"));
        setLeaveTypes(filtered);
      }
    } catch (err) {
      // Silently fail - leave types dropdown will show empty
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/leave/my-requests", { credentials: "include" });
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
      showStatus("error", t("leave.errorSelectType"));
      return;
    }
    if (!startDate || !endDate) {
      showStatus("error", t("leave.errorSelectDates"));
      return;
    }
    if (endDate < startDate) {
      showStatus("error", t("leave.errorEndBeforeStart"));
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
        showStatus("success", json?.message || "Leave request submitted successfully!");
        setSelectedLeaveType("");
        setStartDate(null);
        setEndDate(null);
        setReason("");
        setIsModalOpen(false);
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

  const getTotalDaysForType = (leaveTypeName: string): number => {
    const type = leaveTypes.find((lt) => lt.name === leaveTypeName);
    return type?.default_days_allocated || 0;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">{t("leave.title")}</h1>

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="mb-8 bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger value="balance" className="rounded-lg font-medium px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all text-gray-600">{t("leave.tabBalance")}</TabsTrigger>
          <TabsTrigger value="request" className="rounded-lg font-medium px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all text-gray-600">{t("leave.tabRequest")}</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-medium px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all text-gray-600">{t("leave.tabHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-0">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg text-gray-800">{t("leave.balanceTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {balancesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (<SkeletonCard key={i} />))}
                </div>
              ) : balances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {balances.map((balance) => {
                    const totalDays = getTotalDaysForType(balance.leave_type_name);
                    const usedDays = totalDays - balance.remaining_days;
                    const percentage = totalDays > 0 ? (usedDays / totalDays) * 100 : 0;
                    return (
                      <div
                        key={balance.balance_id}
                        className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-3">
                          {balance.leave_type_name}
                        </div>
                        <div className="flex items-baseline justify-center gap-2 mb-4">
                          <div className="text-4xl font-extrabold text-blue-600">
                            {balance.remaining_days}
                          </div>
                          <div className="text-sm font-medium text-gray-400">
                            {t("leave.daysLeft")}
                          </div>
                        </div>
                        {totalDays > 0 && (
                          <div className="w-full mt-auto">
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ease-out ${percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-500 flex justify-between px-1">
                              <span>{usedDays} {t("leave.used")}</span>
                              <span>{totalDays} {t("leave.total")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">{t("leave.noBalanceData")}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="request" className="mt-0">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden max-w-2xl">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg text-gray-800">{t("leave.submitTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <Label htmlFor="leave-type" className="font-semibold text-gray-700">{t("leave.leaveType")} *</Label>
                  <Select
                    value={selectedLeaveType.toString()}
                    onValueChange={(value) => setSelectedLeaveType(value ? parseInt(value, 10) : "")}
                  >
                    <SelectTrigger className="mt-1.5 h-11">
                      <SelectValue placeholder={t("leave.leaveTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.leave_type_id} value={lt.leave_type_id.toString()}>
                          {lt.name} ({lt.default_days_allocated} {t("leave.daysAllocated")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-semibold text-gray-700">{t("leave.startDate")} *</Label>
                    <div className="mt-1.5">
                      <DatePicker selected={startDate} onSelect={setStartDate} placeholderText={t("leave.startDatePlaceholder")} />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-gray-700">{t("leave.endDate")} *</Label>
                    <div className="mt-1.5">
                      <DatePicker selected={endDate} onSelect={setEndDate} placeholderText={t("leave.endDatePlaceholder")} minDate={startDate || undefined} />
                    </div>
                  </div>
                </div>

                {startDate && endDate && totalDays > 0 && (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-900">{t("leave.totalRequested")}</span>
                    <span className="text-lg font-bold text-blue-700">{totalDays} {totalDays === 1 ? t("leave.day") : t("leave.days")}</span>
                    {endDate < startDate && (
                      <div className="text-xs text-red-600 mt-1 absolute">{t("leave.endBeforeStart")}</div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="reason" className="font-semibold text-gray-700">{t("leave.reason")}</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="mt-1.5 resize-none"
                    placeholder={t("leave.reasonPlaceholder")}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-6 font-semibold"
                    onClick={() => {
                      setSelectedLeaveType("");
                      setStartDate(null);
                      setEndDate(null);
                      setReason("");
                    }}
                  >
                    {t("leave.clearForm")}
                  </Button>
                  <Button type="submit" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={submitting}>
                    {submitting ? t("leave.submitting") : t("leave.submitRequest")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">{t("leave.historyTitle")}</CardTitle>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center transition-colors ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="mr-1.5 h-4 w-4" />
                    {t("leave.listView")}
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center transition-colors ${viewMode === "calendar" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setViewMode("calendar")}
                  >
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {t("leave.calendarView")}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {requestsLoading ? (
                <SkeletonTable />
              ) : requests.length > 0 ? (
                viewMode === "list" ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">{t("leave.colLeaveType")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("leave.colStartDate")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("leave.colEndDate")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("leave.colDays")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("leave.colReason")}</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right pr-4">{t("leave.colStatus")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((req) => {
                          const start = new Date(req.start_date);
                          const end = new Date(req.end_date);
                          const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          return (
                            <TableRow key={req.request_id} className="hover:bg-gray-50/50">
                              <TableCell className="font-semibold text-gray-900 py-4">{req.leave_type_name}</TableCell>
                              <TableCell className="text-gray-600">{new Date(req.start_date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-gray-600">{new Date(req.end_date).toLocaleDateString()}</TableCell>
                              <TableCell className="font-medium text-gray-900">{days}</TableCell>
                              <TableCell className="text-gray-500 max-w-xs truncate" title={req.reason}>{req.reason || "—"}</TableCell>
                              <TableCell className="text-right pr-4">
                                <Badge
                                  className={`rounded-md px-2.5 py-1 text-xs font-bold border ${req.status === "Pending"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : req.status === "Approved"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : req.status === "Rejected"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                    }`}
                                >
                                  {req.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <CalendarView requests={requests} />
                )
              ) : (
                <div className="text-gray-500 text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <CalendarDays size={24} />
                  </div>
                  {t("leave.noRequests")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
