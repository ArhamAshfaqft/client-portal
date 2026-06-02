"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

export interface AppNotification {
  id: string;
  type: "assigned" | "resolved" | "replied" | "new_feedback";
  title: string;
  message: string;
  site_name?: string;
  site_id: string;
  feedback_id?: string;
  user_id?: string | null;
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
  const { isDemo, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isDemo) {
      setNotifications(DEMO_NOTIFICATIONS);
      return;
    }
    if (!profile?.agency_id) return;
    const supabase = createClient();

    // Initial load
    supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${profile.user_id},user_id.is.null`)
      .eq("agency_id", profile.agency_id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setNotifications(data as AppNotification[]);
      });

    // Real-time: new notifications appear instantly in the bell
    const channel = supabase
      .channel(`notifications-${profile.agency_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `agency_id=eq.${profile.agency_id}`,
        },
        (payload) => {
          const n = payload.new as AppNotification;
          // Only show if addressed to this user or broadcast
          if (!n.user_id || n.user_id === profile.user_id) {
            setNotifications((prev) => [n, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isDemo, profile?.agency_id, profile?.user_id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: AppNotification) => {
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (!isDemo) {
      const supabase = createClient();
      supabase.from("notifications").update({ read: true }).eq("id", id);
    }
  }, [isDemo]);

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
