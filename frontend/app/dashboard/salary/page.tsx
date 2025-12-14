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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, Wallet, Calendar, FileText, X, Printer, Link as LinkIcon } from "lucide-react";

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
  pay_period?: string;
  file_url?: string; // Thêm trường này để hiển thị link nếu có
}

// Cập nhật Interface khớp với dữ liệu trả về từ API
export interface SalaryConfig {
  config_id: number;
  base_salary: string;
  transport_allowance: string;
  lunch_allowance: string;
  responsibility_allowance: string;
  employee: {
    employee_id: number;
  };
}

export default function SalaryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  
  // State để lưu cấu hình lương của user hiện tại
  const [selectSalary, setSelectSalary] = useState<SalaryConfig | null>(null);

  // 1. Load danh sách phiếu lương
  const loadPayslips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/my-payslips", {
        credentials: "include",
      });
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

  // 2. Load cấu hình lương (Sửa lỗi logic ở đây)
  const loadSalaryConfig = async () => {
    if (!user) return;
    try {
      // Gọi API lấy config
      const res = await fetch("/api/payroll/config", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch Salary Config");
      
      const data = await res.json();
      
      // LOGIC QUAN TRỌNG: Tìm config của đúng user đang đăng nhập
      if (Array.isArray(data)) {
        const myConfig = data.find((item: any) => item.employee?.employee_id === user.employee_id);
        setSelectSalary(myConfig || null);
      } else {
        // Trường hợp API trả về 1 object (nếu backend đã lọc sẵn)
        setSelectSalary(data);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadPayslips();
      loadSalaryConfig();
    }
  }, [user]);

  // Helpers
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "Approved":
        return <Badge className="bg-blue-500 text-white">Approved</Badge>;
      case "Paid":
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPeriod = (payslip: Payslip) => {
    if (payslip.pay_period) return payslip.pay_period;
    const month = String(payslip.payroll_period.month).padStart(2, "0");
    return `${month}/${payslip.payroll_period.year}`;
  };

  const lastMonthPayslip = payslips.length > 0 ? payslips[0] : null;
  const currentYear = new Date().getFullYear();
  const ytdTotal = payslips
    .filter((p) => p.payroll_period.year === currentYear)
    .reduce((sum, p) => sum + parseFloat(p.net_salary), 0);

  if (authLoading || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Salary History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View and download your payslips</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Last Month's Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {lastMonthPayslip ? formatCurrency(lastMonthPayslip.net_salary) : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> YTD Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(ytdTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Work Days</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.payslip_id}>
                    <TableCell className="font-medium">{formatPeriod(payslip)}</TableCell>
                    <TableCell className="text-right">{payslip.actual_work_days}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(payslip.net_salary)}</TableCell>
                    <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPayslip(payslip)}>
                        <Eye className="w-4 h-4 mr-2" /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detail */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedPayslip(null)}
          />

          <div className="relative w-full max-w-[700px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-t-lg shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Payslip Detail
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPayslip(null)} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 font-mono text-sm space-y-6">
              
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-6">
                <h3 className="text-2xl font-black uppercase text-gray-800 dark:text-white">PAYSLIP</h3>
                <p className="text-gray-500 font-bold mt-1 uppercase">{user?.first_name} {user?.last_name}</p>
                <div className="mt-2 inline-block bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs font-bold">
                  Period: {formatPeriod(selectedPayslip)}
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b mb-3 pb-1">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gross Salary (Base + All Allowances)</span>
                    <span className="font-semibold">
                      {/* FIX LỖI CRASH Ở ĐÂY:
                         1. Kiểm tra selectSalary có tồn tại không.
                         2. Dùng parseFloat cho từng số hạng để tránh cộng chuỗi.
                      */}
                      {selectSalary ? formatCurrency(
                        (parseFloat(selectSalary.base_salary || "0") + 
                         parseFloat(selectSalary.transport_allowance || "0") + 
                         parseFloat(selectSalary.lunch_allowance || "0") + 
                         parseFloat(selectSalary.responsibility_allowance || "0"))
                      ) : "Loading..."}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">OT / Bonus</span>
                    <span className="font-semibold text-blue-600">+{formatCurrency(selectedPayslip.bonus || "0")}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 font-bold border-t dark:border-gray-700">
                    <span>Total Gross</span>
                    <span>{formatCurrency(selectedPayslip.gross_salary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b mb-3 pb-1">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Insurance & Tax</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(selectedPayslip.deductions)}</span>
                  </div>
                </div>
              </div>

              {/* NET PAY */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase">Net Pay</p>
                  <p className="text-[10px] text-gray-400">Transfer via Bank</p>
                </div>
                <div className="text-2xl font-black text-blue-700 dark:text-blue-400 tracking-tight">
                  {formatCurrency(selectedPayslip.net_salary)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t dark:border-gray-700">
                <div>Work Days: <b>{selectedPayslip.actual_work_days}</b></div>
                <div className="text-right">OT Hours: <b>{selectedPayslip.ot_hours}</b></div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-b-lg flex justify-end gap-2 shrink-0">
              {/* Nút xem file nếu có URL */}
              {selectedPayslip.file_url && (
                <Button variant="outline" className="gap-2" onClick={() => window.open(selectedPayslip.file_url, '_blank')}>
                  <LinkIcon className="w-4 h-4" /> View File
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setSelectedPayslip(null)}>Close</Button>
              <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}