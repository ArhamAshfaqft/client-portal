"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Users,
  MessageSquareText,
  Settings,
  ChevronLeft,
  PanelLeft,
  Clock,
  ListTodo,
  History,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/use-permissions";
import { Permissions } from "@/lib/permissions";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { can } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);

  if (!profile) {
    return null;
  }

  const isClient = profile?.role === "client";

  const navItems = isClient
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/my-feedback", label: "My Feedback", icon: ListTodo },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/sites", label: "Sites", icon: Globe, show: can(Permissions.SITES_VIEW) },
        { href: "/dashboard/my-feedback", label: "My Feedback", icon: ListTodo, show: can(Permissions.FEEDBACK_VIEW_ASSIGNED) && !can(Permissions.FEEDBACK_VIEW_ALL) },
        { href: "/dashboard/team", label: "Team", icon: Users, show: can(Permissions.TEAM_VIEW) },
        { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquareText, show: can(Permissions.FEEDBACK_VIEW_ALL) },
        { href: "/dashboard/reports", label: "Reports", icon: Clock, show: can(Permissions.REPORTS_CREATE) || can(Permissions.REPORTS_VIEW_ALL) },
        { href: "/dashboard/activity", label: "Activity", icon: History, show: profile?.role === "owner" || can(Permissions.FEEDBACK_VIEW_ALL) },
        { href: "/dashboard/settings", label: "Settings", icon: Settings, show: can(Permissions.SETTINGS_VIEW) },
      ].filter((item: any) => item.show !== false);

  return (
    <aside
      className={`flex-shrink-0 bg-sidebar border-r border-border transition-all duration-200 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Feedspace
            </span>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {profile?.position ? `${profile.position} workspace` : profile?.role === "owner" ? "owner workspace" : "workspace"}
            </p>
          </div>
        )}
        {collapsed && (
          <span className="text-lg font-bold text-foreground mx-auto">
            F
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item: any) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-sidebar-foreground hover:bg-accent hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        {!collapsed && (
          <p className="text-xs text-sidebar-muted px-3">
            Feedspace v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
}
