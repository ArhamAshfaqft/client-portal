"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DemoBanner } from "./demo-banner";
import { useAuth } from "@/lib/auth-context";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";

const AUTH_TIMEOUT = 20000;

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoading, connectionError } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connection failed
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Could not connect to the server. Check your internet connection or try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner />
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
