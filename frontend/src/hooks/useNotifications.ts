import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from "@/components/ui/use-toast";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: 'leave' | 'leave_request' | 'task' | 'announcement' | 'report' | 'discipline' | 'warning' | 'payroll' | 'resignation_request' | 'resignation_status_update';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Helper to extract access token from cookies if needed, or HTTPOnly cookie is used
  // If backend uses HTTPOnly cookie, we just connect and let it send cookies. But WebSocket handshake from a different port might need extra config or we pass the token.
  // We'll assume the token is in cookies or we can hit the API securely. Since we don't have direct access to HTTPOnly cookie, 
  // we'll try to connect without explicit token if it relies on cookies, or if needed we should use polling/withCredentials.
  
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Poll every 15 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { 
        method: 'PATCH',
        credentials: 'include' 
      });
      if (res.ok) {
        setNotifications((prev) => 
          prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    // This could also be a bulk endpoint, but we can iteratively update state for now
    // and let backend sync if there's no bulk endpoint, or just map through unread.
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const removeNotification = async (id: number) => {
    // Optimistic explicit UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    try {
      await fetch(`/api/notifications/${id}`, { 
        method: 'DELETE',
        credentials: 'include' 
      });
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
