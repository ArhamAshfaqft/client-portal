import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: link, error } = await supabase
      .from("preview_links")
      .select("*, projects!inner(agency_id, name)")
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

    const project = link.projects as any;

    const { data: agency } = await supabase
      .from("agencies")
      .select("primary_color, name")
      .eq("id", project.agency_id)
      .single();

    return NextResponse.json({
      valid: true,
      projectId: link.project_id,
      primaryColor: agency?.primary_color || "#6366f1",
      siteName: project?.name || "Site",
    });
  } catch (err) {
    return NextResponse.json({ valid: false, error: "Internal error" }, { status: 500 });
  }
}
