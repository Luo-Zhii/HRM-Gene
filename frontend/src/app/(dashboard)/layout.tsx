"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useNotifications } from "@/hooks/useNotifications";
import { useCompany, CompanyProvider } from "@/context/CompanyContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import {
  Menu, X, User, Users, LogOut, ChevronDown, Bell, Search,
  CheckCheck, MessageSquare, AlertCircle, FileText, Megaphone, AlertTriangle, Zap,
  Newspaper, Radio, LayoutDashboard, ChevronRight,
  UserCheck, Clock, CalendarDays, DollarSign, BarChart3,
  Settings, Shield, Building, Target,
  CalendarX2, ClipboardList, ScanLine, UserMinus, BadgeAlert,
  KeyRound, Wallet, TrendingUp, PieChart, Cog, Calendar,
  Briefcase, GitBranch, UsersRound, FileCheck2, AlertOctagon,
  LockKeyhole, Fingerprint, CreditCard, Banknote, Receipt,
  LineChart, Megaphone as Ann, Gauge
} from "lucide-react";

// ─── NavItem (leaf link) ─────────────────────────────────────────────────────
function NavItem({
  href, label, icon: Icon, isActive, onClick, indent = false,
}: {
  href: string; label: string; icon?: any; isActive?: boolean; onClick: () => void; indent?: boolean;
}) {
  let allowed = true;
  if (typeof window !== "undefined") {
    try {
      const cacheKey = Object.keys(sessionStorage).find(k => k.startsWith("sidebar_dept_visibility_"));
      if (cacheKey) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed[href] === false) {
            allowed = false;
          }
        }
      }
    } catch (e) {}
  }

  if (!allowed) return null;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group w-full text-[13px] font-medium
        ${indent ? "ml-3 pl-3 border-l-2 border-gray-100" : ""}
        ${isActive
          ? "bg-blue-600 text-white shadow-sm shadow-blue-200/60"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      {Icon && <Icon size={15} className={`shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />}
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ─── NavSection (collapsible group) ─────────────────────────────────────────
function NavSection({
  title, icon: Icon, color = "text-gray-500", children, defaultOpen = false, forceOpen = false,
}: {
  title: string; icon: any; color?: string; children: React.ReactNode; defaultOpen?: boolean; forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || forceOpen);

  // Auto-open if a child is active
  useEffect(() => {
    if (forceOpen && !open) setOpen(true);
  }, [forceOpen]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${open ? "bg-blue-100" : "bg-gray-100 group-hover:bg-gray-200"} transition-colors`}>
            <Icon size={13} className={open ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"} />
          </div>
          <span className={`text-[12.5px] font-bold uppercase tracking-wide ${open ? "text-blue-700" : "text-gray-500 group-hover:text-gray-700"}`}>
            {title}
          </span>
        </div>
        <ChevronRight size={13} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-90 text-blue-500" : ""}`} />
      </button>

      {open && (
        <div className="mt-0.5 ml-1 pl-2 border-l-2 border-gray-100 space-y-0.5 pb-1">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { settings } = useCompany();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();

  const [deptVisibility, setDeptVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const userDept = user?.department?.department_name || "";
    if (!userDept) return;

    // Load from cache first
    const cached = sessionStorage.getItem(`sidebar_dept_visibility_${userDept}`);
    if (cached) {
      try {
        setDeptVisibility(JSON.parse(cached));
      } catch (e) {}
    }

    fetch(`/api/admin/settings/sidebar_dept_visibility`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.value) {
          try {
            const parsed = JSON.parse(data.value);
            const currentDeptSettings = parsed[userDept] || {};
            setDeptVisibility(currentDeptSettings);
            sessionStorage.setItem(`sidebar_dept_visibility_${userDept}`, JSON.stringify(currentDeptSettings));
          } catch (e) {}
        }
      });
  }, [user]);

  const isPathAllowed = (path: string) => {
    // If the path is explicitly set to false for this user's department, hide it
    if (deptVisibility[path] === false) {
      return false;
    }
    return true;
  };

  const positionName = user?.position?.position_name?.toLowerCase();
  const { checkPermission } = useCheckPermission();

  const canViewEmployees = checkPermission("GET", "/api/admin/employees");
  const canViewCompany = checkPermission("GET", "/api/admin/company/settings");
  const canViewPermissions = checkPermission("GET", "/api/admin/permissions/grouped");
  const canManagePayroll = checkPermission("GET", "/api/admin/payroll");
  const canManageLeaveEndpoint = checkPermission("GET", "/api/admin/leave");

  const isAdminOrHr = positionName === "admin" || positionName === "hr" || positionName === "hr manager" || positionName === "director";
  const canManageLeave = canManageLeaveEndpoint || isAdminOrHr;
  const canViewDirectory = canViewEmployees || isAdminOrHr;
  const hasHRAdminAccess = canViewDirectory || canViewCompany || canViewPermissions || isAdminOrHr;
  const canAccessReports = canManagePayroll || canViewCompany || isAdminOrHr;

  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3001';
  const logoUrl = settings?.logo_url ? `${backendBaseUrl}${settings.logo_url}` : "/Logo.png";

  const inPeople = ["/admin/employees", "/admin/contracts", "/admin/organization", "/admin/discipline", "/admin/permissions"].some(p => pathname?.startsWith(p));
  const inAttLeave = ["/admin/attendance", "/admin/qr-display", "/admin/leave-approvals", "/admin/resignations", "/admin/holidays"].some(p => pathname?.startsWith(p));
  const inPayroll = pathname?.startsWith("/admin/payroll");
  const inPerformance = pathname?.startsWith("/admin/performance");
  const inComms = pathname?.startsWith("/admin/announcements");
  const inReports = pathname?.startsWith("/admin/reports");
  const inMyWork = ["/dashboard/timekeeping", "/dashboard/leave", "/dashboard/performance", "/dashboard/salary", "/my-resignation"].some(p => pathname?.startsWith(p));
  const inAdmin = pathname?.startsWith("/admin");

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <aside className={`fixed md:sticky top-0 h-screen z-50 w-[240px] bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 shrink-0">
          <Link href="/dashboard" className="flex items-center">
            <img src={logoUrl} alt="Logo" className="h-7 w-auto object-contain max-w-[130px] cursor-pointer hover:opacity-80 transition-opacity" onError={e => { e.currentTarget.src = "/Logo.png"; }} />
          </Link>
          <button onClick={onClose} className="md:hidden p-1.5 text-gray-400 hover:bg-gray-100 rounded-md"><X size={18} /></button>
        </div>

        {/* Nav */}
        <style dangerouslySetInnerHTML={{ __html: `.thin-sc::-webkit-scrollbar{width:4px}.thin-sc::-webkit-scrollbar-thumb{background:transparent;border-radius:4px}.thin-sc:hover::-webkit-scrollbar-thumb{background:#cbd5e1}` }} />
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 thin-sc">

          {/* Always-visible */}
          <NavItem href="/dashboard" label={t("sidebar.dashboard")} icon={LayoutDashboard} isActive={pathname === "/dashboard"} onClick={onClose} />
          <NavItem href="/company-news" label={t("sidebar.newsFeed")} icon={Newspaper} isActive={pathname?.startsWith("/company-news")} onClick={onClose} />
          <NavItem href="/directory" label={t("sidebar.staffDirectory")} icon={Users} isActive={pathname?.startsWith("/directory")} onClick={onClose} />

          {/* MY WORKSPACE */}
          <div className="pt-2">
            <NavSection title="My Workspace" icon={Gauge} forceOpen={inMyWork || !inAdmin}>
              <NavItem href="/dashboard/timekeeping" label={t("sidebar.timekeeping")} icon={Fingerprint} isActive={pathname === "/dashboard/timekeeping"} onClick={onClose} indent />
              <NavItem href="/dashboard/leave" label={t("sidebar.leaveManagement")} icon={CalendarX2} isActive={pathname?.startsWith("/dashboard/leave")} onClick={onClose} indent />
              <NavItem href="/dashboard/performance/me" label={t("sidebar.myGoals")} icon={Target} isActive={pathname === "/dashboard/performance/me"} onClick={onClose} indent />
              <NavItem href="/dashboard/salary" label={t("sidebar.mySalary")} icon={Wallet} isActive={pathname === "/dashboard/salary"} onClick={onClose} indent />
              <NavItem href="/my-resignation" label={t("sidebar.myResignation")} icon={UserMinus} isActive={pathname === "/my-resignation"} onClick={onClose} indent />
            </NavSection>
          </div>

          {/* ADMINISTRATION */}
          {hasHRAdminAccess && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-2 text-[10px] font-black uppercase tracking-widest text-gray-300">Administration</p>
              </div>

              {canViewDirectory && (
                <NavSection title="People" icon={UsersRound} forceOpen={inPeople}>
                  <NavItem href="/admin/employees" label={t("sidebar.employeeDirectory")} icon={UserCheck} isActive={pathname === "/admin/employees"} onClick={onClose} indent />
                  <NavItem href="/admin/contracts" label={t("sidebar.employmentContract")} icon={FileCheck2} isActive={pathname === "/admin/contracts"} onClick={onClose} indent />
                  {canViewCompany && <NavItem href="/admin/organization" label={t("sidebar.organizationalManagement")} icon={GitBranch} isActive={pathname === "/admin/organization"} onClick={onClose} indent />}
                  {(canViewCompany || isAdminOrHr) && <NavItem href="/admin/discipline" label={t("sidebar.discipline")} icon={AlertOctagon} isActive={pathname === "/admin/discipline"} onClick={onClose} indent />}
                  {canViewPermissions && <NavItem href="/admin/permissions" label={t("sidebar.permissions")} icon={LockKeyhole} isActive={pathname === "/admin/permissions"} onClick={onClose} indent />}
                </NavSection>
              )}

              <NavSection title="Attend & Leave" icon={CalendarDays} forceOpen={inAttLeave}>
                {(isAdminOrHr || canViewCompany) && <NavItem href="/admin/attendance" label={t("sidebar.attendanceHistory")} icon={Clock} isActive={pathname === "/admin/attendance"} onClick={onClose} indent />}
                {canViewCompany && <NavItem href="/admin/qr-display" label={t("sidebar.qrDisplay")} icon={ScanLine} isActive={pathname === "/admin/qr-display"} onClick={onClose} indent />}
                {canManageLeave && <NavItem href="/admin/leave-approvals" label={t("sidebar.leaveApprovals")} icon={ClipboardList} isActive={pathname === "/admin/leave-approvals"} onClick={onClose} indent />}
                {(canManageLeave || isAdminOrHr) && <NavItem href="/admin/resignations" label={t("sidebar.resignationApprovals")} icon={UserMinus} isActive={pathname === "/admin/resignations"} onClick={onClose} indent />}
                {isAdminOrHr && <NavItem href="/admin/holidays" label="Public Holidays" icon={Calendar} isActive={pathname === "/admin/holidays"} onClick={onClose} indent />}
              </NavSection>

              {canManagePayroll && (
                <NavSection title="Payroll" icon={Banknote} forceOpen={inPayroll}>
                  <NavItem href="/admin/payroll/config" label={t("sidebar.salaryConfiguration")} icon={CreditCard} isActive={pathname === "/admin/payroll/config"} onClick={onClose} indent />
                  <NavItem href="/admin/payroll/adjustment" label={t("sidebar.salaryAdjustment")} icon={DollarSign} isActive={pathname === "/admin/payroll/adjustment"} onClick={onClose} indent />
                  <NavItem href="/admin/payroll/generate" label={t("sidebar.createPayroll")} icon={Receipt} isActive={pathname === "/admin/payroll/generate"} onClick={onClose} indent />
                  <NavItem href="/admin/payroll/issue" label={t("sidebar.issuePayslips")} icon={FileText} isActive={pathname === "/admin/payroll/issue"} onClick={onClose} indent />
                </NavSection>
              )}

              {(canViewCompany || isAdminOrHr) && (
                <NavSection title="Performance" icon={TrendingUp} forceOpen={inPerformance}>
                  <NavItem href="/admin/performance/library" label={t("sidebar.kpiLibrary")} icon={Target} isActive={pathname === "/admin/performance/library"} onClick={onClose} indent />
                  <NavItem href="/admin/performance/team" label={t("sidebar.teamPerformance")} icon={BarChart3} isActive={pathname === "/admin/performance/team"} onClick={onClose} indent />
                </NavSection>
              )}

              {canViewCompany && (
                <NavSection title="Communication" icon={Radio} forceOpen={inComms}>
                  <NavItem href="/admin/announcements" label={t("sidebar.manageNews")} icon={Ann} isActive={pathname === "/admin/announcements"} onClick={onClose} indent />
                </NavSection>
              )}

              {canAccessReports && (
                <NavSection title="Analytics" icon={LineChart} forceOpen={inReports}>
                  <NavItem href="/admin/reports" label={t("sidebar.analysisReport")} icon={PieChart} isActive={pathname === "/admin/reports"} onClick={onClose} indent />
                </NavSection>
              )}
            </>
          )}
        </nav>

        {/* Settings pinned at bottom */}
        {canViewCompany && (
          <div className="px-2.5 py-3 border-t border-gray-100 shrink-0 space-y-0.5">
            <NavItem href="/admin/settings" label={t("sidebar.systemSettings")} icon={Cog} isActive={pathname === "/admin/settings"} onClick={onClose} />
            {canManagePayroll && <NavItem href="/admin/settings/payroll" label={t("sidebar.payrollSettings")} icon={Settings} isActive={pathname === "/admin/settings/payroll"} onClick={onClose} />}
          </div>
        )}
      </aside>
    </>
  );
}



function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString([], { timeZone: 'Asia/Ho_Chi_Minh' });
}

