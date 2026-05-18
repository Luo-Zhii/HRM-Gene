"use client";

import { useNotificationContext, AppNotification } from "../context/NotificationContext";

export type { AppNotification };

export function useNotifications() {
  return useNotificationContext();
}
