import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const serviceRoleSet = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const freemiusWebhookSet = !!process.env.FREEMIUS_WEBHOOK_SECRET;
  const freemiusProductSet = !!process.env.FREEMIUS_PRODUCT_ID;
  const freemiusPublicSet = !!process.env.FREEMIUS_PUBLIC_KEY;

  // Verify Supabase connectivity if key is present
  let supabaseOk = false;
  let supabaseError = "";
  if (serviceRoleSet) {
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { error } = await sb.from("agencies").select("id", { count: "exact", head: true });
      supabaseOk = !error;
      if (error) supabaseError = error.message;
    } catch (e: any) {
      supabaseError = e.message;
    }
  }

  return Response.json({
    SERVICE_ROLE_KEY: serviceRoleSet,
    FREEMIUS_WEBHOOK_SECRET: freemiusWebhookSet,
    FREEMIUS_PRODUCT_ID: freemiusProductSet,
    FREEMIUS_PUBLIC_KEY: freemiusPublicSet,
    SUPABASE_CONNECTIVITY: supabaseOk,
    SUPABASE_ERROR: supabaseError || null,
  });
}
