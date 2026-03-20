"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { useNotifications } from "@/src/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  Menu, X, User, LogOut, ChevronDown, Bell,
  CheckCheck, MessageSquare, AlertCircle, FileText, Megaphone
} from "lucide-react";

// --- COMPONENT SIDEBAR (Giữ nguyên logic của sếp) ---
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const positionName = user?.position?.position_name?.toLowerCase();
  const isAdminOrHr = positionName === "admin" || positionName === "hr" || positionName === "hr manager";
  const hasManageSystemPermission = user?.permissions?.includes("manage:system") ?? false;
  const hasManagePayrollPermission = user?.permissions?.includes("manage:payroll") ?? false;
  const hasManageEmployeePermission = user?.permissions?.includes("manage:employee") ?? false;
  const canViewDirectory = isAdminOrHr || hasManageSystemPermission || hasManageEmployeePermission || hasManagePayrollPermission;
  const canAccessReports = hasManageSystemPermission || hasManagePayrollPermission || positionName === "admin" || positionName === "director" || positionName === "hr manager";

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <aside className={`fixed md:sticky top-0 h-screen z-50 w-[260px] bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className={`flex items-center justify-between h-16 px-6 shrink-0 transition-all relative z-10 ${isScrolled ? "border-transparent shadow-sm" : "border-b border-gray-100"}`}>
          <img src="/Logo.png" alt="DashStack Logo" className="h-8 w-auto object-contain" />
          <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"><X size={20} /></button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.custom-thin-scrollbar::-webkit-scrollbar { width: 5px; } .custom-thin-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-thin-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; } .custom-thin-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; } .custom-thin-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; } .custom-thin-scrollbar:hover { scrollbar-color: #cbd5e1 transparent; }` }} />
        <nav onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)} className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-thin-scrollbar">
          <NavItem href="/dashboard" label="Dashboard" isActive={pathname === "/dashboard"} onClick={onClose} />
          <NavItem href="/dashboard/timekeeping" label="Timekeeping" isActive={pathname === "/dashboard/timekeeping"} onClick={onClose} />
          <NavItem href="/dashboard/leave" label="Leave Management" isActive={pathname?.startsWith("/dashboard/leave")} onClick={onClose} />
          <NavItem href="/dashboard/salary" label="My Salary" isActive={pathname === "/dashboard/salary"} onClick={onClose} />
          {(hasManageSystemPermission || isAdminOrHr || hasManageEmployeePermission) && (
            <>
              <NavGroup title="Admin Administration" />
              {canViewDirectory && <NavItem href="/admin/employees" label="Employee Directory" isActive={pathname === "/admin/employees"} onClick={onClose} />}
              {hasManageSystemPermission && (
                <>
                  <NavItem href="/admin/leave-approvals" label="Leave Approvals" isActive={pathname === "/admin/leave-approvals"} onClick={onClose} />
                  <NavItem href="/admin/organization" label="Organization" isActive={pathname === "/admin/organization"} onClick={onClose} />
                  <NavItem href="/admin/permissions" label="Permissions" isActive={pathname === "/admin/permissions"} onClick={onClose} />
                </>
              )}
              {(isAdminOrHr || hasManageSystemPermission) && <NavItem href="/admin/attendance" label="Attendance History" isActive={pathname === "/admin/attendance"} onClick={onClose} />}
              {hasManageSystemPermission && <NavItem href="/admin/qr-display" label="QR Display (Tablet)" isActive={pathname === "/admin/qr-display"} onClick={onClose} />}
            </>
          )}
          {hasManagePayrollPermission && (
            <>
              <NavGroup title="Payroll Management" />
              <NavItem href="/admin/payroll/config" label="Salary Config" isActive={pathname === "/admin/payroll/config"} onClick={onClose} />
              <NavItem href="/admin/payroll/generate" label="Generate Payroll" isActive={pathname === "/admin/payroll/generate"} onClick={onClose} />
            </>
          )}
          {canAccessReports && (
            <>
              <NavGroup title="Analytics" />
              <NavItem href="/admin/reports" label="Reports & Analytics" isActive={pathname === "/admin/reports"} onClick={onClose} />
            </>
          )}
        </nav>
        {hasManageSystemPermission && (
          <div className="p-4 border-t border-gray-100 shrink-0">
            <NavItem href="/admin/settings" label="System Settings" isActive={pathname === "/admin/settings"} onClick={onClose} />
          </div>
        )}
      </aside>
    </>
  );
}

function NavGroup({ title }: { title: string }) { return <div className="mt-6 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">{title}</div>; }
function NavItem({ href, label, isActive, onClick }: { href: string; label: string; isActive?: boolean; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center px-4 py-2.5 rounded-none md:rounded-r-full transition-colors w-full ${isActive ? "bg-blue-500 text-white font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}>
      <span className="text-[14px]">{label}</span>
    </Link>
  );
}

// --- NEW COMPONENT: NOTIFICATION DROPDOWN ---
function NotificationDropdown({ notifications, onMarkAllRead }: { notifications: any[], onMarkAllRead: () => void }) {
  return (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="px-4 pb-3 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        <button onClick={onMarkAllRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto custom-thin-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'leave' ? 'bg-green-100 text-green-600' : n.type === 'task' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {n.type === 'leave' ? <FileText size={16} /> : n.type === 'task' ? <AlertCircle size={16} /> : <Megaphone size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'} truncate`}>{n.title}</p>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 pt-3 border-t border-gray-50">
        <button className="w-full text-center text-xs font-bold text-gray-500 hover:text-blue-600">View All</button>
      </div>
    </div>
  );
}

// --- HEADER ---
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // --- LOGIC THÔNG BÁO ---
  const { notifications, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
      </div>

      <div className="flex items-center gap-2">
        {/* BELL NOTIFICATION */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg relative transition-colors"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotifOpen && <NotificationDropdown notifications={notifications} onMarkAllRead={markAllAsRead} />}
        </div>

        {/* USER DROPDOWN */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{user.first_name || "User"}</p>
                <p className="text-[11px] text-gray-500">{user.position?.position_name || "Employee"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                <span className="absolute">{user.first_name ? user.first_name[0].toUpperCase() : "U"}</span>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><User size={16} /> Profile</Link>
                <button onClick={() => logout()} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"><LogOut size={16} /> Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"><Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign in</Button></Link>
        )}
      </div>
    </header>
  );
}

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