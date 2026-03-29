"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/useAuth";
import { useCompany } from "@/src/context/CompanyContext";
import { Upload, Camera, Save, ShieldAlert, DollarSign, Building, Settings, CheckCircle2, AlertCircle } from "lucide-react";

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { settings, refreshSettings, updateLogo } = useCompany();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    tax_id: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    base_currency: "USD",
    TIMEZONE: "",
    PAYROLL_ROUNDING_RULE: "",
    PASSWORD_POLICIES: "",
    AUTO_LOGOUT_TIME: "",
    COMPANY_IP_WHITELIST: "",
  });

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission = user.permissions?.includes("manage:system");
      if (!hasPermission) {
        setStatusMessage({ type: "error", text: "You do not have permission to access this page." });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  const loadGenericSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const kvData: Record<string, string> = {};
        data.forEach((s: any) => { kvData[s.key] = s.value; });
        
        setFormData(prev => ({
          ...prev,
          TIMEZONE: kvData["TIMEZONE"] || "",
          PAYROLL_ROUNDING_RULE: kvData["PAYROLL_ROUNDING_RULE"] || "",
          PASSWORD_POLICIES: kvData["PASSWORD_POLICIES"] || "",
          AUTO_LOGOUT_TIME: kvData["AUTO_LOGOUT_TIME"] || "",
          COMPANY_IP_WHITELIST: kvData["COMPANY_IP_WHITELIST"] || "",
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user && user.permissions?.includes("manage:system")) {
      setLoading(true);
      Promise.all([loadGenericSettings(), refreshSettings()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        company_name: settings.company_name || "",
        tax_id: settings.tax_id || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        zip: settings.zip || "",
        country: settings.country || "",
        base_currency: settings.base_currency || "USD",
      }));
    }
  }, [settings]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const apiBase = "/api";
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/company-profile/logo`, {
        method: "PATCH",
        body: uploadData,
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        updateLogo(data.logo_url);
        setStatusMessage({ type: "success", text: "Logo updated successfully!" });
      } else {
        throw new Error("Logo upload failed");
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "Failed to upload logo." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const apiBase = "/api";
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // 1. Save Company Profile
      const companyPayload = {
        company_name: formData.company_name,
        tax_id: formData.tax_id,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        base_currency: formData.base_currency,
      };

      const companyRes = await fetch(`${apiBase}/company-profile`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(companyPayload),
        credentials: "include",
      });

      if (!companyRes.ok) throw new Error("Failed to update company profile");

      // 2. Save Generic KV Settings
      const kvKeys = ["TIMEZONE", "PAYROLL_ROUNDING_RULE", "PASSWORD_POLICIES", "AUTO_LOGOUT_TIME", "COMPANY_IP_WHITELIST"];
      await Promise.all(kvKeys.map(key => {
        return fetch(`${apiBase}/admin/settings`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ key, value: formData[key as keyof typeof formData] }),
          credentials: "include",
        });
      }));

      await refreshSettings();
      setStatusMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error saving settings";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.permissions?.includes("manage:system")) {
    return null; // Handled by useEffect redirect
  }

  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3001';
  const currentLogoUrl = settings?.logo_url ? `${backendBaseUrl}${settings.logo_url}` : null;
  const companyInitials = formData.company_name ? formData.company_name.substring(0, 2).toUpperCase() : "CO";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header containing the existing Create button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-inter">Company Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage organizational details, localization, and system security.</p>
          </div>
          <Link href="/admin/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 shadow-sm">
              Create Admin/Dev Account
            </Button>
          </Link>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
            statusMessage.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
            statusMessage.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
            "bg-blue-50 text-blue-800 border-blue-200"
          }`}>
            {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span className="font-medium text-sm">{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Card 1: Company Information */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100">
            <CardHeader className="bg-white border-b border-gray-50 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <Building className="w-5 h-5 text-blue-600" /> Company Information
              </CardTitle>
              <CardDescription className="text-gray-500">Update company identity and primary address details.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Logo Upload Box (w-32 h-32 prominent) */}
              <div className="md:col-span-3 flex flex-col items-center space-y-3">
                <Label className="text-sm font-semibold text-gray-700 w-full text-left">Company Logo</Label>
                <div className="relative group rounded-2xl w-32 h-32 shadow-sm border border-gray-100">
                  <div className="w-full h-full rounded-2xl bg-gray-50/50 flex items-center justify-center overflow-hidden transition-all group-hover:bg-gray-100 relative">
                    {uploading ? (
                      <div className="animate-pulse flex flex-col items-center justify-center w-full h-full bg-blue-50">
                        <div className="w-8 h-8 bg-blue-200 rounded-full mb-2"></div>
                      </div>
                    ) : currentLogoUrl ? (
                      <img 
                        src={currentLogoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain p-2 bg-white" 
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none'; 
                          // When broken, we allow the container background and layout to stand in gracefully
                        }} 
                      />
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center w-full h-full text-gray-400">
                        <div className="text-2xl font-bold tracking-widest text-gray-300 mb-1">{companyInitials}</div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400/80 flex items-center gap-1 mt-1"><Upload className="w-3 h-3"/> Upload</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-xl shadow-lg bg-white border-gray-200 hover:bg-gray-50 text-blue-600 h-9 w-9"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </div>

              <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Company Name</Label>
                  <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="DashStack Inc." className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Tax ID</Label>
                  <Input name="tax_id" value={formData.tax_id} onChange={handleChange} placeholder="e.g. 12-3456789" className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Street Address</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Innovation Way" className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">City</Label>
                  <Input name="city" value={formData.city} onChange={handleChange} placeholder="San Francisco" className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">State / Province</Label>
                  <Input name="state" value={formData.state} onChange={handleChange} placeholder="CA" className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Zip Code</Label>
                  <Input name="zip" value={formData.zip} onChange={handleChange} placeholder="94103" className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Country</Label>
                  <Input name="country" value={formData.country} onChange={handleChange} placeholder="United States" className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 2: Payroll & Currency Rules */}
            <Card className="border-none shadow-sm bg-white rounded-2xl ring-1 ring-gray-100 flex flex-col">
              <CardHeader className="bg-white border-b border-gray-50 pb-4 shrink-0">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                  <DollarSign className="w-5 h-5 text-emerald-600" /> Payroll & Currency Rules
                </CardTitle>
                <CardDescription className="text-gray-500">Configure financial and region presets.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5 flex-1">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Base Currency</Label>
                  <Input name="base_currency" value={formData.base_currency} onChange={handleChange} placeholder="e.g. USD, EUR, VND" className="h-11 rounded-xl border-gray-200" />
                  <p className="text-[11px] text-gray-500 font-medium">Primary currency used across dashlets and payslips.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Timezone</Label>
                  <Input name="TIMEZONE" value={formData.TIMEZONE} onChange={handleChange} placeholder="e.g. UTC, Asia/Ho_Chi_Minh" className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Payroll Rounding Rule</Label>
                  <Input name="PAYROLL_ROUNDING_RULE" value={formData.PAYROLL_ROUNDING_RULE} onChange={handleChange} placeholder="e.g. Nearest 1000, No Rounding" className="h-11 rounded-xl border-gray-200" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Security & System */}
            <Card className="border-none shadow-sm bg-white rounded-2xl ring-1 ring-gray-100 flex flex-col">
              <CardHeader className="bg-white border-b border-gray-50 pb-4 shrink-0">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                  <ShieldAlert className="w-5 h-5 text-red-500" /> Security & System
                </CardTitle>
                <CardDescription className="text-gray-500">System access policies and protections.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5 flex-1">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password Policies</Label>
                  <Input name="PASSWORD_POLICIES" value={formData.PASSWORD_POLICIES} onChange={handleChange} placeholder="e.g. Min 8 chars, 1 Special Char" className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Auto-logout Time</Label>
                  <Input name="AUTO_LOGOUT_TIME" value={formData.AUTO_LOGOUT_TIME} onChange={handleChange} placeholder="e.g. 30 minutes, 1 hour" className="h-11 rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Company IP Whitelist</Label>
                  <Input name="COMPANY_IP_WHITELIST" value={formData.COMPANY_IP_WHITELIST} onChange={handleChange} placeholder="e.g. 192.168.1.1, 10.0.0.5" className="h-11 rounded-xl border-gray-200 font-mono text-sm" />
                  <p className="text-[11px] text-gray-500 font-medium">Restrict admin dashboard access to designated IPs (comma-separated).</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end pt-4 pb-10">
             <Button type="button" onClick={() => router.back()} variant="ghost" className="mr-3 font-semibold text-gray-600 hover:bg-gray-100 h-11 px-6 rounded-xl">
               Discard
             </Button>
             <Button type="submit" disabled={saving || uploading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md h-11 px-8 rounded-xl transition-all">
                {saving ? "Saving..." : "Save Settings"}
                <Save className="ml-2 w-4 h-4" />
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
