"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, ChevronRight, ExternalLink, Copy, ListTodo, MessageSquareText, CheckCircle2 } from "lucide-react";

interface ProjectSummary {
  id: string;
  name: string;
  site_id: string;
  site_name: string;
  total: number;
  pending: number;
  resolved: number;
  latest_date: string;
}

export default function MyFeedbackPage() {
  const { profile, isDemo } = useAuth();
  const [sessions, setSessions] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedSites, setCollapsedSites] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Collapse all sites by default once sessions load
  useEffect(() => {
    if (sessions.length > 0 && collapsedSites.size === 0) {
      const siteIds = [...new Set(sessions.map((s) => s.site_id))];
      setCollapsedSites(new Set(siteIds));
    }
  }, [sessions]);

  useEffect(() => {
    const userId = profile?.user_id;
    const agencyId = profile?.agency_id;
    const role = profile?.role;
    if (!userId || !agencyId) { setLoading(false); return; }

    if (isDemo) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const isOwner = role === "owner";

    if (isOwner) {
      // Owner: get all projects in agency, then fetch counts per project
      supabase
        .from("projects")
        .select("id, name, site_id, created_at, site:site_id(id, name)")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false })
        .then(async ({ data: projects, error }) => {
          if (error || !projects) { setLoading(false); return; }
          const projIds = projects.map((p: any) => p.id);
          if (projIds.length === 0) { setSessions([]); setLoading(false); return; }

          const { data: fb } = await supabase
            .from("feedback_items")
            .select("project_id, status, created_at")
            .in("project_id", projIds)
            .is("parent_id", null);

          const countMap: Record<string, { total: number; pending: number; resolved: number; latest: string }> = {};
          if (fb) {
            for (const f of fb as any[]) {
              if (!countMap[f.project_id]) countMap[f.project_id] = { total: 0, pending: 0, resolved: 0, latest: f.created_at };
              countMap[f.project_id].total++;
              if (f.status === "open") countMap[f.project_id].pending++;
              if (f.status === "resolved") countMap[f.project_id].resolved++;
              if (f.created_at > countMap[f.project_id].latest) countMap[f.project_id].latest = f.created_at;
            }
          }

          setSessions(
            projects.map((p: any) => ({
              id: p.id,
              name: p.name,
              site_id: p.site_id,
              site_name: p.site?.name || "Unknown",
              total: countMap[p.id]?.total || 0,
              pending: countMap[p.id]?.pending || 0,
              resolved: countMap[p.id]?.resolved || 0,
              latest_date: countMap[p.id]?.latest || p.created_at,
            }))
          );
          setLoading(false);
        });
    } else {
      // Dev: get projects where feedback is assigned to this user
      supabase
        .from("feedback_items")
        .select("project_id, status, created_at, project:project_id(id, name, site_id, site:site_id(id, name))")
        .eq("assigned_to", userId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .then(({ data: items, error }) => {
          if (error || !items) { setLoading(false); return; }

          const projectMap: Record<string, ProjectSummary> = {};
          for (const i of items as any[]) {
            const pid = i.project_id;
            if (!projectMap[pid]) {
              projectMap[pid] = {
                id: pid,
                name: i.project?.name || "Unknown",
                site_id: i.project?.site?.id || i.project?.site_id,
                site_name: i.project?.site?.name || "Unknown",
                total: 0, pending: 0, resolved: 0,
                latest_date: i.created_at,
              };
            }
            projectMap[pid].total++;
            if (i.status === "open") projectMap[pid].pending++;
            if (i.status === "resolved") projectMap[pid].resolved++;
            if (i.created_at > projectMap[pid].latest_date) projectMap[pid].latest_date = i.created_at;
          }

          setSessions(Object.values(projectMap));
          setLoading(false);
        });
    }
  }, [profile?.user_id, isDemo]);

  const copyLink = (projectId: string) => {
    const url = `${window.location.origin}/dashboard/my-feedback/${projectId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSite = (id: string) => {
    setCollapsedSites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Group sessions by site
  const siteMap: Record<string, { id: string; name: string; sessions: ProjectSummary[] }> = {};
  for (const s of sessions) {
    const sid = s.site_id || "unknown";
    if (!siteMap[sid]) siteMap[sid] = { id: sid, name: s.site_name, sessions: [] };
    siteMap[sid].sessions.push(s);
  }
  const groups = Object.values(siteMap);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">My Feedback</h2>
        <p className="text-sm text-muted-foreground">Sessions with feedback assigned to you</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}><CardContent><div className="h-16 bg-muted rounded animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">All caught up</h3>
              <p className="text-sm text-muted-foreground">No feedback assigned to you</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((site) => {
            const open = !collapsedSites.has(site.id);
            const totalSessions = site.sessions.reduce((sum, s) => sum + s.total, 0);
            return (
              <div key={site.id}>
                <button
                  onClick={() => toggleSite(site.id)}
                  className="flex items-center gap-2 w-full text-left py-2 px-1 rounded-lg hover:bg-accent transition-colors"
                >
                  {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{site.name}</span>
                  <span className="text-xs text-muted-foreground">({totalSessions} feedback)</span>
                </button>
                {open && (
                  <div className="ml-4 mt-2 space-y-2">
                    {site.sessions.map((proj) => (
                      <Card key={proj.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{proj.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(proj.latest_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <ListTodo className="w-3 h-3" />
                                  {proj.pending} pending
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {proj.resolved} resolved
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              <button
                                onClick={() => copyLink(proj.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedId === proj.id ? "Copied" : "Copy Link"}
                              </button>
                              <Link href={`/dashboard/my-feedback/${proj.id}`}>
                                <Button size="sm" variant="primary">
                                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
