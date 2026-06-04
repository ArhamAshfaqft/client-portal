"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useNotifications, type AppNotification } from "@/lib/notifications-context";
import { Bell, CheckCheck, MessageSquareText, UserPlus, CheckCircle2, AlertCircle, Inbox } from "lucide-react";

const typeIcons: Record<string, typeof Bell> = {
  assigned: UserPlus,
  resolved: CheckCircle2,
  replied: MessageSquareText,
  new_feedback: AlertCircle,
};

const typeLabels: Record<string, string> = {
  assigned: "Assigned",
  resolved: "Resolved",
  replied: "Reply",
  new_feedback: "New Feedback",
};

type FilterPeriod = "today" | "week" | "month" | "year" | "all";

const FILTERS: { key: FilterPeriod; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

function getPeriodStart(period: FilterPeriod): Date | null {
  const now = new Date();
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const { isDemo } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<FilterPeriod>("today");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isDemo) {
      const supabase = createClient();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      supabase.from("notifications").delete().lt("created_at", cutoff.toISOString()).then(() => {}, () => {});
    }
  }, [isDemo]);

  const filtered = useMemo(() => {
    const start = getPeriodStart(filter);
    if (!start) return notifications;
    return notifications.filter((n) => new Date(n.created_at) >= start);
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    setSaving(true);
    markAllAsRead();
    if (!isDemo) {
      const supabase = createClient();
      await supabase.from("notifications").update({ read: true }).eq("read", false);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="text-base font-semibold text-foreground mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            {filter !== "all" ? "No notifications in this period" : "You don&apos;t have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Link
                key={n.id}
                href={n.feedback_id ? `/dashboard/sites/${n.site_id}/feedback` : "/dashboard/my-feedback"}
                onClick={() => markAsRead(n.id)}
                className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors hover:bg-accent ${
                  !n.read ? "border-primary/20 bg-primary-light/20" : "border-border"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  n.type === "assigned" ? "bg-primary-light text-primary" :
                  n.type === "resolved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                  n.type === "replied" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {typeLabels[n.type] || n.type}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-0.5">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(n.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
