"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export interface AppNotification {
  id: string;
  type: "assigned" | "resolved" | "replied" | "new_feedback";
  title: string;
  message: string;
  site_name?: string;
  site_id: string;
  feedback_id?: string;
  read: boolean;
  created_at: string;
}

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1", type: "assigned", title: "Assigned to you",
    message: "Brighton Law Firm - CTA button contrast issue has been assigned to you by Sarah Mitchell",
    site_name: "Brighton Law Firm", site_id: "demo-site-1", feedback_id: "demo-fb-13",
    read: false, created_at: "2026-05-30T09:15:00Z",
  },
  {
    id: "notif-2", type: "replied", title: "New reply on your feedback",
    message: "James Chen replied on your CTA button feedback: 'I will update the colors to white on dark blue'",
    site_name: "Brighton Law Firm", site_id: "demo-site-1", feedback_id: "demo-fb-13",
    read: false, created_at: "2026-05-30T08:30:00Z",
  },
  {
    id: "notif-3", type: "resolved", title: "Feedback resolved",
    message: "Contact Form Update - reference images feedback has been marked as resolved",
    site_name: "Brighton Law Firm", site_id: "demo-site-1", feedback_id: "demo-fb-4",
    read: false, created_at: "2026-05-29T16:00:00Z",
  },
  {
    id: "notif-4", type: "new_feedback", title: "New feedback submitted",
    message: "Michael Chen submitted feedback about CTA buttons on Brighton Law Firm homepage",
    site_name: "Brighton Law Firm", site_id: "demo-site-1", feedback_id: "demo-fb-13",
    read: true, created_at: "2026-05-29T14:00:00Z",
  },
  {
    id: "notif-5", type: "replied", title: "Client replied",
    message: "Michael Chen replied on CTA feedback: 'Yes, please also add 8px border-radius'",
    site_name: "Brighton Law Firm", site_id: "demo-site-1", feedback_id: "demo-fb-13",
    read: true, created_at: "2026-05-28T11:00:00Z",
  },
];

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsState | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isDemo) setNotifications(DEMO_NOTIFICATIONS);
    else setNotifications([]);
  }, [isDemo]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: AppNotification) => {
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
