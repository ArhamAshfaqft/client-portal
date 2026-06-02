import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ name: project.name }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500, headers: corsHeaders });
  }
}
