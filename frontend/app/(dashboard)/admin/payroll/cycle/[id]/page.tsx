"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User, DollarSign } from "lucide-react";

interface Payslip {
  payslip_id: number;
  actual_work_days: number;
  ot_hours: number;
  gross_salary: string;
  deductions: string;
  net_salary: string;
  status: string;
  employee: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    department?: {
      department_name: string;
    };
  };
}

interface PayrollPeriod {
  id: number;
  month: number;
  year: number;
  status: string;
  standard_work_days: number;
}

interface PayrollDetail {
  period: PayrollPeriod;
  payslips: Payslip[];
}

export default function PayrollCycleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const periodId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Load payroll detail
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/payroll/cycle/${periodId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch payroll details");
      const payrollData = await res.json();
      setData(payrollData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payroll details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user &&
      periodId &&
      (user.permissions?.includes("manage:payroll") ||
        user.permissions?.includes("manage:system"))
    ) {
      loadData();
    }
  }, [user, periodId]);

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Get month name
  const getMonthName = (month: number) => {
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
    return monthNames[month - 1] || "";
  };

  // Calculate totals
  const totals = data
    ? data.payslips.reduce(
        (acc, payslip) => {
          acc.totalGross += parseFloat(payslip.gross_salary);
          acc.totalDeductions += parseFloat(payslip.deductions);
          acc.totalNet += parseFloat(payslip.net_salary);
          return acc;
        },
        { totalGross: 0, totalDeductions: 0, totalNet: 0 }
      )
    : { totalGross: 0, totalDeductions: 0, totalNet: 0 };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Payroll period not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/payroll/generate")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payroll
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll {String(data.period.month).padStart(2, "0")}/{data.period.year}
          </h1>
          <p className="text-gray-600 mt-2">
            {getMonthName(data.period.month)} {data.period.year} - Detailed View
          </p>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total Company Cost
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(totals.totalGross)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Total Deductions
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(totals.totalDeductions)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Total Net Payout
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totals.totalNet)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16">Avatar</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Base Salary</TableHead>
                    <TableHead className="text-right">Work Days</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right font-bold bg-green-50">
                      Net Salary
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payslips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-gray-500">No payslips found for this period</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.payslips.map((payslip) => {
                      const grossSalary = parseFloat(payslip.gross_salary);
                      const deductions = parseFloat(payslip.deductions);
                      // Note: Gross salary includes base salary + allowances
                      // For display, we'll show gross as the total income
                      const allowances = 0; // Would need salary config to calculate separately

                      return (
                        <TableRow key={payslip.payslip_id} className="hover:bg-gray-50">
                          <TableCell>
                            {payslip.employee.avatar_url ? (
                              <img
                                src={payslip.employee.avatar_url}
                                alt={payslip.employee.first_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">
                                {payslip.employee.first_name}{" "}
                                {payslip.employee.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {payslip.employee.employee_id} •{" "}
                                {payslip.employee.department?.department_name || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(grossSalary)}
                          </TableCell>
                          <TableCell className="text-right">
                            {payslip.actual_work_days.toFixed(1)} days
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {formatCurrency(allowances)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(deductions)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600 bg-green-50">
                            {formatCurrency(payslip.net_salary)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payslip.status === "Paid"
                                  ? "default"
                                  : payslip.status === "Approved"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                payslip.status === "Paid"
                                  ? "bg-green-500 text-white"
                                  : payslip.status === "Approved"
                                  ? "bg-blue-500 text-white"
                                  : ""
                              }
                            >
                              {payslip.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {data.payslips.length > 0 && (
          <Card className="mt-4 bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Total Employees: {data.payslips.length}
                </span>
                <div className="flex gap-6">
                  <span className="text-gray-600">
                    Total Gross:{" "}
                    <span className="font-bold">{formatCurrency(totals.totalGross)}</span>
                  </span>
                  <span className="text-gray-600">
                    Total Deductions:{" "}
                    <span className="font-bold text-red-600">
                      {formatCurrency(totals.totalDeductions)}
                    </span>
                  </span>
                  <span className="text-gray-600">
                    Total Net:{" "}
                    <span className="font-bold text-green-600">
                      {formatCurrency(totals.totalNet)}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

