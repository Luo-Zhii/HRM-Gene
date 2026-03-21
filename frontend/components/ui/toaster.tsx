// FILE: components/ui/toaster.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-[350px] max-w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map(function (t) {
        let Icon = Info;
        let colorClass = "bg-white border-slate-200 text-slate-800";
        let iconColor = "text-blue-500";

        if (t.variant === "success") {
          Icon = CheckCircle2;
          colorClass = "bg-green-50 border-green-200 text-green-900";
          iconColor = "text-green-600";
        } else if (t.variant === "destructive" || (t.variant as any) === "error") {
          Icon = AlertCircle;
          colorClass = "bg-red-50 border-red-200 text-red-900";
          iconColor = "text-red-600";
        } else if ((t.variant as any) === "warning") {
          Icon = AlertTriangle;
          colorClass = "bg-orange-50 border-orange-200 text-orange-900";
          iconColor = "text-orange-600";
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-right-8 fade-in ${colorClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="grid gap-1 flex-1">
              {t.title && <h3 className="text-sm font-bold">{t.title}</h3>}
              {t.description && <p className="text-sm opacity-90">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute right-2 top-2 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 hover:bg-black/5 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}