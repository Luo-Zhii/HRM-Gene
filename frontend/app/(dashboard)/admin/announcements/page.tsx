"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { 
  Building2, 
  Send, 
  Eye, 
  Megaphone, 
  Bell, 
  Mail, 
  Clock, 
  Settings, 
  AlertCircle,
  MoreVertical,
  Calendar,
  Filter,
  Users,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Department {
  department_id: number;
  department_name: string;
}

interface Announcement {
  id: number;
  title: string;
  type: string;
  target_audience: string;
  priority: string;
  status: string;
  delivery_methods: string[];
  created_at: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    type: "General",
    title: "",
    target_audience: "all",
    department_id: "",
    content: "",
    in_app_notification: true,
    email_notification: false,
    priority: "Normal",
    scheduled_at: "",
  });

  const [statusMessage, setStatusMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.permissions?.includes("manage:system") && !user.permissions?.includes("manage:employee")) {
        router.push("/dashboard");
      } else {
        fetchInitialData();
      }
    }
  }, [user, authLoading, router]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const apiBase = "/api";
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // Attempt to load departments
      const depsRes = await fetch(`${apiBase}/employees`, { 
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      }); // Fallback to employees list if departments endpoint missing
      if (depsRes.ok) {
        setDepartments(await depsRes.json());
      }
      
      // Attempt to load announcements
      const annRes = await fetch(`${apiBase}/announcements`, { 
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (annRes.ok) {
        setAnnouncements(await annRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const apiBase = "/api";
      const delivery_methods = [];
      if (formData.in_app_notification) delivery_methods.push("in_app");
      if (formData.email_notification) delivery_methods.push("email");

      const payload = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        target_audience: formData.target_audience === "department" ? `dept_${formData.department_id}` : formData.target_audience,
        priority: formData.priority,
        status: formData.scheduled_at ? "Scheduled" : "Active",
        scheduled_at: formData.scheduled_at || null,
        delivery_methods,
      };

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/announcements`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to broadcast announcement");

      setStatusMessage({ type: "success", text: "Announcement broadcasted successfully!" });
      
      // Reset form
      setFormData({
        type: "General",
        title: "",
        target_audience: "all",
        department_id: "",
        content: "",
        in_app_notification: true,
        email_notification: false,
        priority: "Normal",
        scheduled_at: "",
      });
      
      fetchInitialData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error sending announcement";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to delete announcement");

      // Optimistic Update
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      setStatusMessage({ type: "success", text: "Announcement deleted successfully" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error deleting announcement";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-inter">Manage Announcements</h1>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">
              Broadcast updates and manage automated system alerts across the entire organization or specific departments.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
            statusMessage.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
          }`}>
            <AlertCircle className={`w-5 h-5 ${statusMessage.type === "success" ? "text-green-600" : "text-red-600"}`} />
            <span className="font-medium text-sm">{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Compose New Announcement
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Announcement Type</Label>
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleChange}
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="General">General Update</option>
                      <option value="Policy">Company Policy</option>
                      <option value="Event">Internal Event</option>
                      <option value="Alert">System Alert</option>
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Target Audience</Label>
                    <select 
                      name="target_audience" 
                      value={formData.target_audience} 
                      onChange={handleChange}
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Employees</option>
                      <option value="department">Specific Department</option>
                    </select>
                  </div>

                  {/* Dynamic Department Selector */}
                  {formData.target_audience === "department" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Department</Label>
                      <select 
                        name="department_id" 
                        value={formData.department_id} 
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      >
                        <option value="" disabled>Choose a department...</option>
                        {departments.map(d => (
                          <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</Label>
                    <Input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      placeholder="e.g. Q3 Townhall Meeting" 
                      required
                      className="h-11 rounded-xl border-gray-200 bg-white" 
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Content</Label>
                    <Textarea 
                      name="content" 
                      value={formData.content} 
                      onChange={handleChange} 
                      placeholder="Write your announcement message here..." 
                      rows={6}
                      required
                      className="rounded-xl border-gray-200 bg-white resize-none" 
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Delivery Methods */}
                  <div className="space-y-4">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery Method</Label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" name="in_app_notification" checked={formData.in_app_notification} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">In-App Notification</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" name="email_notification" checked={formData.email_notification} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">Email Delivery</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Priority & Schedule */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority Level</Label>
                      <div className="flex gap-4">
                        {["Low", "Normal", "High"].map(level => (
                          <label key={level} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="priority" value={level} checked={formData.priority === level} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Send Schedule (Optional)</Label>
                      <Input 
                        type="datetime-local" 
                        name="scheduled_at" 
                        value={formData.scheduled_at} 
                        onChange={handleChange} 
                        className="h-11 rounded-xl border-gray-200 bg-white" 
                      />
                      <p className="text-[11px] text-gray-500">Leave blank to broadcast immediately.</p>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold shadow-sm">
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </Button>
                  <Button type="submit" disabled={saving} className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all">
                    {saving ? "Broadcasting..." : "Send Announcement"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar: History Table / Mini Dashboard */}
          <div className="space-y-6">
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" /> Recent Announcements
                </h2>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-gray-500">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {announcements.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <InboxIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">No recent broadcasts</p>
                      <p className="text-xs text-gray-500 mt-1">Sent announcements will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100 group">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            ann.type === 'Policy' ? 'bg-purple-100 text-purple-700' :
                            ann.type === 'Event' ? 'bg-orange-100 text-orange-700' :
                            ann.type === 'Alert' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {ann.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              ann.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ann.status}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteAnnouncement(ann.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{ann.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ann.target_audience === 'all' ? 'All' : 'Depts'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ann.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
