"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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
import { useAuth } from "../../../src/hooks/useAuth";

type PayrollSummary = {
  month: number;
  year: number;
  total_payroll: number;
  total_base_salary: number;
  total_bonus: number;
  total_deductions: number;
  employees_processed: number;
  avg_salary: number;
  payroll_by_department?: Array<{
    department: string;
    count: number;
    total: number;
    avg: number;
  }>;
};

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AccountingPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [month, setMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));

  const showStatus = (type: "success" | "error" | "info", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  useEffect(() => {
    loadSummary();
  }, [month, year]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/payroll-summary?month=${month}&year=${year}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showStatus("error", "Failed to load payroll summary");
      }
    } catch (err) {
      showStatus("error", "Error loading payroll summary");
    } finally {
      setLoading(false);
    }
  };

  const hasManagePayroll = user?.permissions?.includes("manage:payroll");

  const runPayroll = async () => {
    setRunning(true);
    try {
      const res = await fetch(
        `/api/payroll/run?month=${parseInt(month, 10)}&year=${parseInt(
          year,
          10
        )}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const json = await res.json();
      if (!res.ok) {
        showStatus("error", json?.message || "Payroll run failed");
      } else {
        showStatus("success", json?.message || "Payroll run successful!");
        // refresh summary after run
        await loadSummary();
      }
    } catch (err) {
      showStatus("error", "Error running payroll");
    } finally {
      setRunning(false);
    }
  };

  // Prepare chart data
  const salaryComponentsData = data
    ? [
        { name: "Base Salary", value: data.total_base_salary },
        { name: "Bonus", value: data.total_bonus },
        { name: "Deductions", value: data.total_deductions },
      ]
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Accounting Dashboard</h1>

      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : statusMessage.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded shadow border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 uppercase">Total Payroll</div>
            <div className="text-2xl font-bold mt-1">
              {loading ? "…" : `$${data?.total_payroll?.toFixed(2) ?? 0}`}
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-green-500">
            <div className="text-xs text-gray-600 uppercase">
              Total Base Salary
            </div>
            <div className="text-2xl font-bold mt-1">
              {loading ? "…" : `$${data?.total_base_salary?.toFixed(2) ?? 0}`}
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-yellow-500">
            <div className="text-xs text-gray-600 uppercase">
              Employees Processed
            </div>
            <div className="text-2xl font-bold mt-1">
              {loading ? "…" : data?.employees_processed ?? 0}
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-purple-500">
            <div className="text-xs text-gray-600 uppercase">Avg Salary</div>
            <div className="text-2xl font-bold mt-1">
              {loading ? "…" : `$${data?.avg_salary?.toFixed(2) ?? 0}`}
            </div>
          </div>
        </div>

        {hasManagePayroll && (
          <div className="p-4 bg-white rounded shadow flex flex-col gap-2 min-w-fit">
            <label className="text-sm font-semibold">Period</label>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Month</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="border rounded px-2 py-1 w-16"
                  value={month}
                  onChange={(e) => setMonth(e.target.value.padStart(2, "0"))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Year</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <button
                onClick={runPayroll}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={running}
              >
                {running ? "Running…" : "Run Payroll"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        {/* Bar Chart: Payroll by Department */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Payroll by Department</h2>
          {data?.payroll_by_department &&
          data.payroll_by_department.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.payroll_by_department}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Total Payroll" />
                <Bar dataKey="count" fill="#10b981" name="Employee Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No department data available
            </div>
          )}
        </div>

        {/* Pie Chart: Salary Components */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Salary Components Breakdown
          </h2>
          {salaryComponentsData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salaryComponentsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: $${(value as number).toFixed(0)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salaryComponentsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No salary component data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
