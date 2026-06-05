import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function anonClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function adminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// Best-effort: push mutation back to the WordPress site
async function notifySiteWebhook(feedbackItemId: string, action: string, data: Record<string, any>) {
  try {
    const supabase = adminClient();
    const { data: item } = await supabase
      .from("feedback_items")
      .select("project_id, mirror_id")
      .eq("id", feedbackItemId)
      .single();
    if (!item) return;

    const { data: project } = await supabase
      .from("projects")
      .select("site_id")
      .eq("id", item.project_id)
      .single();
    if (!project) return;

    const { data: site } = await supabase
      .from("sites")
      .select("url, wp_api_url, wp_api_key")
      .eq("id", project.site_id)
      .single();
    if (!site) return;

    const wpRestUrl = site.wp_api_url || site.url;
    const wpApiKey = site.wp_api_key;
    if (!wpRestUrl || !wpApiKey) return;

    const webhookPayload = {
      action,
      data: { ...data, id: item.mirror_id || data.id },
    };
    const webhookUrl = `${wpRestUrl.replace(/\/+$/, "")}/wp-json/feedspace/v1/webhook`;
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Feedspace-Key": wpApiKey },
      body: JSON.stringify(webhookPayload),
    });
  } catch {
    // Webhook is best-effort, don't block the response
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (body.previewToken) {
      const supabase = anonClient();
      const { data: link } = await supabase
        .from("preview_links")
        .select("project_id")
        .eq("token", body.previewToken)
        .single();

      if (!link) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const supabase = adminClient();

    // Try looking up by mirror_id first (WP annotation_id) if direct id fails
    let lookupId = id;
    const { data: mirrorItem } = await supabase
      .from("feedback_items")
      .select("id")
      .eq("mirror_id", id)
      .maybeSingle();
    if (mirrorItem) {
      lookupId = mirrorItem.id;
    }

    const updates: Record<string, any> = {};

    if (body.content !== undefined) updates.content = body.content;
    if (body.status !== undefined) updates.status = body.status;
    if (body.selector !== undefined) updates.selector = body.selector;

    const { data, error } = await supabase
      .from("feedback_items")
      .update(updates)
      .eq("id", lookupId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // If status changed to resolved, insert notifications for assigned devs and owners
    if (updates.status === "resolved") {
      const { data: project } = await supabase.from("projects").select("site_id").eq("id", data.project_id).single();
      if (project && project.site_id) {
        const { data: site } = await supabase.from("sites").select("agency_id, name").eq("id", project.site_id).single();
        if (site && site.agency_id) {
          const userIds: string[] = [];

          const { data: members } = await supabase
            .from("site_members")
            .select("user_id")
            .eq("site_id", project.site_id);
          if (members) for (const m of members) userIds.push(m.user_id);

          const { data: owners } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("agency_id", site.agency_id)
            .eq("role", "owner");
          if (owners) for (const o of owners) { if (!userIds.includes(o.user_id)) userIds.push(o.user_id); }

          if (userIds.length > 0) {
            const notifs = userIds.map((uid) => ({
              agency_id: site.agency_id,
              user_id: uid,
              type: "resolved",
              title: `Feedback resolved on ${site.name || "Client Site"}`,
              message: `"${data.content?.substring(0, 80) || "A feedback item"}" — Marked as resolved`,
              feedback_id: data.id,
              site_id: project.site_id,
            }));
            void supabase.from("notifications").insert(notifs);
          }
        }
      }
    }

    // Fire webhook in background (best-effort, don't await or block)
    notifySiteWebhook(lookupId, "update_status", { id, status: updates.status });

    return NextResponse.json({ id: lookupId, updated: true }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteToken = request.headers.get("X-Site-Token");
  const wpApiKey = request.headers.get("X-WP-API-Key");

  let authorized = false;
  if (token) {
    const supabase = anonClient();
    const { data: link } = await supabase
      .from("preview_links")
      .select("project_id")
      .eq("token", token)
      .single();
    if (link) authorized = true;
  }
  if (!authorized && siteToken && wpApiKey) {
    const supabase = adminClient();
    const { data: site } = await supabase
      .from("sites")
      .select("wp_api_key")
      .eq("id", siteToken)
      .eq("wp_connected", true)
      .maybeSingle();
    if (site && site.wp_api_key === wpApiKey) authorized = true;
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403, headers: corsHeaders() }
    );
  }

  const supabase = adminClient();
  let lookupId = id;
  const { data: mirrorItem } = await supabase
    .from("feedback_items")
    .select("id")
    .eq("mirror_id", id)
    .maybeSingle();
  if (mirrorItem) lookupId = mirrorItem.id;

  const { error } = await supabase
    .from("feedback_items")
    .delete()
    .eq("id", lookupId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }

  notifySiteWebhook(lookupId, "delete", { id: lookupId });

  return NextResponse.json({ deleted: true }, { headers: corsHeaders() });
}