function getNotificationStyle(type: string) {
  const map: Record<string, { bg: string; text: string; icon: any }> = {
    leave: { bg: "bg-green-100", text: "text-green-600", icon: FileText },
    leave_request: { bg: "bg-green-100", text: "text-green-600", icon: FileText },
    task: { bg: "bg-amber-100", text: "text-amber-600", icon: AlertCircle },
    kpi: { bg: "bg-blue-100", text: "text-blue-600", icon: Zap },
    discipline: { bg: "bg-red-100", text: "text-red-600", icon: AlertTriangle },
    warning: { bg: "bg-red-100", text: "text-red-600", icon: AlertTriangle },
    payroll: { bg: "bg-emerald-100", text: "text-emerald-700", icon: MessageSquare },
    resignation_request: { bg: "bg-orange-100", text: "text-orange-600", icon: User },
    resignation_status_update: { bg: "bg-blue-100", text: "text-blue-600", icon: Bell },
    comment: { bg: "bg-violet-100", text: "text-violet-600", icon: MessageSquare },
    announcement: { bg: "bg-sky-100", text: "text-sky-600", icon: Megaphone },
  };
  return map[type] || { bg: "bg-gray-100", text: "text-gray-600", icon: Megaphone };
}

function NotificationDropdown({ notifications, onMarkAllRead, onNotificationClick, onRemoveNotification }: { notifications: any[], onMarkAllRead: () => void, onNotificationClick: (n: any) => void, onRemoveNotification: (id: number) => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.position?.position_name?.toLowerCase();

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="px-4 pb-3 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{t("header.notifications")}</h3>
        <button onClick={onMarkAllRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <CheckCheck size={14} /> {t("header.markAllRead")}
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto custom-thin-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">{t("header.noNewNotifications")}</div>
        ) : (
          notifications.slice(0, 20).map((n) => {
            const style = getNotificationStyle(n.type);
            const Icon = style.icon;
            return (
              <div key={n.id} onClick={() => onNotificationClick(n)} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 border-b border-gray-50 last:border-0 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0 relative pr-6">
                  <p className={`text-xs ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'} truncate`}>{n.title || n.type}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-3 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  {!n.isRead && <span className="absolute top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveNotification(n.id); }}
                    className="absolute -top-1 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    aria-label="Remove notification"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="px-4 pt-3 border-t border-gray-50">
        <button
          onClick={() => {
            if (isAdmin === 'admin' || isAdmin === 'hr' || isAdmin === 'hr manager' || isAdmin === 'director') {
              router.push('/admin/notifications/manage');
            }
          }}
          className="w-full text-center text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
        >
          {t("header.viewAll")}
        </button>
      </div>
    </div>
  );
}

// --- SPOTLIGHT SEARCH ROUTES ---
const SEARCH_ROUTES = [
  { title: "Dashboard", path: "/dashboard", description: "Home overview" },
  { title: "News Feed", path: "/company-news", description: "Company announcements" },
  { title: "Staff Directory", path: "/directory", description: "Browse colleagues publicly" },
  { title: "Timekeeping", path: "/dashboard/timekeeping", description: "Clock in/out, attendance" },
  { title: "Leave Management", path: "/dashboard/leave", description: "Apply and view leaves" },
  { title: "My Goals", path: "/dashboard/performance/me", description: "Personal KPI" },
  { title: "My Salary", path: "/dashboard/salary", description: "Payslips and salary" },
  { title: "My Resignation", path: "/my-resignation", description: "Resignation status" },
  { title: "Profile", path: "/profile", description: "Your personal profile" },
  { title: "Employee Directory", path: "/admin/employees", description: "All employees" },
  { title: "Employment Contract", path: "/admin/contracts", description: "Staff contracts" },
  { title: "Organizational Management", path: "/admin/organization", description: "Departments and structure" },
  { title: "Attendance History", path: "/admin/attendance", description: "Admin attendance logs" },
  { title: "QR Display", path: "/admin/qr-display", description: "Tablet QR check-in" },
  { title: "Leave Approvals", path: "/admin/leave-approvals", description: "Review leave requests" },
  { title: "Resignation Approvals", path: "/admin/resignations", description: "Manage resignations" },
  { title: "Discipline", path: "/admin/discipline", description: "Violations and warnings" },
  { title: "Permissions", path: "/admin/permissions", description: "User access rights" },
  { title: "Salary Configuration", path: "/admin/payroll/config", description: "Base salary setup" },
  { title: "Salary Adjustment", path: "/admin/payroll/adjustment", description: "Bonus and deductions" },
  { title: "Create Payroll", path: "/admin/payroll/generate", description: "Generate payroll cycles" },
  { title: "Issue Payslips", path: "/admin/payroll/issue", description: "Send payslips to staff" },
  { title: "Analysis Report", path: "/admin/reports", description: "HR analytics" },
  { title: "Manage News", path: "/admin/announcements", description: "Publish company news" },
  { title: "KPI Library", path: "/admin/performance/library", description: "KPI templates" },
  { title: "Team Performance", path: "/admin/performance/team", description: "Team KPI overview" },
  { title: "System Settings", path: "/admin/settings", description: "App configuration" },
  { title: "Payroll Settings", path: "/admin/settings/payroll", description: "Payroll rules" },
];

// Route-only result — employee search removed from command palette
type SearchResult = { title: string; path: string; description?: string };


// --- HEADER ---
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, loading, logout } = useAuth();
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
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
      const hasPayrollPerm = user?.permissions?.includes("manage:payroll") || user?.permissions?.includes("manage:system");
      if (hasPayrollPerm) {
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

  // ── COMMAND PALETTE LOGIC ─────────────────────────────────────────────────
  // Pure local filtering — NO API calls, NO employee data.
  // Employee search is handled exclusively by the local search inside EmployeeTable.
  const commandResults: SearchResult[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return []; // empty → show Quick Links instead
    return SEARCH_ROUTES
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery]);

  // Quick Links: shown when the palette is open but the query is empty
  const QUICK_LINKS: SearchResult[] = [
    { title: "Dashboard", path: "/dashboard", description: "Home overview" },
    { title: "Staff Directory", path: "/directory", description: "Browse colleagues" },
    { title: "Timekeeping", path: "/dashboard/timekeeping", description: "Clock in/out" },
    { title: "Leave Management", path: "/dashboard/leave", description: "Apply for leave" },
    { title: "Profile", path: "/profile", description: "Your profile" },
  ];

  const handleSearchSelect = useCallback((result: SearchResult) => {
    router.push(result.path);
    setSearchQuery("");
    setIsSearchOpen(false);
  }, [router]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
      </div>

      <div className="flex items-center gap-3">
        {/* SPOTLIGHT SEARCH */}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56 md:w-72 transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* COMMAND PALETTE DROPDOWN */}
          {isSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[200] animate-in fade-in zoom-in-95 duration-150">
              {/* ── Empty query: show Quick Links ───────────────────────── */}
              {!searchQuery.trim() && (
                <>
                  <p className="px-4 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("header.quickLinks")}
                  </p>
                  {QUICK_LINKS.map((r) => (
                    <button
                      key={r.path}
                      onClick={() => handleSearchSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                        <LayoutDashboard size={14} className="text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                        {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* ── Query typed: show filtered page/feature results ──────── */}
              {searchQuery.trim() && commandResults.length > 0 && (
                <>
                  <p className="px-4 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("header.pagesAndFeatures")}
                  </p>
                  {commandResults.map((r) => (
                    <button
                      key={r.path}
                      onClick={() => handleSearchSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                        <LayoutDashboard size={14} className="text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                        {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                      </div>
                      <span className="ml-auto text-[10px] text-gray-300 font-mono truncate hidden md:block">{r.path}</span>
                    </button>
                  ))}
                </>
              )}

              {/* ── No match ─────────────────────────────────────────────── */}
              {searchQuery.trim() && commandResults.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <Search size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">{t("header.noResults")}</p>
                  <p className="text-xs text-gray-400 mt-1">Try &ldquo;leave&rdquo;, &ldquo;payroll&rdquo;, &ldquo;settings&rdquo;…</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LANGUAGE SWITCHER — pill variant */}
        <LanguageSwitcher variant="pill" />

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
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={16} /> {t("userMenu.myProfile")}
                </Link>
                {/* Language toggle — menu variant: syncs with the pill in the header */}
                <div className="border-t border-gray-50 my-1" />
                <LanguageSwitcher variant="menu" />
                <div className="border-t border-gray-50 my-1" />
                <button onClick={() => logout()} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                  <LogOut size={16} /> {t("userMenu.logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"><Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">{t("common.signIn")}</Button></Link>
        )}
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <CompanyProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </CompanyProvider>
  );
}