"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle2, DollarSign, Loader2, FileText } from "lucide-react";

interface Payslip {
  payslip_id: number;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  actual_work_days: number;
  ot_hours: number;
  gross_salary: string;
  deductions: string;
  net_salary: string;
  status: "Pending" | "Approved" | "Paid";
  payroll_period: {
    id?: number;
    month: number;
    year: number;
  };
}

export default function PayrollGeneratePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const [periodId, setPeriodId] = useState<number | null>(null);

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission =
        user.permissions?.includes("manage:payroll") ||
        user.permissions?.includes("manage:system");
      if (!hasPermission) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have permission to access this page.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router, toast]);

  // Load payslips
  const loadPayslips = async () => {
    try {
      setLoading(true);
      // First get the period ID
      const periodRes = await fetch(
        `/api/payroll/period?month=${selectedMonth}&year=${selectedYear}`,
        {
          credentials: "include",
        }
      );
      if (periodRes.ok) {
        const periodData = await periodRes.json();
        setPeriodId(periodData?.id || null);
      }

      const res = await fetch(
        `/api/payroll/list?month=${selectedMonth}&year=${selectedYear}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch payslips");
      const data = await res.json();
      setPayslips(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payslips",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user &&
      (user.permissions?.includes("manage:payroll") ||
        user.permissions?.includes("manage:system"))
    ) {
      loadPayslips();
    }
  }, [user, selectedMonth, selectedYear]);

  // Generate payroll
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate payroll");
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Payroll generated successfully",
      });

      await loadPayslips();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate payroll",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Approve payslip
  const handleApprove = async (payslipId: number) => {
    try {
      setApproving(payslipId);
      const res = await fetch(`/api/payroll/${payslipId}/approve`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve payslip");
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Payslip approved successfully",
      });

      await loadPayslips();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve payslip",
      });
    } finally {
      setApproving(null);
    }
  };

  // Mark as paid
  const handleMarkPaid = async (payslipId: number) => {
    try {
      setMarkingPaid(payslipId);
      const res = await fetch(`/api/payroll/${payslipId}/mark-paid`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to mark payslip as paid");
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Payslip marked as paid",
      });

      await loadPayslips();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to mark payslip as paid",
      });
    } finally {
      setMarkingPaid(null);
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Draft
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-blue-500 text-white">Approved</Badge>
        );
      case "Paid":
        return (
          <Badge className="bg-green-500 text-white">Paid</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if user can approve (Admin/Director)
  const canApprove =
    user?.position?.position_name === "Admin" ||
    user?.position?.position_name === "Director" ||
    user?.permissions?.includes("manage:system");

  // Check if user can mark as paid (Accountant/Admin)
  const canMarkPaid =
    user?.permissions?.includes("manage:payroll") ||
    user?.permissions?.includes("manage:system");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (
    !user ||
    (!user.permissions?.includes("manage:payroll") &&
      !user.permissions?.includes("manage:system"))
  ) {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payroll Generation
            </h1>
            <p className="text-gray-600 mt-2">
              Generate and manage monthly payroll
            </p>
          </div>
          {payslips.length > 0 && (periodId || payslips[0].payroll_period?.id) && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/admin/payroll/cycle/${periodId || payslips[0].payroll_period?.id}`
                )
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              View Detailed Report
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full sm:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Payroll
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Payslips Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">Loading payslips...</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No payslips found for{" "}
                {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Click "Generate Payroll" to create payslips for this period
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Work Days</TableHead>
                    <TableHead className="text-right">OT Hours</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.payslip_id}>
                      <TableCell className="font-medium">
                        {payslip.employee.first_name}{" "}
                        {payslip.employee.last_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {payslip.actual_work_days.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {payslip.ot_hours.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payslip.gross_salary)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(payslip.deductions)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(payslip.net_salary)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canApprove &&
                            payslip.status === "Pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleApprove(payslip.payslip_id)
                                }
                                disabled={approving === payslip.payslip_id}
                              >
                                {approving === payslip.payslip_id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                )}
                                Approve
                              </Button>
                            )}
                          {canMarkPaid &&
                            payslip.status === "Approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleMarkPaid(payslip.payslip_id)
                                }
                                disabled={markingPaid === payslip.payslip_id}
                              >
                                {markingPaid === payslip.payslip_id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <DollarSign className="w-3 h-3 mr-1" />
                                )}
                                Mark Paid
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

