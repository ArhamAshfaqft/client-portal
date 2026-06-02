import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const siteToken = request.headers.get("X-Site-Token");
    const wpApiKey = request.headers.get("X-WP-API-Key");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    if (!siteToken || !wpApiKey) {
      return NextResponse.json({ error: "Missing auth headers" }, { status: 401 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: site } = await supabase
      .from("sites")
      .select("id, wp_api_key")
      .eq("id", siteToken)
      .maybeSingle();

    if (!site || site.wp_api_key !== wpApiKey) {
      return NextResponse.json({ error: "Invalid auth" }, { status: 403 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ name: project.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
