import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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
    .select("role, agency_id")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can invite" }, { status: 403 });
  }

  const body = await request.json();
  const { email, fullName, position, permissions } = body;

  if (!email || !fullName) {
    return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
  }

  // Use service role key for admin operations (invite)
  // The regular supabase client uses the anon key which cannot call auth.admin
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Server configuration error: service role key not set" },
      { status: 500 }
    );
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: authData, error: authError } =
    await adminClient.auth.admin.inviteUserByEmail(email);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (authData?.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authData.user.id,
      agency_id: profile.agency_id,
      role: "developer",
      full_name: fullName,
      email: email,
      position: position || null,
      permissions: permissions || [],
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, agency_id")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can edit team members" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, fullName, position, permissions } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (position !== undefined) updates.position = position;
  if (permissions !== undefined) updates.permissions = permissions;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .eq("agency_id", profile.agency_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
