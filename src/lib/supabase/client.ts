import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function proxyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url && url.startsWith("https://")) {
    const u = new URL(url);
    if (u.origin === new URL(SUPABASE_URL || "").origin) {
      const proxyPath = `/api/supabase-proxy${u.pathname}${u.search}`;
      const proxyUrl = `${window.location.origin}${proxyPath}`;
      const headers = new Headers(init?.headers || {});
      if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const authHeader = headers.get("Authorization");
      if (authHeader) {
        headers.set("Authorization", authHeader);
      }
      return fetch(proxyUrl, { ...init, headers });
    }
  }
  return fetch(input, init);
}

function createNoopClient(): SupabaseClient {
  const noopResult = { data: null, error: null };
  const noopDataResult = { data: [], error: null };

  const queryMethods = {
    select: () => queryMethods,
    insert: () => queryMethods,
    update: () => queryMethods,
    delete: () => queryMethods,
    eq: () => queryMethods,
    in: () => queryMethods,
    order: () => queryMethods,
    limit: () => queryMethods,
    maybeSingle: () => queryMethods,
    single: () => noopResult,
    then: undefined,
  };

  const noopStorage = {
    from: () => ({
      upload: async () => noopResult,
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      list: async () => noopDataResult,
      remove: async () => noopResult,
    }),
  };

  const noopAuth = {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => noopResult,
    signInWithPassword: async () => noopResult,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null }, error: null }),
  };

  const noop = {
    from: () => queryMethods,
    auth: noopAuth,
    storage: noopStorage,
    rpc: () => queryMethods,
  };

  return noop as unknown as SupabaseClient;
}

let clientInstance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "https://placeholder.supabase.co") {
    return createNoopClient();
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(url, key, {
      ...({ fetch: proxyFetch } as any),
    });
  }

  return clientInstance;
}
