"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function getSocketUrl(): string {
  if (typeof window === "undefined") return "http://localhost:3001";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, "");
  }
  return "http://localhost:3001";
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const initializedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // Silently ignore fetch errors
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {
      // Silently ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const unreadIds = prev.filter((n) => !n.isRead).map((n) => n.id);
      // Fire and forget — update UI optimistically
      unreadIds.forEach((id) => {
        fetch(`/api/notifications/${id}/read`, {
          method: "PATCH",
          credentials: "include",
        }).catch(() => {});
      });
      return prev.map((n) => ({ ...n, isRead: true }));
    });
  }, []);

  const removeNotification = useCallback(async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Silently ignore
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch initial data
    fetchNotifications();

    // Connect Socket.io
    if (!initializedRef.current) {
      initializedRef.current = true;
      const url = getSocketUrl();
      const socket = io(url, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        // Connected successfully
      });

      socket.on("newNotification", (notification: AppNotification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast({
          title: notification.title,
          description: notification.message,
        });
      });

      socket.on("disconnect", () => {
        // Disconnected — will auto-reconnect
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        initializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.employee_id]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationContext must be used within NotificationProvider");
  return ctx;
}
