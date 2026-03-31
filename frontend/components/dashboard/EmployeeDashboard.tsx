"use client";
import React, { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  Palmtree,
  Newspaper,
  ArrowRight,
  MapPin,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";

interface EmployeeData {
  stats: {
    ptoBalance: number;
    daysWorkedThisMonth: number;
  };
  nextHoliday: {
    name: string;
    date: string;
  };
  recentAnnouncements: any[];
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/dashboard/employee")
      .then(res => res.json())
      .then(d => {
        console.log("DASHBOARD DATA:", d); // Added for debugging
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch employee dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="space-y-8 p-8 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-10 px-4 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, {user?.first_name}!</h1>
        <p className="text-gray-500 mt-2 font-medium">Ready to take on the day?</p>
      </div>

      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timekeeping Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Clock size={24} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Status</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Timekeeping</h3>
            <Link href="/dashboard/timekeeping" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              Quick Check-in
            </Link>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <Palmtree size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Leave Balance</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 leading-none tracking-tight">
              {loading ? "..." : (data?.stats?.ptoBalance ?? 0)}
            </h3>
            <span className="text-sm font-bold text-gray-400">Days Available</span>
          </div>
          <Link href="/dashboard/leave" className="mt-8 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
            Request more <ChevronRight size={14} />
          </Link>
        </div>

        {/* Next Holiday Card */}
        <Link href="/dashboard/holidays" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-blue-600 group-hover:text-gray-600 transition-colors">
              <Calendar size={24} />
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Next Holiday</p>
          <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{data?.nextHoliday.name}</h3>
          <p className="text-xs text-gray-400 mt-1 font-medium">{data?.nextHoliday.date ? new Date(data.nextHoliday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg w-fit group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <MapPin size={12} /> View Full Calendar
          </div>
        </Link>
      </div>

      {/* Announcements Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
            <Newspaper size={24} className="text-indigo-500" />
            Company Updates
          </h3>
          <Link href="/company-news" className="text-sm font-bold text-blue-600 hover:text-blue-700">View Feed</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data?.recentAnnouncements.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">No recent updates.</div>
          ) : (
            data?.recentAnnouncements.map((ann, idx) => (
              <div key={idx} className="p-8 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">{ann.priority || 'Normal'}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ann.title}</h4>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
