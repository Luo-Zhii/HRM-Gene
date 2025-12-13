"use client";
import React, { useState, useRef, useEffect } from "react";

// 1. IMPORT USEPATHNAME
import { usePathname } from "next/navigation"; 

import Link from "next/link";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Clock,
  CalendarDays,
  ShieldCheck,
  Building2,
  LockKeyhole,
  QrCode,
  Settings,
  DollarSign,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";

type NavigationItem = {
  name: string;
  href: string;
  icon?: string;
};

// --- 1. COMPONENT SIDEBAR ---
function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  
  // 2. LẤY PATHNAME HIỆN TẠI
  const pathname = usePathname();

  const positionName = user?.position?.position_name?.toLowerCase();
  const isAdminOrHr =
    positionName === "admin" ||
    positionName === "hr" ||
    positionName === "hr manager";

  const hasManageSystemPermission =
    user?.permissions?.includes("manage:system") ?? false;

  const hasManagePayrollPermission =
    user?.permissions?.includes("manage:payroll") ?? false;
    
  const hasManageEmployeePermission =
    user?.permissions?.includes("manage:employee") ?? false;

  const canViewDirectory = 
    isAdminOrHr || 
    hasManageSystemPermission || 
    hasManageEmployeePermission || 
    hasManagePayrollPermission;

  const canAccessReports =
    hasManageSystemPermission ||
    hasManagePayrollPermission ||
    user?.position?.position_name === "Admin" ||
    user?.position?.position_name === "Director" ||
    user?.position?.position_name === "HR Manager";

  return (
    <>
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        onClick={onClose}
      />

      <aside
        className={`
          fixed md:sticky md:top-0 md:h-screen z-50
          w-72 md:w-64 bg-blue-900 border-r border-blue-800 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 shadow-2xl md:shadow-none h-full
        `}
      >
        <div className="flex justify-between items-center h-16 px-6 border-b border-blue-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
              HR
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              HRM App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 text-blue-200 hover:bg-blue-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {/* 3. TRUYỀN isActive VÀO TỪNG MỤC 
             Logic: isActive = {pathname === href}
          */}
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={pathname === "/dashboard"}
            onClick={onClose}
          />
          <NavItem
            href="/dashboard/timekeeping"
            icon={<Clock size={20} />}
            label="Timekeeping"
            isActive={pathname === "/dashboard/timekeeping"}
            onClick={onClose}
          />
          <NavItem
            href="/dashboard/leave"
            icon={<CalendarDays size={20} />}
            label="Leave Management"
            isActive={pathname?.startsWith("/dashboard/leave")} // Dùng startsWith nếu có trang con
            onClick={onClose}
          />
          <NavItem
            href="/dashboard/salary"
            icon={<FileText size={20} />}
            label="My Salary"
            isActive={pathname === "/dashboard/salary"}
            onClick={onClose}
          />

          {(hasManageSystemPermission || isAdminOrHr || hasManageEmployeePermission) && (
            <>
              <div className="mt-8 mb-2 px-3 text-xs font-bold text-blue-300 uppercase tracking-wider">
                Admin Administration
              </div>

              {canViewDirectory && (
                <NavItem
                  href="/admin/employees"
                  icon={<Users size={20} />}
                  label="Employee Directory"
                  isActive={pathname === "/admin/employees"}
                  onClick={onClose}
                />
              )}

              {hasManageSystemPermission && (
                <>
                  <NavItem
                    href="/admin/leave-approvals"
                    icon={<ShieldCheck size={20} />}
                    label="Leave Approvals"
                    isActive={pathname === "/admin/leave-approvals"}
                    onClick={onClose}
                  />
                  <NavItem
                    href="/admin/organization"
                    icon={<Building2 size={20} />}
                    label="Organization"
                    isActive={pathname === "/admin/organization"}
                    onClick={onClose}
                  />
                  <NavItem
                    href="/admin/permissions"
                    icon={<LockKeyhole size={20} />}
                    label="Permissions"
                    isActive={pathname === "/admin/permissions"}
                    onClick={onClose}
                  />
                </>
              )}

              {(isAdminOrHr || hasManageSystemPermission) && (
                <NavItem
                  href="/admin/attendance"
                  icon={<Clock size={20} />}
                  label="Attendance History"
                  isActive={pathname === "/admin/attendance"}
                  onClick={onClose}
                />
              )}

              {hasManageSystemPermission && (
                <Link
                  href="/admin/qr-display"
                  onClick={onClose}
                  // Xử lý active thủ công cho thẻ Link này
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all mt-2 ${
                    pathname === "/admin/qr-display" 
                      ? "bg-blue-600 text-white shadow-md" // Active style
                      : "bg-blue-800 text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <QrCode size={20} />
                  <span>QR Display (Tablet)</span>
                </Link>
              )}
            </>
          )}

          {hasManagePayrollPermission && (
            <>
              <div className="mt-8 mb-2 px-3 text-xs font-bold text-blue-300 uppercase tracking-wider">
                Payroll Management
              </div>

              <NavItem
                href="/admin/payroll/config"
                icon={<DollarSign size={20} />}
                label="Salary Config"
                isActive={pathname === "/admin/payroll/config"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/payroll/generate"
                icon={<FileText size={20} />}
                label="Generate Payroll"
                isActive={pathname === "/admin/payroll/generate"}
                onClick={onClose}
              />
            </>
          )}

          {canAccessReports && (
            <>
              <div className="mt-8 mb-2 px-3 text-xs font-bold text-blue-300 uppercase tracking-wider">
                Analytics
              </div>

              <NavItem
                href="/admin/reports"
                icon={<BarChart3 size={20} />}
                label="Reports & Analytics"
                isActive={pathname === "/admin/reports"}
                onClick={onClose}
              />
            </>
          )}
        </nav>

        {hasManageSystemPermission && (
          <div className="p-4 border-t border-blue-800 shrink-0">
            <NavItem
              href="/admin/settings"
              icon={<Settings size={20} />}
              label="System Settings"
              isActive={pathname === "/admin/settings"}
              onClick={onClose}
            />
          </div>
        )}
      </aside>
    </>
  );
}

// 4. CẬP NHẬT NAVITEM ĐỂ NHẬN PROP isActive VÀ ĐỔI STYLE
function NavItem({
  href,
  icon,
  label,
  isActive, // <--- Nhận prop này
  onClick,
}: {
  href: string;
  icon: any;
  label: string;
  isActive?: boolean; // <--- Thêm type
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      // Logic CSS: Nếu active thì nền sáng (blue-700/600), chữ trắng, đậm hơn
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
        isActive
          ? "bg-blue-600 text-white shadow-md font-medium" // Active State
          : "text-blue-100 hover:bg-blue-800 hover:text-white" // Inactive State
      }`}
    >
      <span
        className={`transition-colors ${
          isActive ? "text-white" : "text-blue-300 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg text-gray-800 md:hidden">HRM</span>
        <span className="hidden md:block font-semibold text-lg text-slate-800">
          Overview
        </span>
      </div>

      <div className="flex items-center">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1.5 rounded-full md:rounded-lg transition-colors border border-transparent md:border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <span className="text-sm font-bold">
                  {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                </span>
              </div>
              <div className="hidden md:block text-left mr-1">
                <p className="text-sm font-medium text-gray-700 leading-none">
                  {user.first_name || "User"}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-1">
                  Employee
                </p>
              </div>
              <ChevronDown
                size={14}
                className="text-gray-400 hidden md:block"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.email || "U"}
                  </p>
                </div>
                <div className="p-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <User size={16} /> Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left mt-1"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              variant="outline"
            >
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
        <Toaster />
      </div>
    </div>
  );
}