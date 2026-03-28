"use client";
import React, { useEffect, useState } from "react";
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserMinus, Download, Calendar, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  summary: {
    headcount: { value: number; trend: string; isPositive: boolean };
    newHires: { value: number; trend: string; isPositive: boolean };
    turnover: { value: number | string; trend: string; isPositive: boolean };
  };
  workforceFluctuations: Array<{ month: string; headcount: number }>;
  resignationReasons: Array<{ reason: string; count: number; percentage: number }>;
  payrollBudget: Array<{ department: string; actual: number; planned: number }>;
  topKpi: Array<{ department: string; score: string; status: string }>;
}

const DONUT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

function StatCard({ title, value, trend, isPositive, icon: Icon, colorClass, bgClass }: any) {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${bgClass} ${colorClass}`}>
          <Icon size={22} />
        </div>
      </div>
      <div>
        <span className={`inline-flex items-center text-[13px] font-bold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
        <span className="text-[12px] font-semibold text-gray-400 ml-2">vs Last Month</span>
      </div>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/analytics/dashboard", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Data Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen pb-10">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Report Analytics</h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">
            Visualizing organization-wide performance and financial metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm font-semibold text-slate-700">This Month</span>
           </div>
           <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm font-semibold text-slate-700">All Branches</span>
           </div>
           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm font-semibold text-sm transition-colors">
              <Download size={16} />
              Export Report
           </button>
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-2xl bg-white" />
            <Skeleton className="h-32 rounded-2xl bg-white" />
            <Skeleton className="h-32 rounded-2xl bg-white" />
         </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Headcount" 
              value={data?.summary.headcount.value}
              trend={data?.summary.headcount.trend}
              isPositive={data?.summary.headcount.isPositive}
              icon={Users}
              bgClass="bg-blue-50"
              colorClass="text-blue-600"
            />
            <StatCard 
              title="New Hires" 
              value={data?.summary.newHires.value}
              trend={data?.summary.newHires.trend}
              isPositive={data?.summary.newHires.isPositive}
              icon={UserPlus}
              bgClass="bg-emerald-50"
              colorClass="text-emerald-600"
            />
            <StatCard 
              title="Turnover Rate" 
              value={`${data?.summary.turnover.value}%`}
              trend={data?.summary.turnover.trend}
              isPositive={data?.summary.turnover.isPositive}
              icon={UserMinus}
              bgClass="bg-orange-50"
              colorClass="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workforce Fluctuations */}
            <Card className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800">Workforce Fluctuations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data?.workforceFluctuations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: "#64748b", fontSize: 12 }} 
                        />
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                           itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="headcount" 
                          stroke="#3b82f6" 
                          strokeWidth={4} 
                          fill="url(#colorHeadcount)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                        />
                     </AreaChart>
                   </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Reasons for Resignation */}
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-lg font-bold text-slate-800">Reasons for Resignation</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                 <div className="h-[220px] w-full relative flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={data?.resignationReasons}
                         cx="50%" cy="50%"
                         innerRadius={70} outerRadius={90}
                         paddingAngle={4}
                         dataKey="count"
                         stroke="none"
                       >
                         {data?.resignationReasons.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-slate-800">
                         {data?.resignationReasons.reduce((sum: number, item: any) => sum + item.count, 0)}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Total</span>
                   </div>
                 </div>
                 
                 {/* Custom Legend */}
                 <div className="w-full mt-4 space-y-3 px-2">
                    {data?.resignationReasons.map((item: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}></div>
                             <span className="text-sm font-semibold text-slate-700">{item.reason}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{item.percentage}%</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payroll Budget by Department */}
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800">Payroll Budget by Department</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data?.payrollBudget} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2} barSize={24}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="department" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} 
                            dy={10} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 11 }} 
                            tickFormatter={(val) => `$${val/1000}k`}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value)}
                          />
                          <Legend 
                             verticalAlign="top" 
                             align="right" 
                             wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
                             iconType="circle"
                          />
                          <Bar dataKey="actual" name="Actual" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="planned" name="Planned" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
            </Card>

            {/* Top 5 KPI Departments */}
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800">Top 5 KPI Departments</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="border-b border-gray-100">
                             <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Department</th>
                             <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Avg KPI Score</th>
                             <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50/80">
                          {data?.topKpi.map((item: any, idx: number) => (
                             <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 text-sm font-bold text-slate-800">
                                   {item.department}
                                </td>
                                <td className="py-4">
                                   <div className="flex items-center gap-3 pr-4">
                                      <div className="text-sm font-bold text-slate-800 w-12">{item.score}%</div>
                                      <div className="w-full bg-gray-100 rounded-full h-2">
                                         <div 
                                            className={`h-2 rounded-full ${Number(item.score) >= 90 ? 'bg-emerald-500' : Number(item.score) >= 80 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                                            style={{ width: `${item.score}%` }}
                                         ></div>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-4 flex justify-end">
                                   <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                     item.status === 'Xuất sắc' || item.status === 'Excellent' ? 'bg-emerald-50 text-emerald-700' : 
                                     item.status === 'Tốt' || item.status === 'Good' ? 'bg-blue-50 text-blue-700' : 
                                     item.status === 'Đạt' || item.status === 'Average' ? 'bg-indigo-50 text-indigo-700' :
                                     'bg-orange-50 text-orange-700'
                                   }`}>
                                      {item.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
