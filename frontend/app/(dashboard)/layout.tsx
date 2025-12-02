"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

type NavigationItem = {
  name: string;
  href: string;
  icon?: string;
};

type Navigation = {
  main: NavigationItem[];
  admin: NavigationItem[];
};

function Sidebar() {
  const { user } = useAuth();
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const [navLoading, setNavLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchNavigation = async () => {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
          const res = await fetch(
            `${apiBase.replace(/\/api$|\/$/, "")}/api/auth/navigation`,
            {
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (res.ok) {
            const navData = await res.json();
            setNavigation(navData);
          } else if (res.status === 401 || res.status === 403) {
            // Token expired or invalid, redirect to login
            console.error("Authentication failed, redirecting to login");
            window.location.href = "/login";
          } else {
            console.error(
              "Failed to fetch navigation:",
              res.status,
              res.statusText
            );
          }
        } catch (err) {
          console.error("Failed to fetch navigation:", err);
        } finally {
          setNavLoading(false);
        }
      };
      fetchNavigation();
    } else {
      setNavLoading(false);
    }
  }, [user]);

  if (navLoading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
        </div>
      </aside>
    );
  }

  if (!navigation) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <p className="text-sm text-gray-500">Unable to load navigation</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <nav className="space-y-2">
        {navigation.main.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            {item.name}
          </Link>
        ))}
        {navigation.admin.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-sm font-medium text-gray-700">
              Admin
            </div>
            {navigation.admin.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block pl-6 py-1 rounded hover:bg-gray-100 transition-colors ${
                  item.name === "QR Display (Tablet)"
                    ? "font-bold text-blue-600"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
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
