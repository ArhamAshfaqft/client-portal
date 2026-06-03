"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCheck, MessageSquareText, UserPlus, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useNotifications, type AppNotification } from "@/lib/notifications-context";
import { useAuth } from "@/lib/auth-context";

const typeIcons: Record<string, typeof Bell> = {
  assigned: UserPlus,
  resolved: CheckCircle2,
  replied: MessageSquareText,
  new_feedback: AlertCircle,
};

const SWIPE_THRESHOLD = 80;

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ id: string; startX: number; currentX: number; element: HTMLElement | null }>({ id: "", startX: 0, currentX: 0, element: null });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && profile?.agency_id) {
      const lastCleanup = sessionStorage.getItem("notif_cleanup_last");
      if (lastCleanup && Date.now() - Number(lastCleanup) < 60000) return;
      sessionStorage.setItem("notif_cleanup_last", String(Date.now()));
      const supabase = createClient();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      supabase.from("notifications").delete().lt("created_at", cutoff.toISOString()).then(() => {}, () => {});
    }
  }, [open, profile?.agency_id]);

  const roleFiltered = notifications.filter((n) => {
    if (profile?.role === "client") return n.type !== "assigned";
    return true;
  }).filter((n) => !dismissed.has(n.id));

  const filteredUnread = roleFiltered.filter((n) => !n.read).length;

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const handleClearAll = () => {
    const allIds = new Set(roleFiltered.map((n) => n.id));
    setDismissed(allIds);
    if (filteredUnread > 0) markAllAsRead();
  };

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    swipeRef.current = { id, startX: e.touches[0].clientX, currentX: e.touches[0].clientX, element: e.currentTarget as HTMLElement };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const s = swipeRef.current;
    if (!s.element) return;
    s.currentX = e.touches[0].clientX;
    const delta = s.currentX - s.startX;
    if (delta > 0) {
      s.element.style.transition = "none";
      s.element.style.transform = `translateX(${Math.min(delta, 120)}px)`;
      s.element.style.opacity = `${1 - delta / 200}`;
    }
  };

  const handleTouchEnd = () => {
    const s = swipeRef.current;
    if (!s.element) return;
    s.element.style.transition = "transform 0.2s ease, opacity 0.2s ease";
    const delta = s.currentX - s.startX;
    if (delta > SWIPE_THRESHOLD) {
      s.element.style.transform = "translateX(120px)";
      s.element.style.opacity = "0";
      setTimeout(() => handleDismiss(s.id), 200);
    } else {
      s.element.style.transform = "";
      s.element.style.opacity = "";
    }
    swipeRef.current = { id: "", startX: 0, currentX: 0, element: null };
  };

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
                  <div
                    key={n.id}
                    onTouchStart={(e) => handleTouchStart(n.id, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="relative group"
                  >
                    <button
                      onClick={() => handleDismiss(n.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <Link
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
                  </div>
                );
              })
            )}
          </div>

          {roleFiltered.length > 0 && (
            <div className="border-t border-border px-4 py-2.5">
              <button
                onClick={handleClearAll}
                className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
