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
  CheckCircle2, ArrowRight, Globe, Copy,
  Trash2, Play, FileText, ChevronDown,
  ChevronRight, ExternalLink, Maximize2, X,
  ArrowLeft,
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
  open: { next: "resolved" as FeedbackStatus, label: "Resolve", icon: CheckCircle2 },
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
  media: { id: string; file_url: string; file_type: string; file_name: string; file_size: number }[];
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!projectId || isDemo) { setLoading(false); return; }
    const supabase = createClient();
    const isOwner = profile?.role === "owner";

    const now = new Date().toISOString();

    Promise.all([
      supabase.from("projects").select("*, site:site_id(name)").eq("id", projectId).single(),
      supabase.from("preview_links").select("target_url").eq("project_id", projectId).eq("is_active", true).or(`expires_at.is.null,expires_at.gt.${now}`).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      (() => {
        let q = supabase
          .from("feedback_items")
          .select("id, type, content, status, created_by, created_at, page_url, parent_id, device")
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
          media: mediaMap[i.id] || [],
        }))
      );
      setLoading(false);
    });
  }, [projectId, profile?.user_id, isDemo]);

  const pages = useMemo(() => {
    const p = new Set<string>();
    for (const f of feedback) if (f.page_url) p.add(f.page_url);
    return Array.from(p).sort();
  }, [feedback]);

  const filtered = useMemo(() => {
    let result = feedback;
    if (statusFilter !== "all") result = result.filter((f) => f.status === statusFilter);
    if (pageFilter !== "all") result = result.filter((f) => f.page_url === pageFilter);
    return result;
  }, [feedback, statusFilter, pageFilter]);

  const counts = useMemo(() => ({
    total: feedback.length,
    pending: feedback.filter((f) => f.status === "open").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  }), [feedback]);

  const handleStatus = (id: string, newStatus: FeedbackStatus) => {
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));
    const supabase = createClient();
    supabase.from("feedback_items").update({ status: newStatus }).eq("id", id).then(() => {}, () => {});
  };

  const handleDelete = async (id: string) => {
    setFeedback((prev) => prev.filter((f) => f.id !== id));
    const supabase = createClient();
    supabase.from("feedback_items").delete().eq("id", id).then(() => {}, () => {});
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
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Card key={i}><CardContent><div className="h-20 bg-muted rounded animate-pulse" /></CardContent></Card>))}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent><div className="text-center py-12 text-sm text-muted-foreground">No feedback items</div></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => {
            const TypeIcon = typeIcons[item.type] || MessageSquareText;
            const action = statusActions[item.status];
            const ActionIcon = action?.icon;
            const hasImages = item.media.filter((m) => isImage(m.file_type));
            const hasAudio = item.media.filter((m) => isAudio(m.file_type));
            const hasFiles = item.media.filter((m) => !isImage(m.file_type) && !isAudio(m.file_type));

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs text-muted-foreground font-mono font-semibold">#{idx + 1}</span>
                    <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{typeLabels[item.type] || item.type}</span>
                    <span className="text-xs font-medium text-foreground ml-1">{item.created_by || "Anonymous"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <Badge variant={statusVariants[item.status] || "default"} className="text-[10px] px-1.5 py-0">
                      {item.status === "open" ? "pending" : item.status}
                    </Badge>
                    {item.device && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border border-border rounded px-1.5 py-0">
                        {item.device}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground mb-1.5">{item.content}</p>

                  {/* Images */}
                  {hasImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1.5">
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
                    <div key={m.id} className="flex items-center gap-2 p-2 bg-accent rounded-lg mb-1.5">
                      <Mic className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{m.file_name || "Voice Note"}</span>
                      <audio controls className="h-8 max-w-[180px]" preload="none">
                        <source src={m.file_url} />
                      </audio>
                    </div>
                  ))}

                  {/* Files */}
                  {hasFiles.length > 0 && (
                    <div className="space-y-1 mb-1.5">
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

                  {/* Page URL */}
                  {item.page_url && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {item.page_url}
                    </p>
                  )}
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
