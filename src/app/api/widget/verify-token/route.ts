import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, projectId, _updateUrl, _siteId, _wpApiKey } = body;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    // Special action: update the site's WP URL from the dashboard
    if (_updateUrl) {
      let query = supabase.from("sites").update({ wp_api_url: _updateUrl, url: _updateUrl });
      if (_siteId) {
        query = query.eq("id", _siteId);
      } else if (_wpApiKey) {
        query = query.eq("wp_api_key", _wpApiKey);
      } else {
        return NextResponse.json({ error: "Missing _siteId or _wpApiKey" }, { status: 400, headers: corsHeaders });
      }
      const { error } = await query;
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });
      }
      return NextResponse.json({ ok: true, message: "Site URL updated to " + _updateUrl }, { headers: corsHeaders });
    }

    // If projectId is provided directly, just look up the project name
    if (projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("name")
        .eq("id", projectId)
        .maybeSingle();

      return NextResponse.json({
        valid: !!project,
        name: project?.name || null,
      }, { headers: corsHeaders });
    }

    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400, headers: corsHeaders });
    }

    const { data: link, error } = await supabase
      .from("preview_links")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !link) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 404, headers: corsHeaders });
    }

    if (!link.is_active) {
      return NextResponse.json({ valid: false, error: "Token is inactive" }, { status: 403, headers: corsHeaders });
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "Token has expired" }, { status: 403, headers: corsHeaders });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("agency_id, name")
      .eq("id", link.project_id)
      .maybeSingle();

    let primaryColor = "#6366f1";
    if (project) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("primary_color")
        .eq("id", project.agency_id)
        .maybeSingle();
      if (agency?.primary_color) primaryColor = agency.primary_color;
    }

    return NextResponse.json({
      valid: true,
      projectId: link.project_id,
      primaryColor,
      siteName: project?.name || "Site",
    }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ valid: false, error: "Internal error" }, { status: 500, headers: corsHeaders });
  }
}
