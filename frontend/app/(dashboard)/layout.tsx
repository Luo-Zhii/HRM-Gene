"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useCompany, CompanyProvider } from "@/src/context/CompanyContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  Menu, X, User, LogOut, ChevronDown, Bell,
  CheckCheck, MessageSquare, AlertCircle, FileText, Megaphone, AlertTriangle, Zap,
  Newspaper, Radio, LayoutDashboard
} from "lucide-react";

// --- COMPONENT SIDEBAR (Cập nhật Menu Contracts) ---
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { settings } = useCompany();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const positionName = user?.position?.position_name?.toLowerCase();
  const isAdminOrHr = positionName === "admin" || positionName === "hr" || positionName === "hr manager";
  const hasManageSystemPermission = user?.permissions?.includes("manage:system") ?? false;
  const hasManagePayrollPermission = user?.permissions?.includes("manage:payroll") ?? false;
  const hasManageEmployeePermission = user?.permissions?.includes("manage:employee") ?? false;
  const canViewDirectory = isAdminOrHr || hasManageSystemPermission || hasManageEmployeePermission || hasManagePayrollPermission;
  const canAccessReports = hasManageSystemPermission || hasManagePayrollPermission || positionName === "admin" || positionName === "director" || positionName === "hr manager";

  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3001';
  const logoUrl = settings?.logo_url 
    ? `${backendBaseUrl}${settings.logo_url}`
    : "/Logo.png";

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <aside className={`fixed md:sticky top-0 h-screen z-50 w-[260px] bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className={`flex items-center justify-between h-16 px-6 shrink-0 transition-all relative z-10 ${isScrolled ? "border-transparent shadow-sm" : "border-b border-gray-100"}`}>
          <img 
            src={logoUrl} 
            alt="Company Logo" 
            className="h-8 w-auto object-contain max-w-[150px]" 
            onError={(e) => {
              e.currentTarget.src = "/Logo.png";
            }}
          />
          <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"><X size={20} /></button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.custom-thin-scrollbar::-webkit-scrollbar { width: 5px; } .custom-thin-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-thin-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; } .custom-thin-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; } .custom-thin-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; } .custom-thin-scrollbar:hover { scrollbar-color: #cbd5e1 transparent; }` }} />
        <nav onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)} className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-thin-scrollbar">
          <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} isActive={pathname === "/dashboard"} onClick={onClose} />
          <NavItem href="/company-news" label="News Feed" icon={Newspaper} isActive={pathname === "/company-news"} onClick={onClose} />
          <NavItem href="/dashboard/timekeeping" label="Timekeeping" isActive={pathname === "/dashboard/timekeeping"} onClick={onClose} />
          <NavItem href="/dashboard/leave" label="Leave Management" isActive={pathname?.startsWith("/dashboard/leave")} onClick={onClose} />
          <NavItem href="/dashboard/salary" label="My Salary" isActive={pathname === "/dashboard/salary"} onClick={onClose} />
          <NavItem href="/my-resignation" label="My Resignation" isActive={pathname === "/my-resignation"} onClick={onClose} />
          {(hasManageSystemPermission || isAdminOrHr || hasManageEmployeePermission) && (
            <>
              <NavGroup title="HR Administration" />
              {canViewDirectory && (
                <>
                  <NavItem href="/admin/employees" label="Employee Directory" isActive={pathname === "/admin/employees"} onClick={onClose} />
                  {/* 👇 NÚT QUẢN LÝ HỢP ĐỒNG ĐÃ ĐƯỢC CHÈN VÀO ĐÂY 👇 */}
                  <NavItem href="/admin/contracts" label="Employment contract" isActive={pathname === "/admin/contracts"} onClick={onClose} />
                </>
              )}
              {hasManageSystemPermission && (
                <>
                  <NavItem href="/admin/leave-approvals" label="Leave Approvals" isActive={pathname === "/admin/leave-approvals"} onClick={onClose} />
                  <NavItem href="/admin/resignations" label="Resignation Approvals" isActive={pathname === "/admin/resignations"} onClick={onClose} />
                  <NavItem href="/admin/organization" label="Organizational management" isActive={pathname === "/admin/organization"} onClick={onClose} />
                  <NavItem href="/admin/discipline" label="Discipline" isActive={pathname === "/admin/discipline"} onClick={onClose} />
                  <NavItem href="/admin/permissions" label="Permissions" isActive={pathname === "/admin/permissions"} onClick={onClose} />
                </>
              )}
              {(isAdminOrHr || hasManageSystemPermission) && (
                <>
                  <NavGroup title="Performance Management" />
                  <NavItem href="/admin/performance/library" label="KPI Library" isActive={pathname === "/admin/performance/library"} onClick={onClose} />
                  <NavItem href="/admin/performance/team" label="Team Performance" isActive={pathname === "/admin/performance/team"} onClick={onClose} />
                </>
              )}
              {(isAdminOrHr || hasManageSystemPermission) && <NavItem href="/admin/attendance" label="Attendance History" isActive={pathname === "/admin/attendance"} onClick={onClose} />}
              {hasManageSystemPermission && (
                <NavItem href="/admin/qr-display" label="QR Display (Tablet)" isActive={pathname === "/admin/qr-display"} onClick={onClose} />
              )}
            </>
          )}
          <NavGroup title="My Performance" />
          <NavItem href="/dashboard/performance/me" label="My Goals" isActive={pathname === "/dashboard/performance/me"} onClick={onClose} />
          {hasManagePayrollPermission && (
            <>
              <NavGroup title="Payroll Management" />
              <NavItem href="/admin/payroll/config" label="Salary configuration" isActive={pathname === "/admin/payroll/config"} onClick={onClose} />
              <NavItem href="/admin/payroll/adjustment" label="Salary Adjustment" isActive={pathname === "/admin/payroll/adjustment"} onClick={onClose} />
              <NavItem href="/admin/payroll/generate" label="Create payroll" isActive={pathname === "/admin/payroll/generate"} onClick={onClose} />
              <NavItem href="/admin/payroll/issue" label="Issue Payslips" isActive={pathname === "/admin/payroll/issue"} onClick={onClose} />
            </>
          )}
          {canAccessReports && (
            <>
              <NavGroup title="System & Analytics" />
              <NavItem href="/admin/reports" label="Analysis report" isActive={pathname === "/admin/reports"} onClick={onClose} />
            </>
          )}
          {hasManageSystemPermission && (
            <>
              <NavGroup title="Communication" />
              <NavItem href="/admin/announcements" label="Manage News" icon={Radio} isActive={pathname === "/admin/announcements"} onClick={onClose} />
            </>
          )}
        </nav>
        {hasManageSystemPermission && (
          <div className="p-4 border-t border-gray-100 shrink-0 space-y-1">
            <NavItem href="/admin/settings" label="System Settings" isActive={pathname === "/admin/settings"} onClick={onClose} />
            <NavItem href="/admin/settings/payroll" label="Payroll Settings" isActive={pathname === "/admin/settings/payroll"} onClick={onClose} />
          </div>
        )}
      </aside>
    </>
  );
}

