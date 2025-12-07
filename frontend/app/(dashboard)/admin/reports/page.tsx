"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import {
  ComposedChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardData {
  salary_trend: Array<{
    year: number;
    month: number;
    month_label: string;
    total_base_salary: number;
    total_net_payout: number;
  }>;
  headcount_trend: Array<{
    year: number;
    month: number;
    month_label: string;
    total_personnel: number;
  }>;
  turnover: Array<{
    year: number;
    month: number;
    month_label: string;
    new_hires: number;
    resigned: number;
  }>;
  personnel_by_department: Array<{
    department_name: string;
    count: number;
  }>;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission =
        user.permissions?.includes("manage:system") ||
        user.permissions?.includes("manage:payroll") ||
        user.position?.position_name === "Admin" ||
        user.position?.position_name === "Director" ||
        user.position?.position_name === "HR Manager";
      if (!hasPermission) {
        setError("You do not have permission to access this page.");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  // Load dashboard data
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reports/dashboard", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for Chart 1: Mixed Chart (Bar + Line)
  const salaryChartData = data.salary_trend.map((item) => ({
    month: item.month_label,
    "Total Base Salary": item.total_base_salary,
    "Total Net Payout": item.total_net_payout,
  }));

  // Prepare data for Chart 2: Staff Fluctuation (Line Chart with tooltip)
  const headcountChartData = data.headcount_trend.map((item) => {
    const turnoverData = data.turnover.find(
      (t) => t.year === item.year && t.month === item.month
    );
    return {
      month: item.month_label,
      "Total Personnel": item.total_personnel,
      "New Hires": turnoverData?.new_hires || 0,
      Resigned: turnoverData?.resigned || 0,
    };
  });

  // Prepare data for Chart 3: Pie Chart
  const departmentChartData = data.personnel_by_department.map((item) => ({
    name: item.department_name,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">HR Reports & Analytics</h1>
        <p className="text-slate-600 mt-2">
          Comprehensive insights into salary trends, headcount, and personnel
          distribution
        </p>
      </div>

      {/* Chart 1: Salary Cost Overview (Mixed Chart) */}
      <Card className="shadow-md rounded-lg border-none">
        <CardHeader>
          <CardTitle className="text-slate-800">Salary Cost Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={salaryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  padding: "12px",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
              <Bar
                yAxisId="left"
                dataKey="Total Base Salary"
                fill="#3b82f6"
                name="Total Base Salary"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Total Net Payout"
                stroke="#f97316"
                strokeWidth={3}
                name="Total Net Payout"
                dot={{ r: 5, fill: "#f97316" }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Staff Fluctuation (Line Chart) */}
      <Card className="shadow-md rounded-lg border-none">
        <CardHeader>
          <CardTitle className="text-slate-800">Staff Fluctuation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={headcountChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
                        <p className="font-semibold mb-2 text-slate-800">{`Month: ${label}`}</p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Total Personnel:</span>{" "}
                          {data["Total Personnel"]} employees
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">New Hires:</span>{" "}
                          {data["New Hires"]}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Resigned:</span>{" "}
                          {data["Resigned"]}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="Total Personnel"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981" }}
                activeDot={{ r: 7 }}
                name="Total Personnel"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-slate-600">
            <p>
              Hover over data points to see New Hires and Resigned counts for
              each month.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Personnel by Department (Pie Chart) */}
      <Card className="shadow-md rounded-lg border-none">
        <CardHeader>
          <CardTitle className="text-slate-800">Personnel by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={departmentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  padding: "12px",
                }}
                formatter={(value: number) => `${value} employees`}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md rounded-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Current Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {data.headcount_trend[data.headcount_trend.length - 1]
                ?.total_personnel || 0}
            </p>
            <p className="text-sm text-slate-500 mt-1">Active employees</p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {data.personnel_by_department.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Latest Month Net Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(
                data.salary_trend[data.salary_trend.length - 1]
                  ?.total_net_payout || 0
              )}
            </p>
            <p className="text-sm text-slate-500 mt-1">Last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

