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
  const projectId = searchParams.get("projectId") || "";
  const idsParam = searchParams.get("ids") || "";
  const wpApiKey = searchParams.get("wpApiKey") || "";
  const token = searchParams.get("token") || "";

  if (!idsParam) {
    return NextResponse.json(
      { error: "Missing ids" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const ids = idsParam.split(",").filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ statuses: {} }, { headers: corsHeaders() });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Missing projectId" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate access: preview token or wpApiKey
  if (token) {
    const { data: link } = await sb
      .from("preview_links")
      .select("project_id")
      .eq("token", token)
      .eq("project_id", projectId)
      .single();
    if (!link) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404, headers: corsHeaders() }
      );
    }
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
    // Verify the project belongs to this site
    const { data: proj } = await sb
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("site_id", site.id)
      .maybeSingle();
    if (!proj) {
      return NextResponse.json(
        { error: "Project not found for this site" },
        { status: 404, headers: corsHeaders() }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Missing auth" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const { data } = await sb
    .from("feedback_items")
    .select("id, status")
    .eq("project_id", projectId)
    .in("id", ids);

  const statuses: Record<string, string> = {};
  if (data) {
    for (const item of data) {
      statuses[item.id] = item.status;
    }
  }

  return NextResponse.json({ statuses }, { headers: corsHeaders() });
}
