"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Settings, Save, Clock, Percent } from "lucide-react";

export default function PayrollSettingsPage() {
  const [rate, setRate] = useState<string>("10.5");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const SETTING_KEY = "social_insurance_rate";

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch(`/api/admin/settings/${SETTING_KEY}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.value) setRate(data.value);
          if (data.updated_at) setLastUpdated(data.updated_at);
        }
      } catch (error) {
        console.error("Failed to fetch setting:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSetting();
  }, []);

  const handleSave = async () => {
    // Basic validation
    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid percentage between 0 and 100.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: SETTING_KEY, value: rate }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLastUpdated(data.updated_at);
        toast({
          title: "Settings Saved",
          description: `Social Insurance Rate updated to ${rate}%`,
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while saving settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll System Settings</h1>
          <p className="text-slate-500 text-sm">Configure global parameters for payroll calculation</p>
        </div>
      </div>

      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent size={20} className="text-blue-500" />
            Social Insurance Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="rate" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Social Insurance Rate (%)
              </Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pl-4 pr-10 h-12 bg-slate-50 border-none focus-visible:ring-blue-500 text-lg font-medium"
                  placeholder="10.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-xs text-slate-400">
                This rate is applied to the base salary during monthly payroll generation.
                Default value is usually 10.5%.
              </p>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
                <Clock size={12} />
                <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 h-10 px-8 rounded-lg shadow-sm transition-all"
            >
              {saving ? "Saving..." : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-4">
        <div className="text-amber-500 shrink-0">
          <Clock size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-800 text-sm">Important Note</h4>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            Changing these values will affect all <strong>future</strong> payroll generations. 
            Existing payslips will not be automatically updated. To apply changes to the current month, 
            you must regenerate the payroll.
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
