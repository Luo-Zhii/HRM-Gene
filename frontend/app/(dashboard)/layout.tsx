"use client";
import React, { useState, useRef, useEffect } from "react";
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

// --- COMPONENT SIDEBAR ---
function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
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
      {/* Overlay cho mobile */}
      <div
        className={`
          fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      <aside
        className={`
          fixed md:sticky top-0 h-screen z-50
          w-[260px] bg-white border-r border-gray-200 
          transform transition-transform duration-300 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* LOGO SECTION */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 shrink-0">
          <img
            src="/Logo.png"
            alt="DashStack Logo"
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">

          <NavItem
            href="/dashboard"
            label="Dashboard"
            isActive={pathname === "/dashboard"}
            onClick={onClose}
          />

          {/* GROUP: HR ADMINISTRATION */}
          <NavGroup title="HR Administration" />
          {canViewDirectory && (
            <NavItem
              href="/admin/employees"
              label="Employee Directory"
              isActive={pathname === "/admin/employees"}
              onClick={onClose}
            />
          )}
          {hasManageSystemPermission && (
            <>
              <NavItem
                href="/admin/organization"
                label="Personnel update"
                isActive={pathname === "/admin/organization"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/contract"
                label="Employment contract"
                isActive={pathname === "/admin/contract"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/management"
                label="Organizational management"
                isActive={pathname === "/admin/management"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/discipline"
                label="Discipline"
                isActive={pathname === "/admin/discipline"}
                onClick={onClose}
              />
            </>
          )}

          <NavDivider />

          {/* GROUP: ATTENDANCE & LEAVE */}
          <NavGroup title="Attendance & Leave" />
          {(isAdminOrHr || hasManageSystemPermission) && (
            <>
              <NavItem
                href="/admin/attendance-report"
                label="Attendance Report"
                isActive={pathname === "/admin/attendance-report"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/qr-history"
                label="QR scan history"
                isActive={pathname === "/admin/qr-history"}
                onClick={onClose}
              />
            </>
          )}
          {hasManageSystemPermission && (
            <NavItem
              href="/admin/leave-approvals"
              label="Approve leave"
              isActive={pathname === "/admin/leave-approvals"}
              onClick={onClose}
            />
          )}
          {hasManageSystemPermission && (
            <NavItem
              href="/admin/qr-display"
              label="QR Display"
              isActive={pathname === "/admin/qr-display"}
              onClick={onClose}
            />
          )}

          <NavDivider />

          {/* GROUP: PAYROLL MANAGEMENT */}
          {hasManagePayrollPermission && (
            <>
              <NavGroup title="Payroll Management" />
              <NavItem
                href="/admin/payroll/config"
                label="Salary configuration"
                isActive={pathname === "/admin/payroll/config"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/payroll/create"
                label="Create payroll"
                isActive={pathname === "/admin/payroll/create"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/payroll/adjustment"
                label="Salary adjustment"
                isActive={pathname === "/admin/payroll/adjustment"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/payroll/payslips"
                label="Issue payslips"
                isActive={pathname === "/admin/payroll/payslips"}
                onClick={onClose}
              />
              <NavDivider />
            </>
          )}

          {/* GROUP: SYSTEM & ANALYTICS */}
          {hasManageSystemPermission && (
            <>
              <NavGroup title="System & Analytics" />
              <NavItem
                href="/admin/reports"
                label="Analysis report"
                isActive={pathname === "/admin/reports"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/permissions"
                label="Roles"
                isActive={pathname === "/admin/permissions"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/settings"
                label="System configuration"
                isActive={pathname === "/admin/settings"}
                onClick={onClose}
              />
              <NavDivider />
            </>
          )}

          {/* GROUP: COMMUNICATION & RECRUITMENT */}
          {hasManageSystemPermission && (
            <>
              <NavGroup title="Communication & Recruitment" />
              <NavItem
                href="/admin/notifications"
                label="Notifications"
                isActive={pathname === "/admin/notifications"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/emails"
                label="Automated email"
                isActive={pathname === "/admin/emails"}
                onClick={onClose}
              />
              <NavItem
                href="/admin/recruitment"
                label="Recruitment management"
                isActive={pathname === "/admin/recruitment"}
                onClick={onClose}
              />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

// --- HELPER COMPONENTS ---

function NavGroup({ title }: { title: string }) {
  return (
    <div className="mt-6 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">
      {title}
    </div>
  );
}

function NavDivider() {
  return <div className="h-[1px] bg-gray-100 my-4 mx-3" />;
}

function NavItem({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center px-4 py-2.5 rounded-none md:rounded-r-full transition-colors w-full
        ${isActive
          ? "bg-blue-500 text-white font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
        }
      `}
    >
      <span className="text-[14px]">{label}</span>
    </Link>
  );
}

// --- HEADER COMPONENT ---
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
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
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
                <p className="text-sm font-semibold text-gray-800">
                  {user.first_name || "User"}
                </p>
                <p className="text-[11px] text-gray-500">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                <img src="/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover opacity-0" onError={(e) => e.currentTarget.style.opacity = '0'} />
                <span className="absolute">{user.first_name ? user.first_name[0].toUpperCase() : "U"}</span>
              </div>

              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} /> Profile
                </Link>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

// --- MAIN LAYOUT ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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