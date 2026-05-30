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

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can invite" }, { status: 403 });
  }

  const body = await request.json();
  const { email, fullName, agencyId } = body;

  const { data: authData, error: authError } =
    await supabase.auth.admin.inviteUserByEmail(email);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (authData?.user) {
    await supabase.from("profiles").insert({
      user_id: authData.user.id,
      agency_id: agencyId,
      role: "developer",
      full_name: fullName,
      email: email,
    });
  }

  return NextResponse.json({ success: true });
}
