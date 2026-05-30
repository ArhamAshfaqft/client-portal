"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/sites": "Sites",
  "/dashboard/team": "Team",
  "/dashboard/feedback": "Feedback",
  "/dashboard/my-feedback": "My Feedback",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

const pageDescriptions: Record<string, string> = {
  "/dashboard": "Overview of your workspace",
  "/dashboard/sites": "View connected WordPress sites",
  "/dashboard/team": "Manage your development team",
  "/dashboard/feedback": "Review all client feedback",
  "/dashboard/my-feedback": "Feedback assigned to you",
  "/dashboard/reports": "Log your daily work hours",
  "/dashboard/settings": "Configure your workspace",
};

export function Header() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [title, setTitle] = useState("Dashboard");

  useEffect(() => {
    const matchedKey = Object.keys(pageTitles).find(
      (key) => pathname === key || pathname.startsWith(key + "/")
    );
    setTitle(pageTitles[matchedKey ?? ""] ?? "Dashboard");
  }, [pathname]);

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">
          {pageDescriptions[pathname] ||
            pageDescriptions[
              Object.keys(pageDescriptions).find((k) =>
                pathname.startsWith(k)
              ) ?? ""
            ] ||
            "workspace"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
