"use client";

/**
 * Staff Directory — /directory
 *
 * Public view accessible to ALL authenticated employees.
 * Reuses the same <EmployeeTable> component as /admin/employees, but with
 * RBAC props set to restrict sensitive data:
 *
 *   showSensitive={false}  → Phone column NOT rendered (neither in table nor card)
 *   showActions={false}    → View/Offboard buttons NOT rendered
 *
 * Data comes from GET /api/employees/directory — the backend also strips
 * phone_number and address at the service layer, providing defence-in-depth.
 */

import React, { useEffect, useState, useRef } from "react";
import { Users, X, Send, MessageSquare, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmployeeTable, { EmployeeRow } from "@/components/EmployeeTable";
import { useAuth } from "@/src/hooks/useAuth";

export default function StaffDirectoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chatUser, setChatUser] = useState<EmployeeRow | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /**
     * Calls GET /api/employees/directory — this endpoint is handled by
     * EmployeesService.findAllPublic() which deliberately excludes
     * phone_number and address from the JSON response.
     *
     * UI hiding is a second layer of security; the backend is the true gate.
     */
    fetch("/api/staff-directory", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  // Listen to window location changes to auto-open chat box
  useEffect(() => {
    if (typeof window === "undefined" || employees.length === 0) return;

    const checkChatParam = () => {
      const params = new URLSearchParams(window.location.search);
      const chatWithId = params.get("chatWith");
      if (chatWithId) {
        const parsedId = parseInt(chatWithId, 10);
        const targetEmp = employees.find((emp) => emp.employee_id === parsedId);
        if (targetEmp && chatUser?.employee_id !== parsedId) {
          setChatUser(targetEmp);
        }
      }
    };

    checkChatParam();

    // Check for parameter changes every 500ms (client-side transitions don't trigger a reload)
    const timer = setInterval(checkChatParam, 500);
    return () => clearInterval(timer);
  }, [employees, chatUser]);

  // Poll messages when chat is open
  useEffect(() => {
    if (!chatUser) return;
    
    const fetchMessages = () => {
      fetch(`/api/messages/${chatUser.employee_id}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
           setMessages(data);
        })
        .catch(console.error);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [chatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !chatUser) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: chatUser.employee_id, content: msgInput }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setMsgInput("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm(t("directory.deleteConfirm", "Are you sure you want to delete this message?"))) return;

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, is_deleted: true, content: "This message was deleted" } : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={22} className="text-blue-500" />
          {t("directory.title")}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {t("directory.subtitle")}
        </p>
      </div>

      {/*
        Shared EmployeeTable — restricted mode:
          showSensitive={false}  No Phone column in table view, no phone row in cards
          showActions={false}    No View Profile (admin) or Offboard button
                                 Cards get a "View Profile" link to /directory/[id] instead
      */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        showSensitive={false}
        showActions={false}
        onMessageClick={(emp) => setChatUser(emp)}
      />

      {/* Floating Chat Box */}
      {chatUser && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-t-xl rounded-b-lg shadow-2xl border border-gray-200 z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                {chatUser.first_name?.[0]}{chatUser.last_name?.[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">{chatUser.first_name} {chatUser.last_name}</span>
                <span className="text-[10px] text-indigo-100">{chatUser.department?.department_name || "Colleague"}</span>
              </div>
            </div>
            <button onClick={() => setChatUser(null)} className="text-indigo-100 hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-72 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-thin-scrollbar">
            {messages.length === 0 ? (
              <div className="m-auto text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <MessageSquare size={24} className="opacity-20" />
                <span>Say hi to {chatUser.first_name}!</span>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender?.employee_id === user?.employee_id;
                const isDeleted = m.is_deleted;
                return (
                  <div key={m.id} className={`flex flex-col max-w-[85%] relative group ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                    <div className="flex items-center gap-1.5 group">
                      {isMe && !isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded bg-gray-200/50 hover:bg-gray-200"
                          title={t("directory.deleteMessage", "Delete message")}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm shadow-sm transition-all ${
                          isDeleted
                            ? "bg-gray-100 text-gray-400 border border-gray-200 border-dashed italic rounded-2xl"
                            : isMe
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {isDeleted ? t("directory.messageDeleted", "This message was deleted") : m.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-full pl-4 pr-10 py-2 text-sm transition-all outline-none"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!msgInput.trim()}
                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
