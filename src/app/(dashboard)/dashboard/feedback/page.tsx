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
  Loader2,
  ChevronRight,
  MessageSquareText,
  ArrowRight,
  Search,
} from "lucide-react";

export default function FeedbackOverviewPage() {
  const { profile, isDemo } = useAuth();
  const supabase = createClient();
  const [search, setSearch] = useState("");

  const sites = isDemo
    ? getAllFeedbackGroupedBySite()
    : [];

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
  const totalNew = filteredSites.reduce((s, site) => s + site.feedback_counts.new_count, 0);
  const totalInProgress = filteredSites.reduce((s, site) => s + site.feedback_counts.in_progress_count, 0);
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
                <span className="font-semibold text-foreground">{totalNew}</span>{" "}
                <span className="text-muted-foreground">new</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <span className="font-semibold text-foreground">{totalInProgress}</span>{" "}
                <span className="text-muted-foreground">in progress</span>
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
                      {site.feedback_counts.new_count > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm font-medium text-foreground">
                            {site.feedback_counts.new_count}
                          </span>
                        </div>
                      )}
                      {site.feedback_counts.in_progress_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Loader2 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {site.feedback_counts.in_progress_count}
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
