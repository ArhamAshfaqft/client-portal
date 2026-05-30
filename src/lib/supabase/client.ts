import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function createNoopClient(): SupabaseClient {
  const noop = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "then") return undefined;
        return () => noop;
      },
    }
  );
  return noop as unknown as SupabaseClient;
}

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "https://placeholder.supabase.co") {
    return createNoopClient();
  }

  return createBrowserClient(url, key);
}
