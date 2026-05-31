import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data: link, error } = await supabase
      .from("preview_links")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !link) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 404 });
    }

    if (!link.is_active) {
      return NextResponse.json({ valid: false, error: "Token is inactive" }, { status: 403 });
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "Token has expired" }, { status: 403 });
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
    });
  } catch (err) {
    return NextResponse.json({ valid: false, error: "Internal error" }, { status: 500 });
  }
}
