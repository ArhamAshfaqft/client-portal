"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pin, MessageSquareText, Mic, Image, Square, ArrowUpRight, Pencil,
  CheckCircle2, ArrowRight, Globe, Copy, RefreshCw,
  Trash2, Play, FileText, ChevronDown,
  ChevronRight, ExternalLink, Maximize2, X,
  ArrowLeft, Monitor, Calendar,
} from "lucide-react";
import Link from "next/link";
import type { FeedbackStatus } from "@/types";
import { usePermissions } from "@/lib/use-permissions";
import { Permissions } from "@/lib/permissions";

const typeIcons: Record<string, typeof Pin> = {
  pin: Pin, comment: MessageSquareText, voice: Mic, media: Image,
  rect: Square, arrow: ArrowUpRight, draw: Pencil,
};

const typeLabels: Record<string, string> = {
  pin: "Pin", comment: "Comment", voice: "Voice Note", media: "Media",
  rect: "Rectangle", arrow: "Arrow", draw: "Freehand",
};

const statusVariants: Record<string, "warning" | "info" | "success" | "default"> = {
  open: "warning",
  resolved: "success",
};

const statusActions: Record<string, { next: FeedbackStatus; label: string; icon: typeof Play }> = {
  open: { next: "resolved" as FeedbackStatus, label: "Mark as Resolved", icon: CheckCircle2 },
  resolved: { next: "open" as FeedbackStatus, label: "Reopen", icon: ArrowRight },
};

function isImage(fileType: string): boolean {
  return fileType.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(fileType);
}