function NavGroup({ title }: { title: string }) { return <div className="mt-6 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">{title}</div>; }
function NavItem({ href, label, icon: Icon, isActive, onClick }: { href: string; label: string; icon?: any; isActive?: boolean; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick} 
      className={`flex items-center gap-3 px-4 py-2.5 rounded-none md:rounded-r-full transition-all group w-full ${
        isActive 
          ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-200" 
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {Icon && <Icon size={18} className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"} />}
      <span className="text-[14px]">{label}</span>
    </Link>
  );
}

// --- NEW COMPONENT: NOTIFICATION DROPDOWN ---
function NotificationDropdown({ notifications, onMarkAllRead, onNotificationClick, onRemoveNotification }: { notifications: any[], onMarkAllRead: () => void, onNotificationClick: (n: any) => void, onRemoveNotification: (id: number) => void }) {
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
            <div key={n.id} onClick={() => onNotificationClick(n)} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${(n.type === 'leave' || n.type === 'leave_request') ? 'bg-green-100 text-green-600' :
                  n.type === 'task' ? 'bg-amber-100 text-amber-600' :
                    n.type === 'kpi' ? 'bg-blue-100 text-blue-600' :
                      (n.type === 'discipline' || n.type === 'warning') ? 'bg-red-100 text-red-600' :
                        n.type === 'payroll' ? 'bg-emerald-100 text-emerald-700' :
                          n.type === 'resignation_request' ? 'bg-orange-100 text-orange-600' :
                            n.type === 'resignation_status_update' ? 'bg-blue-100 text-blue-600 font-bold' :
                              n.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                                'bg-blue-100 text-blue-600'
                }`}>
                {(n.type === 'leave' || n.type === 'leave_request') ? <FileText size={16} /> :
                  n.type === 'task' ? <AlertCircle size={16} /> :
                    n.type === 'kpi' ? <Zap size={16} /> :
                      (n.type === 'discipline' || n.type === 'warning') ? <AlertTriangle size={16} /> :
                        n.type === 'payroll' ? <MessageSquare size={16} /> :
                          n.type === 'resignation_request' ? <User size={16} /> :
                            n.type === 'resignation_status_update' ? <Bell size={16} /> :
                              n.type === 'comment' ? <MessageSquare size={16} /> :
                                <Megaphone size={16} />}
              </div>
              <div className="flex-1 min-w-0 relative pr-6">
                <p className={`text-xs ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'} truncate`}>{n.title || n.type}</p>
                <p className="text-[11px] text-gray-500 line-clamp-3 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveNotification(n.id); }}
                  className="absolute -top-1 -right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Remove notification"
                >
                  <X size={14} />
                </button>
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
  const router = useRouter();

  // --- LOGIC THÔNG BÁO ---
  const { notifications, markAsRead, markAllAsRead, unreadCount, removeNotification } = useNotifications();

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsNotifOpen(false);
    if (notif.link) {
      router.push(notif.link);
    } else if (notif.type === 'leave_request') {
      router.push('/admin/leave-approvals');
    } else if (notif.type === 'leave') {
      router.push('/dashboard/leave');
    } else if (notif.type === 'discipline') {
      const positionName = user?.position?.position_name?.toLowerCase();
      const isAdminOrHr = positionName === "admin" || positionName === "hr" || positionName === "hr manager" || positionName === "director";
      if (isAdminOrHr) {
        router.push('/admin/discipline');
      } else {
        router.push('/profile');
      }
    } else if (notif.type === 'payroll') {
      // Payroll managers go to the admin generate page; employees go to their salary view
      const pos = user?.position?.position_name?.toLowerCase();
      const hasPayrollPerm = user?.permissions?.includes("manage:payroll") || user?.permissions?.includes("manage:system");
      if (hasPayrollPerm) {
        // Route based on notification title for more precision
        const t = (notif.title ?? "").toLowerCase();
        if (t.includes("adjustment")) router.push("/admin/payroll/adjustment");
        else router.push("/admin/payroll/generate");
      } else {
        router.push("/dashboard/salary");
      }
    } else if (notif.type === 'kpi') {
      router.push('/dashboard/performance/me');
    } else if (notif.type === 'resignation_request') {
      router.push('/admin/resignations');
    } else if (notif.type === 'resignation_status_update') {
      router.push('/my-resignation');
    }
  };

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
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-red-500/20">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {isNotifOpen && <NotificationDropdown notifications={notifications} onMarkAllRead={markAllAsRead} onNotificationClick={handleNotificationClick} onRemoveNotification={removeNotification} />}
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
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden relative border border-gray-100 shadow-sm">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    key={user.avatar_url}
                  />
                ) : (
                  <span>{user.first_name ? user.first_name[0].toUpperCase() : "U"}</span>
                )}
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
    <CompanyProvider>
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
    </CompanyProvider>
  );
}