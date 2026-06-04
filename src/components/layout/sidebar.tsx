"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Users,
  Settings,
  Bell,
  ChevronLeft,
  PanelLeft,
  ListTodo,
  Clock,
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/sites", label: "Sites", icon: Globe, show: can(Permissions.SITES_VIEW) },
    { href: "/dashboard/my-feedback", label: "Sessions", icon: ListTodo, show: profile?.role === "owner" || can(Permissions.FEEDBACK_VIEW_ASSIGNED) },
    { href: "/dashboard/team", label: "Team", icon: Users, show: can(Permissions.TEAM_VIEW) },
    { href: "/dashboard/reports", label: "Reports", icon: Clock, show: false },
    { href: "/dashboard/activity", label: "Activity", icon: History, show: false },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
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
          <div className="flex items-center gap-2 px-3">
            <span className="text-xs text-sidebar-muted">Feedspace</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary leading-none">Beta</span>
          </div>
        )}
      </div>
    </aside>
  );
}
