"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getDefaultPermissions } from "@/lib/permissions";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  demoLogin: (role?: "owner" | "developer" | "client") => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const DEMO_OWNER: Profile = {
  id: "demo-id",
  user_id: "demo-user-id",
  agency_id: "demo-agency-id",
  role: "owner",
  full_name: "Sarah Mitchell",
  avatar_url: null,
  email: "sarah@skylineagency.com",
  position: null,
  permissions: getDefaultPermissions("owner"),
  created_at: new Date().toISOString(),
};

const DEMO_CLIENT: Profile = {
  id: "demo-client-profile",
  user_id: "demo-client-1",
  agency_id: "demo-agency-id",
  role: "client",
  full_name: "Michael Chen",
  avatar_url: null,
  email: "michael@brightonlaw.com",
  position: null,
  permissions: [],
  created_at: new Date().toISOString(),
};

const DEMO_DEV: Profile = {
  id: "demo-mem-2",
  user_id: "demo-dev-1",
  agency_id: "demo-agency-id",
  role: "developer",
  full_name: "James Chen",
  avatar_url: null,
  email: "james@skylineagency.com",
  position: "developer",
  permissions: getDefaultPermissions("developer", "developer"),
  created_at: new Date().toISOString(),
};

const DEMO_AGENCY = {
  name: "Skyline Digital Agency",
  slug: "skyline-digital",
  primary_color: "#2563eb",
  secondary_color: "#64748b",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      console.log("[Auth] querying profiles for:", userId);
      try {
        const result = await Promise.race([
          supabase.from("profiles").select("*").eq("user_id", userId).single(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
        const data = (result as any)?.data;
        const error = (result as any)?.error;
        console.log("[Auth] profile query result:", data ? "found" : "null", error?.message || "no error");
        if (error) console.log("[Auth] profile error:", JSON.stringify(error));
        if (data) setProfile(data as Profile);
      } catch (e: any) {
        console.log("[Auth] profile query failed:", e?.message || e);
      }
    },
    [supabase]
  );

  const fetchSessionWithTimeout = useCallback(async () => {
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ]);
      return result as { data: { session: any } };
    } catch (e) {
      console.log("[Auth] getSession timeout/error");
      return { data: { session: null } };
    }
  }, [supabase]);

  useEffect(() => {
    const saved = sessionStorage.getItem("feedspace_demo");
    const savedRole = sessionStorage.getItem("feedspace_demo_role") as "owner" | "developer" | "client" | null;
    if (saved === "true") {
      setProfile(savedRole === "developer" ? DEMO_DEV : savedRole === "client" ? DEMO_CLIENT : DEMO_OWNER);
      setIsDemo(true);
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      console.log("[Auth] supabase is null, skipping");
      setIsLoading(false);
      return;
    }

    console.log("[Auth] useEffect running, supabase type:", typeof supabase.auth?.getSession === "function" ? "real" : "noop");

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("[Auth] onAuthStateChange event:", _event, session?.user?.email || "signed out");
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      subscription = result.data.subscription;
      console.log("[Auth] subscription created");
    } catch (e) {
      console.log("[Auth] subscription error:", e);
    }

    const init = async () => {
      const { data } = await fetchSessionWithTimeout();
      console.log("[Auth] init session:", data?.session?.user?.email || "none");
      const user = data?.session?.user;
      if (user) {
        setUser(user);
        console.log("[Auth] fetching profile for:", user.id);
        await fetchProfile(user.id);
      } else {
        console.log("[Auth] no session found");
      }
      console.log("[Auth] init done");
      setIsLoading(false);
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem("feedspace_demo");
    sessionStorage.removeItem("feedspace_demo_role");
    document.cookie = "feedspace_demo=; path=/; max-age=0";
    await supabase?.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  }, [supabase]);

  const demoLogin = useCallback((role: "owner" | "developer" | "client" = "owner") => {
    const profile = role === "developer" ? DEMO_DEV : role === "client" ? DEMO_CLIENT : DEMO_OWNER;
    sessionStorage.setItem("feedspace_demo", "true");
    sessionStorage.setItem("feedspace_demo_role", role);
    document.cookie = "feedspace_demo=true; path=/; max-age=86400";
    setProfile(profile);
    setIsDemo(true);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemo,
        signOut,
        refreshProfile: () => {
          if (user) return fetchProfile(user.id);
          return Promise.resolve();
        },
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
