"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowUpDown, 
  User, 
  FileText, 
  Phone, 
  MapPin, 
  ExternalLink,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Định nghĩa Interface cho dữ liệu Nhân viên
interface Position {
  position_id: number;
  position_name: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface EmployeeData {
  employee_id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone_number?: string; // Thay thế lương bằng SĐT
  address?: string;      // Thay thế phụ cấp bằng Địa chỉ
  position?: Position | null;
  department?: Department | null;
}

export default function EmployeeDirectoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // State quản lý dữ liệu và loading
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý sắp xếp
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  });

  // State tìm kiếm (Optional - thêm vào để tiện dụng hơn cho danh bạ)
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Kiểm tra quyền hạn (Authorization)
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission =
        user.permissions?.includes("manage:employee") || // Ưu tiên quyền này
        user.permissions?.includes("manage:system") ||
        user.permissions?.includes("manage:payroll");

      if (!hasPermission) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have permission to view employee contact info.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router, toast]);

  // 2. Hàm load dữ liệu nhân viên
  const loadEmployees = async () => {
    try {
      setLoading(true);
      // Giả định endpoint này trả về danh sách nhân viên kèm info cơ bản
      // Bạn cần đảm bảo Backend trả về phone_number và address
      const res = await fetch("/api/employees", { 
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch employee list");
      }
      
      const data = await res.json();
      setEmployees(data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load employee list.",
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user &&
      (user.permissions?.includes("manage:employee") ||
       user.permissions?.includes("manage:system") ||
       user.permissions?.includes("manage:payroll"))
    ) {
      loadEmployees();
    }
  }, [user]);

  // 3. Xử lý sắp xếp (Sorting Logic)
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEmployees = useMemo(() => {
    // Bước 1: Lọc theo tìm kiếm
    let processed = employees.filter(emp => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        (emp.phone_number && emp.phone_number.includes(searchLower))
      );
    });

    // Bước 2: Sắp xếp
    if (sortConfig.key) {
      processed.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Xử lý các trường nested object (Department/Position)
        if (sortConfig.key === 'department') {
          aValue = a.department?.department_name || "";
          bValue = b.department?.department_name || "";
        } else if (sortConfig.key === 'position') {
          aValue = a.position?.position_name || "";
          bValue = b.position?.position_name || "";
        } else {
          // Xử lý null/undefined cho các trường string (phone, address)
          aValue = aValue || "";
          bValue = bValue || "";
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return processed;
  }, [employees, sortConfig, searchTerm]);

  // 4. Hàm chuyển hướng sang Profile
  const handleViewProfile = (employeeId: number) => {
    // Chuyển hướng sang trang profile với query param id
    router.push(`/profile?id=${employeeId}`);
  };

  // Helper hiển thị tên
  const getEmployeeName = (employee: EmployeeData) => {
    return `${employee.first_name} ${employee.last_name}`.trim();
  };

  // Helper hiển thị avatar text
  const getInitials = (employee: EmployeeData) => {
    const first = employee.first_name?.[0]?.toUpperCase() || "";
    const last = employee.last_name?.[0]?.toUpperCase() || "";
    return `${first}${last}` || "U";
  };

  // Loading UI
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading directory...</p>
        </div>
      </div>
    );
  }

  // Access Denied UI
  if (!user || !(
    user.permissions?.includes("manage:employee") ||
    user.permissions?.includes("manage:system") ||
    user.permissions?.includes("manage:payroll")
  )) {
    return null; // Đã handle redirect ở useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Employee Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View contact information and employee profiles
            </p>
          </div>
          
          {/* Thanh tìm kiếm đơn giản */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email or phone..."
              className="pl-8 bg-white dark:bg-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Cột Employee Name */}
                  <TableHead className="p-0 dark:text-gray-200 min-w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('first_name')}
                      className="flex w-full items-center justify-start gap-2 whitespace-nowrap px-4 py-3 font-bold hover:bg-transparent dark:text-gray-200"
                    >
                      Employee
                      <ArrowUpDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </TableHead>

                  {/* Cột Email */}
                  <TableHead className="dark:text-gray-200 font-bold">Email</TableHead>

                  {/* Cột Department */}
                  <TableHead className="p-0 dark:text-gray-200">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('department')}
                      className="flex w-full items-center justify-start gap-2 whitespace-nowrap px-4 py-3 font-bold hover:bg-transparent dark:text-gray-200"
                    >
                      Department
                      <ArrowUpDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </TableHead>

                  {/* Cột Position */}
                  <TableHead className="p-0 dark:text-gray-200">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('position')}
                      className="flex w-full items-center justify-start gap-2 whitespace-nowrap px-4 py-3 font-bold hover:bg-transparent dark:text-gray-200"
                    >
                      Position
                      <ArrowUpDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </TableHead>

                  {/* Cột Phone (Thay thế Base Salary) */}
                  <TableHead className="p-0 dark:text-gray-200">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('phone_number')}
                      className="flex w-full items-center justify-start gap-2 whitespace-nowrap px-4 py-3 font-bold hover:bg-transparent dark:text-gray-200"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                      <ArrowUpDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </TableHead>

                  {/* Cột Address (Thay thế Allowances) */}
                  <TableHead className="p-0 dark:text-gray-200">
                     <Button
                      variant="ghost"
                      onClick={() => handleSort('address')}
                      className="flex w-full items-center justify-start gap-2 whitespace-nowrap px-4 py-3 font-bold hover:bg-transparent dark:text-gray-200"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                      <ArrowUpDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </TableHead>

                  {/* Cột Actions */}
                  <TableHead className="text-right dark:text-gray-200">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAndSortedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                          No employees found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedEmployees.map((emp) => (
                    <TableRow
                      key={emp.employee_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer group"
                      onClick={() => handleViewProfile(emp.employee_id)} // Click vào dòng để chuyển trang
                    >
                      {/* Avatar & Name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {emp.avatar_url ? (
                            <img
                              src={emp.avatar_url}
                              alt={getEmployeeName(emp)}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {getInitials(emp)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {getEmployeeName(emp)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                              {emp.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {emp.email}
                      </TableCell>

                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {emp.department?.department_name || (
                          <span className="text-gray-400 italic">No Dept</span>
                        )}
                      </TableCell>

                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {emp.position?.position_name || (
                          <span className="text-gray-400 italic">No Position</span>
                        )}
                      </TableCell>

                      {/* Hiển thị Số điện thoại */}
                      <TableCell className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                        {emp.phone_number ? (
                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">
                             {emp.phone_number}
                           </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </TableCell>

                      {/* Hiển thị Địa chỉ */}
                      <TableCell className="text-gray-600 dark:text-gray-400 max-w-[200px]">
                        <div className="truncate" title={emp.address}>
                          {emp.address || <span className="text-gray-400 italic">-</span>}
                        </div>
                      </TableCell>

                      {/* Action Button */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click của dòng
                            handleViewProfile(emp.employee_id);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          View Profile
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}