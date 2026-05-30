"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/use-permissions";
import { Permissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DEMO_SITES, getTeamMembers, getTeamMemberName } from "@/lib/demo-data";
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
} from "lucide-react";
import Link from "next/link";
import type { Site } from "@/types";

export default function SitesPage() {
  const { profile, isDemo } = useAuth();
  const { can } = usePermissions();
  const supabase = createClient();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    wp_api_url: "",
    wp_application_password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const canCreate = can(Permissions.SITES_CREATE);
  const canDelete = can(Permissions.SITES_DELETE);
  const [search, setSearch] = useState("");
  const [wpFilter, setWpFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [assignSite, setAssignSite] = useState<string | null>(null);
  const [assignMessage, setAssignMessage] = useState("");
  const [selectedDev, setSelectedDev] = useState("");
  const [siteAssignments, setSiteAssignments] = useState<Record<string, { userId: string; message: string }>>({});
  const teamMembers = isDemo ? getTeamMembers() : [];

  useEffect(() => {
    if (isDemo) {
      setSites(DEMO_SITES as unknown as Site[]);
      setLoading(false);
      return;
    }
    if (!profile?.agency_id) return;
    fetchSites();
  }, [profile, isDemo]);

  const fetchSites = async () => {
    if (!profile?.agency_id) return;
    try {
      const { data } = await supabase
        .from("sites")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .order("created_at", { ascending: false });
      if (data) setSites(data as Site[]);
    } catch {
      // keep empty
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!profile?.agency_id || isDemo) return;
    setSubmitting(true);

    await supabase.from("sites").insert({
      agency_id: profile.agency_id,
      name: formData.name,
      url: formData.url,
      wp_api_url: formData.wp_api_url || null,
      wp_application_password: formData.wp_application_password || null,
      wp_connected: !!(formData.wp_api_url && formData.wp_application_password),
    });

    setShowAdd(false);
    setFormData({ name: "", url: "", wp_api_url: "", wp_application_password: "" });
    fetchSites();
    setSubmitting(false);
  };

  const handleRemoveSite = (siteId: string) => {
    if (isDemo) {
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      return;
    }
    supabase.from("sites").delete().eq("id", siteId).then(() => fetchSites());
  };

  const handleAssignSite = (siteId: string, userId: string) => {
    setSiteAssignments((prev) => ({
      ...prev,
      [siteId]: { userId, message: userId ? assignMessage : "" },
    }));
    setAssignSite(null);
    setAssignMessage("");
  };

  const getCounts = (siteId: string) => {
    if (isDemo) {
      const s = DEMO_SITES.find((ds) => ds.id === siteId);
      return s?.feedback_counts || { new_count: 0, in_progress_count: 0, resolved_count: 0 };
    }
    const site = sites.find((s) => s.id === siteId);
    return (site as any)?.feedback_counts || { new_count: 0, in_progress_count: 0, resolved_count: 0 };
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch = !search.trim() ||
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.url.toLowerCase().includes(search.toLowerCase());
    const matchesWp =
      wpFilter === "all" ||
      (wpFilter === "connected" && site.wp_connected) ||
      (wpFilter === "disconnected" && !site.wp_connected);
    return matchesSearch && matchesWp;
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
      <div className="flex items-center gap-3">
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSites.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No sites added yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first WordPress site to start collecting feedback
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
                              <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {getTeamMemberName(siteAssignments[site.id].userId)}
                              </p>
                              {siteAssignments[site.id]?.message && (
                                <span className="text-[10px] text-muted-foreground/50 truncate max-w-[140px]">
                                  &quot;{siteAssignments[site.id].message}&quot;
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
                      </div>
                    </div>
                  </div>

                  {/* Feedback stats */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-4 py-2.5 border-t border-border">
                      <div className="flex items-center gap-1.5 text-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium text-foreground">{counts.new_count}</span>
                        <span className="text-muted-foreground text-xs">new</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Loader2 className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground">{counts.in_progress_count}</span>
                        <span className="text-muted-foreground text-xs">in progress</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-medium text-foreground">{counts.resolved_count}</span>
                        <span className="text-muted-foreground text-xs">resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="px-5 pb-5">
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
              <Input
                label="WordPress REST API URL"
                placeholder="https://clientsite.com/wp-json"
                value={formData.wp_api_url}
                onChange={(e) => setFormData({ ...formData, wp_api_url: e.target.value })}
              />
              <div className="mt-3">
                <Input
                  label="Application Password"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={formData.wp_application_password}
                  onChange={(e) => setFormData({ ...formData, wp_application_password: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>
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
        onClose={() => { setAssignSite(null); setAssignMessage(""); setSelectedDev(""); }}
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
            {assignSite && siteAssignments[assignSite]?.userId && (
              <button
                onClick={() => {
                  setSiteAssignments((prev) => ({
                    ...prev,
                    [assignSite]: { userId: "", message: "" },
                  }));
                  setAssignSite(null);
                  setAssignMessage("");
                  setSelectedDev("");
                }}
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
    </div>
  );
}
