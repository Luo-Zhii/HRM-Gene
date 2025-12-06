"use client";
import React, { useState, useRef, useEffect } from "react";

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
} from "lucide-react"; // Import thêm icon cho đẹp

type NavigationItem = {
  name: string;
  href: string;
  icon?: string;
};

type Navigation = {
  main: NavigationItem[];
  admin: NavigationItem[];
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

  // Check if user has manage:system permission
  const hasManageSystemPermission =
    user?.permissions?.includes("manage:system") ?? false;

  return (
    <>
      {/* Màn đen mờ khi mở menu trên mobile (Thêm backdrop-blur cho đẹp) */}
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
          w-72 md:w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 shadow-2xl md:shadow-none h-full
        `}
      >
        {/* Header của Sidebar */}
        <div className="flex justify-between items-center h-16 px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              HR
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              HRM App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Danh sách Menu (Thêm Custom Scrollbar) */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            onClick={onClose}
          />
          <NavItem
            href="/dashboard/timekeeping"
            icon={<Clock size={20} />}
            label="Timekeeping"
            onClick={onClose}
          />
          <NavItem
            href="/dashboard/leave"
            icon={<CalendarDays size={20} />}
            label="Leave Management"
            onClick={onClose}
          />

          {/* Admin Administration Section - Only visible if user has manage:system permission */}
          {hasManageSystemPermission && (
            <>
              <div className="mt-8 mb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Admin Administration
              </div>

              <NavItem
                href="/admin/leave-approvals"
                icon={<ShieldCheck size={20} />}
                label="Leave Approvals"
                onClick={onClose}
              />
              <NavItem
                href="/admin/organization"
                icon={<Building2 size={20} />}
                label="Organization"
                onClick={onClose}
              />
              <NavItem
                href="/admin/permissions"
                icon={<LockKeyhole size={20} />}
                label="Permissions"
                onClick={onClose}
              />

              <Link
                href="/admin/qr-display"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-all mt-2"
              >
                <QrCode size={20} />
                <span>QR Display (Tablet)</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer của Sidebar (Optional: Settings ở dưới cùng) */}
        {/* System Settings - Only visible if user has manage:system permission */}
        {hasManageSystemPermission && (
          <div className="p-4 border-t border-gray-100 shrink-0">
            <NavItem
              href="/admin/settings"
              icon={<Settings size={20} />}
              label="System Settings"
              onClick={onClose}
            />
          </div>
        )}
      </aside>
    </>
  );
}

// Helper Component để render Link cho gọn
function NavItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all group"
    >
      <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

// --- 2. COMPONENT HEADER ---
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
    <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
        {/* Trên Mobile hiện tiêu đề ngắn, PC hiện tiêu đề dài hoặc ẩn đi nếu thích */}
        <span className="font-bold text-lg text-gray-800 md:hidden">HRM</span>
        <span className="hidden md:block font-semibold text-lg text-gray-700">
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

// --- 3. LAYOUT CHÍNH ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar bây giờ là sticky trên PC, nên nó nằm cùng cấp với div content */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Wrapper cho nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
        <Toaster />
      </div>
    </div>
  );
}
