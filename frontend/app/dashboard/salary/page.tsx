"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, Wallet, Calendar, FileText } from "lucide-react";

interface Payslip {
  payslip_id: number;
  actual_work_days: number;
  ot_hours: number;
  bonus: string;
  gross_salary: string;
  deductions: string;
  net_salary: string;
  status: "Pending" | "Approved" | "Paid";
  payroll_period: {
    month: number;
    year: number;
  };
  pay_period?: string; // Legacy field MM/YYYY
}

export default function SalaryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Load my payslips
  const loadPayslips = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(
        `${apiBase.replace(/\/api$|\/$/, "")}/api/payroll/my-payslips`,
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
    if (user) {
      loadPayslips();
    }
  }, [user]);

  // Format currency in VND
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Pending
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

  // Format period as MM/YYYY
  const formatPeriod = (payslip: Payslip) => {
    if (payslip.pay_period) {
      return payslip.pay_period;
    }
    const month = String(payslip.payroll_period.month).padStart(2, "0");
    return `${month}/${payslip.payroll_period.year}`;
  };

  // Calculate summary statistics
  const lastMonthPayslip = payslips.length > 0 ? payslips[0] : null;
  const lastMonthNet = lastMonthPayslip
    ? parseFloat(lastMonthPayslip.net_salary)
    : 0;

  const currentYear = new Date().getFullYear();
  const ytdTotal = payslips
    .filter((p) => p.payroll_period.year === currentYear)
    .reduce((sum, p) => sum + parseFloat(p.net_salary), 0);

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Salary History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and download your payslips
        </p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Last Month's Net Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {lastMonthPayslip ? formatCurrency(lastMonthNet) : "N/A"}
            </p>
            {lastMonthPayslip && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Period: {formatPeriod(lastMonthPayslip)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Income YTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(ytdTotal)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Year to Date ({currentYear})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Salary History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No payslips found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Your payslips will appear here once they are generated
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Work Days</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow
                      key={payslip.payslip_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium">
                        {formatPeriod(payslip)}
                      </TableCell>
                      <TableCell className="text-right">
                        {payslip.actual_work_days.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payslip.gross_salary)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(payslip.net_salary)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayslip(payslip)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Detail Modal */}
      <Dialog
        open={!!selectedPayslip}
        onOpenChange={(open) => !open && setSelectedPayslip(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
            <DialogDescription>
              {selectedPayslip && `Period: ${formatPeriod(selectedPayslip)}`}
            </DialogDescription>
          </DialogHeader>

          {selectedPayslip && (
            <div className="py-4">
              {/* Receipt-like Design */}
              <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 font-mono">
                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                  <h2 className="text-2xl font-bold mb-2 dark:text-white">
                    PAYSLIP
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPeriod(selectedPayslip)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Employee: {user?.first_name} {user?.last_name}
                  </p>
                </div>

                {/* Earnings Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">
                    EARNINGS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Base Salary:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(
                          parseFloat(selectedPayslip.gross_salary) -
                            parseFloat(selectedPayslip.bonus || "0")
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Transport Allowance:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Lunch Allowance:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Responsibility Allowance:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        OT Pay:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(selectedPayslip.bonus || "0")}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="dark:text-white">Gross Salary:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(selectedPayslip.gross_salary)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">
                    DEDUCTIONS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Insurance:
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(selectedPayslip.deductions)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Advances/Fines:
                      </span>
                      <span className="font-semibold dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="dark:text-white">Total Deductions:</span>
                      <span className="text-red-600 dark:text-red-400">
                        {formatCurrency(selectedPayslip.deductions)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Calculation */}
                <div className="pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold dark:text-white">
                      NET SALARY:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedPayslip.net_salary)}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Work Days:
                    </span>
                    <span className="font-semibold dark:text-white">
                      {selectedPayslip.actual_work_days.toFixed(1)} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      OT Hours:
                    </span>
                    <span className="font-semibold dark:text-white">
                      {selectedPayslip.ot_hours.toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                  <div className="inline-block">
                    {getStatusBadge(selectedPayslip.status)}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>This is a computer-generated payslip.</p>
                  <p className="mt-1">
                    For inquiries, please contact HR Department.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.print();
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => setSelectedPayslip(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

