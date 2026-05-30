"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  Mail,
  UserPlus,
  Trash2,
  Shield,
  Code,
  Palette,
  Wrench,
  ChevronDown,
  ChevronRight,
  Check,
  Search,
} from "lucide-react";
import {
  POSITIONS,
  ALL_PERMISSIONS,
  getDefaultPermissions,
} from "@/lib/permissions";
import type { PositionType } from "@/types";
import type { Profile } from "@/types";

interface MemberEntry extends Profile {
  last_active?: string;
}

const DEMO_MEMBERS: MemberEntry[] = [
  {
    id: "demo-mem-1", user_id: "demo-user-id", agency_id: "demo-agency",
    role: "owner", full_name: "Sarah Mitchell", avatar_url: null,
    email: "sarah@skylineagency.com", position: null,
    permissions: getDefaultPermissions("owner"),
    created_at: "2026-01-15T10:00:00Z", last_active: new Date().toISOString(),
  },
  {
    id: "demo-mem-2", user_id: "demo-dev-1", agency_id: "demo-agency",
    role: "developer", full_name: "James Chen", avatar_url: null,
    email: "james@skylineagency.com", position: "developer",
    permissions: getDefaultPermissions("developer", "developer"),
    created_at: "2026-02-20T08:00:00Z", last_active: "2026-05-29T16:30:00Z",
  },
  {
    id: "demo-mem-3", user_id: "demo-dev-2", agency_id: "demo-agency",
    role: "developer", full_name: "Maria Rodriguez", avatar_url: null,
    email: "maria@skylineagency.com", position: "designer",
    permissions: getDefaultPermissions("developer", "designer"),
    created_at: "2026-03-05T09:00:00Z", last_active: "2026-05-29T15:00:00Z",
  },
  {
    id: "demo-mem-4", user_id: "demo-dev-3", agency_id: "demo-agency",
    role: "developer", full_name: "Alex Thompson", avatar_url: null,
    email: "alex@skylineagency.com", position: "manager",
    permissions: getDefaultPermissions("developer", "manager"),
    created_at: "2026-03-12T11:00:00Z", last_active: "2026-05-28T17:45:00Z",
  },
  {
    id: "demo-mem-5", user_id: "demo-dev-4", agency_id: "demo-agency",
    role: "developer", full_name: "Priya Patel", avatar_url: null,
    email: "priya@skylineagency.com", position: "developer",
    permissions: getDefaultPermissions("developer", "developer"),
    created_at: "2026-04-01T10:00:00Z", last_active: "2026-05-29T14:20:00Z",
  },
];

const positionLabels: Record<string, string> = {
  manager: "Manager",
  developer: "Developer",
  designer: "Designer",
  custom: "Custom",
};

const positionIcons: Record<string, typeof Shield> = {
  manager: Shield,
  developer: Code,
  designer: Palette,
  custom: Wrench,
};

export default function TeamPage() {
  const { profile, isDemo } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePosition, setInvitePosition] = useState<PositionType>("developer");
  const [customPermissions, setCustomPermissions] = useState<string[]>(getDefaultPermissions("developer", "developer"));
  const [showPermissions, setShowPermissions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isDemo) {
      setMembers(DEMO_MEMBERS);
      setLoading(false);
      return;
    }
    if (!profile?.agency_id) return;
    fetchMembers();
  }, [profile, isDemo]);

  const fetchMembers = async () => {
    if (!profile?.agency_id) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .order("created_at", { ascending: false });
      if (data) setMembers(data as MemberEntry[]);
    } catch {
      setMembers(DEMO_MEMBERS);
    }
    setLoading(false);
  };

  const handlePositionChange = (position: PositionType) => {
    setInvitePosition(position);
    if (position !== "custom") {
      setCustomPermissions(getDefaultPermissions("developer", position));
      setShowPermissions(false);
    } else {
      setShowPermissions(true);
    }
  };

  const togglePermission = (perm: string) => {
    setCustomPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleInvite = async () => {
    if (!profile?.agency_id || isDemo) return;
    setError("");
    setSubmitting(true);

    const { data: authData, error: authError } =
      await supabase.auth.admin.inviteUserByEmail(inviteEmail);

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    if (authData?.user) {
      await supabase.from("profiles").insert({
        user_id: authData.user.id,
        agency_id: profile.agency_id,
        role: "developer",
        full_name: inviteName,
        email: inviteEmail,
        position: invitePosition,
        permissions: customPermissions,
      });
    }

    setShowInvite(false);
    setInviteEmail("");
    setInviteName("");
    setInvitePosition("developer");
    setCustomPermissions(getDefaultPermissions("developer", "developer"));
    setSubmitting(false);
    fetchMembers();
  };

  const handleRemove = async (userId: string) => {
    if (isDemo) {
      setMembers(members.filter((m) => m.user_id !== userId));
      return;
    }
    await supabase.from("profiles").delete().eq("user_id", userId);
    fetchMembers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {members.length} team member{members.length !== 1 ? "s" : ""}
        </p>
        {profile?.role === "owner" && (
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent>
                <div className="h-14 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
          {members
            .filter((m) => {
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                m.full_name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                (m.position || "").toLowerCase().includes(q)
              );
            })
            .map((member) => {
            const PositionIcon = member.position && member.position in positionIcons
              ? positionIcons[member.position as PositionType]
              : Shield;
            return (
              <Card key={member.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.full_name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {member.full_name}
                          </p>
                          {member.role === "owner" ? (
                            <Badge variant="info">
                              <Shield className="w-3 h-3 mr-1" />
                              Owner
                            </Badge>
                          ) : member.position ? (
                            <Badge variant="default">
                              <PositionIcon className="w-3 h-3 mr-1" />
                              {positionLabels[member.position]}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {profile?.role === "owner" && member.role !== "owner" && (
                      <button
                        onClick={() => handleRemove(member.user_id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </>
      )}

      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Team Member"
        size="lg"
      >
        <div className="space-y-5">
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="jane@agency.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Position
            </label>
            <div className="grid grid-cols-4 gap-2">
              {POSITIONS.map((pos) => {
                const Icon = positionIcons[pos.value];
                const isActive = invitePosition === pos.value;
                return (
                  <button
                    key={pos.value}
                    onClick={() => handlePositionChange(pos.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm transition-all ${
                      isActive
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{pos.label}</span>
                    <span className="text-[10px] text-center leading-tight opacity-70">
                      {pos.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom permissions */}
          <div className="border border-border rounded-lg">
            <button
              onClick={() => setShowPermissions(!showPermissions)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground"
            >
              <span>Custom Permissions ({customPermissions.length} selected)</span>
              {showPermissions ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {showPermissions && (
              <div className="px-4 pb-3 space-y-3 border-t border-border pt-3">
                {ALL_PERMISSIONS.reduce(
                  (groups, perm) => {
                    const group = groups.find((g) => g.group === perm.group);
                    if (group) group.items.push(perm);
                    else groups.push({ group: perm.group, items: [perm] });
                    return groups;
                  },
                  [] as { group: string; items: typeof ALL_PERMISSIONS }[]
                ).map(({ group, items }) => (
                  <div key={group}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {items.map((perm) => {
                        const enabled = customPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className="flex items-center gap-2.5 py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                enabled
                                  ? "bg-primary border-primary"
                                  : "border-border group-hover:border-muted-foreground"
                              }`}
                            >
                              {enabled && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => togglePermission(perm.key)}
                              className="sr-only"
                            />
                            <span className="text-sm text-foreground">
                              {perm.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/5 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} loading={submitting}>
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
