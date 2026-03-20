"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Edit2, Save, X, Mail, Phone, Briefcase, DollarSign, FileText, AlertTriangle,
  CreditCard, Camera, Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// ĐỊNH NGHĨA INTERFACES
// ==========================================
interface BankInfo {
  bank_info_id?: number; bank_name: string;
  account_number: string; account_holder_name: string;
}

interface ProfileData {
  employee_id: number; first_name: string; last_name: string;
  email: string; phone_number?: string; address?: string; avatar_url?: string;
  description?: string; dark_mode?: boolean;
  email_notifications?: boolean; task_reminders?: boolean;
  announcements?: boolean; daily_reports?: boolean;
  two_factor_auth?: boolean; push_notifications?: boolean;
  position?: { position_id: number; position_name: string; };
  department?: { department_id: number; department_name: string; };
  bankInfo?: BankInfo;
}

interface Contract {
  contract_id: number; contract_number: string; contract_type: string;
  start_date: string; end_date?: string; status: string;
  salary_rate: string; file_url?: string;
}

interface Violation {
  violation_id: number; date: string; violation_type: string;
  description: string; penalty_amount: string; status: string;
}

interface SalaryHistory {
  history_id: number; old_salary: string; new_salary: string;
  change_date: string; reason?: string;
}

// ==========================================
// COMPONENT CUSTOM TOGGLE (Tránh lỗi CSS shadcn)
// ==========================================
function CustomToggle({ checked, onChange, disabled }: { checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

// ==========================================
// NỘI DUNG CHÍNH CỦA TRANG PROFILE
// ==========================================
function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // State quản lý EDIT 
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State quản lý FORM DATA
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", phone_number: "", address: "", description: ""
  });
  const [bankFormData, setBankFormData] = useState({
    bank_name: "", account_number: "", account_holder_name: ""
  });

  // State cho các nút Toggle
  const [settings, setSettings] = useState({
    email_notifications: true, task_reminders: true, announcements: true, daily_reports: false,
    dark_mode: false, two_factor_auth: false, push_notifications: true
  });

  const viewingOwnProfile = !employeeId || parseInt(employeeId) === user?.employee_id;
  const targetEmployeeId = employeeId ? parseInt(employeeId) : user?.employee_id;
  const isHRorAdmin = user?.permissions?.includes("manage:employees") || user?.permissions?.includes("manage:system") || user?.permissions?.includes("manage:payroll");
  const canViewSalary = viewingOwnProfile || isHRorAdmin;

  const loadDataIntoState = (data: ProfileData) => {
    setFormData({
      first_name: data.first_name || "", last_name: data.last_name || "", email: data.email || "",
      phone_number: data.phone_number || "", address: data.address || "",
      description: data.description || ""
    });
    if (data.bankInfo) {
      setBankFormData({ bank_name: data.bankInfo.bank_name || "", account_number: data.bankInfo.account_number || "", account_holder_name: data.bankInfo.account_holder_name || "" });
    }
    setSettings({
      email_notifications: data.email_notifications ?? true, task_reminders: data.task_reminders ?? true,
      announcements: data.announcements ?? true, daily_reports: data.daily_reports ?? false,
      dark_mode: data.dark_mode ?? false, two_factor_auth: data.two_factor_auth ?? false, push_notifications: data.push_notifications ?? true
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading || (!user && !employeeId)) return;
      try {
        setLoading(true);
        let url = "/api/auth/profile";
        if (employeeId && user && parseInt(employeeId) !== user.employee_id) url = `/api/employees/${employeeId}`;
        const response = await fetch(url, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          loadDataIntoState(data);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load profile details" });
      } finally { setLoading(false); }
    };
    loadProfile();
  }, [authLoading, user, employeeId, toast]);

  useEffect(() => {
    const loadHRData = async () => {
      if (!targetEmployeeId) return;
      try {
        const contractsRes = await fetch(employeeId ? `/api/contracts?employeeId=${employeeId}` : "/api/contracts", { credentials: "include" });
        if (contractsRes.ok) setContracts(await contractsRes.json());
        const violationsRes = await fetch(employeeId ? `/api/violations?employeeId=${employeeId}` : "/api/violations", { credentials: "include" });
        if (violationsRes.ok) setViolations(await violationsRes.json());
        if (canViewSalary) {
          const salaryRes = await fetch(`/api/salary-history${employeeId ? `?employeeId=${employeeId}` : ""}`, { credentials: "include" });
          if (salaryRes.ok) setSalaryHistory(await salaryRes.json());
        }
      } catch (e) { console.error("Failed to load HR data", e); }
    };
    if (user) loadHRData();
  }, [user, targetEmployeeId, employeeId, canViewSalary]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };

  const handleDiscard = () => {
    if (profileData) loadDataIntoState(profileData);
    setIsEditing(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/profile/update", {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        // Gộp lưu toàn bộ Form, Setting và Bank vào 1 cục API
        body: JSON.stringify({ ...formData, ...settings, bank_info: bankFormData }),
      });
      if (!response.ok) throw new Error("Failed to update profile");

      const updatedData = await response.json();
      setProfileData(updatedData);
      loadDataIntoState(updatedData);

      toast({ variant: "default", title: "Success", description: "All settings saved successfully!" });
      setIsEditing(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Error saving settings" });
    } finally { setIsSaving(false); }
  };

  const formatCurrency = (value: string | number) => { const num = typeof value === "string" ? parseFloat(value) : value; return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num); };
  const formatDate = (dateString: string) => { return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); };
  const initials = `${profileData?.first_name?.[0]?.toUpperCase() || ""}${profileData?.last_name?.[0]?.toUpperCase() || ""}` || "U";

  if (loading || authLoading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading profile...</div>;
  if (!profileData) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Profile not found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-inter">
      <div className="max-w-[1200px] mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

        {/* HEADER TỔNG */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account preferences, notifications, and HR details.</p>
          </div>

          {/* Nút Edit tổng bật/tắt chế độ sửa */}
          {viewingOwnProfile && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>

        {/* =========================================
            SECTION 1: PERSONAL INFO (FIGMA STYLE)
           ========================================= */}
        <div className="border border-blue-400 rounded-2xl overflow-hidden mb-10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* Cột trái: Avatar */}
            <div className="md:col-span-3 border-r border-gray-100 p-8 flex flex-col items-center">
              <h2 className="text-base font-bold text-gray-900 mb-6 self-start w-full">Personal Information</h2>

              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-slate-500 text-3xl font-bold">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>

              {viewingOwnProfile && (
                <button className="text-blue-500 font-medium text-sm hover:text-blue-700 transition-colors">
                  Upload Avatar
                </button>
              )}
            </div>

            {/* Cột phải: Form nhập liệu */}
            <div className="md:col-span-9 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInputLight label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} disabled={!isEditing || !viewingOwnProfile} />
                <FormInputLight label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} disabled={!isEditing || !viewingOwnProfile} />
                <FormInputLight label="Email Address" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing || !viewingOwnProfile} type="email" />
                <FormInputLight label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} disabled={!isEditing || !viewingOwnProfile} type="tel" />
                <FormInputLight label="Address" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing || !viewingOwnProfile} />
                <FormInputLight label="Job Title" name="job_title" value={profileData.position?.position_name || "Employee"} disabled={true} />

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-gray-500 mb-2 block">Description / Bio</Label>
                  <Textarea name="description" value={formData.description} onChange={handleInputChange} disabled={!isEditing || !viewingOwnProfile} className="w-full bg-gray-50/50 border-gray-200 rounded-lg min-h-[100px] focus-visible:ring-blue-500 disabled:opacity-70" placeholder="Tell us about yourself..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            SECTION 2: CÀI ĐẶT PHỤ TRỢ MỚI
           ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 px-4">

          {/* Cột 1: Thông báo & Giao diện */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Notification Settings</h3>
              <ToggleItemLight title="Email messages" checked={settings.email_notifications} onChange={handleToggleChange('email_notifications')} disabled={!viewingOwnProfile || !isEditing} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Language & Appearance</h3>
              <ToggleItemLight title="Dark mode" checked={settings.dark_mode} onChange={handleToggleChange('dark_mode')} disabled={!viewingOwnProfile || !isEditing} />
            </div>
          </div>

          {/* Cột 2: Bảo mật */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Two-Factor Authentication</h3>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">Add an extra layer of security to your account. We will ask for a verification code when you sign in from a new device.</p>
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Enable 2FA</span>
                <div className="ml-auto">
                  <CustomToggle checked={settings.two_factor_auth} onChange={handleToggleChange('two_factor_auth')} disabled={!viewingOwnProfile || !isEditing} />
                </div>
              </div>
            </div>
          </div>

          {/* Cột 3: Push Notification */}
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Push Notifications</h3>
              <CustomToggle checked={settings.push_notifications} onChange={handleToggleChange('push_notifications')} disabled={!viewingOwnProfile || !isEditing} />
            </div>

            <div className={`space-y-1 transition-opacity ${settings.push_notifications ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <ToggleItemLight title="Task reminders" checked={settings.task_reminders} onChange={handleToggleChange('task_reminders')} disabled={!viewingOwnProfile || !isEditing} />
              <ToggleItemLight title="Announcements" checked={settings.announcements} onChange={handleToggleChange('announcements')} disabled={!viewingOwnProfile || !isEditing} />
              <ToggleItemLight title="Daily reports" checked={settings.daily_reports} onChange={handleToggleChange('daily_reports')} disabled={!viewingOwnProfile || !isEditing} />
            </div>
          </div>
        </div>

        {/* Nút Save/Discard dưới cùng */}
        {viewingOwnProfile && isEditing && (
          <div className="flex justify-end gap-3 mb-10 pt-6 border-t border-gray-100">
            <Button onClick={handleDiscard} variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600 border-none w-32 rounded-lg">Discard</Button>
            <Button onClick={handleSaveAll} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white w-32 rounded-lg shadow-md">{isSaving ? "Saving..." : "Save Changes"}</Button>
          </div>
        )}

        {/* =========================================
            SECTION 3: HR RECORDS (GỘP BANK VÀO ĐÂY)
           ========================================= */}
        <div className="mt-12 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">HR Administration Records</h2>

          <Accordion type="multiple" className="w-full space-y-4">

            {/* 0. BANK ACCOUNT (Đã đưa vào Accordion cho đồng bộ) */}
            <AccordionItem value="bank" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-gray-900 font-semibold"><div className="flex items-center gap-3"><CreditCard className="text-indigo-500 w-5 h-5" />Bank Account Information</div></AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-4 border-t border-gray-50">
                {isEditing && viewingOwnProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <FormInputLight label="Bank Name" name="bank_name" value={bankFormData.bank_name} onChange={handleBankInputChange} />
                    <FormInputLight label="Account Number" name="account_number" value={bankFormData.account_number} onChange={handleBankInputChange} />
                    <FormInputLight label="Account Holder" name="account_holder_name" value={bankFormData.account_holder_name} onChange={handleBankInputChange} className="uppercase" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Name</span><span className="text-sm font-medium text-gray-900">{profileData.bankInfo?.bank_name || "Not provided"}</span></div>
                    <div><span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Number</span><span className="text-sm font-medium text-gray-900 font-mono">{profileData.bankInfo?.account_number || "Not provided"}</span></div>
                    <div><span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder</span><span className="text-sm font-medium text-gray-900 uppercase">{profileData.bankInfo?.account_holder_name || "Not provided"}</span></div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 1. HỢP ĐỒNG LAO ĐỘNG */}
            <AccordionItem value="contracts" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-gray-900 font-semibold"><div className="flex items-center gap-3"><FileText className="text-blue-500 w-5 h-5" />Labor Contracts ({contracts.length})</div></AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 border-t border-gray-50">
                {contracts.length === 0 ? <p className="text-center py-6 text-gray-500">No contracts found.</p> : (
                  <Table><TableHeader><TableRow className="bg-gray-50 hover:bg-gray-50"><TableHead>Contract No.</TableHead><TableHead>Type</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Salary Rate</TableHead></TableRow></TableHeader>
                    <TableBody>{contracts.map((c) => (<TableRow key={c.contract_id} className={c.status === "Active" ? "bg-blue-50/30" : ""}><TableCell className="font-medium text-gray-900">{c.contract_number}</TableCell><TableCell className="text-gray-600">{c.contract_type}</TableCell><TableCell className="text-gray-600">{formatDate(c.start_date)}</TableCell><TableCell className="text-gray-600">{c.end_date ? formatDate(c.end_date) : "Open-ended"}</TableCell><TableCell><Badge variant={c.status === "Active" ? "default" : "outline"} className={c.status === "Active" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>{c.status}</Badge></TableCell><TableCell className="text-right font-semibold text-gray-900">{formatCurrency(c.salary_rate)}</TableCell></TableRow>))}</TableBody></Table>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 2. LỊCH SỬ LƯƠNG */}
            {canViewSalary && (
              <AccordionItem value="salary" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-gray-900 font-semibold"><div className="flex items-center gap-3"><DollarSign className="text-emerald-500 w-5 h-5" />Salary History</div></AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 border-t border-gray-50">
                  {salaryHistory.length === 0 ? <p className="text-center py-6 text-gray-500">No salary history recorded.</p> : (
                    <Table><TableHeader><TableRow className="bg-gray-50 hover:bg-gray-50"><TableHead>Date</TableHead><TableHead className="text-right">Old Salary</TableHead><TableHead className="text-right">New Salary</TableHead><TableHead>Change</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
                      <TableBody>{salaryHistory.slice().reverse().map((s) => { const oldS = parseFloat(s.old_salary); const newS = parseFloat(s.new_salary); const change = newS - oldS; return (<TableRow key={s.history_id}><TableCell className="text-gray-900 font-medium">{formatDate(s.change_date)}</TableCell><TableCell className="text-right text-gray-500">{formatCurrency(s.old_salary)}</TableCell><TableCell className="text-right font-bold text-gray-900">{formatCurrency(s.new_salary)}</TableCell><TableCell className={`font-semibold text-right ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>{change >= 0 ? "+" : ""}{formatCurrency(change)}</TableCell><TableCell className="text-gray-500 text-sm">{s.reason || "N/A"}</TableCell></TableRow>) })}</TableBody></Table>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* 3. VI PHẠM KỶ LUẬT */}
            <AccordionItem value="violations" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-gray-900 font-semibold"><div className="flex items-center gap-3"><AlertTriangle className="text-rose-500 w-5 h-5" />Violations & Discipline ({violations.length})</div></AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 border-t border-gray-50">
                {violations.length === 0 ? <p className="text-center py-6 text-gray-500">No violations recorded.</p> : (
                  <Table><TableHeader><TableRow className="bg-gray-50 hover:bg-gray-50"><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Penalty</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>{violations.map((v) => (<TableRow key={v.violation_id}><TableCell className="text-gray-900 font-medium">{formatDate(v.date)}</TableCell><TableCell className="font-semibold text-rose-600">{v.violation_type}</TableCell><TableCell className="max-w-xs truncate text-gray-600" title={v.description}>{v.description}</TableCell><TableCell className="text-right text-rose-600 font-semibold">{formatCurrency(v.penalty_amount)}</TableCell><TableCell><Badge variant={v.status === "Resolved" ? "default" : "destructive"} className={v.status === "Resolved" ? "bg-gray-500" : "bg-rose-500"}>{v.status}</Badge></TableCell></TableRow>))}</TableBody></Table>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Toaster />
      </div>
    </div>
  );
}

// ==========================================
// HELPER COMPONENTS (Light UI Figma)
// ==========================================
function FormInputLight({ label, ...props }: { label: string;[key: string]: any }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</Label>
      <Input {...props} className="w-full bg-gray-50/50 border-gray-200 rounded-lg h-10 focus-visible:ring-blue-500 disabled:opacity-60 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed" />
    </div>
  );
}

function ToggleItemLight({ title, checked, onChange, disabled }: { title: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <CustomToggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function ProfilePage() { return (<Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading...</div>}> <ProfileContent /> </Suspense>); }