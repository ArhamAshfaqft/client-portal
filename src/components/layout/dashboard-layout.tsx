"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DemoBanner } from "./demo-banner";
import { useAuth } from "@/lib/auth-context";
import { WifiOff, RefreshCw } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { connectionError, refreshProfile, user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner />
        {connectionError && (
          <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Connection to server failed. Some features may be unavailable.
                </p>
              </div>
              <button
                onClick={() => { window.location.reload(); }}
                className="flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
