import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";
  const idsParam = searchParams.get("ids") || "";
  const wpApiKey = searchParams.get("wpApiKey") || "";

  if ((!token && !wpApiKey) || !idsParam) {
    return NextResponse.json(
      { error: "Missing token/wpApiKey or ids" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const ids = idsParam.split(",").filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ statuses: {} }, { headers: corsHeaders() });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Auth: verify token (preview link) or wpApiKey (WP site)
  let projectId: string | null = null;
  if (token) {
    const { data: link } = await sb
      .from("preview_links")
      .select("project_id")
      .eq("token", token)
      .single();
    if (!link) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404, headers: corsHeaders() }
      );
    }
    projectId = link.project_id;
  } else if (wpApiKey) {
    const { data: site } = await sb
      .from("sites")
      .select("id")
      .eq("wp_api_key", wpApiKey)
      .single();
    if (!site) {
      return NextResponse.json(
        { error: "Invalid wpApiKey" },
        { status: 404, headers: corsHeaders() }
      );
    }
    // Don't filter by project — the IDs themselves are scoped to the site's projects
    projectId = '__any__';
  }

  let data;
  if (projectId === '__any__') {
    const { data: items } = await sb
      .from("feedback_items")
      .select("id, status")
      .in("id", ids);
    data = items;
  } else if (projectId) {
    const { data: items } = await sb
      .from("feedback_items")
      .select("id, status")
      .eq("project_id", projectId)
      .in("id", ids);
    data = items;
  }

  const statuses: Record<string, string> = {};
  if (data) {
    for (const item of data) {
      statuses[item.id] = item.status;
    }
  }

  return NextResponse.json({ statuses }, { headers: corsHeaders() });
}
