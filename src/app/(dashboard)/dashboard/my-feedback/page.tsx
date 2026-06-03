"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAssignedFeedback, getClientFeedback, getTeamMemberName } from "@/lib/demo-data";
import type { FeedbackStatus } from "@/types";

interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  status: string;
  assigned_to: string | null;
  created_by: string | null;
  creator_name?: string;
  created_at: string;
  site_name?: string;
  project_name?: string;
  replies?: { id: string; creator_name: string; content: string; created_at: string }[];
}
import {
  MessageSquareText,
  Pin,
  Mic,
  Image,
  CheckCircle2,
  ArrowRight,
  Play,
  Globe,
  Search,
  Square,
  Pencil,
  ArrowUpRight,
} from "lucide-react";

const typeIcons: Record<string, typeof Pin> = {
  pin: Pin,
  comment: MessageSquareText,
  voice: Mic,
  media: Image,
  rect: Square,
  arrow: ArrowUpRight,
  draw: Pencil,
};

const statusVariants: Record<string, "warning" | "info" | "success" | "default"> = {
  open: "warning",
  in_progress: "info",
  resolved: "success",
  closed: "default",
};

export default function MyFeedbackPage() {
  const { profile, isDemo } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    const userId = profile?.user_id;
    if (!userId) return;

    if (isDemo) {
      if (profile?.role === "client") {
        setFeedback(getClientFeedback(userId));
      } else {
        setFeedback(getAssignedFeedback(userId));
      }
      return;
    }

    const supabase = createClient();
    supabase
      .from("feedback_items")
      .select("id, type, content, status, assigned_to, created_by, created_at, parent_id, project:project_id(name, site:site_id(name))")
      .eq("assigned_to", userId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .then(async ({ data: items, error }) => {
        if (error || !items) return;
        const ids = items.map((i: any) => i.id);
        if (ids.length === 0) { setFeedback([]); return; }

        const { data: replies } = await supabase
          .from("feedback_items")
          .select("id, content, created_by, created_at, parent_id")
          .in("parent_id", ids)
          .order("created_at", { ascending: true });

        const replyMap: Record<string, { id: string; creator_name: string; content: string; created_at: string }[]> = {};
        if (replies) {
          for (const r of replies as any[]) {
            if (!replyMap[r.parent_id]) replyMap[r.parent_id] = [];
            replyMap[r.parent_id].push({
              id: r.id,
              creator_name: r.created_by || "Unknown",
              content: r.content,
              created_at: r.created_at,
            });
          }
        }

        setFeedback(
          items.map((i: any) => ({
            id: i.id,
            type: i.type,
            content: i.content,
            status: i.status,
            assigned_to: i.assigned_to,
            created_by: i.created_by,
            created_at: i.created_at,
            site_name: i.project?.site?.name || "",
            project_name: i.project?.name || "",
            replies: replyMap[i.id] || [],
          }))
        );
      });
  }, [profile?.user_id, profile?.role, isDemo]);

  const updateStatus = (id: string, newStatus: FeedbackStatus) => {
    setFeedback((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
    if (!isDemo) {
      const supabase = createClient();
      supabase.from("feedback_items").update({ status: newStatus }).eq("id", id).then(() => {}, () => {});
    }
  };

  const filtered =
    feedback.filter((f) => {
      if (filter !== "all" && f.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        f.content.toLowerCase().includes(q) ||
        (f.site_name || "").toLowerCase().includes(q) ||
        (f.project_name || "").toLowerCase().includes(q) ||
        (f.creator_name || "").toLowerCase().includes(q)
      );
    });

  const counts = {
    all: feedback.length,
    open: feedback.filter((f) => f.status === "open").length,
    in_progress: feedback.filter((f) => f.status === "in_progress").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  };

  const statusActions: Record<string, { next: FeedbackStatus; label: string; icon: typeof Play }> = {
    open: { next: "in_progress" as FeedbackStatus, label: "Start Working", icon: Play },
    in_progress: { next: "resolved" as FeedbackStatus, label: "Mark Resolved", icon: CheckCircle2 },
    resolved: { next: "open" as FeedbackStatus, label: "Reopen", icon: ArrowRight },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">My Feedback</h2>
        <p className="text-sm text-muted-foreground">
          {profile?.role === "client" ? "Feedback you submitted" : "Feedback items assigned to you"}
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "all", label: "All", count: counts.all },
          { key: "open", label: "Open", count: counts.open },
          {
            key: "in_progress",
            label: "In Progress",
            count: counts.in_progress,
          },
          { key: "resolved", label: "Resolved", count: counts.resolved },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "bg-primary text-white"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} <span className="opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                All caught up
              </h3>
              <p className="text-sm text-muted-foreground">
                {search ? "No matching feedback found" : "No " + (filter !== "all" ? filter : "") + " feedback items assigned to you"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const TypeIcon = typeIcons[item.type] || MessageSquareText;
            const action = statusActions[item.status];
            const ActionIcon = action?.icon;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TypeIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          {item.site_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.project_name}
                        </span>
                        <Badge
                          variant={statusVariants[item.status] || "default"}
                        >
                          {item.status === "open" ? "New" : item.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {item.content}
                      </p>
                      {/* Replies */}
                      {item.replies && item.replies.length > 0 && (
                        <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-border">
                          {item.replies.map((r: any) => (
                            <div key={r.id}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-foreground">{r.creator_name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{r.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {profile?.role === "client" && item.assigned_to && isDemo ? (
                            <span className="text-xs text-muted-foreground">
                              Assigned to: {getTeamMemberName(item.assigned_to)}
                            </span>
                          ) : item.creator_name && profile?.role !== "client" ? (
                            <span className="text-xs text-muted-foreground">
                              From: {item.creator_name}
                            </span>
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        {profile?.role !== "client" && (
                          <Button
                            size="sm"
                            variant={
                              item.status === "resolved" ? "outline" : "primary"
                            }
                            onClick={() =>
                              updateStatus(item.id, action.next)
                            }
                          >
                            <ActionIcon className="w-3.5 h-3.5 mr-1.5" />
                            {action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
