import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const FETCH_TIMEOUT = 30000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  return fetch(input, { ...init, signal: controller.signal })
    .then((res) => { clearTimeout(id); return res; })
    .catch((err) => { clearTimeout(id); throw err; });
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
      ...({ fetch: fetchWithTimeout } as any),
    });
  }

  return clientInstance;
}
