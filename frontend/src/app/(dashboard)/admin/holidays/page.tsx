"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar, Plus, Trash2, Edit2, Download, RefreshCw,
  X, Globe, Building2, Star, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, Loader2
} from "lucide-react";
import { DatePicker } from "@/components/ui/datepicker";

interface Holiday {
  id: number;
  name: string;
  date: string;
  end_date?: string;
  type: "national" | "company" | "optional";
  description?: string;
  is_recurring: boolean;
  year: number;
}

interface HolidayStats {
  total: number;
  national: number;
  company: number;
  optional: number;
  year: number;
}

const TYPE_CONFIG = {
  national: { label: "National Holiday", color: "bg-red-100 text-red-700 border-red-200", icon: Globe, dot: "bg-red-500" },
  company:  { label: "Company Holiday", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Building2, dot: "bg-blue-500" },
  optional: { label: "Optional Leave", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Star, dot: "bg-amber-500" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function HolidaysPage() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [stats, setStats] = useState<HolidayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  // Modal state
  const [modal, setModal] = useState<{ open: boolean; holiday?: Holiday }>({ open: false });
  const [form, setForm] = useState({ name: "", date: "", end_date: "", type: "national", description: "", is_recurring: true });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const isAdminOrHR = useMemo(() => {
    const pos = (user?.role || user?.position?.position_name || "").toLowerCase();
    return ["admin","system admin","director","hr manager","hr"].some(r => pos === r || pos.includes(r));
  }, [user]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.all([
        fetch(`/api/admin/holidays?year=${selectedYear}`, { credentials: "include" }),
        fetch(`/api/admin/holidays/stats`, { credentials: "include" }),
      ]);
      if (hRes.ok) setHolidays(await hRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedYear]);

  const openCreate = () => {
    setForm({ name: "", date: `${selectedYear}-01-01`, end_date: "", type: "national", description: "", is_recurring: true });
    setModal({ open: true });
  };
  const openEdit = (h: Holiday) => {
    setForm({ name: h.name, date: h.date, end_date: h.end_date || "", type: h.type, description: h.description || "", is_recurring: h.is_recurring });
    setModal({ open: true, holiday: h });
  };

  const handleSave = async () => {
    if (!form.name || !form.date) return showToast("Name and date are required", "error");
    setSaving(true);
    try {
      const url = modal.holiday ? `/api/admin/holidays/${modal.holiday.id}` : "/api/admin/holidays";
      const method = modal.holiday ? "PUT" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: parseInt(form.date.split("-")[0]) }),
      });
      if (res.ok) {
        showToast(modal.holiday ? "Holiday updated!" : "Holiday created!");
        setModal({ open: false });
        load();
      } else {
        const j = await res.json();
        showToast(j.message || "Failed to save", "error");
      }
    } catch { showToast("Network error", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this holiday?")) return;
    const res = await fetch(`/api/admin/holidays/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { showToast("Deleted!"); load(); }
    else showToast("Failed to delete", "error");
  };

  const handleSeedVN = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`/api/admin/holidays/seed/vietnam/${selectedYear}`, { method: "POST", credentials: "include" });
      const j = await res.json();
      if (res.ok) { showToast(`Seeded ${j.seeded} Vietnamese holidays for ${selectedYear}!`); load(); }
      else showToast(j.message || "Seed failed", "error");
    } catch { showToast("Network error", "error"); }
    setSeeding(false);
  };

  // Calendar helpers
  const holidayDates = useMemo(() => {
    const map: Record<string, Holiday[]> = {};
    holidays.forEach(h => {
      if (!map[h.date]) map[h.date] = [];
      map[h.date].push(h);
    });
    return map;
  }, [holidays]);

  const calDays = useMemo(() => {
    const firstDay = new Date(selectedYear, calMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, calMonth + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [selectedYear, calMonth]);

  // Group holidays by month
  const holidaysByMonth = useMemo(() => {
    const g: Record<number, Holiday[]> = {};
    holidays.forEach(h => {
      const m = new Date(h.date + "T00:00:00").getMonth();
      if (!g[m]) g[m] = [];
      g[m].push(h);
    });
    return g;
  }, [holidays]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 duration-200 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              Holiday Management
            </h1>
            <p className="text-gray-500 mt-1.5 ml-14">Manage public holidays and company leave days</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <span className="font-bold text-gray-800 px-2 min-w-[4ch] text-center">{selectedYear}</span>
              <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button onClick={() => setViewMode("list")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>List</button>
              <button onClick={() => setViewMode("calendar")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === "calendar" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Calendar</button>
            </div>

            {isAdminOrHR && (
              <>
                <button onClick={handleSeedVN} disabled={seeding} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all disabled:opacity-60">
                  {seeding ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Seed Vietnam {selectedYear}
                </button>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all">
                  <Plus size={16} /> Add Holiday
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Holidays", value: holidays.length, color: "text-gray-900", bg: "bg-gray-50", border: "border-gray-200" },
              { label: "National", value: holidays.filter(h => h.type === "national").length, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
              { label: "Company", value: holidays.filter(h => h.type === "company").length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { label: "Optional", value: holidays.filter(h => h.type === "optional").length, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 shadow-sm`}>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedYear}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : viewMode === "list" ? (
          /* LIST VIEW */
          <div className="space-y-6">
            {MONTH_NAMES.map((monthName, mIdx) => {
              const mHolidays = holidaysByMonth[mIdx] || [];
              if (mHolidays.length === 0) return null;
              return (
                <div key={mIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">{MONTHS[mIdx]}</span>
                      {monthName} {selectedYear}
                    </h2>
                    <span className="text-sm text-gray-500 font-medium">{mHolidays.length} holiday{mHolidays.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {mHolidays.sort((a, b) => a.date.localeCompare(b.date)).map(h => {
                      const cfg = TYPE_CONFIG[h.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.national;
                      const isPast = h.date < today;
                      return (
                        <div key={h.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors ${isPast ? "opacity-60" : ""}`}>
                          <div className="text-center min-w-[52px] shrink-0">
                            <p className="text-xl font-black text-gray-900">{new Date(h.date + "T00:00:00").getDate().toString().padStart(2, "0")}</p>
                            <p className="text-xs text-gray-400 font-semibold uppercase">{MONTHS[new Date(h.date + "T00:00:00").getMonth()]}</p>
                          </div>
                          <div className={`w-1 h-10 rounded-full ${cfg.dot} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-gray-900">{h.name}</h3>
                              {h.is_recurring && <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-2 py-0.5 font-bold uppercase tracking-wide">Recurring</span>}
                            </div>
                            {h.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{h.description}</p>}
                            {h.end_date && h.end_date !== h.date && (
                              <p className="text-xs text-gray-400 mt-0.5">Until {formatDate(h.end_date)}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.color} shrink-0`}>{cfg.label}</span>
                          {isAdminOrHR && (
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEdit(h)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 size={15} />
                              </button>
                              <button onClick={() => handleDelete(h.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {holidays.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">No holidays for {selectedYear}</h3>
                <p className="text-gray-400 text-sm mt-2">Click "Seed Vietnam {selectedYear}" to add Vietnamese public holidays</p>
              </div>
            )}
          </div>
        ) : (
          /* CALENDAR VIEW */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Month navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button onClick={() => setCalMonth(m => m === 0 ? 11 : m - 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <h2 className="font-bold text-gray-900 text-lg">{MONTH_NAMES[calMonth]} {selectedYear}</h2>
              <button onClick={() => setCalMonth(m => m === 11 ? 0 : m + 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${d === "Sun" || d === "Sat" ? "text-red-400" : "text-gray-400"}`}>{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: calDays.firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-gray-50" />
              ))}
              {Array.from({ length: calDays.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${selectedYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayHolidays = holidayDates[dateStr] || [];
                const isToday = dateStr === today;
                const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
                return (
                  <div key={day} className={`min-h-[80px] border-b border-r border-gray-50 p-2 ${isWeekend ? "bg-gray-50/50" : ""} ${isToday ? "ring-2 ring-inset ring-blue-500" : ""}`}>
                    <p className={`text-sm font-bold mb-1 ${isToday ? "text-blue-600" : isWeekend ? "text-gray-400" : "text-gray-700"}`}>{day}</p>
                    {dayHolidays.map(h => {
                      const cfg = TYPE_CONFIG[h.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.national;
                      return (
                        <div key={h.id} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mb-0.5 truncate ${cfg.color} border cursor-pointer`} title={h.name}>
                          {h.name}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-6 flex-wrap">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-semibold text-gray-600">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                {modal.holiday ? "Edit Holiday" : "Add Holiday"}
              </h2>
              <button onClick={() => setModal({ open: false })} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Holiday Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. New Year's Day" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                  <DatePicker
                    selected={parseLocalDate(form.date)}
                    onSelect={date => setForm(f => ({ ...f, date: date ? getLocalDateString(date) : "" }))}
                    maxDate={parseLocalDate(form.end_date) || undefined}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date <span className="text-gray-400">(optional)</span></label>
                  <DatePicker
                    selected={parseLocalDate(form.end_date)}
                    onSelect={date => setForm(f => ({ ...f, end_date: date ? getLocalDateString(date) : "" }))}
                    minDate={parseLocalDate(form.date) || undefined}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type: key }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${form.type === key ? cfg.color + " shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${form.is_recurring ? "bg-blue-600" : "bg-gray-300"}`}
                  onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_recurring ? "left-6" : "left-1"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Recurring Annually</p>
                  <p className="text-xs text-gray-500">This holiday repeats every year</p>
                </div>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal({ open: false })} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {modal.holiday ? "Save Changes" : "Create Holiday"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
