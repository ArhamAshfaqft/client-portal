import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: siteId } = await params;
    const body = await request.json();
    const { user_id, message } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    // Auth client using cookies to verify the caller
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: assignerProfile } = await authClient
      .from("profiles")
      .select("full_name, role, agency_id")
      .eq("user_id", user.id)
      .single();

    if (!assignerProfile || assignerProfile.role !== "owner") {
      return NextResponse.json({ error: "Only owners can assign developers" }, { status: 403 });
    }

    // Service role client for data ops (bypasses RLS)
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: site } = await adminClient
      .from("sites")
      .select("id, name, agency_id")
      .eq("id", siteId)
      .single();

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Verify the dev belongs to the same agency
    const { data: devProfile } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .eq("user_id", user_id)
      .eq("agency_id", site.agency_id)
      .single();

    if (!devProfile) {
      return NextResponse.json({ error: "Developer not found in this agency" }, { status: 404 });
    }

    const { data: member, error: upsertError } = await adminClient
      .from("site_members")
      .upsert({
        site_id: siteId,
        user_id,
        agency_id: site.agency_id,
        assigned_by: assignerProfile.full_name,
        message: message || null,
      }, { onConflict: "site_id,user_id" })
      .select()
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    // Notify the dev
    const { error: notifError } = await adminClient
      .from("notifications")
      .insert({
        agency_id: site.agency_id,
        user_id,
        type: "assigned",
        title: "Site Assigned",
        message: `${assignerProfile.full_name} assigned you to "${site.name}"${message ? `: "${message}"` : ""}`,
        site_id: siteId,
      });

    if (notifError) {
      console.error("[SiteAssign] Notification insert error:", notifError);
    }

    // Auto-assign all open/in-progress feedback on this site to the dev
    const { data: projects } = await adminClient
      .from("projects")
      .select("id")
      .eq("site_id", siteId);

    if (projects && projects.length > 0) {
      const projectIds = projects.map((p: any) => p.id);
      await adminClient
        .from("feedback_items")
        .update({ assigned_to: user_id })
        .in("project_id", projectIds)
        .in("status", ["open"]);
    }

    return NextResponse.json({ ok: true, member });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: siteId } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: assignerProfile } = await authClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!assignerProfile || assignerProfile.role !== "owner") {
      return NextResponse.json({ error: "Only owners can unassign developers" }, { status: 403 });
    }

    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { error } = await adminClient
      .from("site_members")
      .delete()
      .eq("site_id", siteId)
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
