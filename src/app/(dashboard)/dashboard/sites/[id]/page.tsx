"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getFeedbackForSite, getSiteName, getProjectsForSite, DEMO_SITES } from "@/lib/demo-data";

import {
  ArrowLeft,
  Plus,
  Copy,
  MessageSquareText,
  Globe,
  Link2,
  X,
  ExternalLink,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";
import type { Site, Project, PreviewLink } from "@/types";

const DEMO_PREVIEW_LINKS: Record<string, PreviewLink[]> = {
  "demo-proj-1": [
    { id: "link-1", project_id: "demo-proj-1", token: "demo-preview-token-1", target_url: "https://brightonlaw.preview.feedspace.io", is_active: true, created_by: "owner-1", created_at: "2026-05-20T10:00:00Z", expires_at: null },
  ],
  "demo-proj-3": [
    { id: "link-2", project_id: "demo-proj-3", token: "demo-preview-token-3", target_url: "https://greenleaf.preview.feedspace.io", is_active: true, created_by: "owner-1", created_at: "2026-05-22T14:00:00Z", expires_at: "2026-06-22T14:00:00Z" },
    { id: "link-5", project_id: "demo-proj-3", token: "demo-revoked-token", target_url: "https://v1.greenleaf.preview.feedspace.io", is_active: false, created_by: "owner-1", created_at: "2026-05-01T09:00:00Z", expires_at: null },
  ],
  "demo-proj-5": [
    { id: "link-3", project_id: "demo-proj-5", token: "demo-preview-token-5", target_url: "https://pinnacle.preview.feedspace.io", is_active: true, created_by: "owner-1", created_at: "2026-05-25T08:00:00Z", expires_at: "2026-06-25T08:00:00Z" },
  ],
};

// Module-level singleton — stable across renders
const supabase = createClient();

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isDemo, profile } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewLinks, setPreviewLinks] = useState<Record<string, PreviewLink[]>>({});
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});
  const [managingProject, setManagingProject] = useState<string | null>(null);
  const [showNewLink, setShowNewLink] = useState(false);
  const [linkTargetUrl, setLinkTargetUrl] = useState("");
  const [linkExpiryDays, setLinkExpiryDays] = useState("30");
  const [creatingLink, setCreatingLink] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (isDemo) {
      const demo = DEMO_SITES.find((s) => s.id === id);
      if (demo) {
        setSite(demo as unknown as Site);
        const projs = getProjectsForSite(id);
        setProjects(projs);
        setFeedbackCounts(
          Object.fromEntries(
            projs.map((p) => [
              p.id,
              getFeedbackForSite(id).filter((f) => f.project_id === p.id).length,
            ])
          )
        );
        setPreviewLinks(DEMO_PREVIEW_LINKS);
      }
      setLoading(false);
      return;
    }

    const { data: siteData } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();
    setSite(siteData as Site);

    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .eq("site_id", id)
      .order("created_at", { ascending: false });
    const projectsList = (projectsData || []) as Project[];
    setProjects(projectsList);

    // Batch-fetch all preview links in one query instead of N+1
    const projectIds = projectsList.map((p) => p.id);
    const linksMap: Record<string, PreviewLink[]> = {};
    if (projectIds.length > 0) {
      const { data: allLinks } = await supabase
        .from("preview_links")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });
      if (allLinks) {
        for (const link of allLinks as PreviewLink[]) {
          if (!linksMap[link.project_id]) linksMap[link.project_id] = [];
          linksMap[link.project_id].push(link);
        }
      }
    }
    setPreviewLinks(linksMap);
    setLoading(false);
  };

  const createProject = async () => {
    if (!site) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        agency_id: site.agency_id,
        site_id: site.id,
        name: projectName,
        status: "draft",
      })
      .select()
      .single();

    if (!error && data) {
      const token = crypto.randomUUID();
      const previewUrl = site.url || "https://example.com";

      await supabase.from("preview_links").insert({
        project_id: data.id,
        token,
        target_url: previewUrl,
        created_by: profile?.user_id || "",
      });

      setShowNewProject(false);
      setProjectName("");
      fetchData();
    }
    setSubmitting(false);
  };

  const copyPreviewLink = (token: string, projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const linkedSite = site;
    const isWPConnected = linkedSite?.wp_connected && linkedSite?.url;
    const url = isWPConnected
      ? `${linkedSite.url.replace(/\/+$/, '')}?feedspace_preview=${token}`
      : `${window.location.origin}/preview/${token}`;
    navigator.clipboard.writeText(url);
  };

  const createPreviewLink = async () => {
    if (!managingProject || !linkTargetUrl.trim()) return;
    setCreatingLink(true);

    const expiryDate = linkExpiryDays
      ? new Date(Date.now() + parseInt(linkExpiryDays) * 86400000).toISOString()
      : null;

    if (isDemo) {
      const newLink: PreviewLink = {
        id: `link-${Date.now()}`,
        project_id: managingProject,
        token: `demo-token-${Date.now()}`,
        target_url: linkTargetUrl.trim(),
        is_active: true,
        created_by: "owner-1",
        created_at: new Date().toISOString(),
        expires_at: expiryDate,
      };
      setPreviewLinks((prev) => ({
        ...prev,
        [managingProject]: [newLink, ...(prev[managingProject] || [])],
      }));
      setShowNewLink(false);
      setLinkTargetUrl("");
      setLinkExpiryDays("30");
      setCreatingLink(false);
      return;
    }

    const { data, error } = await supabase
      .from("preview_links")
      .insert({
        project_id: managingProject,
        token: crypto.randomUUID(),
        target_url: linkTargetUrl.trim(),
        created_by: profile?.user_id || "",
        expires_at: expiryDate,
      })
      .select()
      .single();

    if (!error && data) {
      setPreviewLinks((prev) => ({
        ...prev,
        [managingProject]: [data as PreviewLink, ...(prev[managingProject] || [])],
      }));
      setShowNewLink(false);
      setLinkTargetUrl("");
      setLinkExpiryDays("30");
    }
    setCreatingLink(false);
  };

  const revokeLink = async (linkId: string) => {
    if (isDemo) {
      setPreviewLinks((prev) => {
        const updated = { ...prev };
        for (const projId of Object.keys(updated)) {
          updated[projId] = updated[projId].map((l) =>
            l.id === linkId ? { ...l, is_active: false } : l
          );
        }
        return updated;
      });
      return;
    }
    try {
      await supabase.from("preview_links").update({ is_active: false }).eq("id", linkId);
    } catch (err) {
      console.error("Failed to revoke link:", err);
    }
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Site not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/sites")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sites
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/sites")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sites
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{site.name}</h2>
            <p className="text-sm text-muted-foreground">{site.url}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Projects</h3>
        <Button onClick={() => setShowNewProject(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No projects yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first project to start collecting feedback
              </p>
              <Button onClick={() => setShowNewProject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {project.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {project.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          project.status === "active"
                            ? "success"
                            : project.status === "completed"
                              ? "info"
                              : "default"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/sites/${id}/feedback`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:bg-border transition-colors"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" />
                      Feedback
                      {feedbackCounts[project.id] > 0 && (
                        <span className="ml-0.5 text-xs opacity-70">({feedbackCounts[project.id]})</span>
                      )}
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManagingProject(managingProject === project.id ? null : project.id)}
                    >
                      <Link2 className="w-4 h-4 mr-1.5" />
                      Links
                      {(previewLinks[project.id] || []).filter((l) => l.is_active).length > 0 && (
                        <span className="ml-1 text-xs opacity-70">({(previewLinks[project.id] || []).filter((l) => l.is_active).length})</span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              {managingProject === project.id && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-foreground">Preview Links</h5>
                    <Button size="sm" onClick={() => { setShowNewLink(true); setLinkTargetUrl(project.name ? `${site?.url || ""}/${project.name.toLowerCase().replace(/\s+/g, "-")}` : site?.url || ""); }}>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      New Link
                    </Button>
                  </div>
                  {(previewLinks[project.id] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No preview links yet. Create one to share with your team.</p>
                  ) : (
                    <div className="space-y-2">
                      {(previewLinks[project.id] || []).map((link) => {
                        const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                        const isActive = link.is_active && !isExpired;
                        return (
                          <div
                            key={link.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border ${
                              isActive
                                ? "border-border bg-background"
                                : "border-border/50 bg-muted/30 opacity-60"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {isActive ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : !link.is_active ? (
                                  <Ban className="w-3.5 h-3.5 text-muted-foreground" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                )}
                                <span className="text-sm truncate text-foreground">
                                  {link.target_url}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-muted-foreground/60">
                                  Created {new Date(link.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                {link.expires_at && (
                                  <span className={`text-[11px] ${isExpired ? "text-red-500" : "text-muted-foreground/60"}`}>
                                    Expires {new Date(link.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                )}
                                <span className={`text-[11px] capitalize ${
                                  isActive ? "text-emerald-500" : "text-muted-foreground"
                                }`}>
                                  {!link.is_active ? "Revoked" : isExpired ? "Expired" : "Active"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isActive && (
                                <>
                                  <button
                                    onClick={() => copyPreviewLink(link.token, project.id)}
                                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy link"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={`/preview/${link.token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    title="Open preview"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => revokeLink(link.id)}
                                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                    title="Revoke link"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        title="Create New Project"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Homepage Redesign"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowNewProject(false)}
            >
              Cancel
            </Button>
            <Button onClick={createProject} loading={submitting}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showNewLink}
        onClose={() => setShowNewLink(false)}
        title="Create Preview Link"
      >
        <div className="space-y-4">
          <Input
            label="Target URL"
            placeholder="https://example.com/preview"
            value={linkTargetUrl}
            onChange={(e) => setLinkTargetUrl(e.target.value)}
          />
          <Input
            label="Expires in (days)"
            placeholder="30"
            type="number"
            min="1"
            value={linkExpiryDays}
            onChange={(e) => setLinkExpiryDays(e.target.value)}
          />
          <p className="text-xs text-muted-foreground -mt-2">Leave empty for no expiry</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowNewLink(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createPreviewLink}
              loading={creatingLink}
              disabled={!linkTargetUrl.trim()}
            >
              Create Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