function isAudio(fileType: string): boolean {
  return fileType.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(fileType);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileName(urlOrName: string): string {
  const parts = urlOrName.split("/");
  return parts[parts.length - 1] || urlOrName;
}

interface FeedbackWithMedia {
  id: string;
  type: string;
  content: string;
  status: string;
  created_by: string | null;
  created_at: string;
  page_url: string;
  device: string | null;
  mirror_id?: string | null;
  media: { id: string; file_url: string; file_type: string; file_name: string; file_size: number }[];
  replies?: { id: string; content: string; created_by?: string; createdBy?: string; created_at?: string; createdAt?: string }[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { profile, isDemo } = useAuth();
  const { can } = usePermissions();
  const [project, setProject] = useState<any>(null);
  const [feedback, setFeedback] = useState<FeedbackWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!projectId || isDemo) { setLoading(false); return; }
    const supabase = createClient();
    const isOwner = profile?.role === "owner";

    const now = new Date().toISOString();

    Promise.all([
      supabase.from("projects").select("*, site:site_id(name, url, wp_api_key)").eq("id", projectId).single(),
      supabase.from("preview_links").select("target_url").eq("project_id", projectId).eq("is_active", true).or(`expires_at.is.null,expires_at.gt.${now}`).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      (() => {
        let q = supabase
          .from("feedback_items")
          .select("id, type, content, status, created_by, created_at, page_url, parent_id, device, mirror_id")
          .eq("project_id", projectId)
          .is("parent_id", null)
          .order("created_at", { ascending: true });
        if (!isOwner) q = q.eq("assigned_to", profile?.user_id);
        return q;
      })(),
    ]).then(async ([{ data: proj }, { data: link }, { data: items }]) => {
      setProject(proj);
      if (link?.target_url) setPreviewLink(link.target_url);
      if (!items || items.length === 0) { setFeedback([]); setLoading(false); return; }

      const ids = items.map((i: any) => i.id);
      const { data: media } = await supabase
        .from("feedback_media")
        .select("*")
        .in("feedback_item_id", ids);

      const mediaMap: Record<string, any[]> = {};
      if (media) {
        for (const m of media as any[]) {
          if (!mediaMap[m.feedback_item_id]) mediaMap[m.feedback_item_id] = [];
          mediaMap[m.feedback_item_id].push(m);
        }
      }

      setFeedback(
        items.map((i: any) => ({
          id: i.id,
          type: i.type,
          content: i.content,
          status: i.status,
          created_by: i.created_by,
          created_at: i.created_at,
          page_url: i.page_url || "",
          device: i.device || null,
          mirror_id: i.mirror_id,
          media: mediaMap[i.id] || [],
        }))
      );
      setLoading(false);
    });
  }, [projectId, profile?.user_id, isDemo, refreshKey]);

  const pages = useMemo(() => {
    const p = new Set<string>();
    for (const f of feedback) if (f.page_url) p.add(f.page_url);
    return Array.from(p).sort();
  }, [feedback]);

  const filtered = useMemo(() => {
    let result: (FeedbackWithMedia & { stableNum: number })[] = feedback.map((f, i) => ({ ...f, stableNum: i + 1 }));
    if (statusFilter !== "all") result = result.filter((f) => f.status === statusFilter);
    if (pageFilter !== "all") result = result.filter((f) => f.page_url === pageFilter);
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [feedback, statusFilter, pageFilter, sortOrder]);

  const counts = useMemo(() => ({
    total: feedback.length,
    pending: feedback.filter((f) => f.status === "open").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  }), [feedback]);

  const handleStatus = async (id: string, newStatus: FeedbackStatus) => {
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));
    try {
      const res = await fetch(`/api/widget/annotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("Status update failed:", res.status);
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleReply = async (feedbackId: string) => {
    if (!replyText.trim()) return;
    const item = feedback.find((f) => f.id === feedbackId);
    if (isDemo || !item) { setReplyText(""); setReplyOpenId(null); return; }
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("feedback_items")
        .insert({
          project_id: projectId,
          parent_id: feedbackId,
          type: "comment",
          content: replyText.trim(),
          page_url: item.page_url || "",
          status: "open",
          created_by: profile?.full_name || "Anonymous",
        })
        .select()
        .single();
      if (error) throw error;
      const reply = { id: data.id, content: data.content, created_by: data.created_by, created_at: data.created_at };
      setFeedback((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, replies: [...(f.replies || []), reply] } as FeedbackWithMedia
            : f
        )
      );
      setReplyText("");
      setReplyOpenId(null);
      // Notify WP if site creds available
      const site = (project as any)?.site;
      if (site?.url && site?.wp_api_key) {
        const parentMirrorId = item.mirror_id || feedbackId;
        fetch(`${site.url.replace(/\/$/, '')}/wp-json/feedspace/v1/webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Feedspace-Key": site.wp_api_key },
          body: JSON.stringify({ action: "reply_added", data: { parentId: parentMirrorId, parentMirrorId, replyId: data.id, content: replyText.trim(), createdBy: profile?.full_name || "Anonymous", createdAt: data.created_at } }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  const handleDelete = async (id: string) => {
    setFeedback((prev) => prev.filter((f) => f.id !== id));
    try {
      await fetch(`/api/widget/annotations/${id}`, { method: "DELETE" });
    } catch {
      // best effort
    }
  };

  const copyLink = () => {
    const url = previewLink || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/my-feedback" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{project?.name || "Session"}</h2>
            <p className="text-xs text-muted-foreground">{project?.site?.name || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied" : "Copy Link"}
          </button>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Badge variant={project?.status === "active" ? "success" : project?.status === "completed" ? "info" : "default"} className="text-xs">{project?.status || "draft"}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 px-4 py-3 bg-accent rounded-lg">
        <span className="text-sm text-muted-foreground">
          Total <strong className="text-foreground">{counts.total}</strong>
        </span>
        <span className="w-px h-4 bg-border" />
        <span className="text-sm text-muted-foreground">
          Pending <strong className="text-amber-600">{counts.pending}</strong>
        </span>
        <span className="w-px h-4 bg-border" />
        <span className="text-sm text-muted-foreground">
          Resolved <strong className="text-emerald-600">{counts.resolved}</strong>
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
        {[{ key: "all", label: `All (${counts.total})` }, { key: "open", label: `Pending (${counts.pending})` }, { key: "resolved", label: `Resolved (${counts.resolved})` }].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab.key ? "bg-primary text-white" : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {pages.length > 0 && (
          <>
            <span className="w-px h-4 bg-border mx-1" />
            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All pages</option>
              {pages.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </>
        )}
        <span className="w-px h-4 bg-border mx-1" />
        {[
          { key: 'newest' as const, label: 'Recent' },
          { key: 'oldest' as const, label: 'Oldest' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortOrder(s.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              sortOrder === s.key ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Card key={i}><CardContent><div className="h-20 bg-muted rounded animate-pulse" /></CardContent></Card>))}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent><div className="text-center py-12 text-sm text-muted-foreground">No feedback items</div></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const TypeIcon = typeIcons[item.type] || MessageSquareText;
            const action = statusActions[item.status];
            const ActionIcon = action?.icon;
            const hasImages = item.media.filter((m) => isImage(m.file_type));
            const hasAudio = item.media.filter((m) => isAudio(m.file_type));
            const hasFiles = item.media.filter((m) => !isImage(m.file_type) && !isAudio(m.file_type));

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow rounded-xl">
                <CardContent className="p-5">
                  {/* Header: number + name | status */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold">{item.stableNum}</span>
                      <span className="text-lg font-semibold text-foreground">{item.created_by || "Anonymous"}</span>
                    </div>
                    <Badge variant={statusVariants[item.status] || "default"} className="text-xs px-3 py-1 rounded-full font-semibold">
                      {item.status === "open" ? "Pending" : item.status === "resolved" ? "Resolved" : item.status}
                    </Badge>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-foreground leading-relaxed mb-4">{item.content}</p>

                  {/* Images */}
                  {hasImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hasImages.map((m) => (
                        <div key={m.id} className="relative group">
                          <div
                            onClick={() => setPreviewUrl(m.file_url)}
                            className="w-20 h-20 rounded-lg border border-border overflow-hidden cursor-pointer bg-accent hover:border-primary transition-colors"
                          >
                            <img src={m.file_url} alt={m.file_name} className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={() => setPreviewUrl(m.file_url)}
                            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg"
                          >
                            <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Audio */}
                  {hasAudio.length > 0 && hasAudio.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 p-2 bg-accent rounded-lg mb-4">
                      <Mic className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{m.file_name || "Voice Note"}</span>
                      <audio controls className="h-8 max-w-[180px]" preload="none">
                        <source src={m.file_url} />
                      </audio>
                    </div>
                  ))}

                  {/* Files */}
                  {hasFiles.length > 0 && (
                    <div className="space-y-1 mb-4">
                      {hasFiles.map((m) => (
                        <a
                          key={m.id}
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-foreground flex-1 truncate">{getFileName(m.file_name)}</span>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatFileSize(m.file_size)}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* URL */}
                  {item.page_url && (
                    <a href={item.page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-4">
                      <Globe className="w-4 h-4" />
                      {item.page_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}

                  {/* Replies */}
                  {(item.replies?.length ?? 0) > 0 && (
                    <div className="space-y-2 mb-4 pl-4 border-l-2 border-border">
                      {item.replies?.map((r: any) => (
                        <div key={r.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{r.created_by || r.createdBy || "Anonymous"}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(r.created_at || r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyOpenId === item.id && (
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleReply(item.id); }}
                        placeholder="Write a reply..."
                        className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={() => handleReply(item.id)}
                        disabled={!replyText.trim()}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {/* Bottom meta: tags | action */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-lg border border-border">
                        <TypeIcon className="w-3 h-3" />
                        {typeLabels[item.type] || item.type}
                      </span>
                      {item.device && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-lg border border-border">
                          <Monitor className="w-3 h-3" />
                          {item.device.charAt(0).toUpperCase() + item.device.slice(1)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-lg border border-border">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => { setReplyOpenId(replyOpenId === item.id ? null : item.id); setReplyText(""); }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2.5 py-1"
                      >
                        <MessageSquareText className="w-3 h-3" />
                        {replyOpenId === item.id ? "Cancel" : `Reply${(item.replies?.length ?? 0) > 0 ? ` (${item.replies?.length})` : ""}`}
                      </button>
                    </div>
                    {action && (
                      <button
                        onClick={() => handleStatus(item.id, action.next)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                      >
                        <ActionIcon className="w-4 h-4" />
                        {action.label}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <button onClick={() => setPreviewUrl(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img src={previewUrl} className="max-w-full max-h-[90vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} alt="" />
        </div>
      )}
    </div>
  );
}
