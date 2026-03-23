"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Save, X, Mail, Phone, Briefcase, DollarSign, FileText, AlertTriangle, CreditCard, Camera, Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// ĐỊNH NGHĨA INTERFACES
// ==========================================
interface BankInfo { bank_info_id?: number; bank_name: string; account_number: string; account_holder_name: string; }
interface ProfileData {
  employee_id: number; first_name: string; last_name: string; email: string; phone_number?: string; address?: string; avatar_url?: string;
  description?: string; dark_mode?: boolean; email_notifications?: boolean; task_reminders?: boolean; announcements?: boolean; daily_reports?: boolean;
  two_factor_auth?: boolean; push_notifications?: boolean; position?: { position_id: number; position_name: string; }; bankInfo?: BankInfo;
}

// ==========================================
// CUSTOM TOGGLE COMPONENT
// ==========================================
function CustomToggle({ checked, onChange, disabled }: { checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </div>
  );
}

function ProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [hrData, setHrData] = useState({ contracts: [], violations: [], salary: [] });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", phone_number: "", address: "", description: "" });
  const [bankFormData, setBankFormData] = useState({ bank_name: "", account_number: "", account_holder_name: "" });
  const [settings, setSettings] = useState({ email_notifications: true, task_reminders: true, announcements: true, daily_reports: false, dark_mode: false, two_factor_auth: false, push_notifications: true });

  const viewingOwnProfile = !employeeId || parseInt(employeeId) === user?.employee_id;

  const syncState = (data: ProfileData) => {
    setFormData({ first_name: data.first_name || "", last_name: data.last_name || "", email: data.email || "", phone_number: data.phone_number || "", address: data.address || "", description: data.description || "" });
    if (data.bankInfo) setBankFormData({ bank_name: data.bankInfo.bank_name || "", account_number: data.bankInfo.account_number || "", account_holder_name: data.bankInfo.account_holder_name || "" });
    setSettings({
      email_notifications: data.email_notifications ?? true, task_reminders: data.task_reminders ?? true, announcements: data.announcements ?? true,
      daily_reports: data.daily_reports ?? false, dark_mode: data.dark_mode ?? false, two_factor_auth: data.two_factor_auth ?? false, push_notifications: data.push_notifications ?? true
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || (!user && !employeeId)) return;
      setLoading(true);
      try {
        const targetId = employeeId || user?.employee_id;
        const [profRes, contRes, violRes, salRes] = await Promise.all([
          fetch(employeeId ? `/api/employees/${employeeId}` : "/api/auth/profile", { credentials: "include" }),
          fetch(`/api/contracts?employeeId=${targetId}`, { credentials: "include" }),
          fetch(`/api/violations?employeeId=${targetId}`, { credentials: "include" }),
          (viewingOwnProfile || user?.permissions?.includes("manage:payroll")) ? fetch(`/api/salary-history?employeeId=${targetId}`, { credentials: "include" }) : Promise.resolve({ json: () => [] })
        ]);

        if (profRes.ok) {
          const d = await profRes.json();
          setProfileData(d);
          syncState(d);
        }

        const [c, v, s] = await Promise.all([contRes.json(), violRes.json(), salRes.json()]);

        // BẢO KÊ DỮ LIỆU: Ép kiểu mảng để chống lỗi .find() và .map()
        setHrData({
          contracts: Array.isArray(c) ? c : (c.data && Array.isArray(c.data)) ? c.data : [],
          violations: Array.isArray(v) ? v : (v.data && Array.isArray(v.data)) ? v.data : [],
          salary: Array.isArray(s) ? s : (s.data && Array.isArray(s.data)) ? s.data : []
        });
      } catch (e) {
        console.error(e);
        // BẢO KÊ LÚC CATCH LỖI NETWORK
        setHrData({ contracts: [], violations: [], salary: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user, employeeId]);

  // --- LOGIC UPLOAD AVATAR ---
  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile/avatar", { method: "POST", credentials: "include", body: uploadForm });
      if (res.ok) {
        const data = await res.json();
        setProfileData(prev => prev ? ({ ...prev, avatar_url: data.avatar_url }) : null);
        toast({ title: "Success", description: "Avatar updated! Syncing with header..." });
        setTimeout(() => window.location.reload(), 800);
      } else { throw new Error(); }
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Upload failed. Check backend Multer config." }); } finally { setIsSaving(false); }
  };

  // --- LOGIC SAVE ALL ---
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/profile/update", {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...settings, bank_info: bankFormData }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfileData(updated);
        syncState(updated);
        toast({ title: "Success", description: "All settings saved successfully!" });
        setIsEditing(false);
      } else { throw new Error(); }
    } catch (error) { toast({ variant: "destructive", title: "Error", description: "Failed to save. Ensure database columns exist!" }); } finally { setIsSaving(false); }
  };

  if (loading || authLoading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-medium">Loading profile...</div>;
  if (!profileData) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">User not found</div>;

  const initials = `${profileData.first_name?.[0]?.toUpperCase() || ""}${profileData.last_name?.[0]?.toUpperCase() || ""}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-inter">
      <div className="max-w-[1100px] mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-slate-900">General Settings</h1>

        {/* THẺ PERSONAL INFO */}
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Cột trái: Avatar */}
            <div className="md:col-span-4 p-10 flex flex-col items-center justify-center border-r border-slate-50">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden text-slate-400 text-4xl font-bold">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} className="w-full h-full object-cover" key={profileData.avatar_url} />
                  ) : initials}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isSaving || !viewingOwnProfile}
                className="mt-4 text-blue-600 font-semibold text-sm hover:underline disabled:opacity-50"
              >
                {isSaving ? "Uploading..." : "Upload Avatar"}
              </button>
            </div>

            {/* Cột phải: Form nhập liệu */}
            <div className="md:col-span-8 p-10 relative">
              {!isEditing && viewingOwnProfile && (
                <Button onClick={() => setIsEditing(true)} variant="ghost" className="absolute top-6 right-6 text-slate-400 hover:text-blue-600">
                  <Edit2 size={18} />
                </Button>
              )}
              <h2 className="text-lg font-bold mb-8">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput label="First Name" name="first_name" value={formData.first_name} onChange={(e: any) => setFormData({ ...formData, first_name: e.target.value })} disabled={!isEditing} />
                <FormInput label="Last Name" name="last_name" value={formData.last_name} onChange={(e: any) => setFormData({ ...formData, last_name: e.target.value })} disabled={!isEditing} />
                <FormInput label="Email" name="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} />
                <FormInput label="Phone" name="phone_number" value={formData.phone_number} onChange={(e: any) => setFormData({ ...formData, phone_number: e.target.value })} disabled={!isEditing} />
                <FormInput label="Address" name="address" value={formData.address} onChange={(e: any) => setFormData({ ...formData, address: e.target.value })} disabled={!isEditing} />
                <FormInput label="Job Title" value={profileData.position?.position_name} disabled={true} />
                <div className="md:col-span-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description / Bio</Label>
                  <Textarea name="description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} disabled={!isEditing} className="bg-slate-50 border-none resize-none h-24 mt-1.5 focus-visible:ring-blue-500" placeholder="Tell us about yourself..." />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* SETTINGS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h3 className="font-bold border-b pb-2">Notifications</h3>
            <ToggleRow title="Email messages" checked={settings.email_notifications} onChange={(v: any) => setSettings({ ...settings, email_notifications: v })} disabled={!isEditing} />
            <h3 className="font-bold border-b pb-2 mt-4">Appearance</h3>
            <ToggleRow title="Dark Mode" checked={settings.dark_mode} onChange={(v: any) => setSettings({ ...settings, dark_mode: v })} disabled={!isEditing} />
          </div>
          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">Security</h3>
            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3"><ShieldCheck className="text-blue-600 w-5 h-5" /><span className="text-sm font-bold">Enable 2FA</span></div>
              <CustomToggle checked={settings.two_factor_auth} onChange={(v) => setSettings({ ...settings, two_factor_auth: v })} disabled={!isEditing} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2"><h3 className="font-bold">Push Notifications</h3><CustomToggle checked={settings.push_notifications} onChange={(v) => setSettings({ ...settings, push_notifications: v })} disabled={!isEditing} /></div>
            <div className={`space-y-4 ${!settings.push_notifications && 'opacity-30 pointer-events-none'}`}>
              <ToggleRow title="Task reminders" checked={settings.task_reminders} onChange={(v: any) => setSettings({ ...settings, task_reminders: v })} disabled={!isEditing} />
              <ToggleRow title="Announcements" checked={settings.announcements} onChange={(v: any) => setSettings({ ...settings, announcements: v })} disabled={!isEditing} />
              <ToggleRow title="Daily reports" checked={settings.daily_reports} onChange={(v: any) => setSettings({ ...settings, daily_reports: v })} disabled={!isEditing} />
            </div>
          </div>
        </div>

        {/* BANK ACCOUNT AREA */}
        <Card className="rounded-2xl border-none shadow-sm bg-white p-8">
          <h2 className="text-lg font-bold flex items-center gap-3 mb-6"><CreditCard className="text-blue-500" /> Bank Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BankField label="Bank Name" value={bankFormData.bank_name} isEditing={isEditing} onChange={(v: any) => setBankFormData({ ...bankFormData, bank_name: v })} />
            <BankField label="Account Number" value={bankFormData.account_number} isEditing={isEditing} onChange={(v: any) => setBankFormData({ ...bankFormData, account_number: v })} mono />
            <BankField label="Account Holder" value={bankFormData.account_holder_name} isEditing={isEditing} onChange={(v: any) => setBankFormData({ ...bankFormData, account_holder_name: v })} uppercase />
          </div>
        </Card>

        {/* NÚT SAVE / DISCARD */}
        {isEditing && (
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button onClick={() => setIsEditing(false)} variant="outline" className="bg-red-50 text-red-500 border-none hover:bg-red-100 px-10">Discard</Button>
            <Button onClick={handleSaveAll} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-10">{isSaving ? "Saving..." : "Save Changes"}</Button>
          </div>
        )}

        {/* HR RECORDS ACCORDION */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">HR Administration Records</h2>
          <Accordion type="single" collapsible className="w-full space-y-3">

            {/* TAB HỢP ĐỒNG */}
            <AccordionItem value="contracts" className="bg-white rounded-xl px-6 border-none shadow-sm">
              <AccordionTrigger className="hover:no-underline font-bold text-slate-700">Labor Contracts ({hrData.contracts.length})</AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-6">
                {(() => {
                  // Đảm bảo hrData.contracts là mảng (an toàn tuyệt đối nhờ đã check ở trên)
                  const activeContract = hrData.contracts.find((c: any) => c.status === 'Active');
                  const historyContracts = hrData.contracts.filter((c: any) => c.status !== 'Active');

                  return (
                    <div className="space-y-6">
                      {activeContract ? (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Active Contract</div>
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                  {activeContract.contract_number}
                                </h4>
                                <p className="text-sm text-slate-500">{activeContract.contract_type}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div>
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Duration</span>
                                  <span className="font-medium text-slate-700">{new Date(activeContract.start_date).toLocaleDateString()} - {activeContract.end_date ? new Date(activeContract.end_date).toLocaleDateString() : 'Indefinite'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Salary Rate</span>
                                  <span className="font-bold text-slate-900">${parseFloat(activeContract.salary_rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-end">
                              {activeContract.file_url && (
                                <Button onClick={() => window.open(activeContract.file_url, "_blank")} className="bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 shadow-sm w-full md:w-auto">
                                  <FileText className="w-4 h-4 mr-2" /> View Document
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-5 text-center text-slate-500 text-sm">No active contract found.</div>
                      )}

                      {historyContracts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contract History</h4>
                          <div className="border border-slate-100 rounded-xl overflow-hidden">
                            <Table>
                              <TableHeader className="bg-slate-50">
                                <TableRow>
                                  <TableHead className="text-xs font-semibold">Contract No.</TableHead>
                                  <TableHead className="text-xs font-semibold">Type</TableHead>
                                  <TableHead className="text-xs font-semibold">Dates</TableHead>
                                  <TableHead className="text-xs font-semibold">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {historyContracts.map((c: any) => (
                                  <TableRow key={c.contract_id} className="text-sm">
                                    <TableCell className="font-medium">{c.contract_number}</TableCell>
                                    <TableCell>{c.contract_type}</TableCell>
                                    <TableCell className="text-slate-500">{new Date(c.start_date).toLocaleDateString()} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={c.status === 'Expired' ? 'text-slate-500 border-slate-200 bg-slate-50' : 'text-red-500 border-red-200 bg-red-50'}>
                                        {c.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </AccordionContent>
            </AccordionItem>

            {/* TAB LƯƠNG */}
            <AccordionItem value="salary" className="bg-white rounded-xl px-6 border-none shadow-sm">
              <AccordionTrigger className="hover:no-underline font-bold text-slate-700">Salary History</AccordionTrigger>
              <AccordionContent>
                {hrData.salary.length > 0 ? (
                  <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>New Salary</TableHead></TableRow></TableHeader>
                    <TableBody>{hrData.salary.map((s: any) => (<TableRow key={s.history_id}><TableCell>{new Date(s.change_date).toLocaleDateString()}</TableCell><TableCell className="font-bold text-blue-600">{s.new_salary}</TableCell></TableRow>))}</TableBody>
                  </Table>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-5 text-center text-slate-500 text-sm">No salary history available.</div>
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

// Sub-components hỗ trợ giao diện gọn đẹp
function FormInput({ label, value, onChange, disabled }: any) {
  return (<div className="space-y-1.5"><Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</Label><Input value={value || ""} onChange={onChange} disabled={disabled} className="bg-slate-50 border-none h-11 focus-visible:ring-blue-500 disabled:opacity-100 disabled:text-slate-500" /></div>);
}
function ToggleRow({ title, checked, onChange, disabled }: any) {
  return (<div className="flex items-center justify-between py-1"><span className="text-sm text-slate-600">{title}</span><CustomToggle checked={checked} onChange={onChange} disabled={disabled} /></div>);
}
function BankField({ label, value, isEditing, onChange, mono, uppercase }: any) {
  return (<div className="space-y-1"><Label className="text-[10px] font-bold text-slate-400 uppercase">{label}</Label>{isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-50 border-none focus-visible:ring-blue-500" /> : <p className={`font-bold ${mono ? 'font-mono' : ''} ${uppercase ? 'uppercase' : ''}`}>{value || "Not provided"}</p>}</div>);
}

export default function ProfilePage() { return (<Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading...</div>}><ProfileContent /></Suspense>); }