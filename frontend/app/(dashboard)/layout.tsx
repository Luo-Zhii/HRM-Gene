"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";

// --- COMPONENT SIDEBAR ---
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // State theo dõi trạng thái cuộn để làm hiệu ứng bóng mờ Logo
  const [isScrolled, setIsScrolled] = useState(false);

  const positionName = user?.position?.position_name?.toLowerCase();
  const isAdminOrHr = positionName === "admin" || positionName === "hr" || positionName === "hr manager";

  const hasManageSystemPermission = user?.permissions?.includes("manage:system") ?? false;
  const hasManagePayrollPermission = user?.permissions?.includes("manage:payroll") ?? false;
  const hasManageEmployeePermission = user?.permissions?.includes("manage:employee") ?? false;

  const canViewDirectory = isAdminOrHr || hasManageSystemPermission || hasManageEmployeePermission || hasManagePayrollPermission;

  const canAccessReports =
    hasManageSystemPermission ||
    hasManagePayrollPermission ||
    positionName === "admin" ||
    positionName === "director" ||
    positionName === "hr manager";

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />

      <aside className={`fixed md:sticky top-0 h-screen z-50 w-[260px] bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* LOGO - Có hiệu ứng đổ bóng mờ khi cuộn */}
        <div
          className={`flex items-center justify-between h-16 px-6 shrink-0 transition-all duration-200 relative z-10 ${isScrolled ? "border-transparent shadow-sm" : "border-b border-gray-100"
            }`}
        >
          <img src="/Logo.png" alt="DashStack Logo" className="h-8 w-auto object-contain" />
          <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"><X size={20} /></button>
        </div>

        {/* CSS Tùy chỉnh thanh cuộn mỏng & ẩn/hiện thông minh */}
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Cho Chrome, Edge, Safari */
          .custom-thin-scrollbar::-webkit-scrollbar {
            width: 5px; /* Độ mỏng của thanh cuộn */
          }
          .custom-thin-scrollbar::-webkit-scrollbar-track {
            background: transparent; /* Nền trong suốt */
          }
          .custom-thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: transparent; /* Ẩn đi khi không tương tác */
            border-radius: 10px; /* Bo tròn thanh cuộn */
          }
          /* Khi di chuột vào khu vực menu, thanh cuộn hiện mờ mờ */
          .custom-thin-scrollbar:hover::-webkit-scrollbar-thumb {
            background-color: #cbd5e1; /* Màu xám nhạt (slate-300) */
          }
          /* Khi di chuột trực tiếp vào thanh cuộn, màu đậm lên một chút */
          .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8; /* Màu xám đậm hơn (slate-400) */
          }

          /* Hỗ trợ cho Firefox */
          .custom-thin-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
            transition: scrollbar-color 0.3s;
          }
          .custom-thin-scrollbar:hover {
            scrollbar-color: #cbd5e1 transparent;
          }
        `}} />

        {/* MENU LIST - Thêm class custom-thin-scrollbar */}
        <nav
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
          className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-thin-scrollbar"
        >
          {/* CÁC MỤC CHUNG AI CŨNG THẤY */}
          <NavItem href="/dashboard" label="Dashboard" isActive={pathname === "/dashboard"} onClick={onClose} />
          <NavItem href="/dashboard/timekeeping" label="Timekeeping" isActive={pathname === "/dashboard/timekeeping"} onClick={onClose} />
          <NavItem href="/dashboard/leave" label="Leave Management" isActive={pathname?.startsWith("/dashboard/leave")} onClick={onClose} />
          <NavItem href="/dashboard/salary" label="My Salary" isActive={pathname === "/dashboard/salary"} onClick={onClose} />

          {/* ADMIN ADMINISTRATION */}
          {(hasManageSystemPermission || isAdminOrHr || hasManageEmployeePermission) && (
            <>
              <NavGroup title="Admin Administration" />

              {canViewDirectory && (
                <NavItem href="/admin/employees" label="Employee Directory" isActive={pathname === "/admin/employees"} onClick={onClose} />
              )}

              {hasManageSystemPermission && (
                <>
                  <NavItem href="/admin/leave-approvals" label="Leave Approvals" isActive={pathname === "/admin/leave-approvals"} onClick={onClose} />
                  <NavItem href="/admin/organization" label="Organization" isActive={pathname === "/admin/organization"} onClick={onClose} />
                  <NavItem href="/admin/permissions" label="Permissions" isActive={pathname === "/admin/permissions"} onClick={onClose} />
                </>
              )}

              {(isAdminOrHr || hasManageSystemPermission) && (
                <NavItem href="/admin/attendance" label="Attendance History" isActive={pathname === "/admin/attendance"} onClick={onClose} />
              )}

              {hasManageSystemPermission && (
                <NavItem href="/admin/qr-display" label="QR Display (Tablet)" isActive={pathname === "/admin/qr-display"} onClick={onClose} />
              )}
            </>
          )}

          {/* PAYROLL MANAGEMENT */}
          {hasManagePayrollPermission && (
            <>
              <NavGroup title="Payroll Management" />
              <NavItem href="/admin/payroll/config" label="Salary Config" isActive={pathname === "/admin/payroll/config"} onClick={onClose} />
              <NavItem href="/admin/payroll/generate" label="Generate Payroll" isActive={pathname === "/admin/payroll/generate"} onClick={onClose} />
            </>
          )}

          {/* ANALYTICS */}
          {canAccessReports && (
            <>
              <NavGroup title="Analytics" />
              <NavItem href="/admin/reports" label="Reports & Analytics" isActive={pathname === "/admin/reports"} onClick={onClose} />
            </>
          )}
        </nav>

        {/* SYSTEM SETTINGS BOTTOM */}
        {hasManageSystemPermission && (
          <div className="p-4 border-t border-gray-100 shrink-0">
            <NavItem href="/admin/settings" label="System Settings" isActive={pathname === "/admin/settings"} onClick={onClose} />
          </div>
        )}
      </aside>
    </>
  );
}

// --- HELPER COMPONENTS CHO GIAO DIỆN FIGMA ---
function NavGroup({ title }: { title: string }) {
  return <div className="mt-6 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">{title}</div>;
}

function NavItem({ href, label, isActive, onClick }: { href: string; label: string; isActive?: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-none md:rounded-r-full transition-colors w-full ${isActive ? "bg-blue-500 text-white font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
        }`}
    >
      <span className="text-[14px]">{label}</span>
    </Link>
  );
}

// --- HEADER ---
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{user.first_name || "User"}</p>
                <p className="text-[11px] text-gray-500">{user.position?.position_name || "Employee"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                <img src="/avatar-placeholder.png" alt="" className="w-full h-full object-cover opacity-0" onError={(e) => e.currentTarget.style.opacity = '0'} />
                <span className="absolute">{user.first_name ? user.first_name[0].toUpperCase() : "U"}</span>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={16} /> Profile
                </Link>
                <button onClick={() => logout()} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign in</Button>
          </Link>
        )}
      </div>
    </header>
  );
}

// --- MAIN LAYOUT ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <Toaster />
      </div>
    </div>
  );
}