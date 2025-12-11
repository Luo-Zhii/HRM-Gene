"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AttendanceRecord = {
  timekeeping_id: number;
  work_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  hours_worked: number;
  status: string;
  ip_address?: string | null;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
};

type AttendanceResponse = {
  data: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState<string | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<string | null>(null);

  const canViewAttendance =
    user?.permissions?.includes("manage:system") ||
    user?.permissions?.includes("manage:leave");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const loadAttendance = async (
    pageToLoad: number,
    start?: string | null,
    end?: string | null
  ) => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const base = apiBase.replace(/\/api$|\/$/, "");

      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: "50",
      });

      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      const res = await fetch(`${base}/api/attendance/admin/all?${params.toString()}`, {
        credentials: "include",
      });

      if (res.status === 403) {
        setAccessDenied(true);
        setRecords([]);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to load attendance records (${res.status})`
        );
      }

      const json: AttendanceResponse = await res.json();
      setRecords(json.data || []);
      setPage(json.page || pageToLoad);
      setTotalPages(json.totalPages || 1);
      setAppliedStartDate(start || null);
      setAppliedEndDate(end || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading attendance records"
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && canViewAttendance) {
      loadAttendance(1, startDate || null, endDate || null);
    }
  }, [authLoading, user]);

  const applyFilter = () => {
    loadAttendance(1, startDate || null, endDate || null);
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEmployeeName = (rec: AttendanceRecord) =>
    `${rec.employee.first_name} ${rec.employee.last_name}`.trim();

  const currentRangeLabel = () => {
    if (!appliedStartDate && !appliedEndDate) {
      return "Showing last 30 days (default)";
    }
    if (appliedStartDate && appliedEndDate) {
      return `Showing ${formatDate(appliedStartDate)} - ${formatDate(
        appliedEndDate
      )}`;
    }
    if (appliedStartDate) {
      return `Showing ${formatDate(appliedStartDate)}`;
    }
    return "Showing all records";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">
          Loading attendance records...
        </p>
      </div>
    );
  }

  if (!user || !canViewAttendance || accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You do not have permission to view attendance history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Attendance History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View detailed attendance records for all employees
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card className="shadow-md border-none">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0">
              <div className="flex flex-col space-y-1">
                <label className="text-sm text-slate-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm text-slate-600">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={applyFilter}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Filter
                </button>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    loadAttendance(1, null, null);
                  }}
                  className="text-sm px-3 py-2 rounded border"
                >
                  Reset
                </button>
              </div>
              <div className="flex-1 text-sm text-slate-600 md:text-right">
                {currentRangeLabel()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                No attendance records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead className="text-right">
                        Working Hours
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec.timekeeping_id}>
                        <TableCell>{formatDate(rec.work_date)}</TableCell>
                        <TableCell>{getEmployeeName(rec)}</TableCell>
                        <TableCell>{formatDateTime(rec.check_in_time)}</TableCell>
                        <TableCell>
                          {formatDateTime(rec.check_out_time)}
                        </TableCell>
                        <TableCell className="text-right">
                          {rec.hours_worked?.toFixed(2) ?? "0.00"}
                        </TableCell>
                        <TableCell>{rec.status}</TableCell>
                        <TableCell>{rec.ip_address || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Simple pagination controls */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600 dark:text-slate-300">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 rounded border bg-white dark:bg-slate-800 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() =>
                    page > 1 &&
                    loadAttendance(page - 1, appliedStartDate, appliedEndDate)
                  }
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded border bg-white dark:bg-slate-800 disabled:opacity-50"
                  disabled={page >= totalPages}
                  onClick={() =>
                    page < totalPages &&
                    loadAttendance(page + 1, appliedStartDate, appliedEndDate)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


