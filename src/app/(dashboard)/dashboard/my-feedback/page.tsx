"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAssignedFeedback, getClientFeedback, getTeamMemberName } from "@/lib/demo-data";
import type { FeedbackStatus } from "@/types";
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
  ChevronDown,
  ChevronRight,
  ExternalLink,
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
  resolved: "success",
  closed: "default",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 86400000;
}

export default function MyFeedbackPage() {
  const { profile, isDemo } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<any[]>([]);
  const [collapsedSites, setCollapsedSites] = useState<Set<string>>(new Set());
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

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
      .select("id, type, content, status, assigned_to, created_by, created_at, parent_id, project:project_id(id, name, site_id, site:site_id(id, name))")
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

        const replyMap: Record<string, any[]> = {};
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
            project_id: i.project?.id,
            site_id: i.project?.site?.id || i.project?.site_id,
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

  const filtered = useMemo(
    () => feedback.filter((f) => {
      if (filter !== "all" && f.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        f.content.toLowerCase().includes(q) ||
        (f.site_name || "").toLowerCase().includes(q) ||
        (f.project_name || "").toLowerCase().includes(q) ||
        (f.creator_name || "").toLowerCase().includes(q)
      );
    }),
    [feedback, filter, search]
  );

  const counts = {
    all: feedback.length,
    open: feedback.filter((f) => f.status === "open").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  };

  const statusActions: Record<string, { next: FeedbackStatus; label: string; icon: typeof Play }> = {
    open: { next: "resolved" as FeedbackStatus, label: "Mark Resolved", icon: CheckCircle2 },
    resolved: { next: "open" as FeedbackStatus, label: "Reopen", icon: ArrowRight },
  };

  // Group filtered items by site -> project
  const groups = useMemo(() => {
    const siteMap: Record<string, { id: string; name: string; projects: Record<string, { id: string; name: string; items: any[] }> }> = {};
    for (const item of filtered) {
      const siteId = item.site_id || "unknown";
      const projectId = item.project_id || "unknown";
      if (!siteMap[siteId]) siteMap[siteId] = { id: siteId, name: item.site_name || "Unknown Site", projects: {} };
      if (!siteMap[siteId].projects[projectId]) siteMap[siteId].projects[projectId] = { id: projectId, name: item.project_name || "Unknown Project", items: [] };
      siteMap[siteId].projects[projectId].items.push(item);
    }
    return Object.values(siteMap);
  }, [filtered]);

  const toggleSite = (id: string) => {
    setCollapsedSites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleProject = (id: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
          { key: "open", label: "Pending", count: counts.open },
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
              <h3 className="text-lg font-semibold text-foreground mb-1">All caught up</h3>
              <p className="text-sm text-muted-foreground">
                {search ? "No matching feedback found" : "No feedback items assigned to you"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((site) => {
            const siteOpen = !collapsedSites.has(site.id);
            const siteTotal = Object.values(site.projects).reduce((sum, p) => sum + p.items.length, 0);
            return (
              <div key={site.id}>
                <button
                  onClick={() => toggleSite(site.id)}
                  className="flex items-center gap-2 w-full text-left py-2 px-1 rounded-lg hover:bg-accent transition-colors group"
                >
                  {siteOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{site.name}</span>
                  <span className="text-xs text-muted-foreground">({siteTotal})</span>
                </button>
                {siteOpen && (
                  <div className="ml-4 mt-2 space-y-3 border-l-2 border-border pl-4">
                    {Object.values(site.projects).map((project) => {
                      const projOpen = !collapsedProjects.has(project.id);
                      return (
                        <div key={project.id}>
                          <button
                            onClick={() => toggleProject(project.id)}
                            className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-lg hover:bg-accent transition-colors group"
                          >
                            {projOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span className="text-sm font-medium text-foreground">{project.name}</span>
                            <span className="text-xs text-muted-foreground">({project.items.length})</span>
                          </button>
                          {projOpen && (
                            <div className="mt-2 space-y-2">
                              {project.items.map((item) => {
                                const TypeIcon = typeIcons[item.type] || MessageSquareText;
                                const action = statusActions[item.status];
                                const ActionIcon = action?.icon;
                                const recent = isRecent(item.created_at);
                                return (
                                  <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                                    <CardContent className="p-0">
                                      <div className="flex items-start">
                                        <Link
                                          href={item.site_id ? `/dashboard/sites/${item.site_id}/feedback` : "#"}
                                          className="flex-1 min-w-0 p-4 hover:bg-accent transition-colors"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <TypeIcon className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                {recent && (
                                                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">New</Badge>
                                                )}
                                                <Badge variant={statusVariants[item.status] || "default"} className="text-[10px] px-1.5 py-0">
                                                  {item.status === "open" ? "Open" : item.status.replace("_", " ")}
                                                </Badge>
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                  <ExternalLink className="w-3 h-3" />
                                                  View details
                                                </span>
                                              </div>
                                              <p className="text-sm text-foreground line-clamp-2 mt-0.5">
                                                {item.content}
                                              </p>
                                              {item.replies && item.replies.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {item.replies.length} repl{item.replies.length !== 1 ? "ies" : "y"}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-2 mt-2">
                                                {item.creator_name ? (
                                                  <span className="text-[11px] text-muted-foreground">
                                                    From: {item.creator_name}
                                                  </span>
                                                ) : null}
                                                <span className="text-[11px] text-muted-foreground">
                                                  {relativeTime(item.created_at)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </Link>
                                        <div className="flex-shrink-0 p-3 pl-0 self-center">
                                          <Button
                                            size="sm"
                                            variant={item.status === "resolved" ? "outline" : "primary"}
                                            onClick={() => updateStatus(item.id, action.next)}
                                            className="whitespace-nowrap"
                                          >
                                            <ActionIcon className="w-3.5 h-3.5 mr-1.5" />
                                            {action.label}
                                          </Button>
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
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
