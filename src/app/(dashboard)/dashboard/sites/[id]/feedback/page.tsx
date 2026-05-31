"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/use-permissions";
import { Permissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeedbackForSite, getSiteName, getTeamMembers, getTeamMemberName, type EnrichedFeedback } from "@/lib/demo-data";
import { MediaPreview } from "@/components/ui/media-preview";
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

const statusVariants: Record<string, "warning" | "info" | "success" | "default"> = {
  open: "warning",
  in_progress: "info",
  resolved: "success",
  closed: "default",
};

const statusActions: Record<string, { next: FeedbackStatus; label: string; icon: typeof Play }> = {
  open: { next: "in_progress" as FeedbackStatus, label: "Start Working", icon: Play },
  in_progress: { next: "resolved" as FeedbackStatus, label: "Mark Resolved", icon: CheckCircle2 },
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

  // Sync feedback data when demo state or site id changes
  useEffect(() => {
    setFeedback(isDemo ? getFeedbackForSite(id) : []);
  }, [isDemo, id]);

  const teamMembers = useMemo(() => isDemo ? getTeamMembers() : [], [isDemo]);

  const handleAssign = (feedbackId: string, userId: string) => {
    setFeedback((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, assigned_to: userId } : f))
    );
    setAssignOpen(null);
  };

  const handleStatusChange = (feedbackId: string, nextStatus: FeedbackStatus) => {
    setFeedback((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, status: nextStatus } : f))
    );
  };

  const handleReply = (feedbackId: string) => {
    if (!replyText.trim()) return;
    const parent = feedback.find((f) => f.id === feedbackId);
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

    if (filter !== "all") {
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
    open: feedback.filter((f) => f.status === "open").length,
    in_progress: feedback.filter((f) => f.status === "in_progress").length,
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
                <span className="text-sm"><span className="font-semibold text-foreground">{counts.open}</span> <span className="text-muted-foreground">new</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary" />
                <span className="text-sm"><span className="font-semibold text-foreground">{counts.in_progress}</span> <span className="text-muted-foreground">in progress</span></span>
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
                  style={{ width: `${counts.all ? (counts.open / counts.all) * 100 : 0}%` }}
                />
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${counts.all ? (counts.in_progress / counts.all) * 100 : 0}%` }}
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
            { key: "open", label: "New", count: counts.open },
            { key: "in_progress", label: "In Progress", count: counts.in_progress },
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

      {/* Results */}
      {sortedProjects.length === 0 ? (
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
                    const assigneeName = isDemo ? getTeamMemberName(item.assigned_to) : null;

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
                                  {item.status === "open" ? "New" : item.status.replace("_", " ")}
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
                                            src={m.file_url}
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
                                          <video src={m.file_url} className="w-full h-full object-cover" muted />
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

                                <span className="text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {new Date(item.created_at).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                                  })}
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

                                {profile?.role === "developer" && action && (
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
