"use client";
import React, { useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  PartyPopper, 
  ChevronRight, 
  Navigation,
  Sparkles,
  MapPin,
  Music,
  Heart,
  Star,
  Flag,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Holiday {
  name: string;
  date: string;
  color: string;
}

const colorMap: Record<string, { bg: string, text: string, border: string, accent: string, gradient: string }> = {
  blue: { 
    bg: "bg-blue-50", 
    text: "text-blue-700", 
    border: "border-blue-100", 
    accent: "bg-blue-600",
    gradient: "from-blue-50 to-indigo-50"
  },
  amber: { 
    bg: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-100", 
    accent: "bg-amber-600",
    gradient: "from-amber-50 to-orange-50"
  },
  emerald: { 
    bg: "bg-emerald-50", 
    text: "text-emerald-700", 
    border: "border-emerald-100", 
    accent: "bg-emerald-600",
    gradient: "from-emerald-50 to-teal-50"
  },
  indigo: { 
    bg: "bg-indigo-50", 
    text: "text-indigo-700", 
    border: "border-indigo-100", 
    accent: "bg-indigo-600",
    gradient: "from-indigo-50 to-purple-50"
  },
  orange: { 
    bg: "bg-orange-50", 
    text: "text-orange-700", 
    border: "border-orange-100", 
    accent: "bg-orange-600",
    gradient: "from-orange-50 to-red-50"
  },
  rose: { 
    bg: "bg-rose-50", 
    text: "text-rose-700", 
    border: "border-rose-100", 
    accent: "bg-rose-600",
    gradient: "from-rose-50 to-pink-50"
  },
};

const holidayIcons: Record<string, any> = {
  "New Year": Sparkles,
  "Tet Holiday": Music,
  "Hung Kings' Festival": Navigation,
  "Reunification Day": Heart,
  "International Workers' Day": Star,
  "National Day": Flag,
};

export default function HolidayCalendarPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetch("/api/dashboard/holidays")
      .then(res => res.json())
      .then(data => {
        setHolidays(data);
        // Find nearest upcoming holiday
        const nearest = data.find((h: Holiday) => new Date(h.date) >= new Date()) || data[0];
        setSelectedHoliday(nearest);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch holidays", err);
        setLoading(false);
      });

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    if (!selectedHoliday) return null;
    const target = new Date(selectedHoliday.date);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [selectedHoliday, now]);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-blue-50 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const activeTheme = selectedHoliday ? colorMap[selectedHoliday.color] : colorMap.blue;
  const SelectedIcon = selectedHoliday ? (holidayIcons[selectedHoliday.name] || PartyPopper) : PartyPopper;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Holiday Hub</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Discover upcoming celebrations for 2026
          </p>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group bg-blue-50 px-4 py-2 rounded-full transition-all">
          Back to Dashboard <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Dynamic Countdown Widget */}
      {selectedHoliday && countdown && (
        <div className={`mx-6 p-10 md:p-14 rounded-[3rem] border transition-all duration-700 shadow-2xl shadow-gray-100 relative overflow-hidden group ${activeTheme.bg} ${activeTheme.border}`}>
          <div className={`absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-[2000ms] ${activeTheme.text}`}>
             <SelectedIcon size={320} />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className={`flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${activeTheme.text} ${activeTheme.border} bg-white/50 backdrop-blur-sm`}>
                  <Clock size={12} /> Countdown to Celebration
                </div>
                <h2 className={`text-5xl md:text-7xl font-black leading-tight ${activeTheme.text}`}>{selectedHoliday.name}</h2>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTheme.accent} text-white shadow-lg`}>
                    <Calendar size={20} />
                  </div>
                  <p className={`text-xl font-bold ${activeTheme.text} opacity-80`}>
                    {new Date(selectedHoliday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className={`h-1.5 w-24 rounded-full ${activeTheme.accent} opacity-20`} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-md border border-white p-5 md:p-7 rounded-[2rem] text-center shadow-sm">
                  <div className={`text-3xl md:text-5xl font-black mb-1 ${activeTheme.text}`}>{String(item.value).padStart(2, '0')}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${activeTheme.text}`}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Holiday List Grid */}
      <div className="px-6 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 italic">
            <Sparkles size={28} className="text-orange-500" /> Select a Holiday
          </h3>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full">
            Click any card to update countdown
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {holidays.map((h, idx) => {
            const theme = colorMap[h.color] || colorMap.blue;
            const Icon = holidayIcons[h.name] || PartyPopper;
            const isSelected = selectedHoliday?.name === h.name;
            const isPast = new Date(h.date) < new Date(now.toDateString());
            const nearestNext = holidays.find(hd => new Date(hd.date) >= new Date(now.toDateString()));
            const isNearest = nearestNext?.name === h.name;
            
            return (
              <button 
                key={idx} 
                onClick={() => setSelectedHoliday(h)}
                className={`text-left p-8 rounded-[2.5rem] border transition-all duration-500 relative group
                  ${isSelected 
                    ? `bg-white ${theme.border} ring-[6px] ring-offset-4 ring-${h.color}-100 scale-[1.03] shadow-2xl` 
                    : isPast 
                      ? 'bg-gray-50 border-gray-100 grayscale opacity-60' 
                      : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:scale-[1.02]'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-5 rounded-2xl transition-all duration-500 shadow-md ${isSelected ? `${theme.accent} text-white` : `bg-gray-100 text-gray-400 group-hover:${theme.accent} group-hover:text-white`}`}>
                    <Icon size={32} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isNearest && (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 py-1.5 px-3 bg-blue-50 rounded-full border border-blue-100 animate-pulse">Next Up</span>
                    )}
                    {isSelected && (
                      <div className={`w-2 h-2 rounded-full ${theme.accent}`} />
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className={`text-2xl font-black transition-colors ${isPast ? 'text-gray-400' : isSelected ? theme.text : 'text-gray-900'}`}>{h.name}</h4>
                  <p className={`text-sm font-bold flex items-center gap-1.5 ${isPast ? 'text-gray-300' : 'text-gray-500'}`}>
                    <Calendar size={14} />
                    {new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className={`mt-8 flex items-center justify-between transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>View Countdown</span>
                  <ArrowRight size={18} className={theme.text} />
                </div>

                {isPast && (
                  <div className="absolute top-8 right-8 text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">Passed</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
