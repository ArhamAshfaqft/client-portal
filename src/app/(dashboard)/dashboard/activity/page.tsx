"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_ACTIVITIES, type ActivityEntry } from "@/lib/activity-data";
import {
  UserPlus,
  CheckCircle2,
  MessageSquareText,
  AlertCircle,
  ArrowUpDown,
  Search,
  UserCheck,
} from "lucide-react";

const typeIcons: Record<string, typeof UserPlus> = {
  assigned: UserPlus,
  status_change: CheckCircle2,
  replied: MessageSquareText,
  feedback_submitted: AlertCircle,
  site_assigned: UserCheck,
};

const typeColors: Record<string, string> = {
  assigned: "bg-primary-light text-primary",
  status_change: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  replied: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  feedback_submitted: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  site_assigned: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
};

export default function ActivityPage() {
  const { isDemo } = useAuth();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    let result = isDemo ? DEMO_ACTIVITIES : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          (a.site_name || "").toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [search, sortOrder, isDemo]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
        <p className="text-sm text-muted-foreground">
          Track changes, assignments, and updates
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activity..."
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

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12 text-sm text-muted-foreground">
                No activity found
              </div>
            </CardContent>
          </Card>
        ) : (
          filtered.map((activity) => {
            const Icon = typeIcons[activity.type] || AlertCircle;
            const colorClass = typeColors[activity.type] || "bg-accent text-muted-foreground";
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{activity.actor}</span>
                        {activity.site_name && (
                          <span className="text-xs text-muted-foreground">{activity.site_name}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground/60">
                          {new Date(activity.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                          })}
                        </span>
                        {activity.feedback_id && (
                          <Link
                            href={`/dashboard/sites/${activity.feedback_id.split("-").slice(0, -1).join("-")}/feedback`}
                            className="text-[10px] text-primary hover:text-primary-hover"
                          >
                            View feedback
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
