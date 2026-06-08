import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Site-Token, X-WP-API-Key",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteToken = request.headers.get("X-Site-Token") || searchParams.get("siteToken");
  const wpApiKey = request.headers.get("X-WP-API-Key") || searchParams.get("wpApiKey");

  const supabase = adminClient();
  let siteId: string | null = null;

  if (token) {
    const { data: link } = await supabase
      .from("preview_links")
      .select("project_id, projects(site_id)")
      .eq("token", token)
      .single();
    if (link) {
      siteId = (link as any).projects?.site_id || null;
    }
  }

  if (!siteId && siteToken && wpApiKey) {
    const { data: site } = await supabase
      .from("sites")
      .select("id, wp_api_key")
      .eq("id", siteToken)
      .eq("wp_connected", true)
      .maybeSingle();
    if (site && site.wp_api_key === wpApiKey) {
      siteId = site.id;
    }
  }

  if (!siteId) {
    return NextResponse.json(
      { error: "Could not resolve site" },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  return NextResponse.json(
    { projects: projects || [] },
    { headers: corsHeaders() }
  );
}
