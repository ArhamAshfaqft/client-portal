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

  if (!token || !idsParam) {
    return NextResponse.json(
      { error: "Missing token or ids" },
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

  const { data } = await sb
    .from("feedback_items")
    .select("id, status")
    .eq("project_id", link.project_id)
    .in("id", ids);

  const statuses: Record<string, string> = {};
  if (data) {
    for (const item of data) {
      statuses[item.id] = item.status;
    }
  }

  return NextResponse.json({ statuses }, { headers: corsHeaders() });
}
