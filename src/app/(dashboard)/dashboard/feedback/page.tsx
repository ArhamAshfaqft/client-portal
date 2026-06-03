"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getAllFeedbackGroupedBySite } from "@/lib/demo-data";
import {
  Globe,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  MessageSquareText,
  ArrowRight,
  Search,
} from "lucide-react";

// Module-level singleton — stable across renders
const supabase = createClient();

export default function FeedbackOverviewPage() {
  const { profile, isDemo } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<ReturnType<typeof getAllFeedbackGroupedBySite>>([]);

  const fetchSitesOverview = async () => {
    if (!profile?.agency_id) return;
    setLoading(true);
    try {
      const { data: sitesData } = await supabase
        .from("sites")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .order("created_at", { ascending: false });

      const sitesList = sitesData || [];

      if (sitesList.length === 0) {
        setSites([]);
        return;
      }

      const siteIds = sitesList.map((s) => s.id);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .in("site_id", siteIds);

      const projectsList = projectsData || [];
      const projectIds = projectsList.map((p) => p.id);
      
      let feedbackCountsMap: Record<string, { pending_count: number; resolved_count: number; total: number }> = {};
      for (const site of sitesList) {
        feedbackCountsMap[site.id] = { pending_count: 0, resolved_count: 0, total: 0 };
      }

      if (projectIds.length > 0) {
        const { data: feedbackData } = await supabase
          .from("feedback_items")
          .select("project_id, status")
          .in("project_id", projectIds)
          .is("parent_id", null);

              if (feedbackData) {
                const projectToSiteMap = Object.fromEntries(projectsList.map((p) => [p.id, p.site_id]));
                for (const item of feedbackData) {
                  const siteId = projectToSiteMap[item.project_id];
                  if (siteId && feedbackCountsMap[siteId]) {
                    feedbackCountsMap[siteId].total++;
                    if (item.status === "open") feedbackCountsMap[siteId].pending_count++;
                    else if (item.status === "resolved") feedbackCountsMap[siteId].resolved_count++;
                  }
                }
              }
      }

      const mapped = sitesList.map((site) => ({
        ...site,
        feedback_counts: feedbackCountsMap[site.id],
        projects: projectsList.filter((p) => p.site_id === site.id),
      }));

      setSites(mapped as any);
    } catch (err) {
      console.error("Error fetching feedback overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemo) {
      setSites(getAllFeedbackGroupedBySite());
      setLoading(false);
      return;
    }
    fetchSitesOverview();

    // Real-time: refresh counts when feedback items change
    const channel = supabase
      .channel("feedback-overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedback_items" },
        () => { fetchSitesOverview(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isDemo, profile]);

  const filteredSites = useMemo(() => {
    if (!search.trim()) return sites;
    const q = search.toLowerCase();
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q)
    );
  }, [sites, search]);

  const totalFeedback = filteredSites.reduce((s, site) => s + site.feedback_counts.total, 0);
  const totalPending = filteredSites.reduce((s, site) => s + site.feedback_counts.pending_count, 0);
  const totalResolved = filteredSites.reduce((s, site) => s + site.feedback_counts.resolved_count, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Feedback Overview</h2>
        <p className="text-sm text-muted-foreground">
          All feedback across {sites.length} site{sites.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm">
                <span className="font-semibold text-foreground">{totalPending}</span>{" "}
                <span className="text-muted-foreground">pending</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm">
                <span className="font-semibold text-foreground">{totalResolved}</span>{" "}
                <span className="text-muted-foreground">resolved</span>
              </span>
            </div>
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {totalFeedback} total
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search sites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Sites with feedback */}
      {sites.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <MessageSquareText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No feedback data
              </h3>
              <p className="text-sm text-muted-foreground">
                Add sites and generate preview links to start collecting feedback
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSites.map((site) => (
            <Link key={site.id} href={`/dashboard/sites/${site.id}/feedback`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {site.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {site.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {site.feedback_counts.pending_count > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm font-medium text-foreground">
                            {site.feedback_counts.pending_count}
                          </span>
                        </div>
                      )}
                      {site.feedback_counts.resolved_count > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm font-medium text-foreground">
                            {site.feedback_counts.resolved_count}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground ml-2">
                        {site.feedback_counts.total}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
