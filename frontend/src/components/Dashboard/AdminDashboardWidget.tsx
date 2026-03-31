"use client";
import React, { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  ClipboardList, 
  ArrowRight,
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface AdminData {
  todayAttendance: {
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
  };
  pendingApprovals: {
    leaveRequests: number;
    resignations: number;
  };
  stats: {
    totalHeadcount: number;
  }
}

export default function AdminDashboardWidget() {
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
    return <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>;
  }

  const kpis = [
    { 
      label: "Total Headcount", 
      value: data?.stats.totalHeadcount || 0, 
      icon: Users, 
      color: "blue",
      sub: "Active Employees"
    },
    { 
      label: "Present Today", 
      value: data?.todayAttendance.present || 0, 
      icon: UserCheck, 
      color: "green",
      sub: `${data?.todayAttendance.late} late arrivals`
    },
    { 
      label: "Absent Today", 
      value: data?.todayAttendance.absent || 0, 
      icon: UserMinus, 
      color: "red",
      sub: "Excused & Unexcused"
    },
    { 
      label: "Pending Approvals", 
      value: (data?.pendingApprovals.leaveRequests || 0) + (data?.pendingApprovals.resignations || 0), 
      icon: ClipboardList, 
      color: "orange",
      sub: "Action Required"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Company Overview</h1>
        <p className="text-gray-500 mt-1 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Status</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-sm font-bold text-gray-800">{kpi.label}</p>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-orange-500" size={18} />
              Pending Approvals
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time sync</span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
               {/* Leave Requests */}
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Leave Requests</h4>
                      <p className="text-xs text-gray-500">{data?.pendingApprovals.leaveRequests} requests awaiting response</p>
                    </div>
                  </div>
                  <Link href="/admin/leave-approvals" className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    Manage <ArrowRight size={14} />
                  </Link>
               </div>

               {/* Resignations */}
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <UserMinus size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Resignation Requests</h4>
                      <p className="text-xs text-gray-500">{data?.pendingApprovals.resignations} requests awaiting response</p>
                    </div>
                  </div>
                  <Link href="/admin/resignations" className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 text-xs font-bold rounded-lg border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                    Manage <ArrowRight size={14} />
                  </Link>
               </div>
            </div>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <ExternalLink size={18} /> Quick Actions
              </h3>
              <p className="text-blue-100 text-xs mb-6 font-medium">Common administrative tasks</p>
              <div className="space-y-3">
                <Link href="/admin/register" className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">Add New Employee</Link>
                <Link href="/admin/payroll/generate" className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">Process Payroll</Link>
                <Link href="/admin/announcements" className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">Broadcast Announcement</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
