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

const AUTH_TIMEOUT = 15000;

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    } catch {
      // profile stays null
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("feedspace_demo");
    const savedRole = sessionStorage.getItem("feedspace_demo_role") as "owner" | "developer" | "client" | null;
    if (saved === "true") {
      setProfile(savedRole === "developer" ? DEMO_DEV : savedRole === "client" ? DEMO_CLIENT : DEMO_OWNER);
      setIsDemo(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    }, AUTH_TIMEOUT);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const usr = data?.session?.user;
        if (usr) {
          setUser(usr);
          await fetchProfile(usr.id);
        }
      } catch (err) {
        console.error("Supabase connection failed:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem("feedspace_demo");
    sessionStorage.removeItem("feedspace_demo_role");
    document.cookie = "feedspace_demo=; path=/; max-age=0";
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  }, []);

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
