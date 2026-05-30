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

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const realUrl = url && url !== "https://placeholder.supabase.co";
  console.log("[createClient] url present:", !!url, "key present:", !!key, "isReal:", realUrl);
  if (!realUrl) {
    console.log("[createClient] using noop client");
    return createNoopClient();
  }
  console.log("[createClient] using real Supabase client");
  return createBrowserClient(url!, key!);
}
