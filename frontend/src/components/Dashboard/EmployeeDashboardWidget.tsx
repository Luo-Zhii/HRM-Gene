"use client";
import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Newspaper, 
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";

interface EmployeeData {
  userStats: {
    ptoBalance: number;
    daysWorkedThisMonth: number;
    upcomingHolidays: number;
  };
  recentAnnouncements: any[];
}

export default function EmployeeDashboardWidget() {
  const { user } = useAuth();
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/employee")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch employee dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-10 w-64 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, {user?.first_name}!</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-full border border-blue-100 flex items-center gap-2 text-blue-700 text-xs font-bold">
           <Award size={14} /> Level 1 Employee
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PTO Balance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
             <Calendar size={60} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PTO Balance</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black text-blue-600">{data?.userStats.ptoBalance}</span>
            <span className="text-sm font-bold text-gray-500 mb-1.5">Days</span>
          </div>
          <p className="text-xs text-gray-400 font-medium italic">Next accrual: April 1st</p>
          <Link href="/dashboard/leave" className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Request Leave <ArrowRight size={14} />
          </Link>
        </div>

        {/* Attendance Stats */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
             <TrendingUp size={60} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Productivity</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black text-green-600">{data?.userStats.daysWorkedThisMonth}</span>
            <span className="text-sm font-bold text-gray-500 mb-1.5">Days Worked</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">This month (March 2026)</p>
          <Link href="/dashboard/timekeeping" className="mt-6 flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
            Check logs <ArrowRight size={14} />
          </Link>
        </div>

        {/* Quick Check-in CTA */}
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
           <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full scale-150" />
           <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-4">Quick Check-in</p>
           <h3 className="text-xl font-bold mb-4 leading-tight">Ready to start <br />your shift?</h3>
           <Link href="/dashboard/timekeeping" className="bg-white text-blue-600 px-6 py-2.5 rounded-xl text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all inline-block truncate max-w-full">
             Go to Timekeeping
           </Link>
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Newspaper size={18} className="text-blue-500" />
            Recent News
          </h3>
          <Link href="/company-news" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data?.recentAnnouncements.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No recent announcements found.</div>
          ) : (
            data?.recentAnnouncements.map((ann, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ann.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {ann.priority}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">Posted on {new Date(ann.created_at).toLocaleDateString()}</span>
                 </div>
                 <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ann.title}</h4>
                 <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
