"use client";
import React, { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  AlertCircle,
  ClipboardList, 
  ArrowRight,
  PlusCircle,
  CreditCard
} from "lucide-react";
import Link from "next/link";

interface AdminData {
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  pendingApprovals: {
    leaveRequests: number;
    resignations: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/admin")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch admin dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 p-8">
        <div className="h-10 w-48 bg-gray-200 rounded-lg mb-8" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Employees", value: data?.attendance.total || 0, icon: Users, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Present Today", value: data?.attendance.present || 0, icon: UserCheck, color: "green", bg: "bg-green-50", text: "text-green-600" },
    { label: "Absent", value: data?.attendance.absent || 0, icon: UserMinus, color: "red", bg: "bg-red-50", text: "text-red-600" },
    { label: "Late", value: data?.attendance.late || 0, icon: AlertCircle, color: "yellow", bg: "bg-yellow-50", text: "text-yellow-600" },
  ];

  return (
    <div className="space-y-8 px-4 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Company Overview</h1>
        <p className="text-gray-500 mt-2 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.text}`}>
                <kpi.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">{kpi.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{kpi.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-blue-500" size={24} />
              Pending Approvals
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Leave Requests</h4>
                      <p className="text-sm text-gray-500">{data?.pendingApprovals.leaveRequests} requests awaiting response</p>
                    </div>
                  </div>
                  <Link href="/admin/leave-approvals" className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
                    Review
                  </Link>
               </div>

               <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <UserMinus size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Resignation Requests</h4>
                      <p className="text-sm text-gray-500">{data?.pendingApprovals.resignations} requests awaiting response</p>
                    </div>
                  </div>
                  <Link href="/admin/resignations" className="px-6 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-all">
                    Review
                  </Link>
               </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30">
              <h3 className="font-bold text-xl text-gray-900">Quick Actions</h3>
           </div>
           <div className="p-6 space-y-4">
              <Link href="/admin/register" className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <PlusCircle size={20} />
                </div>
                <span className="font-bold text-gray-700">Add New Employee</span>
              </Link>
              <Link href="/admin/payroll/generate" className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 border border-transparent hover:border-green-100 transition-all group">
                <div className="p-2.5 rounded-lg bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <CreditCard size={20} />
                </div>
                <span className="font-bold text-gray-700">Generate Payroll</span>
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
