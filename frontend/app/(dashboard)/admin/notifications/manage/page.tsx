"use client";

import { useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function ManageNotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Check if admin
  const isAdmin = user?.position?.position_name?.toLowerCase().includes("admin") || 
                  user?.permissions?.includes("manage:system") ||
                  user?.position?.position_name?.toLowerCase().includes("director");

  const handleSend = async () => {
    if (!title || !message) {
      toast({ variant: "destructive", title: "Wait", description: "Title and message are required" });
      return;
    }
    
    setSending(true);
    try {
      const res = await fetch("/api/notifications/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, message })
      });
      
      if (res.ok) {
        toast({ title: "Success", description: "Announcement sent to all employees!" });
        setTitle("");
        setMessage("");
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to send announcement" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Network error" });
    } finally {
      setSending(false);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 font-inter text-gray-500">Access Denied</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 lg:mt-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
        <p className="text-sm text-gray-500 mt-1">Send real-time alerts and notifications to all employees across the organization.</p>
      </div>
      
      <Card className="rounded-2xl shadow-sm border-gray-100 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">New Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="mb-2 block text-xs font-semibold text-gray-500">Announcement Title</Label>
            <Input 
              placeholder="e.g. Office closed tomorrow" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs font-semibold text-gray-500">Message Content</Label>
            <Textarea 
              placeholder="Detailed announcement text..." 
              rows={5} 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              className="bg-gray-50 border-gray-200"
            />
          </div>
          
          <Button onClick={handleSend} disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
            {sending ? "Sending..." : "Send to All Employees"}
          </Button>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
