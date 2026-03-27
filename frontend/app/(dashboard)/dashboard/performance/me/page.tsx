"use client";

import React, { useEffect, useState } from "react";
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/src/hooks/useAuth";

interface KpiAssignment {
  id: number;
  kpi_library: {
    name: string;
    description: string;
    unit: string;
  };
  target_value: number;
  actual_value: number;
  weight: number;
  status: string;
  manager_score: number | null;
}

export default function MyPerformancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [assignments, setAssignments] = useState<KpiAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateValue, setUpdateValue] = useState<string>("");
  const [totalAchievement, setTotalAchievement] = useState<number>(0);

  const fetchData = async () => {
    try {
      const perRes = await fetch("/api/kpi/period", { credentials: "include" });
      if (!perRes.ok) throw new Error();
      const perData = await perRes.json();
      const safePeriods = Array.isArray(perData) ? perData : [];
      setPeriods(safePeriods);
      if (safePeriods.length > 0) setSelectedPeriod(safePeriods[0].id.toString());
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load periods" });
      setPeriods([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchMyPerformance = async (perId: string) => {
    if (!perId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/kpi/my-performance?period_id=${perId}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);

      // Fetch total achievement score from backend
      if (user?.employee_id) {
        const scoreRes = await fetch(`/api/kpi/calculate-score?employee_id=${user.employee_id}&period_id=${perId}`, { credentials: "include" });
        if (scoreRes.ok) {
          const score = await scoreRes.json();
          setTotalAchievement(score);
        }
      }
    } catch (error) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPeriod) {
      fetchMyPerformance(selectedPeriod);
    }
  }, [selectedPeriod]);

  const handleUpdateActual = async (id: number) => {
    const value = parseFloat(updateValue);
    if (isNaN(value)) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Please enter a valid numeric value." });
      return;
    }
    try {
      const res = await fetch(`/api/kpi/assignment/${id}/actual`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual_value: value }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Updated", description: "Performance value submitted for review" });
      setUpdatingId(null);
      fetchMyPerformance(selectedPeriod);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update value" });
    }
  };

  const calculateAchievement = (actual: number, target: number) => {
    if (target <= 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const totalScore = totalAchievement;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic uppercase">
            <Zap className="w-8 h-8 text-blue-600 fill-blue-600" /> My Performance
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Track your goals and operational efficiency</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <Calendar className="w-5 h-5 text-gray-400 ml-2" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0 font-bold text-gray-700">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100">
              {periods.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-3xl border-none shadow-xl shadow-blue-50 bg-blue-600 text-white overflow-hidden relative group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Achievement</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black italic">{totalScore.toFixed(1)}%</span>
                <TrendingUp className="w-6 h-6 mb-2 text-blue-200" />
              </div>
              <p className="text-[10px] mt-4 font-bold text-blue-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Weighted average across all goals
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-xl shadow-emerald-50 bg-emerald-500 text-white overflow-hidden relative group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Bonus Estimator</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black italic">x{(totalScore / 100).toFixed(2)}</span>
                <Star className="w-6 h-6 mb-2 text-emerald-100 fill-emerald-100" />
              </div>
              <p className="text-[10px] mt-4 font-bold text-emerald-50 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Multiplier for your target bonus
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-100 bg-white overflow-hidden flex flex-col justify-center px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Status</p>
                <p className="text-lg font-black text-gray-900 uppercase italic">Review Pending</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">Sycing performance data...</div>
        ) : assignments.length === 0 ? (
          <div className="col-span-full bg-white rounded-[2rem] border-2 border-dashed border-gray-100 py-24 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Target className="w-10 h-10" />
            </div>
            <p className="font-bold text-gray-900 uppercase tracking-widest text-sm mb-1">No Goals Found</p>
            <p className="text-xs">You haven't been assigned any KPIs for this period yet.</p>
          </div>
        ) : (
          assignments.map(a => {
            const achievement = calculateAchievement(a.actual_value, a.target_value);
            const isSelfUpdate = updatingId === a.id;

            return (
              <div key={a.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-50 group hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Metric Goal</span>
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">Weight: {a.weight}%</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{a.kpi_library.name}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1 pr-6">{a.kpi_library.description || "Continuous improvement of specific operational metrics."}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-3xl flex flex-col items-center justify-center font-black italic shadow-lg shadow-blue-100 border-2 ${achievement >= 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    achievement >= 80 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-red-50 text-red-500 border-red-100"
                    }`}>
                    <span className="text-lg leading-none">{achievement}</span>
                    <span className="text-[8px] uppercase font-black not-italic">%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <span>Performance Progress</span>
                    <span>{a.actual_value} / {a.target_value} {a.kpi_library.unit}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 relative ${achievement >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                        achievement >= 80 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      style={{ width: `${Math.min(100, achievement)}%` }}
                    >
                      <div className="absolute top-0 right-0 h-full w-4 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${a.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">{a.status}</span>
                  </div>

                  {isSelfUpdate ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="New Value"
                        value={updateValue}
                        onChange={(e) => setUpdateValue(e.target.value)}
                        className="w-24 h-9 font-bold bg-white"
                      />
                      <Button size="sm" onClick={() => handleUpdateActual(a.id)} className="bg-blue-600 h-9 font-black uppercase tracking-widest text-[10px] px-4">Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setUpdatingId(null)} className="h-9 px-3 text-gray-400">✕</Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setUpdatingId(a.id);
                        setUpdateValue(a.actual_value.toString());
                      }}
                      className="text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest text-[10px] group/btn"
                    >
                      Update Progress <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
