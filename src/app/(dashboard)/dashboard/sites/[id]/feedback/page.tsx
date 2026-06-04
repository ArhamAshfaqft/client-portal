"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/use-permissions";
import { Permissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeedbackForSite, getSiteName, getTeamMembers, getTeamMemberName, type EnrichedFeedback } from "@/lib/demo-data";
import { MediaPreview } from "@/components/ui/media-preview";
import { createClient } from "@/lib/supabase/client";
import { notifyWPWebhook } from "@/lib/webhook";
import type { FeedbackStatus } from "@/types";
import type { FeedbackMedia } from "@/types";
import {
  ArrowLeft,
  MessageSquareText,
  Pin,
  Mic,
  Image,
  Search,
  ArrowUpDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  UserPlus,
  User,
  Reply,
  Send,
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

const typeLabels: Record<string, string> = {
  pin: "Pin",
  comment: "Comment",
  voice: "Voice Note",
  media: "Media",
  rect: "Rectangle",
  arrow: "Arrow",
  draw: "Freehand",
};

const statusVariants: Record<string, "warning" | "success" | "default"> = {
  open: "warning",
  resolved: "success",
};

const statusActions: Record<string, { next: FeedbackStatus; label: string; icon: typeof Play }> = {
  open: { next: "resolved" as FeedbackStatus, label: "Mark Resolved", icon: CheckCircle2 },
  resolved: { next: "open" as FeedbackStatus, label: "Reopen", icon: ArrowRight },
};

function getViewportIcon(width: number | null | undefined) {
  if (!width) return null;
  if (width >= 1440) return Monitor;
  if (width >= 768) return Tablet;
  return Smartphone;
}

function getViewportLabel(width?: number | null, height?: number | null) {
  if (!width || !height) return null;
  if (width >= 1440) return "Desktop";
  if (width >= 768) return "Tablet";
  return "Mobile";
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  // Supabase TIMESTAMPTZ usually includes an offset, but WP-origin values may
  // arrive as "YYYY-MM-DD HH:MM:SS" (UTC, no marker). Without a timezone marker
  // new Date() treats it as LOCAL time → constant offset error. Normalize to UTC.
  let iso = dateStr.trim();
  const hasTz = /[zZ]$/.test(iso) || /[+-]\d{2}:?\d{2}$/.test(iso);
  if (!hasTz) {
    iso = iso.replace(" ", "T") + "Z";
  } else if (iso.includes(" ") && !iso.includes("T")) {
    iso = iso.replace(" ", "T");
  }
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (isNaN(diff)) return "";
  if (diff < 0) return "Just now";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function proxyMediaUrl(fileUrl: string): string {
  if (fileUrl.startsWith("/api/") || fileUrl.startsWith("http://localhost") || fileUrl.startsWith("blob:")) {
    return fileUrl;
  }
  return `/api/media/proxy?url=${encodeURIComponent(fileUrl)}`;
}

async function insertNotification(notif: {
  agency_id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  site_id?: string;
  feedback_id?: string;
}) {
  await supabase.from("notifications").insert({
    agency_id: notif.agency_id,
    user_id: notif.user_id || null,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    site_id: notif.site_id || null,
    feedback_id: notif.feedback_id || null,
  });
}

// Module-level singleton — stable across renders
const supabase = createClient();

export default function SiteFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile, isDemo } = useAuth();
  const { can: canDo } = usePermissions();
  const isOwner = profile?.role === "owner" || canDo(Permissions.FEEDBACK_ASSIGN);

  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<{ media: FeedbackMedia[]; index: number } | null>(null);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(!isDemo);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [siteCreds, setSiteCreds] = useState<{ wpRestUrl: string; wpApiKey: string } | null>(null);
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({});

  const fetchFeedback = async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      // Non-owners must be assigned to this site
      if (profile?.role !== "owner") {
        const { data: member } = await supabase
          .from("site_members")
          .select("id")
          .eq("site_id", id)
          .eq("user_id", profile?.user_id)
          .maybeSingle();
        if (!member) {
          router.replace("/dashboard/sites");
          return;
        }
      }

      const { data: siteData } = await supabase
        .from("sites")
        .select("url, wp_api_url, wp_api_key")
        .eq("id", id)
        .single();
      if (siteData) {
        setSiteCreds({
          wpRestUrl: siteData.wp_api_url || siteData.url || "",
          wpApiKey: siteData.wp_api_key || "",
        });
      }

      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("site_id", id);
      
      const projectList = projectsData || [];
      const projectIds = projectList.map((p) => p.id);
      const projectNames = Object.fromEntries(projectList.map((p) => [p.id, p.name]));

      if (projectIds.length === 0) {
        setFeedback([]);
        return;
      }

      let fbQuery = supabase
        .from("feedback_items")
        .select("*")
        .in("project_id", projectIds);

      // Devs only see their assigned feedback on the detail page
      const viewAll = canDo(Permissions.FEEDBACK_VIEW_ALL);
      if (!viewAll && canDo(Permissions.FEEDBACK_VIEW_ASSIGNED) && profile?.user_id) {
        fbQuery = fbQuery.eq("assigned_to", profile.user_id);
      }

      const { data: feedbackData, error } = await fbQuery
        .order("created_at", { ascending: false });

      if (error) throw error;

      const feedbackList = (feedbackData || []) as any[];
      const parents = feedbackList.filter((item) => !item.parent_id);
      const replies = feedbackList.filter((item) => item.parent_id);

      const feedbackIds = feedbackList.map((f) => f.id);
      let mediaMap: Record<string, any[]> = {};
      if (feedbackIds.length > 0) {
        const { data: mediaData } = await supabase
          .from("feedback_media")
          .select("*")
          .in("feedback_item_id", feedbackIds);
        if (mediaData) {
          for (const m of mediaData) {
            if (!mediaMap[m.feedback_item_id]) mediaMap[m.feedback_item_id] = [];
            mediaMap[m.feedback_item_id].push(m);
          }
        }
      }

      const enriched: EnrichedFeedback[] = parents.map((item) => {
        const itemReplies = replies
          .filter((r) => r.parent_id === item.id)
          .map((r) => ({
            id: r.id,
            project_id: r.project_id,
            parent_id: r.parent_id,
            type: r.type,
            content: r.content,
            page_url: r.page_url,
            selector: r.selector,
            coordinates_x: r.coordinates_x,
            coordinates_y: r.coordinates_y,
            coordinates_x_end: null,
            coordinates_y_end: null,
            width: null,
            height: null,
            draw_data: null,
            element_dna: null,
            meta_data: null,
            mirror_id: null,
            viewport_width: null,
            viewport_height: null,
            device: null,
            status: r.status,
            assigned_to: r.assigned_to,
            created_by: r.created_by,
            created_at: r.created_at,
            creator_name: r.created_by || "Anonymous",
            media: mediaMap[r.id] || [],
            replies: [],
          }));

        return {
          id: item.id,
          project_id: item.project_id,
          parent_id: null,
          type: item.type,
          content: item.content,
          page_url: item.page_url,
          selector: item.selector,
          coordinates_x: item.coordinates_x,
          coordinates_y: item.coordinates_y,
          coordinates_x_end: item.coordinates_x_end,
          coordinates_y_end: item.coordinates_y_end,
          width: item.width,
          height: item.height,
          draw_data: item.draw_data ? JSON.parse(item.draw_data) : null,
          element_dna: item.element_dna || null,
          mirror_id: item.mirror_id || null,
          meta_data: item.meta_data,
          viewport_width: item.viewport_width,
          viewport_height: item.viewport_height,
          device: item.device,
          status: item.status,
          assigned_to: item.assigned_to,
          created_by: item.created_by,
          created_at: item.created_at,
          creator_name: item.created_by || "Anonymous",
          media: mediaMap[item.id] || [],
          replies: itemReplies,
          project_name: projectNames[item.project_id] || "General",
          site_name: "Client Site",
        };
      });

      setFeedback(enriched);
      const assignedIds = [...new Set(enriched.filter((e) => e.assigned_to).map((e) => e.assigned_to))];
      if (assignedIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", assignedIds as any);
        if (profiles) {
          const nameMap: Record<string, string> = {};
          for (const p of profiles) nameMap[p.user_id] = p.full_name;
          setAssigneeNames(nameMap);
        }
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (isDemo) {
      setTeamMembers(getTeamMembers());
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, role, email");
    if (data) {
      setTeamMembers(data.map((p) => ({
        id: p.user_id,
        name: p.full_name,
        role: p.role,
        email: p.email,
      })));
    }
  };

  useEffect(() => {
    if (isDemo) {
      setFeedback(getFeedbackForSite(id));
      setLoading(false);
      return;
    }
    fetchFeedback();

    // ── Real-time: new feedback items ──────────────────────────────────
    const channel = supabase
      .channel(`site-feedback-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback_items" },
        (payload) => {
          const newItem = payload.new as any;
          if (!newItem.parent_id) {
            // Refresh the full list to get enriched data (media, project name, etc.)
            fetchFeedback();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "feedback_items" },
        (payload) => {
          const updated = payload.new as any;
          setFeedback((prev) =>
            prev.map((f) =>
              f.id === updated.id ? { ...f, status: updated.status, assigned_to: updated.assigned_to } : f
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isDemo, id]);

  useEffect(() => {
    fetchTeamMembers();
  }, [isDemo]);

  const handleAssign = async (feedbackId: string, userId: string) => {
    if (isDemo) {
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, assigned_to: userId } : f))
      );
      setAssignOpen(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("feedback_items")
        .update({ assigned_to: userId || null })
        .eq("id", feedbackId);
      if (error) throw error;
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, assigned_to: userId } : f))
      );
      if (userId && profile?.agency_id) {
        const item = feedback.find((f) => f.id === feedbackId);
        insertNotification({
          agency_id: profile.agency_id,
          user_id: userId,
          type: "assigned",
          title: "Assigned to you",
          message: `${item?.content?.substring(0, 80) || "Feedback"} — assigned to you`,
          site_id: id,
          feedback_id: feedbackId,
        });
      }
    } catch (err) {
      console.error("Failed to assign feedback:", err);
    } finally {
      setAssignOpen(null);
    }
  };

  const handleStatusChange = async (feedbackId: string, nextStatus: FeedbackStatus) => {
    if (isDemo) {
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: nextStatus } : f))
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("feedback_items")
        .update({ status: nextStatus })
        .eq("id", feedbackId);
      if (error) throw error;
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: nextStatus } : f))
      );
      const item = feedback.find((f) => f.id === feedbackId);
      if (siteCreds?.wpRestUrl && siteCreds?.wpApiKey) {
        notifyWPWebhook(siteCreds.wpRestUrl, siteCreds.wpApiKey, "update_status", { id: item?.mirror_id || feedbackId, status: nextStatus });
      }
      if (nextStatus === "resolved" && profile?.agency_id) {
        // Notify assigned devs and owners
        supabase
          .from("site_members")
          .select("user_id")
          .eq("site_id", id)
          .then(({ data: members }) => {
            const userIds = (members || []).map((m) => m.user_id);
            supabase
              .from("profiles")
              .select("user_id")
              .eq("agency_id", profile.agency_id)
              .eq("role", "owner")
              .then(({ data: owners }) => {
                if (owners) for (const o of owners) {
                  if (!userIds.includes(o.user_id)) userIds.push(o.user_id);
                }
                if (userIds.length > 0) {
                  supabase.from("notifications").insert(
                    userIds.map((uid) => ({
                      agency_id: profile.agency_id,
                      user_id: uid,
                      type: "resolved",
                      title: "Feedback resolved",
                      message: `"${item?.content?.substring(0, 80) || "Feedback"}" — Marked as resolved`,
                      site_id: id,
                      feedback_id: feedbackId,
                    }))
                  ).then(({ error }) => { if (error) console.error("Notify error:", error); });
                }
              });
          });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleReply = async (feedbackId: string) => {
    if (!replyText.trim()) return;
    const parent = feedback.find((f) => f.id === feedbackId);
    if (isDemo) {
      const reply: EnrichedFeedback = {
        id: `reply-${Date.now()}`,
        project_id: parent?.project_id || "",
        parent_id: feedbackId,
        type: "comment",
        content: replyText,
        page_url: parent?.page_url || "",
        selector: null,
        coordinates_x: null,
        coordinates_y: null,
        coordinates_x_end: null,
        coordinates_y_end: null,
        width: null,
        height: null,
        draw_data: null,
        element_dna: null,
        mirror_id: null,
        meta_data: null,
        viewport_width: null,
        viewport_height: null,
        device: null,
        status: "open",
        assigned_to: null,
        created_by: profile?.user_id || "",
        created_at: new Date().toISOString(),
        creator_name: profile?.full_name || "Me",
        media: [],
        replies: [],
        project_name: parent?.project_name || "",
        site_name: parent?.site_name || "",
      };
      setFeedback((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, replies: [...(f.replies || []), reply] }
            : f
        )
      );
      setReplyText("");
      setReplyOpen(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("feedback_items")
        .insert({
          project_id: parent?.project_id || "",
          parent_id: feedbackId,
          type: "comment",
          content: replyText,
          page_url: parent?.page_url || "",
          status: "open",
          created_by: profile?.full_name || "Anonymous",
        })
        .select()
        .single();
      if (error) throw error;

      // Auto-activate project if it was draft
      supabase.from("projects").update({ status: "active" }).eq("id", parent?.project_id).eq("status", "draft").then(() => {}, () => {});

      const parentItem = feedback.find((f) => f.id === feedbackId);
      if (siteCreds?.wpRestUrl && siteCreds?.wpApiKey) {
        notifyWPWebhook(siteCreds.wpRestUrl, siteCreds.wpApiKey, "reply_added", {
          parentId: feedbackId,
          parentMirrorId: parentItem?.mirror_id || null,
          replyId: data.id,
          content: replyText,
          createdBy: profile?.full_name || "Anonymous",
        });
      }
      if (profile?.agency_id) {
        insertNotification({
          agency_id: profile.agency_id,
          user_id: parentItem?.created_by !== profile?.user_id ? parentItem?.assigned_to || undefined : undefined,
          type: "replied",
          title: "New reply on feedback",
          message: `${profile?.full_name || "Someone"}: "${replyText.substring(0, 80)}"`,
          site_id: id,
          feedback_id: feedbackId,
        });
      }

      const reply: EnrichedFeedback = {
        id: data.id,
        project_id: data.project_id,
        parent_id: data.parent_id,
        type: data.type,
        content: data.content,
        page_url: data.page_url,
        selector: null,
        coordinates_x: null,
        coordinates_y: null,
        coordinates_x_end: null,
        coordinates_y_end: null,
        width: null,
        height: null,
        draw_data: null,
        element_dna: null,
        mirror_id: null,
        meta_data: null,
        viewport_width: null,
        viewport_height: null,
        device: null,
        status: data.status,
        assigned_to: null,
        created_by: data.created_by,
        created_at: data.created_at,
        creator_name: data.created_by || "Anonymous",
        media: [],
        replies: [],
        project_name: parent?.project_name || "",
        site_name: parent?.site_name || "",
      };

      setFeedback((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, replies: [...(f.replies || []), reply] }
            : f
        )
      );
    } catch (err) {
      console.error("Failed to submit reply:", err);
    } finally {
      setReplyText("");
      setReplyOpen(null);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, typeof feedback> = {};
    feedback.forEach((f) => {
      const key = f.project_name || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    });
    return groups;
  }, [feedback]);

  const filtered = useMemo(() => {
    let result = feedback;

    if (filter === "open") {
      result = result.filter((f) => f.status === "open");
    } else if (filter !== "all") {
      result = result.filter((f) => f.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.content.toLowerCase().includes(q) ||
          (f.page_url || "").toLowerCase().includes(q) ||
          (f.creator_name || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [feedback, filter, search]);

  const sortedProjects = useMemo(() => {
    const projectOrder = Object.keys(grouped).sort();
    return projectOrder.map((projectName) => {
      let items = grouped[projectName].filter((f) => filtered.some((ff) => ff.id === f.id));
      items.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
      return { projectName, items };
    }).filter((g) => g.items.length > 0);
  }, [grouped, filtered, sortOrder]);

  const counts = {
    all: feedback.length,
    pending: feedback.filter((f) => f.status === "open").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  };

  const toggleProject = (name: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const siteName = isDemo ? getSiteName(id) : "Feedback";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/dashboard/sites")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sites
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{siteName}</h2>
            <p className="text-sm text-muted-foreground">
              {feedback.length} feedback item{feedback.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm"><span className="font-semibold text-foreground">{counts.pending}</span> <span className="text-muted-foreground">pending</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm"><span className="font-semibold text-foreground">{counts.resolved}</span> <span className="text-muted-foreground">resolved</span></span>
              </div>
            </div>
              <div className="h-2 w-32 bg-muted rounded-full overflow-hidden hidden sm:block">
              <div className="flex h-full">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${counts.all ? (counts.pending / counts.all) * 100 : 0}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${counts.all ? (counts.resolved / counts.all) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "all", label: "All", count: counts.all },
            { key: "open", label: "Pending", count: counts.pending },
            { key: "resolved", label: "Resolved", count: counts.resolved },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
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
          <button
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading feedback...</p>
          </CardContent>
        </Card>
      ) : sortedProjects.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <MessageSquareText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {search ? "No matching feedback" : "No feedback yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {search ? "Try a different search term" : "Feedback from clients will appear here"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedProjects.map(({ projectName, items }) => {
            const isExpanded = expandedProjects.has(projectName);
            return (
              <div key={projectName}>
                <button
                  onClick={() => toggleProject(projectName)}
                  className="flex items-center gap-2 w-full mb-3 group"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {projectName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({items.length})
                  </span>
                  <div className="flex-1 border-t border-border" />
                </button>

                <div className={`space-y-2 ${isExpanded ? "" : "hidden"}`}>
                  {items.map((item) => {
                    const TypeIcon = typeIcons[item.type] || MessageSquareText;
                    const action = statusActions[item.status];
                    const ActionIcon = action?.icon;
                    const ViewportIcon = getViewportIcon(item.viewport_width);
                    const viewportLabel = getViewportLabel(item.viewport_width, item.viewport_height);
                    const assigneeName = assigneeNames[item.assigned_to || ""] || (isDemo ? getTeamMemberName(item.assigned_to) : null);

                    return (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                              <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  {typeLabels[item.type]}
                                </span>
                                <Badge variant={statusVariants[item.status] || "default"}>
                                  {item.status === "open" ? "Pending" : item.status === "resolved" ? "Resolved" : item.status}
                                </Badge>
                                {item.creator_name && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.creator_name}
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-foreground leading-relaxed">
                                {item.content}
                              </p>

                              {/* Media attachments */}
                              {item.media && item.media.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {item.media.map((m, mi) => {
                                    const isImg = m.file_type.startsWith("image/");
                                    const isVid = m.file_type.startsWith("video/");
                                    if (isImg) {
                                      return (
                                        <button
                                          key={m.id}
                                          onClick={() => setPreviewMedia({ media: item.media!, index: mi })}
                                          className="group relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all"
                                        >
                                          <img
                                            src={proxyMediaUrl(m.file_url)}
                                            alt={m.file_name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </button>
                                      );
                                    }
                                    if (isVid) {
                                      return (
                                        <button
                                          key={m.id}
                                          onClick={() => setPreviewMedia({ media: item.media!, index: mi })}
                                          className="group relative w-48 h-24 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all"
                                        >
                                          <video src={proxyMediaUrl(m.file_url)} className="w-full h-full object-cover" muted />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                              <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-black ml-1" />
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    }
                                    return (
                                      <button
                                        key={m.id}
                                        onClick={() => setPreviewMedia({ media: item.media!, index: mi })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-accent text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                                      >
                                        {m.file_name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Replies */}
                              {item.replies && item.replies.length > 0 && (
                                <div className="mt-3 space-y-2 pl-4 border-l-2 border-border">
                                  {item.replies.map((r) => (
                                    <div key={r.id} className="text-sm">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-xs font-medium text-foreground">{r.creator_name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {new Date(r.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{r.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply form */}
                              {replyOpen === item.id ? (
                                <div className="mt-3 flex items-start gap-2">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    rows={2}
                                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(item.id);
                                      }
                                    }}
                                  />
                                  <Button size="sm" onClick={() => handleReply(item.id)} disabled={!replyText.trim()}>
                                    <Send className="w-3.5 h-3.5 mr-1" />
                                    Send
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setReplyOpen(item.id); setReplyText(""); }}
                                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Reply className="w-3 h-3" />
                                  Reply
                                </button>
                              )}

                              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                                {item.page_url && (
                                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                    {item.page_url}
                                  </span>
                                )}

                                {viewportLabel && ViewportIcon && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ViewportIcon className="w-3 h-3" />
                                    {viewportLabel} ({item.viewport_width}x{item.viewport_height})
                                  </span>
                                )}

                {item.coordinates_x != null && item.coordinates_y != null && (
                  <span className="text-xs text-muted-foreground">
                    Pin: ({Math.round(item.coordinates_x)}%, {Math.round(item.coordinates_y)}%)
                  </span>
                )}

                                <span className="text-xs text-muted-foreground" title={new Date(item.created_at).toLocaleString()}>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {timeAgo(item.created_at)}
                                </span>
                              </div>

                              {/* Assignee + action bar */}
                              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  {assigneeName ? (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <User className="w-3 h-3" />
                                      {assigneeName}
                                    </span>
                                  ) : isOwner ? (
                                    <div className="relative">
                                      <button
                                        onClick={() => setAssignOpen(assignOpen === item.id ? null : item.id)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
                                      >
                                        <UserPlus className="w-3 h-3" />
                                        Assign
                                      </button>
                                      {assignOpen === item.id && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setAssignOpen(null)}
                                          />
                                          <div className="absolute left-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-popover shadow-lg py-1">
                                            {teamMembers.map((m) => (
                                              <button
                                                key={m.user_id}
                                                onClick={() => handleAssign(item.id, m.user_id)}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
                                                  item.assigned_to === m.user_id
                                                    ? "text-primary font-medium"
                                                    : "text-foreground"
                                                }`}
                                              >
                                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                {m.full_name}
                                              </button>
                                            ))}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <UserPlus className="w-3 h-3" />
                                      Unassigned
                                    </span>
                                  )}
                                </div>

                                {isOwner && action && (
                                  <Button
                                    size="sm"
                                    variant={item.status === "resolved" ? "outline" : "primary"}
                                    onClick={() => handleStatusChange(item.id, action.next)}
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
              </div>
            );
          })}
        </div>
      )}

      {previewMedia && (
        <MediaPreview
          media={previewMedia.media}
          initialIndex={previewMedia.index}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </div>
  );
}
