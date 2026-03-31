"use client";
import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null; 

  if (user.role === 'Admin' || user.role === 'System Director') {
    return <AdminDashboard />;
  }
  
  return <EmployeeDashboard />;
}
