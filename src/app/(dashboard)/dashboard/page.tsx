"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  Globe,
  FolderKanban,
  MessageSquareText,
  Users,
  Clock,
  ListTodo,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface DashboardData {
  total_sites: number;
  active_projects: number;
  open_feedback: number;
  team_members: number;
  resolved_feedback: number;
}

const DEMO_OWNER_DATA: DashboardData = {
  total_sites: 8,
  active_projects: 4,
  open_feedback: 12,
  team_members: 5,
  resolved_feedback: 47,
};

const DEMO_DEV_DATA = {
  assigned_feedback: 5,
  resolved_this_week: 3,
  hours_logged_this_week: 28,
  active_projects: 2,
  my_open: 3,
  my_in_progress: 2,
};

// Module-level singleton — never changes across renders
const supabase = createClient();

export default function DashboardPage() {
  const { profile, isDemo } = useAuth();
  const [data, setData] = useState<DashboardData>({
    total_sites: 0,
    active_projects: 0,
    open_feedback: 0,
    team_members: 0,
    resolved_feedback: 0,
  });
  const [devData, setDevData] = useState({
    my_open: 0,
    my_in_progress: 0,
    resolved: 0,
    active_projects: 0,
  });
  const [devProjects, setDevProjects] = useState<{ name: string; feedback: number; siteName: string }[]>([]);
  const [devActivity, setDevActivity] = useState<{ action: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const isDev = profile?.role === "developer";
  const isClient = profile?.role === "client";
  const agencyId = profile?.agency_id;
  const role = profile?.role;

  useEffect(() => {
    let cancelled = false;

    if (isDemo && (isDev || isClient)) {
      setLoading(false);
      return;
    }
    if (isDemo) {
      setData(DEMO_OWNER_DATA);
      setLoading(false);
      return;
    }
    if (!agencyId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (isDev && profile?.user_id) {
          const [
            { count: openCount },
            { count: inProgressCount },
            { count: resolvedCount },
          ] = await Promise.all([
            supabase
              .from("feedback_items")
              .select("*", { count: "exact", head: true })
              .eq("assigned_to", profile.user_id)
              .eq("status", "open"),
            supabase
              .from("feedback_items")
              .select("*", { count: "exact", head: true })
              .eq("assigned_to", profile.user_id)
              .eq("status", "in_progress"),
            supabase
              .from("feedback_items")
              .select("*", { count: "exact", head: true })
              .eq("assigned_to", profile.user_id)
              .eq("status", "resolved"),
          ]);

          // Active projects = distinct projects where dev has assigned feedback
          const { data: myProjects } = await supabase
            .from("feedback_items")
            .select("project_id")
            .eq("assigned_to", profile.user_id);
          const uniqueProjectIds = [...new Set((myProjects || []).map((f: any) => f.project_id))];

          let projCount = 0;
          const projectsList: { name: string; feedback: number; siteName: string }[] = [];
          if (uniqueProjectIds.length > 0) {
            const { data: projects, count: pCount } = await supabase
              .from("projects")
              .select("id, name, site_id", { count: "exact", head: false })
              .in("id", uniqueProjectIds);

            projCount = pCount ?? 0;

            if (projects && projects.length > 0) {
              const siteIds = [...new Set(projects.map((p: any) => p.site_id))];
              const { data: sites } = await supabase
                .from("sites")
                .select("id, name")
                .in("id", siteIds);
              const siteNames = Object.fromEntries((sites || []).map((s: any) => [s.id, s.name]));

              const projIds = projects.map((p: any) => p.id);
              const { data: fbCounts } = await supabase
                .from("feedback_items")
                .select("project_id")
                .in("project_id", projIds)
                .eq("assigned_to", profile.user_id)
                .in("status", ["open", "in_progress"]);

              const countMap: Record<string, number> = {};
              if (fbCounts) for (const f of fbCounts as any[]) { countMap[f.project_id] = (countMap[f.project_id] || 0) + 1; }

              for (const p of projects as any[]) {
                projectsList.push({
                  name: p.name,
                  feedback: countMap[p.id] || 0,
                  siteName: siteNames[p.site_id] || "Unknown",
                });
              }
            }
          }

          // Recent activity - last 5 feedback items assigned to dev
          const { data: recentFeedback } = await supabase
            .from("feedback_items")
            .select("content, status, created_at")
            .eq("assigned_to", profile.user_id)
            .order("created_at", { ascending: false })
            .limit(5);

          const activity: { action: string; time: string }[] = [];
          if (recentFeedback) {
            for (const f of recentFeedback as any[]) {
              const action = f.status === "resolved"
                ? `Resolved: "${f.content?.substring(0, 50) || "Feedback"}"`
                : `New: "${f.content?.substring(0, 50) || "Feedback"}"`;
              const time = timeAgo(f.created_at);
              activity.push({ action, time });
            }
          }

          if (!cancelled) {
            setDevData({
              my_open: openCount ?? 0,
              my_in_progress: inProgressCount ?? 0,
              resolved: resolvedCount ?? 0,
              active_projects: projCount ?? 0,
            });
            setDevProjects(projectsList);
            setDevActivity(activity);
          }
          if (!cancelled) setLoading(false);
          return;
        }

        const [
          { count: sitesCount },
          { count: projectsCount },
          { count: openCount },
          { count: membersCount },
          { count: resolvedCount },
        ] = await Promise.all([
          supabase
            .from("sites")
            .select("*", { count: "exact", head: true })
            .eq("agency_id", agencyId),
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("agency_id", agencyId)
            .in("status", ["active"]),
          supabase
            .from("feedback_items")
            .select("*", { count: "exact", head: true })
            .in("status", ["open", "in_progress"]),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("agency_id", agencyId),
          supabase
            .from("feedback_items")
            .select("*", { count: "exact", head: true })
            .eq("status", "resolved"),
        ]);

        if (!cancelled) {
          setData({
            total_sites: sitesCount ?? 0,
            active_projects: projectsCount ?? 0,
            open_feedback: openCount ?? 0,
            team_members: membersCount ?? 0,
            resolved_feedback: resolvedCount ?? 0,
          });
        }
      } catch {
        // keep empty defaults
      }
      if (!cancelled) setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [agencyId, isDemo, isDev, isClient, role]);

  if (isDev) {
    const devStats = [
      {
        label: "My Open Tasks",
        value: isDemo ? DEMO_DEV_DATA.my_open : devData.my_open,
        icon: AlertCircle,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
      },
      {
        label: "In Progress",
        value: isDemo ? DEMO_DEV_DATA.my_in_progress : devData.my_in_progress,
        icon: ListTodo,
        color: "text-primary",
        bg: "bg-primary-light",
      },
      {
        label: "Resolved",
        value: isDemo ? DEMO_DEV_DATA.resolved_this_week : devData.resolved,
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
      },
      {
        label: "Hours This Week",
        value: isDemo ? DEMO_DEV_DATA.hours_logged_this_week : 0,
        icon: Clock,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-500/10",
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Developer"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is your workload overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {devStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Active Projects
                </h3>
                <span className="text-xs text-muted-foreground">
                  {isDemo ? DEMO_DEV_DATA.active_projects : devData.active_projects} projects
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isDemo ? (
                  [
                    { name: "Brighton Law Firm", status: "active", feedback: 4 },
                    { name: "Apex Fitness", status: "active", feedback: 2 },
                  ].map((proj) => (
                    <div
                      key={proj.name}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {proj.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {proj.feedback} open feedback items
                        </p>
                      </div>
                      <Badge variant="success">assigned</Badge>
                    </div>
                  ))
                ) : devProjects.length > 0 ? (
                  devProjects.map((proj, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {proj.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {proj.siteName} · {proj.feedback} open
                        </p>
                      </div>
                      <Badge variant="info">assigned</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No active projects</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Recent Activity
                </h3>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isDemo ? (
                  [
                    { action: "Resolved feedback on Brighton Law Firm", time: "2 hours ago" },
                    { action: "Added daily report - 6 hours logged", time: "5 hours ago" },
                    { action: "Started work on Apex Fitness mobile nav", time: "Yesterday" },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : devActivity.length > 0 ? (
                  devActivity.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">
                          {act.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {act.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isClient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Welcome, {profile?.full_name || "Client"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your submitted feedback and their status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-xl font-bold text-foreground">{isDemo ? 4 : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-xl font-bold text-foreground">{isDemo ? 2 : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-xl font-bold text-foreground">{isDemo ? 3 : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Link
          href="/dashboard/my-feedback"
          className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <MessageSquareText className="w-4 h-4" />
          View My Feedback
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Sites",
      value: data.total_sites,
      icon: Globe,
      color: "text-primary",
      bg: "bg-primary-light",
    },
    {
      label: "Active Projects",
      value: data.active_projects,
      icon: FolderKanban,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: "Open Feedback",
      value: data.open_feedback,
      icon: MessageSquareText,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "Team Members",
      value: data.team_members,
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? (
                        <span className="inline-block w-8 h-6 bg-muted rounded animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Recent Activity
              </h3>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Feedback Overview
              </h3>
              <span className="text-xs text-muted-foreground">
                {data.resolved_feedback} resolved
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Open</span>
                  <span className="font-medium text-foreground">
                    {data.open_feedback}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        data.open_feedback + data.resolved_feedback > 0
                          ? (data.resolved_feedback /
                              (data.open_feedback +
                                data.resolved_feedback)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-1.5">
                  <span className="text-muted-foreground">Resolved</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {data.resolved_feedback}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
