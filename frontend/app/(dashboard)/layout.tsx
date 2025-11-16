"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/timekeeping"
          className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Timekeeping
        </Link>
        <Link
          href="/dashboard/leave"
          className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Leave
        </Link>
        <div className="space-y-1">
          <div className="px-3 py-2 text-sm font-medium text-gray-700">
            Admin
          </div>
          <Link
            href="/admin/leave-approvals"
            className="block pl-6 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Leave Approvals
          </Link>
          <Link
            href="/admin/organization"
            className="block pl-6 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Organization
          </Link>
          <Link
            href="/admin/permissions"
            className="block pl-6 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Permissions
          </Link>
          <Link
            href="/admin/settings"
            className="block pl-6 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Settings
          </Link>
        </div>
      </nav>
    </aside>
  );
}

function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      <div className="font-semibold">HRM Dashboard</div>
      <div className="flex items-center">
        {loading ? (
          <span className="mr-3">Loading...</span>
        ) : user ? (
          <>
            <span className="mr-3">
              Welcome, {user.first_name || user.email}
            </span>
            <Button onClick={() => logout()} variant="outline">
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">Sign in</Link>
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
