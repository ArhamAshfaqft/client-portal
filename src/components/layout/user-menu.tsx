"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="flex items-center gap-2 p-1.5">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        <Avatar name={profile.full_name} size="sm" />
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-tight">
            {profile.full_name}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {profile.role}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {profile.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/settings");
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <User className="w-4 h-4" />
            Profile Settings
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
