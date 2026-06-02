import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Auto-register from WP plugin (no auth)
  if (body.agencyToken) {
    return handleAutoRegister(body);
  }

  // Normal site creation (authenticated user)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({
      agency_id: profile.agency_id,
      name: body.name,
      url: body.url,
      wp_api_url: body.wp_api_url || null,
      wp_application_password: body.wp_application_password || null,
      wp_connected: !!(body.wp_api_url && body.wp_application_password),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

async function handleAutoRegister(body: any) {
  const { agencyToken, siteName, siteUrl, apiKey } = body;
  if (!agencyToken || !siteName || !siteUrl || !apiKey) {
    return NextResponse.json(
      { error: "Missing required fields: agencyToken, siteName, siteUrl, apiKey" },
      { status: 400 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .select("id")
    .eq("agency_token", agencyToken)
    .maybeSingle();

  if (agencyError || !agency) {
    return NextResponse.json({ error: "Invalid agency token" }, { status: 404 });
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .insert({
      agency_id: agency.id,
      name: siteName,
      url: siteUrl,
      wp_api_key: apiKey,
      wp_api_url: siteUrl,
      wp_connected: true,
    })
    .select("id")
    .single();

  if (siteError || !site) {
    return NextResponse.json(
      { error: siteError?.message || "Failed to create site" },
      { status: 500 }
    );
  }

  return NextResponse.json({ connected: true, siteId: site.id });
}
