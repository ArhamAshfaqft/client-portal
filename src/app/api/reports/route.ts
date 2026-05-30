import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    .select("agency_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let query = supabase
    .from("dev_reports")
    .select("*, developer:profiles!developer_id(full_name, email), project:projects(name)")
    .order("date", { ascending: false });

  if (profile.role === "developer") {
    query = query.eq("developer_id", user.id);
  } else {
    const { data: developers } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("agency_id", profile.agency_id);

    const devIds = (developers || []).map((d) => d.user_id);
    query = query.in("developer_id", devIds);
  }

  const { data } = await query;
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("dev_reports")
    .insert({
      developer_id: user.id,
      project_id: body.project_id,
      date: body.date || new Date().toISOString().split("T")[0],
      summary: body.summary,
      hours_logged: body.hours_logged || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
