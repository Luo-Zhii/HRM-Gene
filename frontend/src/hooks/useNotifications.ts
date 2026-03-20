import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: 'leave' | 'leave_request' | 'task' | 'announcement' | 'report';
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

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
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    fetchNotifications();

    // Determine backend WS URL: in development standard is localhost:3001
    // In production, it might be the same origin.
    const isDev = process.env.NODE_ENV === 'development';
    const wsUrl = isDev ? 'http://localhost:3001' : '/';

    const newSocket = io(wsUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket for notifications');
    });

    newSocket.on('newNotification', (notif: AppNotification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
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

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    markAsRead,
    markAllAsRead,
  };
}
