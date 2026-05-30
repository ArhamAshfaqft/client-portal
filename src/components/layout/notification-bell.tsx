"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, MessageSquareText, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { useNotifications, type AppNotification } from "@/lib/notifications-context";
import { useAuth } from "@/lib/auth-context";

const typeIcons: Record<string, typeof Bell> = {
  assigned: UserPlus,
  resolved: CheckCircle2,
  replied: MessageSquareText,
  new_feedback: AlertCircle,
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const roleFiltered = notifications.filter((n) => {
    if (profile?.role === "client") return n.type !== "assigned";
    return true;
  });

  const filteredUnread = roleFiltered.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Bell className="w-5 h-5" />
        {filteredUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
            {filteredUnread > 9 ? "9+" : filteredUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-border bg-popover shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {filteredUnread > 0 && (
              <button
                onClick={() => { markAllAsRead(); }}
                className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {roleFiltered.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              roleFiltered.map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                return (
                  <Link
                    key={n.id}
                    href={n.feedback_id ? `/dashboard/sites/${n.site_id}/feedback` : "/dashboard/my-feedback"}
                    onClick={() => { markAsRead(n.id); setOpen(false); }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-accent ${
                      !n.read ? "bg-primary-light/30" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      n.type === "assigned" ? "bg-primary-light text-primary" :
                      n.type === "resolved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                      n.type === "replied" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
