"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  demoLogin: (role?: "owner" | "developer" | "client") => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function makeDemo(overrides: Partial<Profile>): Profile {
  return {
    id: "",
    user_id: "",
    agency_id: "",
    role: "developer",
    full_name: "",
    avatar_url: null,
    email: "",
    position: null,
    permissions: [],
    is_super_admin: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const DEMO_OWNER = makeDemo({
  id: "demo-id",
  user_id: "demo-user-id",
  agency_id: "demo-agency-id",
  role: "owner",
  full_name: "Sarah Mitchell",
  email: "sarah@skylineagency.com",
  permissions: getDefaultPermissions("owner"),
});

const DEMO_CLIENT = makeDemo({
  id: "demo-client-profile",
  user_id: "demo-client-1",
  agency_id: "demo-agency-id",
  role: "client",
  full_name: "Michael Chen",
  email: "michael@brightonlaw.com",
  permissions: [],
});

const DEMO_DEV = makeDemo({
  id: "demo-mem-2",
  user_id: "demo-dev-1",
  agency_id: "demo-agency-id",
  role: "developer",
  full_name: "James Chen",
  email: "james@skylineagency.com",
  position: "developer",
  permissions: getDefaultPermissions("developer", "developer"),
});

// Grab the singleton once at module level — the reference never changes
const supabase = createClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const isSuperAdmin = !!profile?.is_super_admin;

  // Guard against double-fire in React 18 Strict Mode
  const initRef = useRef(false);

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
  }, []); // supabase is now a stable module-level singleton — no dependency needed

  useEffect(() => {
    // Prevent double-init on React 18 Strict Mode / concurrent features
    if (initRef.current) return;
    initRef.current = true;

    // Guard SSR — sessionStorage is browser-only
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const saved = sessionStorage.getItem("feeddash_demo");
    const savedRole = sessionStorage.getItem("feeddash_demo_role") as "owner" | "developer" | "client" | null;
    if (saved === "true") {
      setProfile(savedRole === "developer" ? DEMO_DEV : savedRole === "client" ? DEMO_CLIENT : DEMO_OWNER);
      setIsDemo(true);
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const usr = session?.user ?? null;
      setUser(usr);
      if (usr) {
        fetchProfile(usr.id).finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const usr = session?.user ?? null;
      setUser(usr);
      if (usr) fetchProfile(usr.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem("feeddash_demo");
    sessionStorage.removeItem("feeddash_demo_role");
    document.cookie = "feeddash_demo=; path=/; max-age=0";
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  }, []);

  const demoLogin = useCallback((role: "owner" | "developer" | "client" = "owner") => {
    const p = role === "developer" ? DEMO_DEV : role === "client" ? DEMO_CLIENT : DEMO_OWNER;
    sessionStorage.setItem("feeddash_demo", "true");
    sessionStorage.setItem("feeddash_demo_role", role);
    document.cookie = "feeddash_demo=true; path=/; max-age=86400";
    setProfile(p);
    setIsDemo(true);
    setIsLoading(false);
  }, []);

  const refreshProfile = useCallback(() => {
    if (user) return fetchProfile(user.id);
    return Promise.resolve();
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemo,
        isSuperAdmin,
        signOut,
        refreshProfile,
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
