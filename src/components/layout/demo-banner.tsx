"use client";

import { useAuth } from "@/lib/auth-context";
import { X, Info } from "lucide-react";

export function DemoBanner() {
  const { isDemo, signOut } = useAuth();

  if (!isDemo) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-6 py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            You are viewing the demo. Data is stored locally and will reset on
            refresh.
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          Exit Demo
        </button>
      </div>
    </div>
  );
}
