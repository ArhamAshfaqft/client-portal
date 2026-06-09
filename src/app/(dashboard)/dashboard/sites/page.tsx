"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/use-permissions";
import { Permissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DEMO_SITES } from "@/lib/demo-data";
import {
  Globe,
  Plus,
  ExternalLink,
  Wifi,
  WifiOff,
  MessageSquareText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  MoreVertical,
  Trash2,
  UserPlus,
  User,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { Site } from "@/types";

// Module-level singleton — stable across renders
const supabase = createClient();

export default function SitesPage() {
  const router = useRouter();
  const { profile, isDemo } = useAuth();
  const { can } = usePermissions();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    wp_api_url: "",
    wp_api_key: "",
    wp_application_password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const canCreate = can(Permissions.SITES_CREATE);
  const canDelete = can(Permissions.SITES_DELETE);
  const canCreateSession = can(Permissions.PROJECTS_CREATE);
  const [search, setSearch] = useState("");
  const [wpFilter, setWpFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [sortBy, setSortBy] = useState<"name" | "name_desc" | "newest" | "oldest" | "most_feedback" | "least_feedback">("newest");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [assignSite, setAssignSite] = useState<string | null>(null);
  const [assignMessage, setAssignMessage] = useState("");
  const [selectedDev, setSelectedDev] = useState("");
  const [siteAssignments, setSiteAssignments] = useState<Record<string, { userId: string; message: string; assignedBy: string }>>({});
  const [teamMembers, setTeamMembers] = useState<{ user_id: string; full_name: string; email: string; position: string | null }[]>([]);
  const [assignError, setAssignError] = useState("");
  const [loginLoading, setLoginLoading] = useState<string | null>(null);
  const [newSessionSite, setNewSessionSite] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);

  const openWpAdmin = async (siteId: string) => {
    setLoginLoading(siteId);
    try {
      const res = await fetch(`/api/sites/${siteId}/auto-login`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to generate login link");
      }
    } catch {
      alert("Network error");
    }
    setLoginLoading(null);
  };

  useEffect(() => {
    if (isDemo) {
      setSites(DEMO_SITES as unknown as Site[]);
      setLoading(false);
      return;
    }
    if (!profile?.agency_id) {
      setLoading(false);
      return;
    }
    fetchSites();
  }, [profile, isDemo]);

  const fetchSites = async () => {
    if (!profile?.agency_id) return;
    try {
      // Fetch team members for the assign dropdown and assigned-to display
      supabase
        .from("profiles")
        .select("user_id, full_name, email, position")
        .eq("agency_id", profile.agency_id)
        .order("full_name", { ascending: true })
        .then(({ data }) => { if (data) setTeamMembers(data as any); });

      // For devs: first get assigned site IDs
      let assignedSiteIds: string[] = [];
      if (profile.role !== "owner") {
        const { data: memberData } = await supabase
          .from("site_members")
          .select("site_id")
          .eq("user_id", profile.user_id);

        assignedSiteIds = memberData?.map((m) => m.site_id) || [];
        if (assignedSiteIds.length === 0) {
          setSites([]);
          setLoading(false);
          return;
        }
      }

      // Fetch sites
      let query = supabase
        .from("sites")
        .select("*")
        .eq("agency_id", profile.agency_id);

      if (profile.role !== "owner" && assignedSiteIds.length > 0) {
        query = query.in("id", assignedSiteIds);
      }

      const { data: sitesData } = await query.order("created_at", { ascending: false });

      if (sitesData) {
        const sitesList = sitesData as Site[];
        const siteIds = sitesList.map((s) => s.id);

        // Fetch site_members for all visible sites
        if (siteIds.length > 0) {
          const { data: membersData } = await supabase
            .from("site_members")
            .select("*")
            .in("site_id", siteIds);

          const assignments: Record<string, { userId: string; message: string; assignedBy: string }> = {};
          if (membersData) {
            for (const m of membersData) {
              assignments[m.site_id] = {
                userId: m.user_id,
                message: m.message || "",
                assignedBy: m.assigned_by || "",
              };
            }
          }
          setSiteAssignments(assignments);
        }

        if (siteIds.length > 0) {
          // Fetch all projects for these sites
          const { data: projectsData } = await supabase
            .from("projects")
            .select("id, site_id")
            .in("site_id", siteIds);

          const projectsList = projectsData || [];
          const projectIds = projectsList.map((p) => p.id);

          let countsMap: Record<string, { pending_count: number; resolved_count: number }> = {};
          for (const s of sitesList) {
            countsMap[s.id] = { pending_count: 0, resolved_count: 0 };
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
                  if (siteId && countsMap[siteId]) {
                    if (item.status === "open") countsMap[siteId].pending_count++;
                    else if (item.status === "resolved") countsMap[siteId].resolved_count++;
                  }
                }
              }
          }

          // Attach feedback_counts to each site object
          const enrichedSites = sitesList.map((s) => ({
            ...s,
            feedback_counts: countsMap[s.id],
          }));

          setSites(enrichedSites as any);
        } else {
          setSites([]);
        }
      }
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!profile?.agency_id || isDemo) return;
    setSubmitting(true);
    setAddError("");

    try {
      const result = await Promise.race([
        supabase.from("sites").insert({
          agency_id: profile.agency_id,
          name: formData.name,
          url: formData.url,
          wp_api_url: formData.wp_api_url || null,
          wp_api_key: formData.wp_api_key || null,
          wp_application_password: formData.wp_application_password || null,
          wp_connected: !!(formData.wp_api_url && (formData.wp_api_key || formData.wp_application_password)),
        }),
        new Promise<{ error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 15000)
        ),
      ]);
      if ((result as any)?.error) throw (result as any).error;
    } catch (e: any) {
      if (e?.message === "timeout") {
        setAddError("Request timed out. Check your Supabase connection.");
      } else {
        setAddError(e?.message || "Failed to add site. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    setShowAdd(false);
    setFormData({ name: "", url: "", wp_api_url: "", wp_api_key: "", wp_application_password: "" });
    setAddError("");
    fetchSites();
    setSubmitting(false);
  };

  const handleRemoveSite = (siteId: string) => {
    if (isDemo) {
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      return;
    }
    (async () => {
      try {
        await supabase.from("sites").delete().eq("id", siteId);
      } catch (err) {
        console.error("Failed to delete site:", err);
      }
      fetchSites();
    })();
  };

  const handleAssignSite = (siteId: string, userId: string) => {
    setAssignSite(null);
    setAssignMessage("");
    setSelectedDev("");

    const body = JSON.stringify({ user_id: userId, message: assignMessage });
    fetch(`/api/sites/${siteId}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body })
      .then(async (r) => {
        if (r.ok) { fetchSites(); return; }
        const data = await r.json().catch(() => ({}));
        setAssignError(data?.error || `Server error (${r.status})`);
        setTimeout(() => setAssignError(""), 5000);
      })
      .catch((e) => {
        setAssignError("Network error: " + e.message);
        setTimeout(() => setAssignError(""), 5000);
      });
  };

  const handleUnassign = (siteId: string, userId: string) => {
    setAssignSite(null);
    setAssignMessage("");
    setSelectedDev("");

    const body = JSON.stringify({ user_id: userId });
    fetch(`/api/sites/${siteId}/assign`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body })
      .then(async (r) => {
        if (r.ok) { fetchSites(); return; }
        const data = await r.json().catch(() => ({}));
        setAssignError(data?.error || `Server error (${r.status})`);
        setTimeout(() => setAssignError(""), 5000);
      })
      .catch((e) => {
        setAssignError("Network error: " + e.message);
        setTimeout(() => setAssignError(""), 5000);
      });
  };

  const getCounts = (siteId: string) => {
    if (isDemo) {
      const s = DEMO_SITES.find((ds) => ds.id === siteId);
      return s?.feedback_counts || { pending_count: 0, resolved_count: 0 };
    }
    const site = sites.find((s) => s.id === siteId) as any;
    return site?.feedback_counts || { pending_count: 0, resolved_count: 0 };
  };

  const addSession = (siteId: string) => {
    setMenuOpen(null);
    setNewSessionSite(siteId);
    setNewSessionName("");
    setCreatingSession(false);
  };

  const createSession = async () => {
    if (!newSessionSite || !newSessionName.trim()) return;
    setCreatingSession(true);
    const s = sites.find((si) => si.id === newSessionSite) as any;
    await supabase.from("projects").insert({
      agency_id: s?.agency_id || profile?.agency_id,
      site_id: newSessionSite,
      name: newSessionName.trim(),
      status: "draft",
    });
    setNewSessionSite(null);
    setNewSessionName("");
    setCreatingSession(false);
    router.push(`/dashboard/sites/${newSessionSite}`);
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch = !search.trim() ||
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.url.toLowerCase().includes(search.toLowerCase());
    const matchesWp =
      wpFilter === "all" ||
      (wpFilter === "connected" && site.wp_connected) ||
      (wpFilter === "disconnected" && !site.wp_connected);
    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && !!siteAssignments[site.id]) ||
      (assignmentFilter === "unassigned" && !siteAssignments[site.id]);
    return matchesSearch && matchesWp && matchesAssignment;
  }).sort((a, b) => {
    const countsA = getCounts(a.id);
    const countsB = getCounts(b.id);
    const totalA = countsA.pending_count + countsA.resolved_count;
    const totalB = countsB.pending_count + countsB.resolved_count;
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "name_desc": return b.name.localeCompare(a.name);
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "most_feedback": return totalB - totalA;
      case "least_feedback": return totalA - totalB;
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSites.length} / {sites.length} site{sites.length !== 1 ? "s" : ""}
        </p>
        {canCreate && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </Button>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {(["all", "connected", "disconnected"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setWpFilter(opt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                wpFilter === opt
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt === "all" ? "All" : opt === "connected" ? "WP Connected" : "No WP"}
            </button>
          ))}
        </div>
        {profile?.role === "owner" && (
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["all", "assigned", "unassigned"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setAssignmentFilter(opt)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  assignmentFilter === opt
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt === "all" ? "All" : opt === "assigned" ? "Assigned" : "Unassigned"}
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2.5 py-1.5 pr-7 text-xs font-medium rounded-lg border border-border bg-background text-foreground cursor-pointer outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="most_feedback">Most Feedback</option>
            <option value="least_feedback">Least Feedback</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sites.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {profile?.role === "owner" ? "No sites added yet" : "No projects assigned"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {profile?.role === "owner"
                  ? "Add your first WordPress site to start collecting feedback"
                  : "Wait for your owner to assign you a project"}
              </p>
              {canCreate && (
                <Button onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Site
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : filteredSites.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No matching sites
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your search or filter
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site) => {
            const counts = getCounts(site.id);
            return (
              <Card
                key={site.id}
                className="hover:shadow-lg transition-all duration-200 group"
              >
                <CardContent className="p-0">
                  {/* Header section */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/sites/${site.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors block truncate"
                          >
                            {site.name}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            {site.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </p>
                          {siteAssignments[site.id]?.userId && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground/70" />
                                Assigned to{" "}
                                <span className="text-foreground/80 font-medium">
                                  {teamMembers.find((m) => m.user_id === siteAssignments[site.id].userId)?.full_name || siteAssignments[site.id].assignedBy || "Developer"}
                                </span>
                              </p>
                              {siteAssignments[site.id]?.message && (
                                <span className="text-[10px] text-muted-foreground/50 truncate max-w-[140px] hidden sm:inline">
                                  — &ldquo;{siteAssignments[site.id].message}&rdquo;
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {site.wp_connected ? (
                          <Badge variant="success" className="text-[10px] px-2 py-0.5">
                            <Wifi className="w-3 h-3 mr-1" />
                            WP
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] px-2 py-0.5">
                            <WifiOff className="w-3 h-3 mr-1" />
                            WP
                          </Badge>
                        )}
                        {(profile?.role === "owner" || canCreateSession || canDelete) && (
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpen(menuOpen === site.id ? null : site.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          {menuOpen === site.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-popover shadow-lg py-1">
                                {profile?.role === "owner" && (
                                  <button
                                    onClick={() => {
                                      setMenuOpen(null);
                                      setAssignMessage(siteAssignments[site.id]?.message || "");
                                      setAssignSite(site.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                                  >
                                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                                    {siteAssignments[site.id]?.userId ? "Reassign" : "Assign Developer"}
                                  </button>
                                )}
                                {canCreateSession && (
                                  <button
                                    onClick={() => addSession(site.id)}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                                  >
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                    Add Session
                                  </button>
                                )}
                                {profile?.role === "owner" && (
                                  <button
                                    onClick={() => {
                                      setMenuOpen(null);
                                      const newUrl = prompt('Enter new WordPress URL (e.g. https://yoursite.com):', 'https://');
                                      if (newUrl && newUrl !== 'https://') {
                                        const apiKey = (site as any).wp_api_key || '';
                                        console.log('[FeedDash] Updating site URL', { siteId: site.id, newUrl, hasApiKey: !!apiKey });
                                        const base = window.location.origin;
                                        fetch(base + '/api/widget/verify-token', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ _updateUrl: newUrl, _siteId: site.id, _wpApiKey: apiKey }),
                                        }).then(r => r.text()).then(text => {
                                          console.log('[FeedDash] URL update response:', text);
                                          try {
                                            const d = JSON.parse(text);
                                            alert(d.ok ? 'URL updated!' : 'Failed: ' + JSON.stringify(d));
                                          } catch {
                                            alert('Response (not JSON): ' + text.substring(0, 200));
                                          }
                                        }).catch(e => alert('Error: ' + e.message));
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                                  >
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    Edit WP URL
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => { setMenuOpen(null); handleRemoveSite(site.id); }}
                                    className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove Site
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Feedback stats */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-4 py-2.5 border-t border-border">
                      <div className="flex items-center gap-1.5 text-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium text-foreground">{counts.pending_count}</span>
                        <span className="text-muted-foreground text-xs">pending</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-medium text-foreground">{counts.resolved_count}</span>
                        <span className="text-muted-foreground text-xs">resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="px-5 pb-5 space-y-2">
                    {(site as any).wp_api_key && (
                      <button
                        onClick={() => openWpAdmin(site.id)}
                        disabled={loginLoading === site.id}
                        className="inline-flex items-center justify-center w-full gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {loginLoading === site.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        Open WP Admin
                      </button>
                    )}
                    <Link
                      href={`/dashboard/sites/${site.id}/feedback`}
                      className="inline-flex items-center justify-center w-full gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:bg-border transition-colors"
                    >
                      <MessageSquareText className="w-4 h-4" />
                      View Feedback
                      <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {canCreate && (
        <Modal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          title="Add WordPress Site"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Site Name"
              placeholder="My Agency Site"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Site URL"
              placeholder="https://clientsite.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-medium text-foreground mb-3">
                WordPress API Configuration (Optional)
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Connect your WordPress site to enable media storage on your
                client&apos;s hosting. No extra server costs.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-3"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    const cfg = JSON.parse(text);
                    if (cfg.name && cfg.url) {
                      setFormData({
                        ...formData,
                        name: formData.name || cfg.name,
                        url: formData.url || cfg.url,
                        wp_api_url: cfg.wp_api_url || formData.wp_api_url,
                        wp_api_key: cfg.wp_api_key || formData.wp_api_key,
                        wp_application_password: cfg.wp_application_password || formData.wp_application_password,
                      });
                    }
                  } catch {}
                }}
              >
                Paste Config
              </Button>
              <Input
                label="WordPress REST API URL"
                placeholder="https://clientsite.com/wp-json"
                value={formData.wp_api_url}
                onChange={(e) => setFormData({ ...formData, wp_api_url: e.target.value })}
              />
              <div className="mt-3">
              <Input
                label="Webhook API Key"
                placeholder="From FeedDash Connector admin page"
                value={formData.wp_api_key}
                onChange={(e) => setFormData({ ...formData, wp_api_key: e.target.value })}
              />
              </div>
              <div className="mt-3">
              <Input
                label="Application Password"
                placeholder="For media uploads (optional)"
                value={formData.wp_application_password}
                onChange={(e) => setFormData({ ...formData, wp_application_password: e.target.value })}
              />
              </div>
            </div>
            {addError && (
              <p className="text-sm text-danger bg-danger/5 rounded-lg px-3 py-2">
                {addError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowAdd(false); setAddError(""); }}>
                Cancel
              </Button>
              <Button onClick={handleAdd} loading={submitting}>
                Add Site
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        open={!!assignSite}
        onClose={() => { setAssignSite(null); setAssignMessage(""); setSelectedDev(""); setAssignError(""); }}
        title="Assign Developer"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a developer to handle feedback for this site
          </p>
          <div className="space-y-1">
            {teamMembers.map((m) => {
              const isSelected = selectedDev === m.user_id;
              return (
                <button
                  key={m.user_id}
                  onClick={() => setSelectedDev(isSelected ? "" : m.user_id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                    isSelected
                      ? "bg-primary-light text-primary"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-foreground">
                    {m.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Instructions for developer
            </label>
            <textarea
              value={assignMessage}
              onChange={(e) => setAssignMessage(e.target.value)}
              placeholder="What needs to be done? Add context like you would in WhatsApp..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              This message will be visible to the assigned developer when they view this site
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            {assignError && (
              <p className="text-xs text-danger flex-1">{assignError}</p>
            )}
            {assignSite && siteAssignments[assignSite]?.userId && (
              <button
                onClick={() => handleUnassign(assignSite, siteAssignments[assignSite].userId)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Unassign
              </button>
            )}
            <Button
              disabled={!selectedDev}
              onClick={() => {
                if (!assignSite || !selectedDev) return;
                handleAssignSite(assignSite, selectedDev);
                setSelectedDev("");
              }}
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!newSessionSite}
        onClose={() => { setNewSessionSite(null); setNewSessionName(""); }}
        title="Create New Session"
      >
        <div className="space-y-4">
          <Input
            label="Session Name"
            placeholder="Homepage Redesign"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => { setNewSessionSite(null); setNewSessionName(""); }}>
              Cancel
            </Button>
            <Button onClick={createSession} loading={creatingSession} disabled={!newSessionName.trim()}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
