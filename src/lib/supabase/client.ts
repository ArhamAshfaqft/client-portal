import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

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

// Module-level singleton — guarantees the same reference across all
// components and hooks so React dependency arrays stay stable and
// we never open duplicate realtime connections.
let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Return cached singleton if it already exists
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "https://placeholder.supabase.co") {
    _client = createNoopClient();
  } else {
    _client = createBrowserClient(url, key);
  }

  return _client;
}
